# Supabase Integration

This directory contains all Supabase-related code for the VitalStream Workflow application.

## Directory Structure

```
integrations/supabase/
├── client.ts           # Supabase client initialization
├── types.ts            # Auto-generated TypeScript types from database schema
├── index.ts            # Barrel exports for easy importing
├── utils.ts            # Utility functions for common operations
├── examples.tsx        # Example components showing usage patterns
├── hooks/
│   └── use-patients.ts # React Query hooks for patients table
└── README.md           # This file
```

## Quick Start

### Import Everything from One Place

```typescript
import {
  supabase,           // Supabase client
  usePatients,        // React Query hooks
  getPatientStats,    // Utility functions
  type Tables,        // TypeScript types
} from '@/integrations/supabase';
```

## Usage Examples

### 1. Fetch Patients (React Query Hook)

```typescript
import { usePatients } from '@/integrations/supabase';

export function PatientsList() {
  const { data: patients, isLoading, error } = usePatients();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {patients?.map((patient) => (
        <div key={patient.id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

### 2. Create a Patient

```typescript
import { useCreatePatient } from '@/integrations/supabase';

export function CreatePatient() {
  const createPatient = useCreatePatient();

  const handleCreate = async () => {
    await createPatient.mutateAsync({
      name: 'John Doe',
      age: 65,
      status: 'Intake',
      insurance: 'Medicaid',
    });
  };

  return (
    <button onClick={handleCreate} disabled={createPatient.isPending}>
      Create Patient
    </button>
  );
}
```

### 3. Update a Patient

```typescript
import { useUpdatePatient } from '@/integrations/supabase';

const updatePatient = useUpdatePatient();

await updatePatient.mutateAsync({
  id: patientId,
  updates: { status: 'Approved' },
});
```

### 4. Search Patients

```typescript
import { useSearchPatients } from '@/integrations/supabase';

const [searchTerm, setSearchTerm] = useState('');
const { data: patients } = useSearchPatients(searchTerm);
```

### 5. Real-time Subscriptions

```typescript
import { subscribeToTable } from '@/integrations/supabase';

useEffect(() => {
  const unsubscribe = subscribeToTable('patients', (payload) => {
    console.log('Patient changed:', payload);
    // Handle the change
  });

  return () => unsubscribe();
}, []);
```

### 6. Direct Supabase Client Usage

```typescript
import { supabase } from '@/integrations/supabase';

// Fetch data
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .eq('status', 'Active');

// Insert data
const { data, error } = await supabase
  .from('patients')
  .insert({ name: 'Jane Doe', age: 70 });
```

## Available Hooks

All hooks are in `hooks/use-patients.ts`:

- `usePatients()` - Fetch all patients
- `usePatient(id)` - Fetch single patient by ID
- `usePatientsByStatus(status)` - Filter patients by status
- `useCreatePatient()` - Create a new patient (mutation)
- `useUpdatePatient()` - Update an existing patient (mutation)
- `useDeletePatient()` - Delete a patient (mutation)
- `useSearchPatients(searchTerm)` - Search patients by name
- `useRealtimePatients()` - Subscribe to real-time patient changes

## Available Utilities

All utilities are in `utils.ts`:

### File Storage
- `uploadFile(bucket, path, file)` - Upload file to Supabase Storage
- `deleteFile(bucket, path)` - Delete file from Storage

### Authentication
- `getCurrentUser()` - Get the current authenticated user
- `signIn(email, password)` - Sign in with credentials
- `signOut()` - Sign out the current user
- `signUp(email, password)` - Create a new user account
- `resetPassword(email)` - Send password reset email

### Patient Operations
- `batchCreatePatients(patients[])` - Create multiple patients at once
- `getPatientStats()` - Get statistics grouped by status
- `getRecentPatients()` - Get patients from last 7 days
- `getPatientsByDateRange(start, end)` - Get patients within date range
- `countPatientsByStatus(status)` - Count patients with specific status
- `patientExistsByCaseId(caseId)` - Check if patient exists
- `bulkUpdatePatients(updates[])` - Update multiple patients

### Advanced
- `invokeEdgeFunction(name, payload)` - Call Supabase Edge Functions
- `subscribeToTable(table, callback, filter?)` - Subscribe to table changes
- `executeRawQuery(query)` - Execute raw SQL queries

## TypeScript Types

Import types from the module:

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase';

type Patient = Tables<'patients'>;
type PatientInsert = TablesInsert<'patients'>;
type PatientUpdate = TablesUpdate<'patients'>;
```

## Environment Variables

Required in your `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

## Database Schema

The `patients` table has the following columns:

- `id` (UUID) - Primary key
- `name` (TEXT) - Patient name (required)
- `age` (INTEGER) - Patient age
- `case_id` (TEXT) - Case identifier
- `status` (TEXT) - Current status
- `insurance` (TEXT) - Insurance provider
- `diagnosis` (TEXT) - Medical diagnosis
- `facility_type` (TEXT) - Type of care facility
- `preferred_language` (TEXT) - Language preference
- `phone` (TEXT) - Contact phone number
- `referral_date` (TIMESTAMP) - Date of referral
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time (auto-updated)

## Best Practices

1. **Use Hooks for UI Components** - React Query hooks provide caching, loading states, and automatic refetching
2. **Use Utilities for Complex Logic** - Use utility functions for batch operations, statistics, etc.
3. **Use Direct Client for Custom Queries** - For complex queries not covered by hooks/utils
4. **Handle Errors Gracefully** - All hooks and utilities throw errors, use try/catch or error states
5. **Leverage Type Safety** - Use the exported TypeScript types for type checking

## Examples

See `examples.tsx` for complete working examples of all common patterns.

## Regenerating Types

When you update your database schema in Supabase, regenerate the types:

```bash
npx supabase gen types typescript --project-id <project-id> > src/integrations/supabase/types.ts
```
