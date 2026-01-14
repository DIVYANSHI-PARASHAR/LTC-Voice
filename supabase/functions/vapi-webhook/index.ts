/**
 * VAPI Webhook Handler
 * 
 * This edge function receives webhooks from VAPI and stores
 * structured patient assessment data in the database.
 * 
 * Webhook URL: https://your-project.supabase.co/functions/v1/vapi-webhook
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for VAPI
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse the VAPI webhook event
    const vapiEvent = await req.json();
    console.log('Received VAPI event:', vapiEvent.message.type);

    // Handle different VAPI event types
    const messageType = vapiEvent.message.type;

    if (messageType === 'end-of-call-report') {
      // This is the main event we care about - contains the full call data
      const call = vapiEvent.message.call;
      const artifact = vapiEvent.message.artifact;

      console.log('Processing end-of-call-report for call:', call.id);

      // Extract patient ID from metadata (set when initiating the call)
      const patientId = call.metadata?.patient_id;
      
      if (!patientId) {
        console.error('No patient_id found in call metadata');
        return new Response(
          JSON.stringify({ error: 'No patient_id in metadata' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Step 1: Save the VAPI call record
      const { data: vapiCallRecord, error: callError } = await supabaseClient
        .from('vapi_calls')
        .insert({
          patient_id: patientId,
          vapi_call_id: call.id,
          call_type: call.type,
          call_status: call.status,
          started_at: call.startedAt,
          ended_at: call.endedAt,
          duration_seconds: call.endedAt && call.startedAt 
            ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000)
            : null,
          transcript: call.transcript || artifact?.transcript,
          summary: call.summary,
          recording_url: call.recordingUrl || artifact?.recordingUrl,
          stereo_recording_url: call.stereoRecordingUrl || artifact?.stereoRecordingUrl,
          ended_reason: call.endedReason,
          cost: call.cost,
          patient_confirmed: call.metadata?.patient_confirmed ?? false,
          patient_willing_to_continue: call.metadata?.patient_willing_to_continue ?? false,
          assessment_completed: call.metadata?.assessment_completed ?? false,
          metadata: call.metadata,
        })
        .select()
        .single();

      if (callError) {
        console.error('Error saving VAPI call:', callError);
        throw callError;
      }

      console.log('Saved VAPI call record:', vapiCallRecord.id);

      // Step 2: Extract structured data from the call
      // This depends on how your VAPI assistant is configured
      // Option A: Data is in metadata (if you used function calling)
      // Option B: Parse from transcript/summary (using AI or keywords)
      const structuredData = extractStructuredData(call, artifact);

      // Step 3: Create the assessment record
      const { data: assessment, error: assessmentError } = await supabaseClient
        .from('patient_assessments')
        .insert({
          patient_id: patientId,
          vapi_call_id: vapiCallRecord.id,
          assessed_by: 'VAPI Voice Assistant',
          patient_confirmed_name: structuredData.patientConfirmed ?? false,
          patient_consent_given: structuredData.consentGiven ?? false,
          assessment_complete: structuredData.assessmentComplete ?? false,
          verbal_summary: structuredData.verbalSummary || call.summary,
          notes: structuredData.notes,
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Error creating assessment:', assessmentError);
        throw assessmentError;
      }

      console.log('Created assessment record:', assessment.id);

      // Step 4: Save all assessment sections in parallel
      const saveTasks = [];

      // Living Situation
      if (structuredData.living && Object.keys(structuredData.living).length > 0) {
        saveTasks.push(
          supabaseClient.from('living_situation').insert({
            assessment_id: assessment.id,
            patient_id: patientId,
            ...structuredData.living,
          })
        );
      }

      // ADL Assessment
      if (structuredData.adl && Object.keys(structuredData.adl).length > 0) {
        saveTasks.push(
          supabaseClient.from('adl_assessment').insert({
            assessment_id: assessment.id,
            patient_id: patientId,
            ...structuredData.adl,
          })
        );
      }

      // IADL Assessment
      if (structuredData.iadl && Object.keys(structuredData.iadl).length > 0) {
        saveTasks.push(
          supabaseClient.from('iadl_assessment').insert({
            assessment_id: assessment.id,
            patient_id: patientId,
            ...structuredData.iadl,
          })
        );
      }

      // Health Assessment
      if (structuredData.health && Object.keys(structuredData.health).length > 0) {
        saveTasks.push(
          supabaseClient.from('health_assessment').insert({
            assessment_id: assessment.id,
            patient_id: patientId,
            ...structuredData.health,
          })
        );
      }

      // Cognition Assessment
      if (structuredData.cognition && Object.keys(structuredData.cognition).length > 0) {
        saveTasks.push(
          supabaseClient.from('cognition_assessment').insert({
            assessment_id: assessment.id,
            patient_id: patientId,
            ...structuredData.cognition,
          })
        );
      }

      // Support Network
      if (structuredData.support && Object.keys(structuredData.support).length > 0) {
        saveTasks.push(
          supabaseClient.from('support_network').insert({
            assessment_id: assessment.id,
            patient_id: patientId,
            ...structuredData.support,
          })
        );
      }

      // Execute all saves in parallel
      const results = await Promise.allSettled(saveTasks);
      
      // Log any errors but don't fail the request
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Error saving assessment section ${index}:`, result.reason);
        }
      });

      console.log('Successfully processed assessment');

      return new Response(
        JSON.stringify({ 
          success: true, 
          assessment_id: assessment.id,
          vapi_call_id: vapiCallRecord.id,
          sections_saved: results.filter(r => r.status === 'fulfilled').length,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle other VAPI events (call-started, status-update, etc.)
    console.log('Received event type:', messageType);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Event received' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing VAPI webhook:', error);

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    return new Response(
      JSON.stringify({ 
        error: message,
        stack,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Extract structured assessment data from the VAPI call
 * 
 * This function needs to be customized based on how your VAPI assistant
 * is configured to collect and return data.
 * 
 * Options:
 * 1. Use VAPI function calling to structure data during the call
 * 2. Store structured data in call.metadata
 * 3. Use AI to parse the transcript (e.g., with OpenAI)
 * 4. Use keyword matching on the transcript
 */
function extractStructuredData(call: any, artifact: any) {
  // Option 1: If you're using function calling or storing in metadata
  if (call.metadata?.assessment_data) {
    return call.metadata.assessment_data;
  }

  // Option 2: Parse from artifact if VAPI provides structured output
  if (artifact?.structuredData) {
    return artifact.structuredData;
  }

  // Option 3: Basic extraction from transcript (customize as needed)
  const transcript = call.transcript || artifact?.transcript || '';
  
  // This is a simplified example - you should customize this based on
  // your actual conversation flow and data collection needs
  const data: any = {
    patientConfirmed: transcript.toLowerCase().includes('yes') || transcript.toLowerCase().includes('confirm'),
    consentGiven: true, // Set based on your consent flow
    assessmentComplete: call.status === 'ended' && call.endedReason !== 'customer-ended-call',
    verbalSummary: call.summary,
    notes: null,
    living: {},
    adl: {},
    iadl: {},
    health: {},
    cognition: {},
    support: {},
  };

  // Parse living situation
  if (transcript.toLowerCase().includes('live alone')) {
    data.living.lives_alone = true;
  } else if (transcript.toLowerCase().includes('live with')) {
    data.living.lives_alone = false;
  }

  if (transcript.toLowerCase().includes('stairs')) {
    data.living.has_stairs_to_enter = true;
  }

  // Parse ADL - Bathing
  if (transcript.toLowerCase().includes('bathe') || transcript.toLowerCase().includes('shower')) {
    if (transcript.toLowerCase().includes('by myself') || transcript.toLowerCase().includes('independently')) {
      data.adl.bathing_independent = true;
      data.adl.bathing_level = 'independent';
    } else if (transcript.toLowerCase().includes('need help') || transcript.toLowerCase().includes('assistance')) {
      data.adl.bathing_independent = false;
      data.adl.bathing_level = 'requires assistance';
    }
  }

  // Parse assistive devices
  const devices: string[] = [];
  if (transcript.toLowerCase().includes('cane')) devices.push('cane');
  if (transcript.toLowerCase().includes('walker')) devices.push('walker');
  if (transcript.toLowerCase().includes('wheelchair')) devices.push('wheelchair');
  if (transcript.toLowerCase().includes('crutch')) devices.push('crutches');
  
  if (devices.length > 0) {
    data.adl.uses_assistive_device = true;
    data.adl.assistive_devices = devices;
  }

  // Parse IADL - Medication Management (CRITICAL FIELD)
  if (transcript.toLowerCase().includes('forget') && transcript.toLowerCase().includes('medication')) {
    data.iadl.forgets_medications = true;
    data.iadl.medication_management_independent = false;
    data.iadl.medication_reminders_needed = true;
    data.iadl.medication_notes = 'Patient reports forgetting medications';
  } else if (transcript.toLowerCase().includes('medication') && transcript.toLowerCase().includes('myself')) {
    data.iadl.medication_management_independent = true;
    data.iadl.forgets_medications = false;
  }

  // Parse health conditions
  const conditions: string[] = [];
  if (transcript.toLowerCase().includes('diabetes')) conditions.push('diabetes');
  if (transcript.toLowerCase().includes('hypertension') || transcript.toLowerCase().includes('blood pressure')) conditions.push('hypertension');
  if (transcript.toLowerCase().includes('copd') || transcript.toLowerCase().includes('emphysema')) conditions.push('COPD');
  if (transcript.toLowerCase().includes('heart')) conditions.push('heart disease');
  
  if (conditions.length > 0) {
    data.health.has_chronic_conditions = true;
    data.health.chronic_conditions = conditions;
  }

  // Parse pain
  if (transcript.toLowerCase().includes('pain')) {
    data.health.has_pain = true;
    // Try to extract pain level (0-10)
    const painMatch = transcript.match(/pain.*?(\d+).*?(?:out of |\/)?10/i);
    if (painMatch) {
      data.health.pain_level = parseInt(painMatch[1]);
    }
  }

  // Parse breathing issues
  if (transcript.toLowerCase().includes('breath') || transcript.toLowerCase().includes('oxygen')) {
    data.health.has_breathing_issues = true;
    if (transcript.toLowerCase().includes('oxygen')) {
      data.health.uses_oxygen = true;
    }
  }

  // Parse cognition - memory
  if (transcript.toLowerCase().includes('forget') || transcript.toLowerCase().includes('memory')) {
    data.cognition.has_memory_issues = true;
    if (transcript.toLowerCase().includes('short term')) {
      data.cognition.memory_issue_type = 'short-term';
    }
  }

  // Parse support network - caregiver
  if (transcript.toLowerCase().includes('caregiver') || 
      transcript.toLowerCase().includes('daughter') || 
      transcript.toLowerCase().includes('son') ||
      transcript.toLowerCase().includes('spouse')) {
    data.support.has_informal_caregiver = true;
    
    // Try to extract relationship
    if (transcript.toLowerCase().includes('daughter')) {
      data.support.informal_caregiver_relationship = 'daughter';
    } else if (transcript.toLowerCase().includes('son')) {
      data.support.informal_caregiver_relationship = 'son';
    } else if (transcript.toLowerCase().includes('spouse') || transcript.toLowerCase().includes('wife') || transcript.toLowerCase().includes('husband')) {
      data.support.informal_caregiver_relationship = 'spouse';
    }
  }

  return data;
}

/**
 * TODO: For production use, consider:
 * 
 * 1. Using VAPI's function calling feature to collect structured data
 *    during the conversation (recommended approach)
 * 
 * 2. Integrating with an LLM (e.g., OpenAI) to parse the transcript
 *    into structured data with higher accuracy
 * 
 * 3. Implementing retry logic for failed database operations
 * 
 * 4. Adding more sophisticated error handling and logging
 * 
 * 5. Implementing webhook signature verification for security
 * 
 * 6. Adding rate limiting to prevent abuse
 */

