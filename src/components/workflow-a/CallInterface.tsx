import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { startCall as vapiStartCall, stopCall as vapiStopCall, setMuted as vapiSetMuted, setupEventListeners } from "@/integrations/vapi/client";

interface CallInterfaceProps {
  open: boolean;
  onClose: () => void;
  patientName: string;
  patientPhone?: string;
}

export function CallInterface({ open, onClose, patientName, patientPhone = "(555) 123-4567" }: CallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callInProgressRef = useRef(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCall = async () => {
    console.log('[CallInterface] startCall invoked at', new Date().toISOString());
    
    // Guard: Prevent multiple simultaneous calls
    if (callInProgressRef.current) {
      console.warn('[CallInterface] Call already in progress, ignoring duplicate trigger');
      return;
    }
    
    callInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log('[CallInterface] Setting up VAPI event listeners...');
      
      // Set up VAPI event listeners before starting call
      setupEventListeners({
        onCallStart: () => {
          console.log('[CallInterface] VAPI call started');
          setIsCallActive(true);
          setIsLoading(false);
          
          // Start call duration timer
          intervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
          
          toast({
            title: "Call connected",
            description: "Connected to VoiceAssist AI",
          });
        },
        onCallEnd: () => {
          console.log('[CallInterface] VAPI call ended');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsCallActive(false);
          setCallDuration(0);
          callInProgressRef.current = false;
        },
        onError: (error) => {
          console.error('[CallInterface] VAPI error:', error);
          setIsLoading(false);
          callInProgressRef.current = false;
          toast({
            title: "Call error",
            description: "An error occurred during the call",
            variant: "destructive",
          });
        },
      });
      
      console.log('[CallInterface] Starting VAPI call...');
      
      await vapiStartCall({
        patientName,
        assistantOverrides: {
          firstMessage: `Hello ${patientName}, this is VitalStream calling to complete your healthcare intake assessment. Do you have a few minutes to talk?`,
        },
      });

      console.log('[CallInterface] VAPI call initiated successfully');
      
      toast({
        title: "Call initiating",
        description: "Connecting to VoiceAssist AI...",
      });
      
    } catch (error) {
      console.error('[CallInterface] Error starting VAPI call:', error);
      setIsLoading(false);
      callInProgressRef.current = false;
      
      toast({
        title: "Call failed",
        description: error instanceof Error ? error.message : "Unable to initiate call. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Auto-start the Vapi call when the dialog opens
  useEffect(() => {
    if (open) {
      startCall();
    }
  }, [open]);

  const endCall = () => {
    console.log('[CallInterface] Ending call');
    vapiStopCall();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsCallActive(false);
    setCallDuration(0);
    callInProgressRef.current = false;
    onClose();
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    vapiSetMuted(newMutedState);
    setIsMuted(newMutedState);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Call Interface</DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="pt-6 space-y-6">
            {/* Patient Info */}
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">{patientName}</h3>
              <p className="text-muted-foreground">{patientPhone}</p>
            </div>

            {/* Call Status */}
            <div className="text-center">
              {isCallActive ? (
                <div className="space-y-2">
                  <Badge variant="default" className="animate-pulse">
                    Connected via VoiceAssist AI
                  </Badge>
                  <p className="text-2xl font-mono">{formatDuration(callDuration)}</p>
                </div>
              ) : (
                <Badge variant="outline">Ready to Call</Badge>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex gap-3 justify-center">
              {!isCallActive ? (
                <Button
                  size="lg"
                  onClick={startCall}
                  disabled={isLoading}
                  className="rounded-full w-16 h-16"
                >
                  <Phone className="h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant={isMuted ? "default" : "outline"}
                    onClick={toggleMute}
                    className="rounded-full w-16 h-16"
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={endCall}
                    className="rounded-full w-16 h-16"
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Quick Notes */}
            {isCallActive && (
              <div className="text-sm text-muted-foreground text-center space-y-1">
                <p>🎙️ VoiceAI is capturing conversation</p>
                <p>Forms will auto-populate after call</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
