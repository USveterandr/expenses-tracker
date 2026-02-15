# Vercel Deployment Guide

## Quick Deploy

Your app is configured for Vercel deployment. Here's what you need:

### 1. Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://fcnkgpnfixuombrqsdyt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbmtncG5maXh1b21icnFzZHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTIzODEsImV4cCI6MjA4NjQyODM4MX0.mYTXp8_cfxpaO-TEtu0DZI6jIY1bG4vXeTcung2xq_E
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbmtncG5maXh1b21icnFzZHl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NTIzODEsImV4cCI6MjA4NjQyODM4MX0.mYTXp8_cfxpaO-TEtu0DZI6jIY1bG4vXeTcung2xq_E
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
```

### 2. Build Settings (Auto-detected)

Vercel should auto-detect these settings:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3. Deploy

Push to GitHub and Vercel will auto-deploy:
```bash
git push origin main
```

Or deploy manually:
```bash
npm i -g vercel
vercel --prod
```

## Features Working on Vercel

✅ Next.js 16 App Router  
✅ API Routes  
✅ Supabase Integration  
✅ Authentication  
✅ Server Components  
✅ Static Generation  
✅ Edge Functions  

## Troubleshooting

**Build fails?**
- Check that all env variables are set
- Ensure Node.js 18+ is selected in project settings

**API routes not working?**
- Vercel supports Next.js API routes natively - no extra config needed

**Database connection issues?**
- Verify Supabase URL and keys are correct
- Check Supabase project is active

## Custom Domain (Optional)

1. In Vercel dashboard, go to **Domains**
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` env variable with your custom domain

## Local Development

```bash
# Copy environment variables
cp .env.local.example .env.local

# Install dependencies
npm install

# Run dev server
npm run dev
```
