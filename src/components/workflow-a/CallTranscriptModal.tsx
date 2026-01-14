import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TranscriptMessage {
  role: string;
  message?: string;
  content?: string;
}

interface CallTranscriptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transcript: TranscriptMessage[] | string;
  patientName?: string;
}

export function CallTranscriptModal({
  open,
  onOpenChange,
  transcript,
  patientName = "Patient",
}: CallTranscriptModalProps) {
  // Parse transcript into individual messages
  const parseTranscript = (): Array<{ role: string; content: string }> => {
    if (!transcript) return [];

    // If transcript is an array with a conversation role, extract the content
    if (Array.isArray(transcript) && transcript.length > 0) {
      const conversationText = transcript[0].content || transcript[0].message || '';

      // Split by "AI:" and "User:" to create separate messages
      const parts = conversationText.split(/\n(?=AI:|User:)/);
      const parsedMessages: Array<{ role: string; content: string }> = [];

      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.startsWith('AI:')) {
          parsedMessages.push({
            role: 'assistant',
            content: trimmed.replace(/^AI:\s*/, '').trim()
          });
        } else if (trimmed.startsWith('User:')) {
          parsedMessages.push({
            role: 'user',
            content: trimmed.replace(/^User:\s*/, '').trim()
          });
        }
      });

      return parsedMessages;
    }

    // If it's already an array of messages, return as-is
    if (Array.isArray(transcript)) {
      return transcript.map(msg => ({
        role: msg.role,
        content: msg.message || msg.content || ''
      }));
    }

    return [];
  };

  const messages = parseTranscript();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Call Transcript</DialogTitle>
          <DialogDescription>
            Remote intake assessment conversation with {patientName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role?.toLowerCase().includes('assistant') ||
                                 msg.role?.toLowerCase().includes('ai') ||
                                 msg.role?.toLowerCase().includes('system');

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex",
                    isAssistant ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                      isAssistant
                        ? "bg-muted text-foreground rounded-tl-sm"
                        : "bg-primary text-primary-foreground rounded-tr-sm"
                    )}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70">
                      {isAssistant ? "VitalStream AI" : patientName}
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            })}

            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No transcript available
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
