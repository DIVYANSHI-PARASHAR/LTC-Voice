# FastAPI Backend Setup Guide - Outbound Phone Calls with VAPI

This guide will help you set up the FastAPI backend to make **real outbound phone calls** to patients using VAPI's Python SDK.

## What You've Built

✅ **FastAPI Backend** - Python REST API server
✅ **VAPI Python SDK Integration** - Server-side phone call functionality
✅ **Outbound Call Endpoint** - Make calls to actual phone numbers
✅ **New CallInterface Component** - Frontend UI for outbound calls
✅ **Supabase Still Active** - Database functionality preserved

## Architecture

```
Frontend (React)          FastAPI Backend          VAPI Service          Patient's Phone
    │                           │                        │                      │
    │  POST /api/calls/outbound│                        │                      │
    │──────────────────────────>│                        │                      │
    │   {patient_phone, name}   │                        │                      │
    │                           │  Create Call           │                      │
    │                           │  (Python SDK)          │                      │
    │                           │──────────────────────> │                      │
    │                           │                        │                      │
    │                           │<──────────────────────│                      │
    │                           │  Call ID returned      │                      │
    │<──────────────────────────│                        │   Ring! Ring!        │
    │  {success, call_id}       │                        │──────────────────────>│
    │                           │                        │                      │
    │                           │                        │<─────────────────────│
    │                           │                        │  "Hello, this is..."  │
```

## Setup Steps

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**What gets installed:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `vapi-python` - VAPI Python SDK ⭐
- `pydantic` - Data validation
- `python-dotenv` - Environment variables

### 2. Get VAPI Credentials for Backend

You need **different credentials** than the frontend:

#### A. Private API Key (Server-Side)

1. Go to https://dashboard.vapi.ai
2. Navigate to **Settings** → **API Keys**
3. Create a **Private API Key** (different from Public Key!)
4. Copy the key (starts with `sk_live_...`)

⚠️ **This is SECRET - never expose in frontend!**

#### B. Buy a Phone Number

1. In VAPI Dashboard, go to **Phone Numbers**
2. Click **Buy Number**
3. Choose a phone number (~$2-10/month)
4. Copy the **Phone Number ID** (format: `phone_xxxxx`)

This is the caller ID patients will see!

#### C. Get/Create Assistant ID (Optional but Recommended)

1. Go to **Assistants** in VAPI Dashboard
2. You already have one: `5113fdc8-a44e-4b03-84c6-56d040a2f16d`
3. You can use this or create a new one for phone calls

### 3. Configure Backend Environment

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in:

```env
# VAPI Configuration (Server-Side)
VAPI_PRIVATE_API_KEY=sk_live_your_private_key_here
VAPI_PHONE_NUMBER_ID=phone_your_phone_number_id_here
VAPI_ASSISTANT_ID=5113fdc8-a44e-4b03-84c6-56d040a2f16d

# Server Configuration
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:8080
DEBUG=True
```

### 4. Start the Backend Server

```bash
cd backend
python main.py
```

Or using uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### 5. Test the API

Open http://localhost:8000/docs in your browser.

You'll see interactive API documentation!

**Try it:**
1. Expand `POST /api/calls/outbound`
2. Click "Try it out"
3. Edit the request body:
   ```json
   {
     "patient_phone": "+1YOUR_PHONE_NUMBER",
     "patient_name": "Test Patient"
   }
   ```
4. Click "Execute"

**You should receive an actual phone call!** 📞

### 6. Use the New Frontend Component

The new `CallInterfaceOutbound.tsx` component makes API calls to your backend.

**To use it**, replace the import in your workflow page:

```typescript
// Old - browser web call
import { CallInterface } from '@/components/workflow-a/CallInterface';

// New - outbound phone call
import { CallInterface } from '@/components/workflow-a/CallInterfaceOutbound';
```

## Difference Between Components

### CallInterface.tsx (Original - Browser Calls)
- Uses VAPI Web SDK (`@vapi-ai/web`)
- Browser microphone → AI conversation
- No actual phone calls
- User must be on website

### CallInterfaceOutbound.tsx (New - Phone Calls)
- Calls FastAPI backend
- Backend uses VAPI Python SDK
- Makes real phone calls to phone numbers
- Patient receives call on their phone

## File Structure

```
vitalstream-workflow/
├── backend/                              # NEW FastAPI Backend
│   ├── main.py                          # FastAPI app entry
│   ├── requirements.txt                 # Python dependencies
│   ├── .env                             # Backend secrets (not committed)
│   ├── .env.example                     # Template
│   ├── README.md                        # Backend docs
│   │
│   └── app/
│       ├── config.py                    # Settings
│       ├── vapi_client.py              # VAPI SDK wrapper
│       ├── schemas.py                   # Pydantic models
│       │
│       └── routers/
│           └── calls.py                 # Call endpoints
│
├── src/
│   └── components/workflow-a/
│       ├── CallInterface.tsx            # Original (browser calls)
│       └── CallInterfaceOutbound.tsx    # NEW (phone calls)
│
└── .env                                 # Frontend env (add VITE_BACKEND_URL)
```

## Environment Variables Summary

### Frontend `.env`
```env
# Supabase (unchanged)
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...

# VAPI Web SDK (for browser calls - optional)
VITE_VAPI_PUBLIC_KEY=10353996-2fe3-494c-bffe-7913f898009b
VITE_VAPI_ASSISTANT_ID=5113fdc8-a44e-4b03-84c6-56d040a2f16d

# Backend URL (NEW)
VITE_BACKEND_URL=http://localhost:8000
```

### Backend `.env`
```env
# VAPI Server-side credentials (NEW)
VAPI_PRIVATE_API_KEY=sk_live_...           # Get from VAPI Dashboard
VAPI_PHONE_NUMBER_ID=phone_...             # Buy from VAPI
VAPI_ASSISTANT_ID=5113fdc8-...             # Use existing or create new

# Server config
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:8080
DEBUG=True
```

## API Endpoints

### POST /api/calls/outbound

Create an outbound phone call.

**Request:**
```json
{
  "patient_phone": "+15551234567",
  "patient_name": "John Doe",
  "assistant_overrides": {
    "first_message": "Hello John..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "call_id": "call_abc123",
  "message": "Call initiated successfully to +15551234567",
  "patient_phone": "+15551234567",
  "patient_name": "John Doe"
}
```

### GET /api/calls/{call_id}

Get call status and details.

### GET /api/calls/?limit=10

List recent calls.

## Testing

### Test with Your Own Phone

1. Start backend: `cd backend && python main.py`
2. Start frontend: `npm run dev`
3. Open app at http://localhost:8080
4. Navigate to a workflow with CallInterface
5. Click to open call dialog
6. It should call your phone number!

### Test via API Docs

1. Go to http://localhost:8000/docs
2. Use the interactive interface to test endpoints
3. Try calling your own phone number

## Phone Number Format

Always use **E.164 format**:

```
+[country code][area code][number]
```

Examples:
- ✅ `+15551234567` (US)
- ✅ `+447911123456` (UK)
- ❌ `555-123-4567` (invalid)
- ❌ `5551234567` (missing +1)

## Costs

**VAPI Pricing:**
- Phone number: ~$2-10/month
- Outbound call: ~$0.01-0.05/minute
- AI processing: Based on usage

Check current rates at https://vapi.ai/pricing

## Troubleshooting

### Backend won't start

```bash
# Check Python version (need 3.9+)
python --version

# Install dependencies
cd backend
pip install -r requirements.txt

# Check .env exists
ls -la .env
```

### "VAPI_PRIVATE_API_KEY not found"

- Create `backend/.env` file
- Add `VAPI_PRIVATE_API_KEY=sk_live_...`
- Restart backend server

### Frontend can't connect to backend

- Check backend is running on port 8000
- Verify `VITE_BACKEND_URL=http://localhost:8000` in frontend `.env`
- Restart frontend dev server after changing `.env`

### "Invalid phone number"

- Use E.164 format: `+15551234567`
- Include country code
- No spaces or dashes

### Call not connecting

- Check VAPI phone number is active
- Verify phone number ID is correct
- Check VAPI account balance
- Look at backend logs for errors

## Next Steps

1. ✅ Buy VAPI phone number
2. ✅ Get private API key
3. ✅ Configure backend/.env
4. ✅ Test with your phone
5. ✅ Update frontend to use CallInterfaceOutbound
6. ✅ Test end-to-end workflow

## Resources

- [Backend README](backend/README.md) - Detailed backend docs
- [VAPI Documentation](https://docs.vapi.ai)
- [VAPI Python SDK](https://docs.vapi.ai/quickstart/python)
- [VAPI Dashboard](https://dashboard.vapi.ai)
- [FastAPI Docs](https://fastapi.tiangolo.com)

## Support

If you have issues:
1. Check backend logs
2. Check browser console
3. Verify all environment variables
4. Test API directly at http://localhost:8000/docs
5. Check VAPI Dashboard for call logs
