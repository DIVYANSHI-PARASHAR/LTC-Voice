# Nginx Setup Guide for LTC-Voice Frontend

## Problem
You're seeing "Welcome to nginx" instead of your frontend application because:
1. The frontend needs to be built first
2. Nginx needs to be configured to serve the built files

## Solution

### Step 1: Build the Frontend
The frontend has already been built! The `dist` folder contains your production-ready files.

If you need to rebuild:
```bash
cd /Users/divyanshiparashar/Desktop/LTC-Voice
npm run build
```

### Step 2: Update Nginx Configuration
The nginx configuration has been updated at `/opt/homebrew/etc/nginx/nginx.conf`.

The server block now points to:
```
root /Users/divyanshiparashar/Desktop/LTC-Voice/dist;
```

### Step 3: Reload Nginx
Run these commands to test and reload nginx:

```bash
# Test the configuration
sudo nginx -t

# If test passes, reload nginx
sudo nginx -s reload

# Or restart nginx if reload doesn't work
sudo brew services restart nginx
```

### Step 4: Verify
Visit `http://localhost:8080` in your browser. You should now see your LTC-Voice application instead of the nginx welcome page.

## Alternative: Use a Different Port

If you want to use port 80 (default HTTP port) instead of 8080:

1. Change the listen port in `/opt/homebrew/etc/nginx/nginx.conf`:
   ```nginx
   listen 80;
   ```

2. You'll need sudo privileges to bind to port 80:
   ```bash
   sudo nginx -s reload
   ```

## Troubleshooting

### Still seeing nginx welcome page?
1. Make sure the `dist` folder exists: `ls -la /Users/divyanshiparashar/Desktop/LTC-Voice/dist`
2. Check nginx error logs: `tail -f /opt/homebrew/var/log/nginx/error.log`
3. Verify nginx is using the correct config: `nginx -T` (shows full config)

### Permission errors?
- Make sure nginx has read access to the dist folder
- Check file permissions: `ls -la /Users/divyanshiparashar/Desktop/LTC-Voice/dist`

### Port already in use?
- Check what's using port 8080: `lsof -i :8080`
- Stop the conflicting service or change nginx port

## Development vs Production

**For Development:**
- Use `npm run dev` - runs Vite dev server on port 8080
- No nginx needed

**For Production:**
- Build with `npm run build`
- Serve with nginx (as configured above)

## Backend API Proxy

The nginx config includes a proxy for `/api` requests to your FastAPI backend on port 8000. Make sure your backend is running:

```bash
cd backend
python main.py
```

API requests to `http://localhost:8080/api/*` will be proxied to `http://localhost:8000/*`.
