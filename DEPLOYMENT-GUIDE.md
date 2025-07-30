# Vercel Deployment Guide

## Prerequisites
- [ ] GitHub repository created and code pushed
- [ ] Vercel account connected to GitHub
- [ ] Production Stripe products created

## Vercel Configuration

### 1. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://asljibfralcdthkuqosh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzbGppYmZyYWxjZHRoa3Vxb3NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTUzMTEsImV4cCI6MjA2NzEzMTMxMX0.9E-p0fzLzlTTy3158BvQr65b9pHKjpjBK8T5JlHv7KA
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RptiQKxt1K8sHTsOgKVK9rGb4w1lsEU7FJiKyT2THV0MBhTa9rGn9nwb5NnJgLIZhEJJYFJOhxn8vGYpXsagtKX00cSH4CU1N
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aGlnaC1idWxsZnJvZy0yNi5jbGVyay5hY2NvdW50cy5kZXYk
```

### 2. Build Configuration
- Framework: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Post-Deployment Tasks

### 1. Update Domain References
After getting your Vercel domain, update:
- Clerk domain settings
- Stripe success/cancel URLs (if needed)
- Any hardcoded localhost references

### 2. Stripe Webhook Configuration
Update webhook endpoint to: `https://your-domain.vercel.app/webhooks/stripe`

### 3. Test Production Flow
- [ ] Authentication works
- [ ] Payment processing works
- [ ] Usage tracking updates
- [ ] Edge functions respond correctly

## Key Files Created
- `vercel.json` - Vercel deployment configuration
- `DEPLOYMENT-GUIDE.md` - This deployment guide

## Current Status
✅ Debug logs removed
✅ Production environment variables identified
✅ Vercel configuration created
⏳ Waiting for GitHub repo connection to Vercel