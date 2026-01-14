import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

// 🎭 MOCK MODE: Controls whether to use mock data instead of real VAPI calls
// 
// Default behavior:
//   - Development: Mock mode ON (safe default, no real API calls)
//   - Production: Mock mode OFF (real calls enabled)
//
// Override options:
//   - Set VITE_USE_REAL_CALLS=true to force real calls (even in dev)
//   - Set VITE_USE_MOCK_CALLS=true to force mock mode (even in production)
//
const USE_MOCK_CALL = (() => {
  // Explicit override: force real calls
  if (import.meta.env.VITE_USE_REAL_CALLS === "true") {
    return false;
  }
  // Explicit override: force mock mode
  if (import.meta.env.VITE_USE_MOCK_CALLS === "true") {
    return true;
  }
  // Default: mock mode in development, real calls in production
  return import.meta.env.MODE !== "production";
})();

// Mock response data for demo purposes
const MOCK_CALL_RESPONSE = {
  success: true,
  call_id: "019a20d9-4112-7aae-9dd3-6c03a5def052",
  message: "Call initiated successfully to +12402465262 (Status: ended)",
  patient_phone: "+12014231932",
  patient_name: "Linda Martinez",
  status: "ended",
  call_completed: true,
  structured_data: {
    summary:
      "Vital Stream initiated a healthcare intake assessment call with Linda Marchingdon to prefill her long-term care assessment. During the call, Linda confirmed her contact information, stated she lives alone with stairs leading to her home, and indicated she needs some help with bathing and dressing but can manage toileting and feeding herself independently. The call ended abruptly while the AI was asking about her ability to feed herself.",
    structured_data: {
      medication_memory: "all the time",
      mobility_equipment: "cane",
      lives_with: "alone",
    },
    structured_data_multi: null,
    success_evaluation: "false",
  },
  transcript: [
    {
      role: "conversation",
      content:
        "AI: Hello, Linda Martinez. This is Vital Stream calling to complete your healthcare intake assessment. Do you have a few minutes to talk?\nUser: Yes. Do.\nAI: Great. Thank you, Linda. I'll I'll ask a few questions to help prefill your long term care assessment. You can answer in your own words. I'll ask 1 question at a time. First, can you confirm your full name and the best phone number to reach you in the nurse needs to call before the visit? If you'd rather\nUser: Yes.\nAI: Thank you. Could you please tell me your full name as you'd like it recorded and the best phone number to reach you if the nurse needs to call before the visit?\nUser: Yes. Linda Marchingdon. 2 4 0 2 4 6 5 2 6 2.\nAI: Thank you, Linda Marchingdon. I have the phone number as 2 4 0 2 4 6 5 2 6 2. Is that correct?\nUser: Yes. That's correct.\nAI: Thank you, Linda. I have your name and phone number. I'm going to ask a few more questions. We 1 at a time. About your living situation and daily activities. You can answer in your own words. If you'd like to stop at any time, just tell me. First, do you live alone or with someone? If with someone, who lives with your spouse, family, caregiver,\nUser: I live alone.\nAI: Thank you, Linda. I've noted you live alone. Are there any steps or stairs you need to use to get into your home, for example? Front steps or\nUser: Yes. There are stairs leading up to my house.\nAI: Thank you. Noted that there are stairs leading up to your house. Next question. Can you bathe or shower by yourself? Or do you need help?\nUser: I need a little bit of help\nAI: Thank you, Linda. I appreciate you sharing that. I've noted that you need a little bit of help with bathing or showering. Next question. Can you get dressed by yourself, or do you need help with dressing?\nUser: I need help with tracking as well.\nAI: You, Linda. I've noted that you need help with dressing as well. Next question. Do you need help getting to the toilet or using it toileting, or can you do that by your\nUser: I can do that by myself.\nAI: Thank you, Linda. I have that you can use the toilet by yourself. Next, can you feed yourself? Eat and drink without help?\n",
    },
  ],
  recording_url:
    "https://storage.vapi.ai/019a20d9-4112-7aae-9dd3-6c03a5def052-1761487868324-1b0215d5-8ef2-40f1-b723-1576608a401d-mono.wav",
  cost: 0.2855,
};

interface InitiateCallParams {
  patientPhone: string;
  patientName: string;
  patientId?: string;
  /**
   * Whether to wait for call to complete before returning
   * - "connected": Wait until patient answers or call fails (~30-60 seconds)
   * - "ended": Wait until entire call finishes (could be several minutes!)
   * - "none": Return immediately after initiating (default)
   */
  waitForCompletion?: "connected" | "ended" | "none";
  /** Maximum seconds to wait if waitForCompletion is set (default: 300) */
  timeout?: number;
}

export function useInitiateCall() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiateCall = async ({
    patientPhone,
    patientName,
    patientId,
    waitForCompletion = "ended",
    timeout = 300,
  }: InitiateCallParams) => {
    console.log("[useInitiateCall] Initiating outbound call to", patientPhone);

    setIsLoading(true);

    // 🎭 HACKATHON MODE: Return mock data immediately
    if (USE_MOCK_CALL) {
      console.log(
        "[useInitiateCall] 🎭 MOCK MODE: Simulating call with fake data"
      );

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const mockData = {
          ...MOCK_CALL_RESPONSE,
          patient_phone: patientPhone,
          patient_name: patientName,
        };

        toast({
          title: "Mock Call Completed",
          description: `Simulated call to ${patientName}. Using demo data for hackathon.`,
        });

        return {
          success: true,
          callId: mockData.call_id,
          status: mockData.status,
          callCompleted: mockData.call_completed,
          structuredData: mockData.structured_data,
          transcript: mockData.transcript,
          recordingUrl: mockData.recording_url,
          cost: mockData.cost,
        };
      } finally {
        setIsLoading(false);
      }
    }

    // 📞 REAL MODE: Make actual backend call
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/calls/outbound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patient_phone: patientPhone,
          patient_name: patientName,
          assistant_overrides: {
            first_message: `Hello ${patientName}, this is VitalStream calling to complete your healthcare intake assessment. Do you have a few minutes to talk?`,
          },
          wait_for_completion: waitForCompletion,
          timeout: timeout,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to initiate call");
      }

      const data = await response.json();
      console.log(
        "[useInitiateCall] Outbound call initiated successfully:",
        data
      );

      // Store call in database for tracking
      const { data: callData, error: dbError } = await supabase
        .from("calls")
        .insert({
          call_id: data.call_id,
          patient_id: patientId || null,
          patient_name: patientName,
          patient_phone: patientPhone,
          status: data.status || "initiated",
          transcript_ready: data.transcript ? true : false,
        })
        .select()
        .single();

      if (dbError) {
        console.error(
          "[useInitiateCall] Error storing call in database:",
          dbError
        );
        // Don't fail the whole operation if database insert fails
      } else if (callData) {
        // If call completed with transcript, store in vapi_calls table
        if (patientId && data.status === "ended" && (data.transcript || data.structured_data)) {
          console.log("[useInitiateCall] Storing transcript and structured data in vapi_calls table");
          
          // Convert transcript to string if it's an array
          let transcriptText = null;
          if (data.transcript) {
            if (Array.isArray(data.transcript)) {
              // Extract content from transcript array
              transcriptText = data.transcript
                .map((item: any) => item.content || item.message || JSON.stringify(item))
                .join("\n\n");
            } else if (typeof data.transcript === "string") {
              transcriptText = data.transcript;
            }
          }

          // Use type assertion since vapi_calls table may not be in generated types
          const supabaseAny = supabase as any;
          const { error: vapiCallError } = await supabaseAny
            .from("vapi_calls")
            .insert({
              patient_id: patientId,
              vapi_call_id: data.call_id,
              call_type: "outboundPhoneCall",
              call_status: data.status,
              transcript: transcriptText,
              summary: data.structured_data?.summary || null,
              recording_url: data.recording_url || null,
              cost: data.cost || null,
              assessment_completed: !!data.structured_data,
              metadata: data.structured_data ? { structured_data: data.structured_data } : null,
            });

          if (vapiCallError) {
            console.error(
              "[useInitiateCall] Error storing VAPI call data:",
              vapiCallError
            );
          } else {
            console.log("[useInitiateCall] VAPI call data stored successfully");
            
            // Update calls table to mark transcript as ready
            await supabase
              .from("calls")
              .update({ 
                status: "completed",
                completed_at: new Date().toISOString(),
                transcript_ready: true 
              })
              .eq("id", callData.id);

            // Create notification immediately since transcript is ready
            await supabase
              .from("notifications")
              .insert({
                type: "call_completed",
                title: "Call Transcript Ready",
                message: `The call transcript for ${patientName} is now available for review.`,
                call_id: callData.id,
                read: false,
              });
          }
        } else if (callData && data.status !== "ended") {
          // Schedule notification for later if call is still in progress
          console.log(
            "[useInitiateCall] Scheduling notification for 60 seconds from now"
          );
          setTimeout(async () => {
            console.log(
              "[useInitiateCall] Creating notification for call:",
              callData.id
            );
            const { error: notificationError } = await supabase
              .from("notifications")
              .insert({
                type: "call_completed",
                title: "Call Transcript Ready",
                message: `The call transcript for ${patientName} is now available for review.`,
                call_id: callData.id,
                read: false,
              });

            if (notificationError) {
              console.error(
                "[useInitiateCall] Error creating notification:",
                notificationError
              );
            } else {
              console.log("[useInitiateCall] Notification created successfully");
            }
          }, 60000); // 60 seconds
        }
      }

      // Show appropriate toast based on completion status
      if (data.status) {
        // Call was blocking, show final status
        const statusMessages: Record<
          string,
          { title: string; description: string }
        > = {
          "in-progress": {
            title: "Patient answered!",
            description: `${patientName} picked up the phone. Call is now in progress.`,
          },
          ended: {
            title: "Call completed",
            description: `Call with ${patientName} has ended. Transcript will be available shortly.`,
          },
          "no-answer": {
            title: "No answer",
            description: `${patientName} did not answer the call.`,
          },
          busy: {
            title: "Line busy",
            description: `${patientName}'s line was busy. Please try again later.`,
          },
          failed: {
            title: "Call failed",
            description: `Unable to complete call to ${patientName}.`,
          },
          timeout: {
            title: "Call timeout",
            description: `Call to ${patientName} is taking longer than expected. You'll be notified when it completes.`,
          },
        };

        const statusInfo = statusMessages[data.status] || {
          title: "Call status",
          description: `Call to ${patientName}: ${data.status}`,
        };

        toast({
          title: statusInfo.title,
          description: statusInfo.description,
          variant: ["failed", "no-answer", "busy"].includes(data.status)
            ? "destructive"
            : "default",
        });
      } else {
        // Non-blocking call
        toast({
          title: "Call initiated",
          description: `Calling ${patientName} at ${patientPhone}. They will receive a call shortly.`,
        });
      }

      return {
        success: true,
        callId: data.call_id,
        status: data.status,
        callCompleted: data.call_completed,
        structuredData: data.structured_data,
        transcript: data.transcript,
        recordingUrl: data.recording_url,
        cost: data.cost,
      };
    } catch (error) {
      console.error("[useInitiateCall] Error initiating outbound call:", error);

      toast({
        title: "Call failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to initiate call. Please try again.",
        variant: "destructive",
      });

      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { initiateCall, isLoading };
}
