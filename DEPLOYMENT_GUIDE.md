# 🚀 Deployment Guide: VAPI Assessment System

This guide walks you through deploying the patient assessment database and VAPI integration.

## 📋 Prerequisites

- Supabase project set up
- VAPI account with API access
- Node.js and npm/bun installed

## 🗄️ Step 1: Deploy Database Migration

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not already installed):
```bash
npm install -g supabase
```

2. **Login to Supabase**:
```bash
supabase login
```

3. **Link your project**:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. **Run the migration**:
```bash
supabase db push
```

This will apply the migration file:
- `supabase/migrations/20251026000000_patient_assessment_tables.sql`

### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase/migrations/20251026000000_patient_assessment_tables.sql`
4. Paste it into the SQL Editor
5. Click **Run**

### Verify the Migration

After running the migration, verify that these tables were created:
- `vapi_calls`
- `patient_assessments`
- `living_situation`
- `adl_assessment`
- `iadl_assessment`
- `health_assessment`
- `cognition_assessment`
- `support_network`

You can check in the **Table Editor** section of your Supabase dashboard.

---

## 🔗 Step 2: Deploy Webhook Handler

### Deploy to Supabase Edge Functions

1. **Make sure you're in your project directory**:
```bash
cd /path/to/vitalstream-workflow
```

2. **Deploy the webhook function**:
```bash
supabase functions deploy vapi-webhook
```

3. **Note the webhook URL** - it will be something like:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/vapi-webhook
```

4. **Set environment variables** (if needed):
```bash
supabase secrets set CUSTOM_VAR=value
```

The function automatically has access to:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 🎙️ Step 3: Configure VAPI

### Set Up VAPI Webhook

1. Log into your VAPI dashboard
2. Go to **Settings** → **Webhooks**
3. Add a new webhook with the URL from Step 2:
   ```
   https://YOUR_PROJECT_REF.supabase.co/functions/v1/vapi-webhook
   ```
4. Select events to listen for:
   - ✅ `end-of-call-report` (required)
   - ✅ `call-started` (optional)
   - ✅ `status-update` (optional)

### Configure VAPI Assistant

Create or update your VAPI assistant with the appropriate prompt. Here's a sample system prompt:

```
You are a compassionate healthcare assistant conducting a patient assessment. Your goal is to gather information about the patient's living situation, daily activities, health status, cognitive function, and support network.

CONVERSATION FLOW:
1. Confirm patient's identity: "Am I speaking with [Patient Name]?"
2. Get consent: "I'd like to ask you some questions about your daily life and health to help us provide better care. This will take about 10-15 minutes. Are you comfortable continuing?"
3. If yes, proceed with assessment questions.

ASSESSMENT AREAS:
- Living Situation: Ask about who they live with, stairs, accessibility
- ADLs: Ask about bathing, dressing, toileting, eating, transferring, mobility
- IADLs: Ask about meal prep, laundry, shopping, managing money, MEDICATIONS (very important!)
- Health: Ask about chronic conditions, breathing, pain, dizziness, wounds
- Cognition: Ask about memory, orientation, confusion
- Support: Ask about caregivers, family support, emergency contacts

CRITICAL: Pay special attention to medication management. Ask:
- "Do you take your medications by yourself?"
- "Do you ever forget to take your medications?"
- "Would reminders be helpful?"

After all questions, provide a brief summary of what you learned and thank the patient.

Be conversational, empathetic, and patient. If answers are vague, gently ask for clarification.
```

### Set Metadata When Starting Calls

When you trigger a VAPI call programmatically, include the patient ID in metadata:

```javascript
const call = await vapi.createCall({
  phoneNumberId: 'your-phone-number-id',
  customer: {
    number: '+1234567890',
    name: 'John Doe',
  },
  assistantId: 'your-assistant-id',
  metadata: {
    patient_id: 'uuid-from-your-database',
  },
});
```

---

## 💻 Step 4: Update Your Frontend

### Install React Query (if not already installed)

```bash
npm install @tanstack/react-query
# or
bun add @tanstack/react-query
```

### Wrap Your App with QueryClientProvider

In your `main.tsx` or `App.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```

### Use the Assessment Hooks

Import and use the custom hooks in your components:

```typescript
import { useCompleteAssessment } from '@/integrations/supabase/hooks/use-assessments';

function MyComponent() {
  const { data, isLoading } = useCompleteAssessment(assessmentId);
  // ... use the data
}
```

Or use the pre-built component:

```typescript
import { PatientAssessmentView } from '@/components/workflow-a/PatientAssessmentView';

function AssessmentPage() {
  return <PatientAssessmentView assessmentId="uuid-here" />;
}
```

---

## 🧪 Step 5: Test the Integration

### Test 1: Manual Database Insert

Test that your tables work by manually inserting data:

```sql
-- In Supabase SQL Editor
INSERT INTO vapi_calls (patient_id, vapi_call_id, call_status)
VALUES (
  (SELECT id FROM patients LIMIT 1),
  'test-call-123',
  'ended'
);
```

### Test 2: Test the Webhook

Test the webhook endpoint using curl:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/vapi-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "type": "end-of-call-report",
      "call": {
        "id": "test-123",
        "type": "outboundPhoneCall",
        "status": "ended",
        "metadata": {
          "patient_id": "YOUR_PATIENT_UUID"
        },
        "transcript": "Patient lives alone and uses a walker. Forgets medications sometimes.",
        "summary": "Patient needs assistance with medication management"
      }
    }
  }'
```

### Test 3: Make a Real VAPI Call

1. Create a test patient in your database
2. Trigger a VAPI call with the patient's phone number
3. Answer the call and complete the assessment
4. Check the database to see if data was saved

Query to check:
```sql
SELECT * FROM vapi_calls ORDER BY created_at DESC LIMIT 1;
SELECT * FROM patient_assessments ORDER BY created_at DESC LIMIT 1;
```

---

## 🔍 Step 6: Monitor and Debug

### View Webhook Logs

```bash
supabase functions logs vapi-webhook
```

Or in the Supabase dashboard:
1. Go to **Edge Functions**
2. Click on `vapi-webhook`
3. View the **Logs** tab

### Common Issues and Solutions

#### Issue: Webhook not receiving data
- **Solution**: Check VAPI webhook configuration
- Verify the webhook URL is correct
- Check that you selected the right events

#### Issue: Patient ID not found
- **Solution**: Make sure you're passing `patient_id` in the call metadata when creating VAPI calls

#### Issue: Data not being saved
- **Solution**: Check the webhook logs for errors
- Verify the data structure matches your database schema
- Check that RLS policies allow insertions

#### Issue: TypeScript errors
- **Solution**: Make sure your `types.ts` file is up to date
- Run `supabase gen types typescript --local > src/integrations/supabase/types.ts` to regenerate types

---

## 📊 Step 7: View Assessment Data

### In Your React App

```typescript
import { PatientAssessmentView } from '@/components/workflow-a/PatientAssessmentView';

function ViewAssessment() {
  const assessmentId = 'get-from-props-or-url';
  return <PatientAssessmentView assessmentId={assessmentId} />;
}
```

### In Supabase Dashboard

1. Go to **Table Editor**
2. Select any of the assessment tables
3. View the data directly

### Using SQL Queries

Get complete assessment with all sections:
```sql
SELECT 
  pa.*,
  ls.*,
  adl.*,
  iadl.*,
  ha.*,
  ca.*,
  sn.*
FROM patient_assessments pa
LEFT JOIN living_situation ls ON ls.assessment_id = pa.id
LEFT JOIN adl_assessment adl ON adl.assessment_id = pa.id
LEFT JOIN iadl_assessment iadl ON iadl.assessment_id = pa.id
LEFT JOIN health_assessment ha ON ha.assessment_id = pa.id
LEFT JOIN cognition_assessment ca ON ca.assessment_id = pa.id
LEFT JOIN support_network sn ON sn.assessment_id = pa.id
WHERE pa.id = 'assessment-uuid';
```

---

## 🎯 Production Checklist

Before going to production, ensure:

- [ ] Database migration applied successfully
- [ ] All 8 tables created with proper indexes
- [ ] RLS policies are enabled and tested
- [ ] Webhook function deployed and accessible
- [ ] VAPI webhook configured with correct URL
- [ ] VAPI assistant has appropriate system prompt
- [ ] Patient IDs are passed in call metadata
- [ ] Frontend can display assessment data
- [ ] End-to-end test completed successfully
- [ ] Error monitoring set up (webhook logs)
- [ ] Backup strategy in place
- [ ] Security review completed (RLS policies, webhook auth)

---

## 🔐 Security Best Practices

1. **Row Level Security (RLS)**
   - All tables have RLS enabled by default
   - Customize policies based on your organization's needs
   - Example: Restrict access by user role

2. **Webhook Security**
   - Consider adding signature verification for VAPI webhooks
   - Use environment variables for sensitive data
   - Implement rate limiting if needed

3. **Data Privacy**
   - Ensure compliance with HIPAA/GDPR
   - Implement audit logging for sensitive data access
   - Use Supabase's built-in encryption

4. **API Keys**
   - Never expose Supabase service role key in frontend code
   - Use anon key for frontend, service role for backend only
   - Rotate keys periodically

---

## 📈 Scaling Considerations

As your system grows:

1. **Indexing**: The migration includes indexes on common query patterns. Add more as needed.

2. **Archiving**: Consider archiving old assessments after a certain period.

3. **Caching**: Use React Query's caching features effectively.

4. **Real-time**: Consider enabling Supabase real-time subscriptions for live updates.

5. **Analytics**: Set up views or materialized views for reporting.

---

## 🆘 Getting Help

If you run into issues:

1. Check the webhook logs: `supabase functions logs vapi-webhook`
2. Review the migration file for any SQL errors
3. Test database connectivity and permissions
4. Verify VAPI configuration
5. Check the browser console for frontend errors

---

## 🎉 You're Done!

Your VAPI patient assessment system is now fully deployed and ready to collect structured data from voice calls!

Next steps:
- Train your staff on how to initiate calls
- Monitor the first few calls closely
- Gather feedback and iterate on the assistant's prompt
- Build additional UI components for data visualization
- Set up automated alerts for high-risk patients

Happy assessing! 🏥

