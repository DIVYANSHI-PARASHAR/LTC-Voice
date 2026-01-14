# VAPI Patient Assessment Storage Guide

This guide explains how to store structured patient assessment data collected from VAPI voice assistant calls into your Supabase database.

## 📋 Table of Contents

1. [Database Schema Overview](#database-schema-overview)
2. [Assessment Data Flow](#assessment-data-flow)
3. [Storing Data from VAPI Calls](#storing-data-from-vapi-calls)
4. [Usage Examples](#usage-examples)
5. [VAPI Webhook Integration](#vapi-webhook-integration)
6. [Best Practices](#best-practices)

---

## 🗂️ Database Schema Overview

The database schema consists of 8 main tables designed to store comprehensive patient assessment data:

### 1. **vapi_calls**
Stores metadata about each VAPI voice call.

**Key Fields:**
- `vapi_call_id` - The actual call ID from VAPI
- `patient_id` - Links to the patient
- `call_status`, `call_type` - Call metadata
- `transcript`, `summary` - Call content
- `recording_url` - Audio recording link
- `patient_confirmed`, `patient_willing_to_continue` - Consent tracking

### 2. **patient_assessments**
Main assessment record that links all other assessment tables.

**Key Fields:**
- `patient_id` - Links to the patient
- `vapi_call_id` - Links to the VAPI call
- `patient_confirmed_name`, `patient_consent_given` - Consent tracking
- `verbal_summary` - Summary given to patient at end of call
- `assessment_complete` - Whether all sections were completed

### 3. **living_situation**
Captures information about the patient's living environment.

**Key Fields:**
- `lives_alone`, `lives_with`, `lives_with_details`
- `housing_type` - 'house', 'apartment', 'assisted living', etc.
- `has_stairs_to_enter`, `stairs_inside_home`
- `wheelchair_accessible`, `has_elevator`
- `home_safety_concerns`

### 4. **adl_assessment**
Activities of Daily Living assessment.

**Key Fields:**
- Bathing: `bathing_independent`, `bathing_level`, `bathing_notes`
- Dressing: `dressing_independent`, `dressing_level`, `dressing_notes`
- Toileting: `toileting_independent`, `toileting_level`, `toileting_incontinence`
- Eating: `eating_independent`, `eating_level`, `eating_special_diet`
- Transferring: `transferring_independent`, `transferring_level`
- Mobility: `mobility_independent`, `uses_assistive_device`, `assistive_devices[]`

### 5. **iadl_assessment**
Instrumental Activities of Daily Living assessment.

**Key Fields:**
- Meal Preparation: `meal_prep_independent`, `meal_prep_level`
- Laundry: `laundry_independent`, `laundry_level`
- Shopping: `shopping_independent`, `shopping_level`
- Money Management: `money_management_independent`, `money_management_level`
- **Medication Management**: `medication_management_independent`, `forgets_medications`, `medication_reminders_needed`
- Transportation: `transportation_independent`, `transportation_method`
- Housekeeping: `housekeeping_independent`, `housekeeping_level`
- Phone Use: `phone_use_independent`

### 6. **health_assessment**
Comprehensive health status tracking.

**Key Fields:**
- Chronic Conditions: `has_chronic_conditions`, `chronic_conditions[]`
- Breathing: `has_breathing_issues`, `uses_oxygen`
- Pain: `has_pain`, `pain_level` (0-10), `pain_location`, `pain_frequency`
- Dizziness/Balance: `has_dizziness`, `has_balance_issues`, `fall_risk`, `recent_falls`
- Wounds: `has_wounds`, `wound_location`, `wound_type`, `wound_care_needed`
- Vision/Hearing: `vision_impairment`, `hearing_impairment`, `uses_hearing_aid`
- Sleep: `sleep_issues`, `sleep_details`
- Nutrition: `nutrition_concerns`, `weight_loss`, `weight_gain`

### 7. **cognition_assessment**
Cognitive and mental status evaluation.

**Key Fields:**
- Memory: `has_memory_issues`, `memory_issue_type`, `forgets_recent_events`, `forgets_appointments`
- Orientation: `oriented_to_person`, `oriented_to_place`, `oriented_to_time`
- Decision Making: `decision_making_capacity`
- Communication: `communication_ability`
- Confusion: `experiences_confusion`, `confusion_frequency`
- Diagnosis: `dementia_diagnosis`, `dementia_type`, `cognitive_impairment_level`
- Safety: `wandering_risk`, `safety_concerns`

### 8. **support_network**
Information about caregivers and support systems.

**Key Fields:**
- Formal Caregivers: `has_formal_caregiver`, `formal_caregiver_type`, `formal_caregiver_frequency`
- Informal Caregivers: `has_informal_caregiver`, `informal_caregiver_name`, `informal_caregiver_phone`, `informal_caregiver_relationship`
- Emergency Contact: `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`
- Services: `receives_meals_on_wheels`, `receives_transportation_services`, `receives_other_services`
- Caregiver Burden: `caregiver_burden_concerns`, `caregiver_burden_details`

---

## 🔄 Assessment Data Flow

```
VAPI Call → Structured Data → Database Tables
    ↓
1. Call starts
2. Patient confirms identity
3. Conversation collects data:
   - Living situation
   - ADLs (bathing, dressing, etc.)
   - IADLs (medications, shopping, etc.)
   - Health (pain, conditions, etc.)
   - Cognition (memory, orientation)
   - Support network
4. Call ends with verbal summary
5. Data saved to database
```

---

## 💾 Storing Data from VAPI Calls

### Step 1: Create the VAPI Call Record

When a VAPI call starts or ends, create a record in the `vapi_calls` table:

```typescript
import { useCreateVAPICall } from '@/integrations/supabase/hooks/use-assessments';

const { mutate: createVAPICall } = useCreateVAPICall();

// When you receive VAPI webhook data
createVAPICall({
  patient_id: 'patient-uuid',
  vapi_call_id: vapiData.id,
  call_type: vapiData.type,
  call_status: vapiData.status,
  started_at: vapiData.startedAt,
  ended_at: vapiData.endedAt,
  transcript: vapiData.transcript,
  summary: vapiData.summary,
  recording_url: vapiData.recordingUrl,
  patient_confirmed: true,
  patient_willing_to_continue: true,
  assessment_completed: true,
});
```

### Step 2: Create the Assessment Record

```typescript
import { useCreateAssessment } from '@/integrations/supabase/hooks/use-assessments';

const { mutate: createAssessment } = useCreateAssessment();

createAssessment({
  patient_id: 'patient-uuid',
  vapi_call_id: 'vapi-call-uuid', // from step 1
  assessed_by: 'VAPI Assistant',
  patient_confirmed_name: true,
  patient_consent_given: true,
  assessment_complete: true,
  verbal_summary: 'Patient requires assistance with...',
});
```

### Step 3: Store Assessment Details

After creating the main assessment, store the detailed information in each category:

```typescript
import {
  useSaveLivingSituation,
  useSaveADLAssessment,
  useSaveIADLAssessment,
  useSaveHealthAssessment,
  useSaveCognitionAssessment,
  useSaveSupportNetwork,
} from '@/integrations/supabase/hooks/use-assessments';

// Living Situation
const { mutate: saveLiving } = useSaveLivingSituation();
saveLiving({
  assessment_id: 'assessment-uuid',
  patient_id: 'patient-uuid',
  lives_alone: false,
  lives_with: 'family',
  lives_with_details: 'Lives with spouse and adult daughter',
  housing_type: 'house',
  has_stairs_to_enter: true,
  stairs_inside_home: false,
  wheelchair_accessible: false,
});

// ADL Assessment
const { mutate: saveADL } = useSaveADLAssessment();
saveADL({
  assessment_id: 'assessment-uuid',
  patient_id: 'patient-uuid',
  bathing_independent: false,
  bathing_level: 'requires assistance',
  bathing_notes: 'Needs help getting in/out of tub',
  uses_assistive_device: true,
  assistive_devices: ['walker', 'cane'],
  mobility_level: 'limited',
});

// IADL Assessment (including medication management)
const { mutate: saveIADL } = useSaveIADLAssessment();
saveIADL({
  assessment_id: 'assessment-uuid',
  patient_id: 'patient-uuid',
  medication_management_independent: false,
  forgets_medications: true,
  medication_reminders_needed: true,
  medication_notes: 'Often forgets evening medications',
  meal_prep_independent: true,
  shopping_independent: false,
});

// Health Assessment
const { mutate: saveHealth } = useSaveHealthAssessment();
saveHealth({
  assessment_id: 'assessment-uuid',
  patient_id: 'patient-uuid',
  has_chronic_conditions: true,
  chronic_conditions: ['diabetes', 'hypertension', 'COPD'],
  has_pain: true,
  pain_level: 6,
  pain_location: 'lower back',
  pain_frequency: 'constant',
  has_breathing_issues: true,
  uses_oxygen: true,
});

// Cognition Assessment
const { mutate: saveCognition } = useSaveCognitionAssessment();
saveCognition({
  assessment_id: 'assessment-uuid',
  patient_id: 'patient-uuid',
  has_memory_issues: true,
  memory_issue_type: 'short-term',
  forgets_recent_events: true,
  forgets_appointments: true,
  oriented_to_person: true,
  oriented_to_place: true,
  oriented_to_time: false,
  decision_making_capacity: 'needs support',
});

// Support Network
const { mutate: saveSupport } = useSaveSupportNetwork();
saveSupport({
  assessment_id: 'assessment-uuid',
  patient_id: 'patient-uuid',
  has_informal_caregiver: true,
  informal_caregiver_name: 'Sarah Johnson',
  informal_caregiver_relationship: 'daughter',
  informal_caregiver_phone: '+1234567890',
  informal_caregiver_availability: 'weekends and evenings',
  has_emergency_contact: true,
  emergency_contact_name: 'Sarah Johnson',
  emergency_contact_phone: '+1234567890',
});
```

### Step 4: Save Everything at Once (Recommended)

For better performance, use the `useSaveCompleteAssessment` hook to save all data in one operation:

```typescript
import { useSaveCompleteAssessment } from '@/integrations/supabase/hooks/use-assessments';

const { mutate: saveComplete } = useSaveCompleteAssessment();

saveComplete({
  assessment: {
    patient_id: 'patient-uuid',
    vapi_call_id: 'vapi-call-uuid',
    assessed_by: 'VAPI Assistant',
    patient_confirmed_name: true,
    patient_consent_given: true,
    assessment_complete: true,
  },
  livingSituation: { /* ... */ },
  adlAssessment: { /* ... */ },
  iadlAssessment: { /* ... */ },
  healthAssessment: { /* ... */ },
  cognitionAssessment: { /* ... */ },
  supportNetwork: { /* ... */ },
});
```

---

## 📝 Usage Examples

### Fetching Assessment Data

```typescript
import { useCompleteAssessment } from '@/integrations/supabase/hooks/use-assessments';

function AssessmentView({ assessmentId }: { assessmentId: string }) {
  const { data, isLoading, error } = useCompleteAssessment(assessmentId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Patient Assessment</h2>
      
      {/* Main Assessment Info */}
      <section>
        <h3>Assessment Date: {data.assessment.assessment_date}</h3>
        <p>Assessed by: {data.assessment.assessed_by}</p>
        <p>Complete: {data.assessment.assessment_complete ? 'Yes' : 'No'}</p>
      </section>

      {/* Living Situation */}
      {data.livingSituation && (
        <section>
          <h3>Living Situation</h3>
          <p>Lives Alone: {data.livingSituation.lives_alone ? 'Yes' : 'No'}</p>
          <p>Stairs to Enter: {data.livingSituation.has_stairs_to_enter ? 'Yes' : 'No'}</p>
        </section>
      )}

      {/* ADL Assessment */}
      {data.adlAssessment && (
        <section>
          <h3>Activities of Daily Living</h3>
          <p>Bathing: {data.adlAssessment.bathing_level}</p>
          <p>Uses Assistive Device: {data.adlAssessment.uses_assistive_device ? 'Yes' : 'No'}</p>
          {data.adlAssessment.assistive_devices && (
            <p>Devices: {data.adlAssessment.assistive_devices.join(', ')}</p>
          )}
        </section>
      )}

      {/* IADL - Medication Management */}
      {data.iadlAssessment && (
        <section>
          <h3>Medication Management</h3>
          <p>Independent: {data.iadlAssessment.medication_management_independent ? 'Yes' : 'No'}</p>
          <p>Forgets Medications: {data.iadlAssessment.forgets_medications ? 'Yes' : 'No'}</p>
          <p>Needs Reminders: {data.iadlAssessment.medication_reminders_needed ? 'Yes' : 'No'}</p>
        </section>
      )}

      {/* Health Assessment */}
      {data.healthAssessment && (
        <section>
          <h3>Health Status</h3>
          {data.healthAssessment.chronic_conditions && (
            <p>Conditions: {data.healthAssessment.chronic_conditions.join(', ')}</p>
          )}
          {data.healthAssessment.has_pain && (
            <p>Pain Level: {data.healthAssessment.pain_level}/10</p>
          )}
        </section>
      )}

      {/* Cognition Assessment */}
      {data.cognitionAssessment && (
        <section>
          <h3>Cognitive Status</h3>
          <p>Memory Issues: {data.cognitionAssessment.has_memory_issues ? 'Yes' : 'No'}</p>
          <p>Oriented to Time: {data.cognitionAssessment.oriented_to_time ? 'Yes' : 'No'}</p>
        </section>
      )}

      {/* Support Network */}
      {data.supportNetwork && (
        <section>
          <h3>Support Network</h3>
          {data.supportNetwork.informal_caregiver_name && (
            <>
              <p>Caregiver: {data.supportNetwork.informal_caregiver_name}</p>
              <p>Relationship: {data.supportNetwork.informal_caregiver_relationship}</p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
```

### Viewing All Assessments for a Patient

```typescript
import { usePatientAssessments } from '@/integrations/supabase/hooks/use-assessments';

function PatientAssessmentHistory({ patientId }: { patientId: string }) {
  const { data: assessments, isLoading } = usePatientAssessments(patientId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Assessment History</h2>
      {assessments?.map((assessment) => (
        <div key={assessment.id}>
          <p>Date: {new Date(assessment.assessment_date).toLocaleDateString()}</p>
          <p>Complete: {assessment.assessment_complete ? '✓' : '✗'}</p>
          <p>Assessed by: {assessment.assessed_by}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔗 VAPI Webhook Integration

### Setting up a Webhook Handler

Create a Supabase Edge Function to receive VAPI webhooks:

```typescript
// supabase/functions/vapi-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const vapiEvent = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different event types
    if (vapiEvent.message.type === 'end-of-call-report') {
      const call = vapiEvent.message.call;
      
      // Extract structured data from the call transcript or metadata
      const structuredData = extractStructuredData(call);
      
      // Save VAPI call record
      const { data: vapiCallRecord } = await supabaseClient
        .from('vapi_calls')
        .insert({
          vapi_call_id: call.id,
          patient_id: call.metadata?.patient_id,
          call_type: call.type,
          call_status: call.status,
          started_at: call.startedAt,
          ended_at: call.endedAt,
          transcript: call.transcript,
          summary: call.summary,
          recording_url: call.recordingUrl,
          metadata: call.metadata,
        })
        .select()
        .single();

      // Create assessment record
      const { data: assessment } = await supabaseClient
        .from('patient_assessments')
        .insert({
          patient_id: call.metadata?.patient_id,
          vapi_call_id: vapiCallRecord.id,
          assessed_by: 'VAPI Assistant',
          patient_confirmed_name: structuredData.patientConfirmed,
          patient_consent_given: structuredData.consentGiven,
          assessment_complete: structuredData.isComplete,
          verbal_summary: structuredData.summary,
        })
        .select()
        .single();

      // Save all assessment sections
      if (structuredData.living) {
        await supabaseClient.from('living_situation').insert({
          ...structuredData.living,
          assessment_id: assessment.id,
          patient_id: call.metadata?.patient_id,
        });
      }

      if (structuredData.adl) {
        await supabaseClient.from('adl_assessment').insert({
          ...structuredData.adl,
          assessment_id: assessment.id,
          patient_id: call.metadata?.patient_id,
        });
      }

      // ... save other sections similarly

      return new Response(
        JSON.stringify({ success: true, assessment_id: assessment.id }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to extract structured data from VAPI response
function extractStructuredData(call: any) {
  // Parse the transcript or use VAPI's structured output
  // This depends on how you configured your VAPI assistant
  
  return {
    patientConfirmed: true,
    consentGiven: true,
    isComplete: true,
    summary: call.summary,
    living: {
      lives_alone: false,
      has_stairs_to_enter: true,
      // ... extracted from conversation
    },
    adl: {
      bathing_independent: false,
      uses_assistive_device: true,
      // ... extracted from conversation
    },
    iadl: {
      forgets_medications: true,
      medication_reminders_needed: true,
      // ... extracted from conversation
    },
    // ... other sections
  };
}
```

### Configuring VAPI Assistant for Structured Output

In your VAPI assistant configuration, use function calling or structured output to ensure data is collected in a format that matches your database schema:

```json
{
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "functions": [
      {
        "name": "save_assessment_data",
        "description": "Save structured patient assessment data",
        "parameters": {
          "type": "object",
          "properties": {
            "living_situation": {
              "type": "object",
              "properties": {
                "lives_alone": { "type": "boolean" },
                "has_stairs_to_enter": { "type": "boolean" }
              }
            },
            "medication_management": {
              "type": "object",
              "properties": {
                "forgets_medications": { "type": "boolean" },
                "medication_reminders_needed": { "type": "boolean" }
              }
            }
          }
        }
      }
    ]
  }
}
```

---

## ✅ Best Practices

### 1. **Always Link Records Properly**
- Every assessment must have a `patient_id`
- Link assessments to VAPI calls using `vapi_call_id`
- All detail tables (living, ADL, IADL, etc.) must reference the `assessment_id`

### 2. **Handle Incomplete Data Gracefully**
- Not every field needs to be filled
- Use `null` for missing data rather than empty strings
- Set `assessment_complete` to `false` if the call was interrupted

### 3. **Track Consent**
- Always set `patient_confirmed_name` and `patient_consent_given`
- Don't proceed with assessment if consent is not given

### 4. **Use Transactions for Complete Assessments**
- When saving a complete assessment, use the `useSaveCompleteAssessment` hook
- This ensures all related data is saved together

### 5. **Store the Verbal Summary**
- The `verbal_summary` field should contain what was told to the patient
- This is important for continuity of care

### 6. **Medication Management is Critical**
- Pay special attention to the IADL fields:
  - `forgets_medications`
  - `medication_reminders_needed`
  - `medication_management_independent`
- This is often a key indicator for intervention needs

### 7. **Use Arrays for Multi-Select Fields**
- `assistive_devices`: `['walker', 'cane', 'wheelchair']`
- `chronic_conditions`: `['diabetes', 'hypertension', 'COPD']`

### 8. **Indexing and Performance**
- All major foreign keys are indexed
- Queries by `patient_id` will be fast
- Consider adding custom indexes for frequently queried fields

### 9. **Real-time Updates**
- All tables have RLS (Row Level Security) enabled
- Use Supabase real-time subscriptions to watch for new assessments

### 10. **Data Privacy**
- All tables have RLS policies requiring authentication
- Consider adding more restrictive policies based on your organization's needs

---

## 🎯 Example: Complete Workflow

Here's a complete example of processing a VAPI call and storing all assessment data:

```typescript
// After receiving VAPI webhook in your edge function
async function processVAPIAssessment(vapiCallData: any) {
  const supabase = createClient(/* ... */);
  
  // 1. Save VAPI call
  const { data: vapiCall } = await supabase
    .from('vapi_calls')
    .insert({
      patient_id: vapiCallData.metadata.patient_id,
      vapi_call_id: vapiCallData.id,
      call_type: vapiCallData.type,
      started_at: vapiCallData.startedAt,
      ended_at: vapiCallData.endedAt,
      transcript: vapiCallData.transcript,
      summary: vapiCallData.summary,
      patient_confirmed: true,
      patient_willing_to_continue: true,
      assessment_completed: true,
    })
    .select()
    .single();

  // 2. Parse structured data from VAPI (from function call or transcript)
  const structured = vapiCallData.artifact?.structuredData || {};

  // 3. Create complete assessment
  const { data: assessment } = await supabase
    .from('patient_assessments')
    .insert({
      patient_id: vapiCallData.metadata.patient_id,
      vapi_call_id: vapiCall.id,
      assessed_by: 'VAPI Assistant',
      patient_confirmed_name: structured.patientConfirmed,
      patient_consent_given: structured.consentGiven,
      assessment_complete: true,
      verbal_summary: vapiCallData.summary,
    })
    .select()
    .single();

  // 4. Save all sections
  const assessmentId = assessment.id;
  const patientId = vapiCallData.metadata.patient_id;

  await Promise.all([
    structured.living && supabase.from('living_situation').insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      ...structured.living,
    }),
    
    structured.adl && supabase.from('adl_assessment').insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      ...structured.adl,
    }),
    
    structured.iadl && supabase.from('iadl_assessment').insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      ...structured.iadl,
    }),
    
    structured.health && supabase.from('health_assessment').insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      ...structured.health,
    }),
    
    structured.cognition && supabase.from('cognition_assessment').insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      ...structured.cognition,
    }),
    
    structured.support && supabase.from('support_network').insert({
      assessment_id: assessmentId,
      patient_id: patientId,
      ...structured.support,
    }),
  ]);

  return { success: true, assessmentId };
}
```

---

## 🚀 Next Steps

1. **Run the Migration**: Apply the database migration to create all tables
2. **Configure VAPI**: Set up your VAPI assistant to collect structured data
3. **Set up Webhooks**: Create edge functions to handle VAPI webhooks
4. **Build UI Components**: Create React components to display assessment data
5. **Test End-to-End**: Make test calls and verify data flows correctly

---

## 📞 Support

If you have questions or need help:
1. Check the migration file: `supabase/migrations/20251026000000_patient_assessment_tables.sql`
2. Review the hooks: `src/integrations/supabase/hooks/use-assessments.ts`
3. See the types: `src/integrations/supabase/types.ts`

Happy coding! 🎉

