import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface StageProgress {
  name: string;
  progress: number;
  status: "complete" | "in-progress" | "pending";
}

interface OverallProgressBarProps {
  stages: StageProgress[];
  overallProgress: number;
  completedForms: number;
  totalForms: number;
  targetDate: string;
}

export function OverallProgressBar({
  stages,
  overallProgress,
  completedForms,
  totalForms,
  targetDate,
}: OverallProgressBarProps) {
  return (
    <Card className="shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Overall Case Progress</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {completedForms} of {totalForms} forms completed • Target Completion: {targetDate}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    stage.status === "complete"
                      ? "bg-success border-success text-success-foreground"
                      : stage.status === "in-progress"
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {stage.status === "complete" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : stage.status === "in-progress" ? (
                    <Clock className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-xs font-medium text-foreground">{stage.name}</p>
                </div>
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`w-24 h-0.5 mx-2 ${
                    stage.status === "complete" ? "bg-success" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
