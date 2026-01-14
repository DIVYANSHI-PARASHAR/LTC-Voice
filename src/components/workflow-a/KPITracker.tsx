import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, CheckCircle2, FileText } from "lucide-react";

interface VoiceCallMetric {
  callDate: string;
  callTime: string;
  duration: string;
  status: "completed" | "in-progress" | "failed";
  transcriptionStatus: "complete" | "processing" | "pending";
  formsGenerated: number;
}

interface KPITrackerProps {
  callMetrics: VoiceCallMetric[];
  totalCalls: number;
  totalCallDuration: string;
  formsAutoFilled: number;
}

export function KPITracker({
  callMetrics,
  totalCalls,
  totalCallDuration,
  formsAutoFilled,
}: KPITrackerProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Patient VoiceAI Call Metrics</CardTitle>
        <CardDescription>Voice call history and automation analytics for this patient</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Top KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Total Calls</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed voice calls</p>
          </div>

          <div className="p-4 rounded-lg bg-success/5 border border-success/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-muted-foreground">Total Call Time</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalCallDuration}</div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative duration</p>
          </div>

          <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">Forms Generated</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{formsAutoFilled}</div>
            <p className="text-xs text-muted-foreground mt-1">Auto-filled from calls</p>
          </div>
        </div>

        {/* Call History Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50">
            <div className="grid grid-cols-6 gap-4 p-3 text-xs font-medium text-muted-foreground">
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Time</div>
              <div className="col-span-1">Duration</div>
              <div className="col-span-1">Call Status</div>
              <div className="col-span-1">Transcription</div>
              <div className="col-span-1">Forms Generated</div>
            </div>
          </div>
          <div className="divide-y">
            {callMetrics.map((metric, index) => (
              <div key={index} className="grid grid-cols-6 gap-4 p-3 text-sm">
                <div className="col-span-1 font-medium text-foreground">{metric.callDate}</div>
                <div className="col-span-1 text-muted-foreground">{metric.callTime}</div>
                <div className="col-span-1 font-medium text-foreground">{metric.duration}</div>
                <div className="col-span-1">
                  {metric.status === "completed" ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  ) : metric.status === "in-progress" ? (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                      Failed
                    </Badge>
                  )}
                </div>
                <div className="col-span-1">
                  {metric.transcriptionStatus === "complete" ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      Complete
                    </Badge>
                  ) : metric.transcriptionStatus === "processing" ? (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      Processing
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="col-span-1 text-muted-foreground text-center">{metric.formsGenerated}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
