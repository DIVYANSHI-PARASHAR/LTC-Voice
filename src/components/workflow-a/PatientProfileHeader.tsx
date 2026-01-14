import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MessageSquare } from "lucide-react";

interface PatientProfileHeaderProps {
  patient: {
    name: string;
    age: number;
    caseId: string;
    insurance: string;
    diagnosis: string;
    facilityType: string;
    preferredLanguage: string;
    status: "in-progress" | "under-review" | "complete";
    timeSinceReferral: string;
    targetCompletion: string;
  };
  workflowStatus?: string;
  onCallClick: () => void;
  isCallLoading?: boolean;
}

const statusConfig = {
  "in-progress": { label: "In Progress", variant: "default" as const },
  "under-review": { label: "Under Review", variant: "secondary" as const },
  "complete": { label: "Complete", variant: "outline" as const },
};

export function PatientProfileHeader({ patient, workflowStatus, onCallClick, isCallLoading }: PatientProfileHeaderProps) {
  const status = statusConfig[patient.status];

  // Determine button text based on workflow status
  const getButtonText = () => {
    if (isCallLoading) return 'Initiating...';

    switch (workflowStatus) {
      case "Referral":
        return "Sync data from EMR";
      case "Remote Intake":
        return "Initiate Remote Intake Process";
      case "Nurse Assessment":
        return "Initiate In-Patient Assessment";
      case "Authorization":
        return "Request Authorization";
      default:
        return "Initiate Remote Intake Process";
    }
  };

  return (
    <Card className="border-b rounded-none shadow-sm bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>Age: {patient.age}</span>
                  <span>•</span>
                  <span>Case ID: {patient.caseId}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onCallClick}
                disabled={isCallLoading}
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                {getButtonText()}
              </Button>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Send SMS
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Insurance Type:</span>
              <p className="font-medium text-foreground">{patient.insurance}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Primary Diagnosis:</span>
              <p className="font-medium text-foreground">{patient.diagnosis}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Facility Type:</span>
              <p className="font-medium text-foreground">{patient.facilityType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Preferred Language:</span>
              <p className="font-medium text-foreground">{patient.preferredLanguage}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Time Since Referral:</span>
              <p className="font-medium text-foreground">{patient.timeSinceReferral}</p>
            </div>
          </div>
        </div>
      </Card>
  );
}
