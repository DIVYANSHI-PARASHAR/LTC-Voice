import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log('[handle-vapi-webhook] Received webhook:', JSON.stringify(payload, null, 2));

    // VAPI sends different event types, we're interested in call.ended
    const { type, call } = payload;

    if (type === 'call.ended' || type === 'call.completed') {
      const callId = call?.id;
      
      if (!callId) {
        console.error('[handle-vapi-webhook] No call ID in webhook payload');
        return new Response(JSON.stringify({ error: 'No call ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[handle-vapi-webhook] Call ended: ${callId}`);

      // Update the call status
      const { data: callRecord, error: updateError } = await supabase
        .from('calls')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('call_id', callId)
        .select()
        .single();

      if (updateError) {
        console.error('[handle-vapi-webhook] Error updating call:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update call' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('[handle-vapi-webhook] Call updated, waiting 60 seconds for transcript...');

      // Wait 60 seconds for transcript to be processed
      await new Promise(resolve => setTimeout(resolve, 60000));

      // Mark transcript as ready
      const { error: transcriptError } = await supabase
        .from('calls')
        .update({ transcript_ready: true })
        .eq('id', callRecord.id);

      if (transcriptError) {
        console.error('[handle-vapi-webhook] Error marking transcript ready:', transcriptError);
      }

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          call_id: callRecord.id,
          type: 'call_completed',
          title: 'Call Completed',
          message: `Remote intake call with ${callRecord.patient_name} has completed. Transcript is ready for review.`,
          read: false,
        });

      if (notificationError) {
        console.error('[handle-vapi-webhook] Error creating notification:', notificationError);
        return new Response(JSON.stringify({ error: 'Failed to create notification' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`[handle-vapi-webhook] Notification created for call ${callId}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Webhook processed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For other event types, just acknowledge
    return new Response(
      JSON.stringify({ success: true, message: 'Event acknowledged' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[handle-vapi-webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
