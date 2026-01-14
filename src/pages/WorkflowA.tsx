import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { PatientProfileHeader } from "@/components/workflow-a/PatientProfileHeader";
import { OverallProgressBar } from "@/components/workflow-a/OverallProgressBar";
import { KPITracker } from "@/components/workflow-a/KPITracker";
import { TaskFormCard } from "@/components/workflow-a/TaskFormCard";
import { ConsolidatedAssessmentView } from "@/components/workflow-a/ConsolidatedAssessmentView";
import { useInitiateCall } from "@/hooks/useInitiateCall";
import { patientData } from "@/data/patientData";

const stageProgress = [
  { name: "Referral", progress: 100, status: "complete" as const },
  { name: "Remote Intake", progress: 100, status: "complete" as const },
  { name: "Nurse Assessment", progress: 100, status: "complete" as const },
  { name: "Authorization", progress: 40, status: "in-progress" as const },
];

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
  {
    callDate: "Oct 25, 2025",
    callTime: "2:45 PM",
    duration: "31 min",
    status: "completed" as const,
    transcriptionStatus: "processing" as const,
    formsGenerated: 0,
  },
];

const forms = [
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
    formUrl: "https://www.cms.gov/medicare/provider-enrollment-and-certification/certificationandcomplianc/downloads/pasrrlevelone.pdf",
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
  {
    id: 4,
    name: "Level of Care Assessment — UAS-NY (DOH-694B)",
    code: "NY DOH-694B",
    status: "pending" as const,
    progress: 0,
    formUrl: "https://www.health.ny.gov/forms/doh-694.pdf",
  },
  {
    id: 5,
    name: "Medical Necessity Form — MNF-NY (DOH-3520)",
    code: "NY DOH-3520",
    status: "pending" as const,
    progress: 0,
    formUrl: "https://www.health.ny.gov/forms/doh-3520.pdf",
  },
  {
    id: 6,
    name: "Financial Eligibility Form — NY DOH-4495 (Supplement A)",
    code: "NY DOH-5178A",
    status: "pending" as const,
    progress: 0,
    voiceAIActive: true,
    formUrl: "https://www.health.ny.gov/forms/doh-5178a_dd_access.pdf",
  },
  {
    id: 7,
    name: "ADL/IADL Assessment — UAS-NY Functional",
    code: "UAS-NY Functional",
    status: "pending" as const,
    progress: 0,
    formUrl: "https://www.health.ny.gov/health_care/medicaid/redesign/uasis/",
  },
];

const intakeResults = [
  {
    domain: "Transfers",
    findings: "Moderate assist required",
  },
  {
    domain: "Mobility",
    findings: "Walker with standby assist",
  },
  {
    domain: "Bathing",
    findings: "Total assistance needed",
  },
  {
    domain: "Vitals",
    findings: "BP 142/88, O2 94%",
  },
  {
    domain: "Cognition",
    findings: "Alert, oriented x3",
  },
  {
    domain: "Environment",
    findings: "Single-story, grab bars installed",
  },
  {
    domain: "Summary",
    findings: "SNF level care appropriate",
  },
];

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

const automationRules = [
  { id: 1, rule: "Auto-populate demographics via MMIS API", status: "active" },
  { id: 2, rule: "Validate eligibility with X12 270/271", status: "active" },
  {
    id: 3,
    rule: "Route PASRR to Behavioral Health reviewer",
    status: "triggered",
  },
  { id: 4, rule: "Flag incomplete MNF", status: "active" },
];

export default function WorkflowA() {
  const { initiateCall, isLoading: isCallLoading } = useInitiateCall();
  const nextIncompleteForm = forms.find((form) => form.status !== "complete");

  const handleCallClick = async () => {
    await initiateCall({
      patientPhone: patientData.phone,
      patientName: patientData.name,
    });
  };

  return (
    <div className="space-y-0">
      {/* Patient Profile Header - Always Visible */}
      <PatientProfileHeader
        patient={patientData}
        onCallClick={handleCallClick}
        isCallLoading={isCallLoading}
      />

      <div className="p-6 space-y-6">
        {/* Overall Progress Bar with Stages */}
        <OverallProgressBar
          stages={stageProgress}
          overallProgress={57}
          completedForms={3}
          totalForms={7}
          targetDate={patientData.targetCompletion}
        />

        {/* KPI Tracker - VoiceAI Call Metrics */}
        <KPITracker
          callMetrics={callMetrics}
          totalCalls={3}
          totalCallDuration="72 min"
          formsAutoFilled={3}
        />

        {/* Data Tabs */}
        <Tabs defaultValue="forms" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="forms">Forms & Documents</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="forms" className="space-y-4">
            {/* Task Forms */}
            <div className="space-y-3">
              {forms.map((form) => (
                <TaskFormCard
                  key={form.id}
                  form={form}
                  onCallClick={handleCallClick}
                  isCallLoading={isCallLoading}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-4">
            <ConsolidatedAssessmentView
              intakeResults={intakeResults}
              intakeCallDate="Oct 24, 2025"
              intakeDuration="23 minutes"
            />
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>VoiceAI Automation Rules</CardTitle>
                <CardDescription>
                  Automatic form field mapping from voice capture sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {automationRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="text-sm">{rule.rule}</span>
                      </div>
                      <Badge
                        variant={
                          rule.status === "triggered" ? "default" : "outline"
                        }
                      >
                        {rule.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                <CardDescription>Activity log for MC-2024-1234</CardDescription>
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
                    {
                      time: "6 hours ago",
                      action: "Medicaid Application validated via MMIS",
                      user: "System",
                      status: "success",
                    },
                    {
                      time: "1 day ago",
                      action: "Case initiated",
                      user: "John Williams, Case Manager",
                      status: "info",
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
                        {idx < 3 && (
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
      </div>
    </div>
  );
}
