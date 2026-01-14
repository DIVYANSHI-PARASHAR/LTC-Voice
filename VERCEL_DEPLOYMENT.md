# Vercel Deployment Guide

This guide will help you deploy the LTC-Voice application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. GitHub/GitLab/Bitbucket repository (recommended) or Vercel CLI
3. Environment variables ready (see below)

## Project Structure

The project is configured for Vercel deployment with:

- **Frontend**: React/Vite app (built and served as static files)
- **Backend**: FastAPI serverless functions (in `api/` directory)
- **Configuration**: `vercel.json` for deployment settings

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import project in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect the project settings

3. **Configure Build Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Set Environment Variables**:
   
   Click "Environment Variables" and add the following:

   #### Frontend Environment Variables
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   VITE_BACKEND_URL=https://your-project.vercel.app
   VITE_TEST_PHONE_NUMBER=+1234567890 (optional)
   ```

   #### Backend Environment Variables (for API functions)
   ```
   VAPI_PRIVATE_API_KEY=your-vapi-private-key
   VAPI_PHONE_NUMBER_ID=your-vapi-phone-number-id
   VAPI_ASSISTANT_ID=your-vapi-assistant-id
   FRONTEND_URL=https://your-project.vercel.app
   DEBUG=false
   ```

   **Important**: 
   - Set these for **Production**, **Preview**, and **Development** environments
   - After adding variables, you'll need to redeploy

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
   vercel env add VITE_BACKEND_URL
   vercel env add VAPI_PRIVATE_API_KEY
   vercel env add VAPI_PHONE_NUMBER_ID
   vercel env add VAPI_ASSISTANT_ID
   vercel env add FRONTEND_URL
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Environment Variables Reference

### Frontend Variables (VITE_*)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `VITE_BACKEND_URL` | Backend API URL (use Vercel URL after first deploy) | Yes |
| `VITE_TEST_PHONE_NUMBER` | Test phone number for development | No |
| `VITE_USE_REAL_CALLS` | Force real calls even in dev (set to "true") | No |
| `VITE_USE_MOCK_CALLS` | Force mock mode even in production (set to "true") | No |

### Backend Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VAPI_PRIVATE_API_KEY` | VAPI server-side API key | Yes |
| `VAPI_PHONE_NUMBER_ID` | VAPI phone number ID | Yes |
| `VAPI_ASSISTANT_ID` | VAPI assistant ID | Yes |
| `FRONTEND_URL` | Frontend URL (use Vercel URL) | Yes |
| `DEBUG` | Enable debug mode ("true" or "false") | No |

## Post-Deployment Steps

1. **Update `VITE_BACKEND_URL`**:
   - After first deployment, update `VITE_BACKEND_URL` to your Vercel URL
   - Format: `https://your-project.vercel.app`
   - Redeploy after updating

2. **Update `FRONTEND_URL`**:
   - Set `FRONTEND_URL` to your Vercel frontend URL
   - This is used for CORS configuration

3. **Test the API**:
   - Visit `https://your-project.vercel.app/api/docs` for API documentation
   - Test the `/api/calls/outbound` endpoint

4. **Verify Frontend**:
   - Visit your Vercel URL
   - Test the call initiation feature

## API Routes

After deployment, your API will be available at:

- `https://your-project.vercel.app/api/calls/outbound` (POST) - Create outbound call
- `https://your-project.vercel.app/api/calls/{call_id}` (GET) - Get call status
- `https://your-project.vercel.app/api/calls` (GET) - List calls
- `https://your-project.vercel.app/api/docs` - API documentation
- `https://your-project.vercel.app/health` - Health check

## Troubleshooting

### Build Fails

1. **Check Node.js version**: Vercel uses Node.js 18.x by default
2. **Check Python version**: Ensure `requirements.txt` is in root directory
3. **Check build logs**: Review build output in Vercel dashboard

### API Functions Not Working

1. **Check Python runtime**: Ensure `vercel.json` specifies Python 3.9+
2. **Check imports**: Ensure `api/index.py` can import from `backend/app`
3. **Check environment variables**: Verify all backend variables are set
4. **Check function logs**: Review function logs in Vercel dashboard

### CORS Errors

1. **Update `FRONTEND_URL`**: Ensure it matches your Vercel frontend URL
2. **Check CORS middleware**: Currently allows all origins (`*`) - restrict in production

### Environment Variables Not Working

1. **Redeploy after adding variables**: Changes require a new deployment
2. **Check variable names**: Ensure exact spelling (case-sensitive)
3. **Check environment scope**: Set variables for Production, Preview, and Development

## Production Considerations

1. **CORS**: Update CORS settings to only allow your domain:
   ```python
   allow_origins=["https://your-project.vercel.app"]
   ```

2. **Environment Variables**: Never commit sensitive keys to Git

3. **Monitoring**: Set up Vercel Analytics and monitoring

4. **Rate Limiting**: Consider adding rate limiting for API endpoints

5. **Error Handling**: Review error handling and logging

## Local Development

To test locally with Vercel-like environment:

```bash
# Install Vercel CLI
npm i -g vercel

# Run development server
vercel dev
```

This will:
- Serve frontend on `http://localhost:3000`
- Serve API functions on `http://localhost:3000/api/*`
- Use environment variables from `.env` files

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python)
- [FastAPI on Vercel](https://vercel.com/guides/deploying-fastapi-with-vercel)
