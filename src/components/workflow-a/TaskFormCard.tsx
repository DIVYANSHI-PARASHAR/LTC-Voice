import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle2, Clock, AlertCircle, Mic, Phone, ExternalLink } from "lucide-react";

interface TaskFormCardProps {
  form: {
    id: number;
    name: string;
    code: string;
    status: "complete" | "in-review" | "pending";
    progress: number;
    startTime?: string;
    endTime?: string;
    duration?: string;
    voiceAIActive?: boolean;
    formUrl?: string;
  };
  onCallClick: () => void;
  isCallLoading?: boolean;
  onViewClick?: () => void;
  patientId?: string;
}

const statusConfig = {
  complete: {
    color: "text-success",
    bg: "bg-success/10",
    icon: CheckCircle2,
    label: "Complete",
    badgeVariant: "outline" as const,
  },
  "in-review": {
    color: "text-warning",
    bg: "bg-warning/10",
    icon: Clock,
    label: "Ready for Review",
    badgeVariant: "secondary" as const,
  },
  pending: {
    color: "text-muted-foreground",
    bg: "bg-muted",
    icon: AlertCircle,
    label: "Not Started",
    badgeVariant: "outline" as const,
  },
};

export function TaskFormCard({ form, onCallClick, isCallLoading, onViewClick, patientId }: TaskFormCardProps) {
  const config = statusConfig[form.status];
  const StatusIcon = config.icon;
  const isRobertJenkins = patientId === "7";

  return (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-3 rounded-lg ${config.bg}`}>
                <FileText className={`h-5 w-5 ${config.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{form.name}</h4>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {form.status !== "complete" && !isRobertJenkins && (
                  <Button size="sm">
                    {form.status === "in-review" ? "Review" : "Begin"}
                  </Button>
                )}
                {(form.status === "complete" || (form.status === "in-review" && isRobertJenkins)) && (
                  <Button variant="outline" size="sm" onClick={onViewClick}>
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}
