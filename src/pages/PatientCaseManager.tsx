import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { workflowPatients } from "@/data/workflowPatients";
import { PatientProfileHeader } from "@/components/workflow-a/PatientProfileHeader";
import { OverallProgressBar } from "@/components/workflow-a/OverallProgressBar";
import { KPITracker } from "@/components/workflow-a/KPITracker";
import { TaskFormCard } from "@/components/workflow-a/TaskFormCard";
import { ConsolidatedAssessmentView } from "@/components/workflow-a/ConsolidatedAssessmentView";
import { useInitiateCall } from "@/hooks/useInitiateCall";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { usePatientData } from "@/contexts/PatientDataContext";
import { useVAPICalls } from "@/integrations/supabase/hooks/use-assessments";
import { useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

// Stage progress based on patient's current status
const getStageProgress = (currentStatus: string) => {
  type StageStatus = "pending" | "in-progress" | "complete";

  const stages: Array<{ name: string; progress: number; status: StageStatus }> = [
    { name: "Referral", progress: 0, status: "pending" },
    { name: "Remote Intake", progress: 0, status: "pending" },
    { name: "Nurse Assessment", progress: 0, status: "pending" },
    { name: "Authorization", progress: 0, status: "pending" },
  ];

  // Map status to stage index and completion
  const statusMap: Record<string, { stageIndex: number; progress: number }> = {
    "Referral": { stageIndex: 0, progress: 60 },
    "Remote Intake": { stageIndex: 1, progress: 60 },
    "Remote Intake Complete": { stageIndex: 2, progress: 0 }, // Remote Intake complete, Nurse Assessment next
    "Nurse Assessment": { stageIndex: 2, progress: 60 },
    "Authorization": { stageIndex: 3, progress: 60 },
  };

  const currentStageInfo = statusMap[currentStatus] || { stageIndex: 0, progress: 0 };

  // Mark all previous stages as complete
  for (let i = 0; i < currentStageInfo.stageIndex; i++) {
    stages[i].progress = 100;
    stages[i].status = "complete";
  }

  // Mark current stage as in-progress
  if (currentStageInfo.stageIndex < stages.length) {
    stages[currentStageInfo.stageIndex].progress = currentStageInfo.progress;
    stages[currentStageInfo.stageIndex].status = currentStageInfo.progress > 0 ? "in-progress" : "pending";
  }

  return stages;
};

// Calculate overall progress percentage
const calculateOverallProgress = (stages: Array<{ progress: number }>) => {
  const totalProgress = stages.reduce((sum, stage) => sum + stage.progress, 0);
  return Math.round(totalProgress / stages.length);
};

const callMetrics = [
  {
    callDate: "Oct 24, 2025",
    callTime: "9:14 AM",
    duration: "23 min",
    status: "completed" as const,
    transcriptionStatus: "complete" as const,
    formsGenerated: 2,
  },
  {
    callDate: "Oct 24, 2025",
    callTime: "10:15 AM",
    duration: "18 min",
    status: "completed" as const,
    transcriptionStatus: "complete" as const,
    formsGenerated: 1,
  },
];

const getPatientForms = (patientId: string) => {
  const isRobertJenkins = patientId === "7";
  
  return [
    {
      id: 4,
      name: "Level of Care Assessment — UAS-NY (DOH-694B)",
      code: "NY DOH-694B",
      status: isRobertJenkins ? ("in-review" as const) : ("complete" as const),
      progress: 100,
      formUrl: "https://www.health.ny.gov/forms/doh-694.pdf",
    },
    {
      id: 1,
      name: "Medicaid Application — NY Form 102",
      code: "NY DOH Form 102",
      status: "complete" as const,
      progress: 100,
      startTime: "9:14 AM",
      endTime: "9:42 AM",
      duration: "28 min",
      voiceAIActive: true,
      formUrl: "https://www.health.ny.gov/forms/doh-4220.pdf",
    },
    {
      id: 2,
      name: "PASRR Level I — CMS 3620",
      code: "CMS 3620",
      status: "complete" as const,
      progress: 100,
      startTime: "9:45 AM",
      endTime: "10:03 AM",
      duration: "18 min",
      voiceAIActive: true,
      formUrl:
        "https://www.cms.gov/medicare/provider-enrollment-and-certification/certificationandcomplianc/downloads/pasrrlevelone.pdf",
    },
    {
      id: 3,
      name: "PASRR Level II — 42 CFR §483.130",
      code: "NY OMH PASRR",
      status: "in-review" as const,
      progress: 75,
      startTime: "10:15 AM",
      voiceAIActive: true,
      formUrl: "https://omh.ny.gov/omhweb/guidance/pasrr/",
    },
  ];
};

// Old hardcoded data - now using real call results
// const intakeResults = [...];

const nurseAssessment = [
  {
    domain: "Transfers",
    prompt: "Stand from chair",
    output: "Minimal assist, balance stable",
  },
  {
    domain: "Mobility",
    prompt: "Bathroom setup review",
    output: "No grab bars, fall risk",
  },
  {
    domain: "Bathing",
    prompt: "Bathing management",
    output: "Knee pain, assistance needed",
  },
  {
    domain: "Vitals",
    prompt: "Vital signs check",
    output: "BP 138/76, HR 82",
  },
  {
    domain: "Cognition",
    prompt: "Orientation check",
    output: "Oriented person and place",
  },
  {
    domain: "Environment",
    prompt: "Living space tour",
    output: "One-floor, adequate lighting",
  },
  {
    domain: "Summary",
    prompt: "Assessment conclusion",
    output: "Community LTC services approved",
  },
];


export default function PatientCaseManager() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { initiateCall, isLoading: isCallLoading } = useInitiateCall();
  const { addNotification } = useNotificationContext();
  const { getPatientData, setPatientCallResults, setPatientStatus } = usePatientData();

  // Find the patient from workflow data
  const foundPatient = workflowPatients
    .flatMap((workflow) => workflow.patients)
    .find((patient) => patient.id === patientId);

  // If patient not found, redirect to home
  if (!foundPatient) {
    navigate("/");
    return null;
  }

  // Get persisted patient data from context (persists across navigation)
  const persistedData = getPatientData(patientId || '');
  const callResults = persistedData?.callResults || null;
  const currentStatus = persistedData?.status || foundPatient.status;

  // Load stored VAPI calls from database
  const { data: vapiCalls, isLoading: isLoadingVAPICalls } = useVAPICalls(patientId || '');
  
  // Get the latest call with transcript from database
  const latestStoredCall = useMemo(() => {
    if (!vapiCalls || vapiCalls.length === 0) return null;
    // Find the most recent call with transcript
    return vapiCalls.find(call => call.transcript) || vapiCalls[0];
  }, [vapiCalls]);

  // Merge database transcript with context data (database takes precedence)
  const finalCallResults = useMemo(() => {
    if (latestStoredCall && latestStoredCall.transcript) {
      // Parse transcript from database
      let transcript = latestStoredCall.transcript;
      if (typeof transcript === 'string') {
        // Convert string transcript to array format expected by UI
        transcript = [{ role: "conversation", content: transcript }];
      }
      
      // Parse structured_data from metadata if available
      const structuredData = latestStoredCall.metadata?.structured_data || null;
      
      return {
        structuredData: structuredData || callResults?.structuredData,
        transcript: transcript || callResults?.transcript,
        recordingUrl: latestStoredCall.recording_url || callResults?.recordingUrl,
        cost: latestStoredCall.cost || callResults?.cost,
      };
    }
    return callResults;
  }, [latestStoredCall, callResults]);

  // Map patient status to expected values
  const mapStatus = (
    status: string
  ): "in-progress" | "under-review" | "complete" => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("review")) return "under-review";
    if (statusLower.includes("complete")) return "complete";
    return "in-progress";
  };

  // Build patient data with found patient details
  // Phone number: Use VITE_TEST_PHONE_NUMBER if set, otherwise use demo number
  // Set VITE_TEST_PHONE_NUMBER in .env file to use your own number for testing
  const patientData = {
    name: foundPatient.name,
    age: foundPatient.age,
    caseId: foundPatient.caseId,
    insurance: "NY Medicaid Managed LTC (MLTC)",
    diagnosis: "COPD",
    facilityType: "Skilled Nursing Facility",
    preferredLanguage: "English",
    status: mapStatus(foundPatient.status),
    timeSinceReferral: `${foundPatient.daysInWorkflow} days`,
    targetCompletion: "10/29/25",
    phone: import.meta.env.VITE_TEST_PHONE_NUMBER || "+12014231932",
  };

  const stageProgress = getStageProgress(currentStatus);
  const overallProgress = calculateOverallProgress(stageProgress);
  const forms = getPatientForms(patientId || '');
  const nextIncompleteForm = forms.find((form) => form.status !== "complete");

  const handleCallClick = async () => {
    const result = await initiateCall({
      patientPhone: patientData.phone,
      patientName: patientData.name,
      patientId: patientId || undefined, // Pass patientId for database storage
      waitForCompletion: "ended", // Wait for call to finish
      timeout: 600, // 10 minute timeout
    });

    // If call completed successfully with structured data, store it
    if (result.success && result.structuredData && patientId) {
      console.log('[PatientCaseManager] Call completed with structured data:', result.structuredData);

      // Store call results in context (persists across navigation)
      setPatientCallResults(patientId, {
        structuredData: result.structuredData,
        transcript: result.transcript,
        recordingUrl: result.recordingUrl,
        cost: result.cost,
      });

      // Update patient status to indicate Remote Intake is complete and Nurse Assessment is next
      setPatientStatus(patientId, "Remote Intake Complete");

      // Add notification to the notification panel
      addNotification({
        type: 'call_completed',
        title: 'Remote Intake Assessment Completed',
        message: `Initial intake assessment for ${patientData.name} has been completed. Click to view results.`,
        patientId: patientId,
        patientName: patientData.name,
      });

      console.log('[PatientCaseManager] Notification added to panel, status updated to Nurse Assessment');
    }
  };

  return (
    <div className="space-y-0">
      {/* Back Button */}
      <div className="border-b bg-card px-6 py-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Patient Profile Header */}
      <PatientProfileHeader
        patient={patientData}
        workflowStatus={currentStatus}
        onCallClick={handleCallClick}
        isCallLoading={isCallLoading}
      />

      <div className="p-6 space-y-6">
        {/* Overall Progress Bar with Stages */}
        <OverallProgressBar
          stages={stageProgress}
          overallProgress={overallProgress}
          completedForms={3}
          totalForms={7}
          targetDate={patientData.targetCompletion}
        />

        {/* Data Tabs */}
        <Tabs defaultValue="assessments" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="forms">Forms & Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-4">
            {finalCallResults?.structuredData ? (
              <ConsolidatedAssessmentView
                intakeResults={[
                  { domain: "Medication Memory", findings: finalCallResults.structuredData.structured_data?.medication_memory || "" },
                  { domain: "Mobility Equipment", findings: finalCallResults.structuredData.structured_data?.mobility_equipment || "" },
                  { domain: "Lives With", findings: finalCallResults.structuredData.structured_data?.lives_with || "" },
                  { domain: "Summary", findings: finalCallResults.structuredData.summary || "" },
                ]}
                intakeCallDate={latestStoredCall?.started_at 
                  ? new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'America/New_York'
                    }).format(new Date(latestStoredCall.started_at))
                  : new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'America/New_York'
                    }).format(new Date())
                }
                intakeDuration={latestStoredCall?.duration_seconds 
                  ? `${Math.floor(latestStoredCall.duration_seconds / 60)} minutes`
                  : "12 minutes"
                }
                transcript={finalCallResults.transcript}
                patientName={patientData.name}
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Remote Intake Assessment Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Call Patient" to initiate a remote intake assessment call.
                  </p>
                  <Button onClick={handleCallClick} disabled={isCallLoading}>
                    {isCallLoading ? "Calling..." : "Call Patient"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forms" className="space-y-4">
            {/* Task Forms */}
            <div className="space-y-3">
              {forms.map((form) => (
                <TaskFormCard
                  key={form.id}
                  form={form}
                  onCallClick={handleCallClick}
                  isCallLoading={isCallLoading}
                  patientId={patientId}
                  onViewClick={() => {
                    if (form.id === 4) {
                      navigate(`/patient/${patientId}/level-of-care-assessment`);
                    }
                  }}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Notes & Observations</CardTitle>
                <CardDescription>
                  Clinical observations and administrative notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    No notes added yet. Click "Add Note" to begin.
                  </p>
                  <Button variant="outline">Add Note</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Case Timeline</CardTitle>
                <CardDescription>
                  Activity log for {patientData.caseId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      time: "2 hours ago",
                      action: "PASRR Level II submitted for review",
                      user: "System Auto-Route",
                      status: "info",
                    },
                    {
                      time: "4 hours ago",
                      action: "PASRR Level I completed and approved",
                      user: "Jane Smith, RN",
                      status: "success",
                    },
                  ].map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            event.status === "success"
                              ? "bg-success"
                              : "bg-primary"
                          }`}
                        />
                        {idx < 1 && (
                          <div className="w-0.5 h-full bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.user} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* KPI Tracker - VoiceAI Call Metrics */}
        <KPITracker
          callMetrics={callMetrics}
          totalCalls={2}
          totalCallDuration="41 min"
          formsAutoFilled={3}
        />
      </div>
    </div>
  );
}
