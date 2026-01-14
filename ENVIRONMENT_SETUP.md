# Environment Variables Setup Guide

This guide explains how to configure environment variables for the VitalStream Workflow application.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Vite Environment Variables](#understanding-vite-environment-variables)
3. [Required Variables](#required-variables)
4. [Getting Your Credentials](#getting-your-credentials)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Create Your `.env` File

```bash
# Copy the example file
cp .env.example .env
```

### 2. Fill in Your Credentials

Open `.env` and replace the placeholder values with your actual credentials:

```env
# Supabase
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-actual-anon-key"

# VAPI
VITE_VAPI_PUBLIC_KEY="your-actual-vapi-key"
VITE_VAPI_ASSISTANT_ID="your-assistant-id"  # Optional
```

### 3. Restart Dev Server

**Important:** After updating `.env`, you **must** restart your development server:

```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

---

## Understanding Vite Environment Variables

### The `VITE_` Prefix

In Vite projects, environment variables must start with `VITE_` to be accessible in your client-side code.

```typescript
// ✅ Works - has VITE_ prefix
const apiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// ❌ Won't work - missing VITE_ prefix
const apiKey = import.meta.env.VAPI_PUBLIC_KEY; // undefined!
```

### How to Access Environment Variables

In your TypeScript/JavaScript code:

```typescript
// Access environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const vapiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// Check if variable is defined
if (!import.meta.env.VITE_VAPI_PUBLIC_KEY) {
  console.error('VAPI key not configured!');
}
```

### Type Safety (Optional)

For TypeScript autocomplete, you can extend the types in `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_VAPI_PUBLIC_KEY: string;
  readonly VITE_VAPI_ASSISTANT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Required Variables

### Supabase Configuration (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/public key (safe for client) | `eyJhbGc...` |
| `VITE_SUPABASE_PROJECT_ID` | Your project ID | `abc123def456` |

### VAPI Configuration

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_VAPI_PUBLIC_KEY` | Your VAPI public key | Yes | `a1b2c3d4-...` |
| `VITE_VAPI_ASSISTANT_ID` | Saved assistant ID | No | `asst_abc123...` |

---

## Getting Your Credentials

### Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** → **API**
4. Copy the values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API keys** → Copy the `anon` `public` key → `VITE_SUPABASE_PUBLISHABLE_KEY`
   - **Project ref** (in URL) → `VITE_SUPABASE_PROJECT_ID`

**Direct link for your project:**
https://supabase.com/dashboard/project/dgmlzwfdihqpehrifcwn/settings/api

### VAPI Credentials

1. Go to [VAPI Dashboard](https://dashboard.vapi.ai)
2. Sign in or create an account
3. Navigate to **Settings** or **API Keys**
4. Copy your **Public Key** → `VITE_VAPI_PUBLIC_KEY`

**For Assistant ID (Optional):**
1. In VAPI Dashboard, go to **Assistants**
2. Create or select an assistant
3. Copy the **Assistant ID** → `VITE_VAPI_ASSISTANT_ID`

If you don't set `VITE_VAPI_ASSISTANT_ID`, the app will use an inline assistant configuration.

---

## File Structure

```
vitalstream-workflow/
├── .env                 # Your actual credentials (DO NOT COMMIT)
├── .env.example         # Template file (safe to commit)
├── .gitignore           # Should include .env
└── src/
    └── vite-env.d.ts    # Type definitions
```

### Security

✅ `.env` is listed in `.gitignore` - your credentials are **not** committed to git
✅ `.env.example` is safe to commit - it contains no real credentials
✅ All variables are prefixed with `VITE_` - they're meant for client-side use
⚠️ Never put **secret** keys in client-side environment variables

---

## How It Works

### Build Time vs Runtime

Environment variables in Vite are **replaced at build time**:

```typescript
// Your code
const url = import.meta.env.VITE_SUPABASE_URL;

// After build (with VITE_SUPABASE_URL="https://abc.supabase.co")
const url = "https://abc.supabase.co";
```

This means:
- Values are hardcoded into your build
- Changes require a dev server restart
- Values are visible in the built JavaScript (don't use for secrets!)

---

## Usage Examples

### Example 1: Basic Usage

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Example 2: With Validation

```typescript
// src/integrations/vapi/client.ts
const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || '';

function getVapiClient() {
  if (!VAPI_PUBLIC_KEY) {
    throw new Error('VITE_VAPI_PUBLIC_KEY environment variable is not configured');
  }

  return new Vapi(VAPI_PUBLIC_KEY);
}
```

### Example 3: With Defaults

```typescript
const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID || '';

// Use saved assistant if ID provided, otherwise use inline config
if (ASSISTANT_ID) {
  await client.start(ASSISTANT_ID);
} else {
  await client.start({ /* inline config */ });
}
```

---

## Troubleshooting

### "Environment variable is undefined"

**Problem:** `import.meta.env.VITE_MY_VAR` returns `undefined`

**Solutions:**
1. ✅ Check the variable name starts with `VITE_`
2. ✅ Restart your dev server
3. ✅ Verify `.env` file is in the project root
4. ✅ Check for typos in variable names
5. ✅ Ensure no spaces around `=` in `.env` file

### "Changes not taking effect"

**Problem:** Updated `.env` but changes don't appear

**Solution:**
- **Must restart dev server** - Vite only reads `.env` on startup
```bash
# Stop server (Ctrl+C)
npm run dev  # Restart
```

### "Variable works in dev but not in production"

**Problem:** Works locally but not after build

**Solution:**
- Environment variables are baked into the build
- Make sure your build process has access to `.env`
- For deployment platforms (Vercel, Netlify, etc.), set variables in their UI

### "Getting console warnings about missing variables"

**Problem:** Console shows "VAPI_API_KEY not configured"

**Solution:**
1. Open `.env` file
2. Add the missing variable:
   ```env
   VITE_VAPI_PUBLIC_KEY="your-key-here"
   ```
3. Restart dev server

### "My .env file is being committed to git"

**Problem:** `.env` appears in git changes

**Solution:**
```bash
# Check .gitignore includes .env
cat .gitignore | grep .env

# If not present, add it
echo ".env" >> .gitignore

# Remove from git if already committed
git rm --cached .env
git commit -m "Remove .env from git"
```

---

## Best Practices

### ✅ Do

- Use `VITE_` prefix for all client-side variables
- Keep `.env` in `.gitignore`
- Provide `.env.example` as a template
- Restart dev server after changing `.env`
- Use meaningful variable names
- Add comments in `.env` for clarity
- Validate variables before using them

### ❌ Don't

- Don't commit `.env` to version control
- Don't use environment variables for secrets (they're visible in built code)
- Don't forget to restart dev server
- Don't use variables without the `VITE_` prefix
- Don't hardcode credentials in source files

---

## Environment-Specific Configuration

### Development vs Production

You can create different env files:

```bash
.env                # Loaded in all cases
.env.local          # Loaded in all cases, ignored by git
.env.development    # Only loaded in development
.env.production     # Only loaded in production
```

Priority order (highest to lowest):
1. `.env.[mode].local`
2. `.env.[mode]`
3. `.env.local`
4. `.env`

### Example Setup

```bash
# .env - Shared defaults
VITE_APP_NAME="VitalStream Workflow"

# .env.development - Dev-specific
VITE_SUPABASE_URL="https://dev-project.supabase.co"
VITE_VAPI_PUBLIC_KEY="dev-key-123"

# .env.production - Prod-specific
VITE_SUPABASE_URL="https://prod-project.supabase.co"
VITE_VAPI_PUBLIC_KEY="prod-key-456"
```

---

## Checklist

Before starting development, ensure:

- [ ] `.env` file exists in project root
- [ ] All required variables are filled in
- [ ] Variables start with `VITE_` prefix
- [ ] Dev server has been restarted
- [ ] `.env` is in `.gitignore`
- [ ] Credentials are correct (test by running the app)

---

## Quick Reference

```typescript
// Access environment variables
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
import.meta.env.VITE_VAPI_PUBLIC_KEY
import.meta.env.VITE_VAPI_ASSISTANT_ID

// Check if in development
import.meta.env.DEV        // true in dev mode
import.meta.env.PROD       // true in production build
import.meta.env.MODE       // 'development' or 'production'
```

---

## Need Help?

- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Setup Guide](https://supabase.com/docs/guides/getting-started)
- [VAPI Documentation](https://docs.vapi.ai)
- Check the integration READMEs:
  - `src/integrations/supabase/README.md`
  - `src/integrations/vapi/README.md`
