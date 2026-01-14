# Vercel Deployment Checklist

## Pre-Deployment Checklist

- [x] Created `vercel.json` configuration file
- [x] Created `api/index.py` FastAPI serverless function
- [x] Created `requirements.txt` in root directory
- [x] Created `.vercelignore` file
- [x] Updated `backend/app/config.py` to support Vercel environment variables
- [x] Created deployment documentation (`VERCEL_DEPLOYMENT.md`)

## Files Created/Modified

### New Files
- `vercel.json` - Vercel deployment configuration
- `api/index.py` - FastAPI serverless function entry point
- `api/__init__.py` - Python package marker
- `requirements.txt` - Python dependencies (root level)
- `.vercelignore` - Files to exclude from deployment
- `VERCEL_DEPLOYMENT.md` - Deployment guide
- `VERCEL_CHECKLIST.md` - This file

### Modified Files
- `backend/app/config.py` - Updated to support Vercel environment variables

## Environment Variables to Set in Vercel

### Frontend (VITE_*)
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] `VITE_BACKEND_URL` (set after first deployment to your Vercel URL)
- [ ] `VITE_TEST_PHONE_NUMBER` (optional)

### Backend
- [ ] `VAPI_PRIVATE_API_KEY`
- [ ] `VAPI_PHONE_NUMBER_ID`
- [ ] `VAPI_ASSISTANT_ID`
- [ ] `FRONTEND_URL` (set after first deployment to your Vercel URL)
- [ ] `DEBUG` (set to "false" for production)

## Deployment Steps

1. [ ] Push code to Git repository
2. [ ] Import project in Vercel dashboard
3. [ ] Set all environment variables
4. [ ] Deploy project
5. [ ] Update `VITE_BACKEND_URL` and `FRONTEND_URL` with actual Vercel URL
6. [ ] Redeploy to apply URL changes
7. [ ] Test API endpoints at `/api/docs`
8. [ ] Test frontend functionality

## Post-Deployment Verification

- [ ] Frontend loads correctly
- [ ] API documentation accessible at `/api/docs`
- [ ] Health check endpoint works: `/health`
- [ ] Can initiate calls via frontend
- [ ] CORS configured correctly
- [ ] Environment variables working

## Notes

- The FastAPI app is served from `api/index.py` as a serverless function
- All routes are prefixed with `/api` (e.g., `/api/calls/outbound`)
- Python runtime is set to 3.9 in `vercel.json`
- Maximum function duration is 60 seconds (adjust if needed for long calls)
