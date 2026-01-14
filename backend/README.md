# VitalStream Workflow - FastAPI Backend

FastAPI backend for making outbound phone calls using VAPI Python SDK.

## Features

- **Outbound Phone Calls**: Make real phone calls to patients using VAPI
- **VAPI Python SDK Integration**: Server-side integration with VAPI
- **RESTful API**: Clean API endpoints for call management
- **Auto-generated API Docs**: Interactive API documentation at `/docs`

## Prerequisites

- Python 3.9 or higher
- VAPI account with:
  - Private API Key
  - Phone Number (purchased from VAPI)
  - Assistant ID (optional)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your VAPI credentials:

```env
# VAPI Configuration
VAPI_PRIVATE_API_KEY=your-vapi-private-key
VAPI_PHONE_NUMBER_ID=your-vapi-phone-number-id
VAPI_ASSISTANT_ID=your-vapi-assistant-id

# Server Configuration
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:8080
DEBUG=True
```

### 3. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Getting VAPI Credentials

### 1. Private API Key

1. Go to [VAPI Dashboard](https://dashboard.vapi.ai)
2. Navigate to **Settings** → **API Keys**
3. Create a **Private API Key** (not the public key!)
4. Copy and save it to `.env` as `VAPI_PRIVATE_API_KEY`

⚠️ **Important**: This is a server-side key. Never expose it in client-side code!

### 2. Phone Number

1. In VAPI Dashboard, go to **Phone Numbers**
2. Click **Buy Number** or **Port Number**
3. Select a phone number (costs ~$2-10/month)
4. Copy the Phone Number ID
5. Save it to `.env` as `VAPI_PHONE_NUMBER_ID`

This is the number that patients will see when you call them.

### 3. Assistant (Optional but Recommended)

1. In VAPI Dashboard, go to **Assistants**
2. Click **Create Assistant**
3. Configure your assistant:
   - **Model**: GPT-4 or GPT-3.5
   - **Voice**: Choose a voice provider (PlayHT, ElevenLabs, etc.)
   - **System Prompt**: Healthcare intake specialist prompt
   - **First Message**: Greeting message
4. Save and copy the Assistant ID
5. Save it to `.env` as `VAPI_ASSISTANT_ID`

## API Endpoints

### Create Outbound Call

```http
POST /api/calls/outbound
Content-Type: application/json

{
  "patient_phone": "+15551234567",
  "patient_name": "John Doe",
  "assistant_overrides": {
    "first_message": "Hello John, this is VitalStream..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "call_id": "call_abc123xyz",
  "message": "Call initiated successfully to +15551234567",
  "patient_phone": "+15551234567",
  "patient_name": "John Doe"
}
```

### Get Call Status

```http
GET /api/calls/{call_id}
```

**Response:**
```json
{
  "call_id": "call_abc123xyz",
  "status": "in-progress",
  "created_at": "2025-01-25T10:30:00Z",
  "started_at": "2025-01-25T10:30:05Z",
  "cost": 0.05
}
```

### List Recent Calls

```http
GET /api/calls/?limit=10
```

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (not in git)
├── .env.example           # Environment template
├── README.md              # This file
│
└── app/
    ├── __init__.py
    ├── config.py          # Settings and configuration
    ├── vapi_client.py     # VAPI Python SDK wrapper
    ├── schemas.py         # Pydantic models
    │
    └── routers/
        └── calls.py       # Call management endpoints
```

## Phone Number Format

Always use E.164 format for phone numbers:

```
+[country code][area code][number]
```

Examples:
- US: `+15551234567`
- UK: `+447911123456`

## Error Handling

The API returns detailed error messages:

```json
{
  "success": false,
  "error": "Failed to create outbound call: Invalid phone number format"
}
```

## Development

### Running in Debug Mode

Set `DEBUG=True` in `.env` to enable auto-reload on code changes.

### View Logs

Logs are printed to console with timestamps and log levels.

### Testing the API

1. Start the backend server
2. Visit http://localhost:8000/docs
3. Try the "POST /api/calls/outbound" endpoint
4. Use your own phone number for testing

## Deployment

### Environment Variables for Production

```env
VAPI_PRIVATE_API_KEY=your-production-key
VAPI_PHONE_NUMBER_ID=your-production-phone-number
VAPI_ASSISTANT_ID=your-production-assistant
BACKEND_PORT=8000
FRONTEND_URL=https://your-frontend-domain.com
DEBUG=False
```

### Running in Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use a production ASGI server like Gunicorn:

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Security Notes

🔒 **Never commit `.env` to version control**
🔒 **Keep your VAPI Private API Key secret**
🔒 **Use HTTPS in production**
🔒 **Implement authentication/authorization for production**

## Costs

- Phone number rental: ~$2-10/month
- Outbound call minutes: ~$0.01-0.05/minute
- AI processing: Based on usage
- Check [VAPI Pricing](https://vapi.ai/pricing) for current rates

## Troubleshooting

### "VAPI_PRIVATE_API_KEY not found"
- Make sure `.env` file exists in backend directory
- Check variable name is exactly `VAPI_PRIVATE_API_KEY`
- Restart the server after editing `.env`

### "Invalid phone number format"
- Use E.164 format: `+15551234567`
- Include country code with `+`

### "Phone number not found"
- Verify `VAPI_PHONE_NUMBER_ID` is correct
- Check you have an active phone number in VAPI Dashboard

### API returns 500 error
- Check backend logs for detailed error message
- Verify all environment variables are set
- Check VAPI API key is valid

## Resources

- [VAPI Documentation](https://docs.vapi.ai)
- [VAPI Python SDK](https://docs.vapi.ai/quickstart/python)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [VAPI Dashboard](https://dashboard.vapi.ai)
