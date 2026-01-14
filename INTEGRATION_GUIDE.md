# VitalStream Workflow - Integration Guide

This guide shows how to use the VAPI and Supabase integrations in your VitalStream Workflow application.

## Table of Contents

1. [VAPI Voice AI Integration](#vapi-voice-ai-integration)
2. [Supabase Database Integration](#supabase-database-integration)
3. [Combined Example: Voice Call with Database](#combined-example)

---

## VAPI Voice AI Integration

### Setup

Add to your `.env` file:

```env
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=your-assistant-id  # Optional
```

### Quick Start

```typescript
import { startCall, stopCall, setupEventListeners } from '@/integrations/vapi';

// Set up event listeners
setupEventListeners({
  onCallStart: () => console.log('Call started'),
  onCallEnd: () => console.log('Call ended'),
  onMessage: (msg) => console.log('Message:', msg),
});

// Start a call
await startCall({
  patientName: 'John Doe',
});

// Stop the call
stopCall();
```

### Files

```
src/integrations/vapi/
├── index.ts       # Import everything from here
├── client.ts      # VAPI Web SDK client
├── types.ts       # TypeScript types
├── examples.ts    # Usage examples
└── README.md      # Full documentation
```

### Documentation

See `src/integrations/vapi/README.md` for complete documentation.

---

## Supabase Database Integration

### Setup

Add to your `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### Quick Start

```typescript
import {
  usePatients,
  useCreatePatient,
  getPatientStats,
  type Tables
} from '@/integrations/supabase';

// Fetch patients
const { data: patients, isLoading } = usePatients();

// Create a patient
const createPatient = useCreatePatient();
await createPatient.mutateAsync({
  name: 'Jane Doe',
  age: 70,
  status: 'Intake',
});

// Get statistics
const stats = await getPatientStats();
```

### Files

```
src/integrations/supabase/
├── index.ts           # Import everything from here
├── client.ts          # Supabase client
├── types.ts           # Database types
├── utils.ts           # Utility functions
├── examples.tsx       # Example components
├── hooks/
│   └── use-patients.ts # React Query hooks
└── README.md          # Full documentation
```

### Documentation

See `src/integrations/supabase/README.md` for complete documentation.

---

## Combined Example: Voice Call with Database

Here's a complete example showing how to use both VAPI and Supabase together:

### Scenario: Start a voice call with a patient and save call records

```typescript
import { useState, useEffect } from 'react';
import { startCall, stopCall, setupEventListeners } from '@/integrations/vapi';
import {
  usePatient,
  useUpdatePatient,
  type Tables
} from '@/integrations/supabase';
import { useToast } from '@/hooks/use-toast';

type Patient = Tables<'patients'>;

export function PatientCallInterface({ patientId }: { patientId: string }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  const { toast } = useToast();
  const { data: patient } = usePatient(patientId);
  const updatePatient = useUpdatePatient();

  useEffect(() => {
    // Set up VAPI event listeners
    setupEventListeners({
      onCallStart: () => {
        setIsCallActive(true);
        setCallStartTime(new Date());

        toast({
          title: "Call started",
          description: `Connected with ${patient?.name}`,
        });

        // Update patient status in database
        updatePatient.mutate({
          id: patientId,
          updates: { status: 'In Call' },
        });
      },

      onCallEnd: () => {
        setIsCallActive(false);
        const duration = callStartTime
          ? Math.round((Date.now() - callStartTime.getTime()) / 1000)
          : 0;

        toast({
          title: "Call ended",
          description: `Call duration: ${duration} seconds`,
        });

        // Update patient status after call
        updatePatient.mutate({
          id: patientId,
          updates: { status: 'Assessment Complete' },
        });
      },

      onError: (error) => {
        toast({
          title: "Call error",
          description: "An error occurred during the call",
          variant: "destructive",
        });

        console.error('Call error:', error);
      },

      onMessage: (message) => {
        console.log('VAPI message:', message);
        // You could save important messages to the database here
      },
    });
  }, [patientId, patient?.name]);

  const handleStartCall = async () => {
    if (!patient) {
      toast({
        title: "Error",
        description: "Patient not found",
        variant: "destructive",
      });
      return;
    }

    try {
      await startCall({
        patientName: patient.name,
        assistantOverrides: {
          metadata: {
            patientId: patient.id,
            caseId: patient.case_id,
          },
        },
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      toast({
        title: "Call failed",
        description: "Could not initiate call",
        variant: "destructive",
      });
    }
  };

  const handleStopCall = () => {
    stopCall();
  };

  if (!patient) {
    return <div>Loading patient...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="border rounded-lg p-4">
        <h2 className="text-2xl font-bold">{patient.name}</h2>
        <p className="text-muted-foreground">Case ID: {patient.case_id}</p>
        <p className="text-muted-foreground">Status: {patient.status}</p>
        <p className="text-muted-foreground">Phone: {patient.phone}</p>
      </div>

      <div className="flex gap-4">
        {!isCallActive ? (
          <button
            onClick={handleStartCall}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Start Voice Call
          </button>
        ) : (
          <button
            onClick={handleStopCall}
            className="px-4 py-2 bg-destructive text-white rounded-lg"
          >
            End Call
          </button>
        )}
      </div>

      {isCallActive && (
        <div className="border rounded-lg p-4 bg-green-50">
          <p className="text-green-800 font-semibold">
            🎙️ Call in progress...
          </p>
          <p className="text-sm text-green-600">
            VoiceAI is capturing the conversation
          </p>
        </div>
      )}
    </div>
  );
}
```

### Key Integration Points

1. **Patient Data from Supabase** → Used to personalize VAPI call
2. **VAPI Call Events** → Trigger database updates
3. **Status Tracking** → Patient status updated based on call lifecycle
4. **Metadata** → Patient info passed to VAPI for context
5. **Error Handling** → Errors from both services handled gracefully

---

## Best Practices

### 1. Error Handling

Always wrap integration calls in try/catch:

```typescript
try {
  await startCall({ patientName: 'John' });
  await createPatient.mutateAsync({ name: 'John' });
} catch (error) {
  console.error('Operation failed:', error);
  // Show user-friendly error message
}
```

### 2. Loading States

Use React Query's built-in loading states:

```typescript
const { data, isLoading, error } = usePatients();

if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <PatientList patients={data} />;
```

### 3. Type Safety

Leverage TypeScript types:

```typescript
import type { Tables } from '@/integrations/supabase';
import type { VAPICall } from '@/lib/vapi-types';

type Patient = Tables<'patients'>;
```

### 4. Event Cleanup

Always clean up event listeners:

```typescript
useEffect(() => {
  setupEventListeners({ /* ... */ });

  return () => {
    removeEventListeners();
  };
}, []);
```

---

## Environment Variables Summary

Required `.env` configuration:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# VAPI
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=your-assistant-id  # Optional
```

---

## Getting Help

- **VAPI Issues**: Check `src/lib/vapi-example.ts`
- **Supabase Issues**: Check `src/integrations/supabase/README.md`
- **Type Errors**: Ensure types are imported from the correct location
- **Connection Errors**: Verify environment variables are set correctly

---

## Next Steps

1. Set up your environment variables
2. Test VAPI integration with `startCall()`
3. Test Supabase with `usePatients()`
4. Build your first integrated feature
5. Refer to examples for common patterns
