# Supabase Integration Migration Guide

## Summary of Changes

All Supabase-related code has been consolidated into the `src/integrations/supabase/` directory for better organization.

## New Directory Structure

```
src/integrations/supabase/
├── client.ts              # Supabase client (unchanged)
├── types.ts               # Database types (unchanged)
├── index.ts               # NEW: Barrel exports for easy importing
├── utils.ts               # MOVED from src/lib/supabase-utils.ts
├── examples.tsx           # MOVED from src/lib/supabase-examples.tsx
├── hooks/
│   └── use-patients.ts    # MOVED from src/hooks/use-patients.ts
└── README.md              # NEW: Complete documentation
```

## Import Path Changes

### Before (Old Paths) ❌

```typescript
// Old - scattered imports
import { supabase } from '@/integrations/supabase/client';
import { usePatients } from '@/hooks/use-patients';
import { uploadFile } from '@/lib/supabase-utils';
import type { Tables } from '@/integrations/supabase/types';
```

### After (New Paths) ✅

```typescript
// New - single import source
import {
  supabase,        // Client
  usePatients,     // Hooks
  uploadFile,      // Utilities
  type Tables      // Types
} from '@/integrations/supabase';
```

## Migration Checklist

If you have existing code that imports from the old locations, update as follows:

### 1. Update Hook Imports

**Before:**
```typescript
import { usePatients, useCreatePatient } from '@/hooks/use-patients';
```

**After:**
```typescript
import { usePatients, useCreatePatient } from '@/integrations/supabase';
```

### 2. Update Utility Imports

**Before:**
```typescript
import { uploadFile, getPatientStats } from '@/lib/supabase-utils';
```

**After:**
```typescript
import { uploadFile, getPatientStats } from '@/integrations/supabase';
```

### 3. Client Imports (Optional Update)

**Before (still works):**
```typescript
import { supabase } from '@/integrations/supabase/client';
```

**After (recommended):**
```typescript
import { supabase } from '@/integrations/supabase';
```

### 4. Type Imports (Optional Update)

**Before (still works):**
```typescript
import type { Tables } from '@/integrations/supabase/types';
```

**After (recommended):**
```typescript
import type { Tables } from '@/integrations/supabase';
```

## Benefits of New Structure

✅ **Single Import Source** - Import everything from `@/integrations/supabase`
✅ **Better Organization** - All Supabase code in one place
✅ **Clear Separation** - Client, hooks, utils, and types logically grouped
✅ **Easy Discovery** - New developers know where to find Supabase code
✅ **Consistent Patterns** - Follow standard integration patterns

## Example: Complete Component Migration

### Before

```typescript
import { supabase } from '@/integrations/supabase/client';
import { usePatients, useCreatePatient } from '@/hooks/use-patients';
import { getPatientStats } from '@/lib/supabase-utils';
import type { Tables } from '@/integrations/supabase/types';

type Patient = Tables<'patients'>;

export function PatientDashboard() {
  const { data: patients } = usePatients();
  const createPatient = useCreatePatient();
  // ... component code
}
```

### After

```typescript
import {
  supabase,
  usePatients,
  useCreatePatient,
  getPatientStats,
  type Tables
} from '@/integrations/supabase';

type Patient = Tables<'patients'>;

export function PatientDashboard() {
  const { data: patients } = usePatients();
  const createPatient = useCreatePatient();
  // ... component code
}
```

## No Breaking Changes

The old import paths will continue to work if you reference the specific files:
- `@/integrations/supabase/client` still works
- `@/integrations/supabase/types` still works

But we recommend using the new barrel export `@/integrations/supabase` for consistency.

## Need Help?

Check the [README.md](./README.md) for complete documentation and examples.
