# VitalStream Workflow

> **AI-Powered Healthcare Case Management Platform for NY Medicaid Long-Term Care**

VitalStream automates the complex patient intake and eligibility assessment process for Medicaid placement using Voice AI technology.

---

## Table of Contents

- [Business Overview](#-business-overview)
- [Business Workflow](#-business-workflow)
- [Tech Stack](#-tech-stack)
- [Technical Workflow](#-technical-workflow)
- [Tools & Integrations](#-tools--integrations)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)

---

## 🏢 Business Overview

### What VitalStream Does

VitalStream is a **Healthcare Case Management Platform** specifically designed for **New York Medicaid Long-Term Care (LTC) and Home and Community-Based Services (HCBS) workflows**. It automates the complex patient intake and eligibility assessment process for Medicaid placement.

### Core Business Problem Solved

1. **Manual Intake Burden**: Traditional healthcare intake requires lengthy phone calls with case managers manually filling out forms
2. **Regulatory Compliance**: NY Medicaid requires multiple standardized forms (PASRR, UAS-NY, etc.) that must be completed accurately
3. **Time-to-Authorization**: The authorization process can take weeks due to paperwork backlogs
4. **Data Entry Errors**: Manual transcription from phone calls to forms introduces errors

### Business Value Proposition

| Metric | Before VitalStream | With VitalStream |
|--------|-------------------|------------------|
| Avg. Time to Complete | Manual ~2-3 hours | **57 minutes** (82% VoiceAI automation) |
| Form Auto-Fill | 0% | **82%** |
| On-Time Submissions | ~60-70% | **91%** |
| Data Accuracy | Human error-prone | AI-verified |

---

## 📋 Business Workflow

The system follows a **4-stage workflow** for each patient case:

```
┌─────────────┐    ┌────────────────┐    ┌───────────────────┐    ┌───────────────┐
│  REFERRAL   │ →  │  REMOTE INTAKE │ →  │ NURSE ASSESSMENT  │ →  │ AUTHORIZATION │
│             │    │ (VoiceAI Call) │    │  (In-Person/Video)│    │   (Approval)  │
└─────────────┘    └────────────────┘    └───────────────────┘    └───────────────┘
```

### Stage Details

#### Stage 1: Referral
- New patient referred to the system
- Basic demographics captured
- Case created with ID (e.g., `NY-MC-2024-1234`)

#### Stage 2: Remote Intake (VoiceAI-Powered)

This is the **core innovation** - an AI voice assistant calls the patient and conducts a structured assessment collecting:

**1. Living Situation**
- Lives alone or with family
- Housing type (house, apartment, assisted living)
- Home accessibility (stairs, wheelchair access)

**2. ADL Assessment** (Activities of Daily Living)
- Bathing capability
- Dressing capability
- Toileting independence
- Eating/feeding
- Mobility & transfer ability
- Assistive devices used (cane, walker, wheelchair)

**3. IADL Assessment** (Instrumental ADL)
- Medication management (critical for LTC placement)
- Meal preparation
- Shopping, laundry, housekeeping
- Transportation
- Money management

**4. Health Assessment**
- Chronic conditions (diabetes, COPD, heart disease)
- Pain levels (0-10 scale)
- Breathing issues / oxygen use
- Fall risk & recent falls
- Vision/hearing impairments

**5. Cognition Assessment**
- Memory issues (short/long-term)
- Orientation (person, place, time)
- Dementia diagnosis
- Safety concerns (wandering risk)

**6. Support Network**
- Formal caregivers (home health, nurses)
- Informal caregivers (family members)
- Emergency contacts
- Existing services (Meals on Wheels, etc.)

#### Stage 3: Nurse Assessment
- In-person or video visit
- Physical verification of reported conditions
- Clinical evaluation
- Vitals check (BP, O2 levels)

#### Stage 4: Authorization
- All forms submitted for review
- Eligibility determination
- Level of Care approval
- Care plan finalization

### Required Forms (Auto-Generated)

The system handles multiple NY Medicaid forms:

| Form | Purpose | Status |
|------|---------|--------|
| NY DOH Form 102 | Medicaid Application | Auto-filled |
| CMS 3620 | PASRR Level I | Auto-filled |
| NY OMH PASRR | PASRR Level II | In Review |
| NY DOH-694B | Level of Care Assessment (UAS-NY) | Auto-filled |
| NY DOH-3520 | Medical Necessity Form | Pending |
| NY DOH-5178A | Financial Eligibility | Pending |

---

## 💻 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **React Router v6** | Client-side Routing |
| **TanStack React Query** | Server State Management |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | Component Library (built on Radix UI) |
| **Lucide React** | Icons |
| **Recharts** | Data Visualization |
| **Zod** | Form Validation |
| **React Hook Form** | Form Management |

### Backend

| Technology | Purpose |
|------------|---------|
| **FastAPI (Python)** | REST API Framework |
| **VAPI Python SDK** | Voice AI Integration |
| **Pydantic** | Data Validation |
| **Uvicorn** | ASGI Server |

### Database & Backend Services

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL Database + Auth + Edge Functions |
| **Supabase Edge Functions** | Serverless Webhook Handlers (Deno) |
| **Row Level Security (RLS)** | Data Access Control |

### Voice AI

| Technology | Purpose |
|------------|---------|
| **VAPI** | Voice AI Platform |
| **Deepgram** | Speech-to-Text (Nova-2 model) |
| **OpenAI GPT-4** | Conversation Intelligence |
| **PlayHT** | Text-to-Speech (Voice: "Jennifer") |

### Development & Deployment

| Technology | Purpose |
|------------|---------|
| **Lovable** | AI-Assisted Development Platform |
| **ESLint** | Code Linting |
| **PostCSS** | CSS Processing |

---

## 🔄 Technical Workflow

### Call Initiation Flow

```
┌──────────────┐     ┌─────────────────┐     ┌────────────────┐
│   Frontend   │────▶│  FastAPI Backend │────▶│   VAPI Cloud   │
│ (React App)  │     │   (Python API)   │     │ (Voice AI)     │
└──────────────┘     └─────────────────┘     └────────────────┘
        │                    │                       │
        │  1. Click "Call    │  2. POST /api/calls   │  3. Outbound
        │     Patient"       │     /outbound         │     Phone Call
        │                    │                       │
        ▼                    ▼                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    CALL IN PROGRESS                          │
│  Patient speaks → Deepgram STT → GPT-4 → PlayHT TTS → Patient│
└──────────────────────────────────────────────────────────────┘
```

### Webhook Processing Flow

When a call ends, VAPI sends a webhook to the Supabase Edge Function:

```json
POST /functions/v1/vapi-webhook

{
  "message": {
    "type": "end-of-call-report",
    "call": {
      "id": "call_xyz123",
      "transcript": "...",
      "summary": "...",
      "recordingUrl": "...",
      "metadata": { "patient_id": "uuid" }
    }
  }
}
```

### Data Storage Flow

```
┌─────────────────┐
│   vapi_calls    │ ← Raw call metadata (transcript, recording, cost)
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ patient_assessments │ ← Main assessment record
└────────┬────────────┘
         │
    ┌────┼────┬────┬────┬────┬────┐
    ▼    ▼    ▼    ▼    ▼    ▼    ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│living││ adl  ││ iadl ││health││cognit││support│
│situa-││assess││assess││assess││assess││network│
│tion  ││ment  ││ment  ││ment  ││ment  ││      │
└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────┐
│                    App.tsx                          │
├─────────────────────────────────────────────────────┤
│  QueryClientProvider (TanStack React Query)         │
│    └─ NotificationProvider (Context)                │
│        └─ PatientDataProvider (Context)             │
│            └─ BrowserRouter                         │
│                └─ Routes                            │
│                    ├─ / → Home (Patient Roster)     │
│                    ├─ /patient/:id → CaseManager    │
│                    ├─ /patient/:id/level-of-care    │
│                    └─ /assessor-kpi → KPI Dashboard │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Tools & Integrations

### Voice AI Platform (VAPI)

- **Purpose**: Conducts automated patient phone interviews
- **Features Used**:
  - Outbound phone calls
  - Real-time transcription
  - Structured data extraction
  - Call recording
  - Function calling for structured output
  - Webhook notifications

### Database (Supabase)

- **8 Assessment Tables**: Normalized schema for comprehensive patient data
- **Edge Functions**: Serverless webhook handlers
- **Row Level Security**: Data access control
- **Real-time Subscriptions**: Live data updates

### AI/ML Services

| Service | Provider | Use Case |
|---------|----------|----------|
| Speech-to-Text | Deepgram Nova-2 | Call transcription |
| Language Model | OpenAI GPT-4 | Conversation AI |
| Text-to-Speech | PlayHT | Voice synthesis |

---

## 📊 Key Features

### For Case Managers

- **Patient Roster Dashboard**: View all cases with status tracking
- **One-Click Calling**: Initiate AI voice assessments instantly
- **Progress Tracking**: Visual stage indicators per patient
- **KPI Dashboard**: Performance metrics (cases/week, on-time rate, quality score)
- **Notification Center**: Real-time updates on call completions

### For Clinical Staff

- **Consolidated Assessment View**: All patient data in one place
- **Call Transcript Access**: Full conversation history
- **Form Pre-population**: Auto-filled regulatory forms
- **Level of Care Assessment**: Structured UAS-NY form display

### Automation Features

- **VoiceAI Intake**: 82% of form fields auto-populated
- **MMIS API Integration**: Auto-populate demographics
- **X12 270/271**: Eligibility validation
- **Smart Routing**: Auto-route PASRR to Behavioral Health reviewer

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    React + TypeScript + Vite                     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │   │
│  │  │ Home     │ │ Patient  │ │ Level of │ │ Assessor KPI      │   │   │
│  │  │ Dashboard│ │ Case Mgr │ │ Care     │ │ Dashboard         │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                     │
│  ┌─────────────────────┐         ┌───────────────────────────────────┐ │
│  │  FastAPI Backend    │         │   Supabase Edge Functions         │ │
│  │  ├─ /api/calls      │         │   ├─ vapi-webhook                 │ │
│  │  └─ outbound calls  │         │   └─ handle-vapi-webhook          │ │
│  └─────────────────────┘         └───────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                │                                │
                ▼                                ▼
┌───────────────────────────┐    ┌──────────────────────────────────────┐
│      VAPI PLATFORM        │    │         SUPABASE DATABASE            │
│  ┌─────────────────────┐  │    │  ┌──────────────────────────────┐   │
│  │ ┌─────────────────┐ │  │    │  │ patients                     │   │
│  │ │ Deepgram STT    │ │  │    │  │ vapi_calls                   │   │
│  │ └─────────────────┘ │  │    │  │ patient_assessments          │   │
│  │ ┌─────────────────┐ │  │    │  │ living_situation             │   │
│  │ │ GPT-4 LLM       │ │  │    │  │ adl_assessment               │   │
│  │ └─────────────────┘ │  │    │  │ iadl_assessment              │   │
│  │ ┌─────────────────┐ │  │    │  │ health_assessment            │   │
│  │ │ PlayHT TTS      │ │  │    │  │ cognition_assessment         │   │
│  │ └─────────────────┘ │  │    │  │ support_network              │   │
│  └─────────────────────┘  │    │  └──────────────────────────────┘   │
└───────────────────────────┘    └──────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ & npm
- Python 3.9+
- Supabase account
- VAPI account with:
  - Private API Key
  - Phone Number (purchased from VAPI)
  - Assistant ID

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your VAPI credentials

# Start the server
python main.py
```

The API will be available at `http://localhost:8000`

### Environment Variables

#### Frontend (`.env`)

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_BACKEND_URL=http://localhost:8000
```

#### Backend (`backend/.env`)

```env
VAPI_PRIVATE_API_KEY=your-vapi-private-key
VAPI_PHONE_NUMBER_ID=your-vapi-phone-number-id
VAPI_ASSISTANT_ID=your-vapi-assistant-id
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:5173
DEBUG=True
```

---

## 📁 Project Structure

```
vitalstream-workflow/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   └── workflow-a/           # Workflow-specific components
│   ├── contexts/                 # React context providers
│   ├── data/                     # Static data and mock data
│   ├── hooks/                    # Custom React hooks
│   ├── integrations/             # External service integrations
│   │   ├── supabase/             # Supabase client and hooks
│   │   └── vapi/                 # VAPI client
│   ├── pages/                    # Page components
│   └── lib/                      # Utility functions
│
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── routers/              # API route handlers
│   │   ├── config.py             # Configuration
│   │   ├── schemas.py            # Pydantic models
│   │   └── vapi_client.py        # VAPI SDK wrapper
│   ├── main.py                   # Application entry point
│   └── requirements.txt          # Python dependencies
│
├── supabase/                     # Supabase configuration
│   ├── functions/                # Edge functions
│   │   └── vapi-webhook/         # VAPI webhook handler
│   └── migrations/               # Database migrations
│
├── public/                       # Static assets
├── package.json                  # Node.js dependencies
└── README.md                     # This file
```

---

## 📚 Additional Documentation

- [Integration Guide](./INTEGRATION_GUIDE.md) - VAPI and Supabase integration details
- [VAPI Assessment Storage Guide](./VAPI_ASSESSMENT_STORAGE_GUIDE.md) - Database schema and data flow
- [Backend README](./backend/README.md) - FastAPI backend documentation
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment instructions

---

## 🎯 Summary

**VitalStream Workflow** is a modern healthcare automation platform that:

1. **Replaces manual phone interviews** with AI-powered voice calls
2. **Auto-populates complex Medicaid forms** from conversation data
3. **Tracks case progress** through a 4-stage workflow
4. **Stores comprehensive assessments** in a normalized database schema
5. **Reduces time-to-authorization** from hours to minutes
6. **Ensures regulatory compliance** with NY Medicaid requirements

---

## 📄 License

© 2025 VitalStream • Built for New York LTC / HCBS Workflows
