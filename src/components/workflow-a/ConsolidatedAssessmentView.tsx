import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CallTranscriptModal } from "./CallTranscriptModal";

interface IntakeResult {
  domain: string;
  findings: string;
}

interface TranscriptMessage {
  role: string;
  message?: string;
  content?: string;
}

interface ConsolidatedAssessmentViewProps {
  intakeResults: IntakeResult[];
  intakeCallDate?: string;
  intakeDuration?: string;
  transcript?: TranscriptMessage[] | string;
  patientName?: string;
}

export function ConsolidatedAssessmentView({
  intakeResults,
  intakeCallDate,
  intakeDuration,
  transcript,
  patientName = "Patient",
}: ConsolidatedAssessmentViewProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  // Separate summary from other domains
  const summaryResult = intakeResults.find(r => r.domain.toLowerCase() === "summary");
  const domainResults = intakeResults.filter(r => r.domain.toLowerCase() !== "summary");

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Remote Intake Assessment</CardTitle>
              <CardDescription>
                {intakeCallDate && `Completed on ${intakeCallDate}`}
                {intakeDuration && ` • Duration: ${intakeDuration}`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTranscriptOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              See Call Transcript
            </Button>
          </div>
        </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Domain</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domainResults.map((result, idx) => {
              const hasData = result.findings.trim().length > 0;
              return (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{result.domain}</TableCell>
                  <TableCell>
                    {hasData ? (
                      <span className="text-sm">{result.findings}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No data captured</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {summaryResult && (
          <div className="border-t pt-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Assessment Summary</h3>
              <div className="bg-muted/50 rounded-lg p-4 border">
                <p className="text-sm leading-relaxed">{summaryResult.findings}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    <CallTranscriptModal
      open={transcriptOpen}
      onOpenChange={setTranscriptOpen}
      transcript={transcript || []}
      patientName={patientName}
    />
  </>
  );
}
