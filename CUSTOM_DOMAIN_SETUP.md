# Custom Domain Setup Guide

## Step 1: Deploy to Cloudflare Pages

First, make sure your app is deployed to Cloudflare Pages:

```bash
# Login to Cloudflare
npx wrangler login

# Build and deploy
npm run cf:deploy
```

Or connect your GitHub repo to Cloudflare Pages for automatic deployments.

## Step 2: Configure Custom Domain in Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain: `isaac-trinidad.com`
3. Go to **Pages** in the left sidebar
4. Click on your project: `expense-flow`
5. Go to **Custom domains** tab
6. Click **Set up a custom domain**
7. Enter: `expensetracker.isaac-trinidad.com`
8. Click **Continue** and **Activate domain**

## Step 3: DNS Configuration

Cloudflare should automatically add the DNS record. Verify it's there:

1. In Cloudflare Dashboard, go to your domain
2. Go to **DNS** > **Records**
3. Look for a CNAME record:
   - Name: `expensetracker`
   - Target: `expense-flow.pages.dev`
   - Proxy status: Proxied (orange cloud)

If it's not there, add it manually:
- Type: CNAME
- Name: `expensetracker`
- Target: `expense-flow.pages.dev`
- TTL: Auto
- Proxy status: Proxied

## Step 4: SSL/TLS Settings

1. Go to **SSL/TLS** in the left sidebar
2. Set encryption mode to **Full (strict)**
3. Under **Edge Certificates**, ensure **Always Use HTTPS** is enabled

## Step 5: Wait for Propagation

DNS changes can take up to 24-48 hours to propagate globally, but usually work within a few minutes.

## Troubleshooting

If you still get 404:

1. **Check if build succeeded**: Run `npm run build` locally and check for errors
2. **Verify deployment**: Check Cloudflare Pages dashboard for successful deployment
3. **Check DNS**: Use `dig expensetracker.isaac-trinidad.com` or online DNS checker
4. **Clear cache**: Purge Cloudflare cache from dashboard
5. **Check routes**: Ensure `_routes.json` or `next.config.js` handles all routes

## Environment Variables

Make sure these are set in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Go to: Pages > Your Project > Settings > Environment variables

## Testing

Once configured, test your domain:
```bash
curl -I https://expensetracker.isaac-trinidad.com
```

You should see a 200 OK response.
