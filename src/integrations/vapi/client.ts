// Minimal VAPI client stub to satisfy CallInterface imports
// Replace with real implementation when integrating with VAPI SDK

type EventHandlers = {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (error: unknown) => void;
};

let handlers: EventHandlers = {};
let muted = false;
let activeTimeout: number | undefined;

export function setupEventListeners(h: EventHandlers) {
  handlers = h;
}

export async function startCall(_opts: { patientName: string; assistantOverrides?: Record<string, unknown> }) {
  // Simulate async start
  queueMicrotask(() => handlers.onCallStart?.());
  // Auto-end after 30s in stub
  activeTimeout = setTimeout(() => {
    handlers.onCallEnd?.();
  }, 30000) as unknown as number;
}

export function stopCall() {
  if (activeTimeout) {
    clearTimeout(activeTimeout as unknown as number);
    activeTimeout = undefined;
  }
  handlers.onCallEnd?.();
}

export function setMuted(value: boolean) {
  muted = value;
  // no-op in stub
}

export function isMuted() {
  return muted;
}
