# Integrations Directory

This directory contains all third-party service integrations for the VitalStream Workflow application.

## Directory Structure

```
integrations/
├── supabase/          # Supabase database integration
│   ├── index.ts       # Barrel exports
│   ├── client.ts      # Supabase client
│   ├── types.ts       # Database types
│   ├── utils.ts       # Utility functions
│   ├── examples.tsx   # Example components
│   ├── hooks/
│   │   └── use-patients.ts
│   ├── README.md
│   └── MIGRATION_GUIDE.md
│
├── vapi/              # VAPI Voice AI integration
│   ├── index.ts       # Barrel exports
│   ├── client.ts      # VAPI Web SDK client
│   ├── types.ts       # Type definitions
│   ├── examples.ts    # Example usage
│   ├── README.md
│   └── MIGRATION_GUIDE.md
│
└── README.md          # This file
```

## Quick Reference

### Import Patterns

All integrations follow the same pattern - import from the integration's index:

```typescript
// Supabase
import { supabase, usePatients, getPatientStats, type Tables } from '@/integrations/supabase';

// VAPI
import { startCall, stopCall, setupEventListeners, type VAPICall } from '@/integrations/vapi';
```

### Supabase Integration

**Purpose:** PostgreSQL database with real-time subscriptions, authentication, and storage

**Key Features:**
- React Query hooks for data fetching
- Real-time subscriptions
- Authentication helpers
- File storage utilities
- Type-safe database operations

**Quick Start:**
```typescript
import { usePatients, useCreatePatient } from '@/integrations/supabase';

const { data: patients } = usePatients();
const createPatient = useCreatePatient();
```

**Documentation:** [supabase/README.md](./supabase/README.md)

### VAPI Integration

**Purpose:** Browser-based voice AI conversations

**Key Features:**
- Start/stop voice calls
- Real-time event listeners
- Mute/unmute controls
- Send messages during calls
- Custom assistant configuration

**Quick Start:**
```typescript
import { startCall, setupEventListeners } from '@/integrations/vapi';

setupEventListeners({
  onCallStart: () => console.log('Started'),
  onCallEnd: () => console.log('Ended'),
});

await startCall({ patientName: 'John' });
```

**Documentation:** [vapi/README.md](./vapi/README.md)

## Environment Variables

### Required Configuration

Create a `.env` file in the project root with:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# VAPI
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=your-assistant-id  # Optional
```

## Integration Patterns

### 1. Barrel Exports

Each integration provides a single import source via `index.ts`:

```typescript
// ✅ Good - single import
import { supabase, usePatients } from '@/integrations/supabase';

// ❌ Avoid - multiple imports
import { supabase } from '@/integrations/supabase/client';
import { usePatients } from '@/integrations/supabase/hooks/use-patients';
```

### 2. TypeScript Types

All types are exported from the main module:

```typescript
import { type Tables, type VAPICall } from '@/integrations/supabase';
```

### 3. Documentation

Each integration has:
- `README.md` - Complete documentation
- `MIGRATION_GUIDE.md` - Migration instructions
- `examples.ts/tsx` - Working code examples

## Combined Usage Example

Using both integrations together:

```typescript
import { useState, useEffect } from 'react';
import { startCall, setupEventListeners } from '@/integrations/vapi';
import { usePatient, useUpdatePatient } from '@/integrations/supabase';

export function PatientCall({ patientId }: { patientId: string }) {
  const [isActive, setIsActive] = useState(false);
  const { data: patient } = usePatient(patientId);
  const updatePatient = useUpdatePatient();

  useEffect(() => {
    setupEventListeners({
      onCallStart: () => {
        setIsActive(true);
        updatePatient.mutate({
          id: patientId,
          updates: { status: 'In Call' },
        });
      },
      onCallEnd: () => {
        setIsActive(false);
        updatePatient.mutate({
          id: patientId,
          updates: { status: 'Call Complete' },
        });
      },
    });
  }, [patientId]);

  const handleStart = async () => {
    await startCall({ patientName: patient?.name });
  };

  return (
    <button onClick={handleStart} disabled={isActive}>
      {isActive ? 'Call Active' : 'Start Call'}
    </button>
  );
}
```

## Adding New Integrations

When adding a new third-party integration:

1. Create a new directory: `integrations/your-service/`
2. Create these files:
   - `index.ts` - Barrel exports
   - `client.ts` - Client/SDK initialization
   - `types.ts` - TypeScript types
   - `README.md` - Documentation
   - `examples.ts` - Usage examples
3. Follow the same patterns as existing integrations
4. Update this README with the new integration

## File Organization Rules

### What Goes in Integrations

- Third-party service clients
- SDK wrappers
- API utilities
- Service-specific types
- Integration examples

### What Goes Elsewhere

- React components → `src/components/`
- General utilities → `src/lib/`
- React hooks (non-integration) → `src/hooks/`
- Pages → `src/pages/`

## Best Practices

1. **Single Import Source** - Always import from `@/integrations/[service]`
2. **Type Safety** - Use exported TypeScript types
3. **Error Handling** - All functions should throw errors, not return them
4. **Documentation** - Keep READMEs up to date
5. **Examples** - Provide working code examples
6. **Environment Variables** - Use `VITE_` prefix for client-side vars
7. **Consistency** - Follow established patterns

## Resources

- [Main Integration Guide](../../INTEGRATION_GUIDE.md) - Complete usage guide
- [Supabase Documentation](./supabase/README.md)
- [VAPI Documentation](./vapi/README.md)

## Need Help?

1. Check the integration's README
2. Review example code
3. Check migration guides
4. Refer to the main [INTEGRATION_GUIDE.md](../../INTEGRATION_GUIDE.md)
