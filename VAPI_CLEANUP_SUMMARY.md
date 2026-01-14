# VAPI Web SDK Removal - Migration Summary

## What Changed

The VAPI Web SDK (browser-based voice calls) has been **removed**. The project now uses **only** the FastAPI backend with VAPI Python SDK for **outbound phone calls**.

## Removed Files

### Frontend VAPI Web Integration
- ❌ `src/integrations/vapi/` (entire directory)
  - ❌ `client.ts` - VAPI Web SDK client
  - ❌ `types.ts` - Web SDK types
  - ❌ `index.ts` - Barrel exports
  - ❌ `examples.ts` - Web SDK examples
  - ❌ `README.md` - Web SDK docs
  - ❌ `MIGRATION_GUIDE.md` - Web SDK migration guide

### NPM Package
- ❌ `@vapi-ai/web` - Uninstalled from package.json

### Component
- ❌ `src/components/workflow-a/CallInterface.tsx` (old browser version)
- ✅ Replaced with outbound phone call version

### Environment Variables (Frontend)
- ❌ `VITE_VAPI_PUBLIC_KEY` - No longer needed
- ❌ `VITE_VAPI_ASSISTANT_ID` - No longer in frontend

## What Remains

### Backend (FastAPI)
✅ `backend/` - Complete FastAPI backend
✅ `backend/app/vapi_client.py` - VAPI Python SDK client
✅ `backend/app/routers/calls.py` - Outbound call endpoints
✅ Python package: `vapi-python`

### Frontend
✅ `src/components/workflow-a/CallInterface.tsx` - Outbound phone call UI
✅ Calls FastAPI backend instead of VAPI Web SDK

### Database
✅ `src/integrations/supabase/` - All Supabase functionality preserved

## New Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      VitalStream Workflow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (React + Vite)                                        │
│  ├── Supabase Integration (Database, Auth)                     │
│  └── CallInterface.tsx ───────┐                                │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                                 │ HTTP POST
                                 │ /api/calls/outbound
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FastAPI Backend (Python)                      │
│  ├── VAPI Python SDK                                            │
│  ├── Outbound Call Endpoints                                    │
│  └── Server-side VAPI credentials                              │
└────────────────────────────────────────────────────────────────┘
                                 │
                                 │ VAPI API
                                 ↓
                          ┌──────────────┐
                          │   VAPI       │
                          │   Service    │
                          └──────────────┘
                                 │
                                 ↓
                          Patient's Phone 📱
```

## Environment Variables

### Frontend `.env`
```env
# Supabase (unchanged)
VITE_SUPABASE_PROJECT_ID="..."
VITE_SUPABASE_PUBLISHABLE_KEY="..."
VITE_SUPABASE_URL="..."

# FastAPI Backend
VITE_BACKEND_URL="http://localhost:8000"
```

### Backend `backend/.env`
```env
# VAPI Server-side credentials
VAPI_PRIVATE_API_KEY=sk_live_...
VAPI_PHONE_NUMBER_ID=phone_...
VAPI_ASSISTANT_ID=...

# Server config
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:8080
DEBUG=True
```

## How to Use

### 1. Start Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Configure Backend

Create `backend/.env` with your VAPI server credentials:
- Private API Key (get from VAPI Dashboard)
- Phone Number ID (buy from VAPI)
- Assistant ID (optional)

### 3. Use CallInterface

The CallInterface component now makes outbound phone calls:

```typescript
import { CallInterface } from '@/components/workflow-a/CallInterface';

<CallInterface
  open={isOpen}
  onClose={() => setIsOpen(false)}
  patientName="John Doe"
  patientPhone="+15551234567"  // Real phone number!
/>
```

When user clicks "Call Patient":
1. Frontend sends request to FastAPI backend
2. Backend uses VAPI Python SDK
3. VAPI calls the patient's actual phone
4. AI assistant conducts interview

## Migration Checklist

- [x] Removed `@vapi-ai/web` package
- [x] Deleted `src/integrations/vapi/` directory
- [x] Replaced CallInterface with outbound version
- [x] Removed VAPI web env variables from frontend
- [x] Kept Supabase integration intact
- [x] Backend FastAPI ready for VAPI outbound calls

## Benefits

✅ **Simpler Architecture** - One VAPI integration (backend only)
✅ **Real Phone Calls** - Actually calls patient's phone
✅ **More Secure** - Private API key only on server
✅ **No Browser Permissions** - No microphone access needed
✅ **Production Ready** - Proper separation of concerns

## What You Need to Do

1. **Get VAPI Credentials**:
   - Private API Key from https://dashboard.vapi.ai
   - Buy a phone number
   - Note your Assistant ID

2. **Configure Backend**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your VAPI credentials
   ```

3. **Start Backend**:
   ```bash
   python main.py
   ```

4. **Test**:
   - Go to http://localhost:8000/docs
   - Try the outbound call endpoint
   - Call your own phone to test!

## Documentation

- [FASTAPI_SETUP.md](FASTAPI_SETUP.md) - Complete setup guide
- [backend/README.md](backend/README.md) - Backend API docs
- [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) - Environment variables guide

## Support

The VAPI Web SDK functionality has been completely removed. If you need browser-based voice calls, you would need to re-add the `@vapi-ai/web` package and web integration code.

For outbound phone calls (current setup), see [FASTAPI_SETUP.md](FASTAPI_SETUP.md).
