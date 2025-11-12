# Cloudflare Worker Deployment Guide

## Prerequisites
1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

## Configuration Steps

### 1. Update `wrangler.toml`
Edit `cloudflare-worker/wrangler.toml`:
- Replace `YOUR_API_URL_HERE` with your actual API URL (e.g., `https://api.sard.com`)
- Replace `sard.com` with your actual domain
- Update `zone_name` if different

### 2. Deploy Worker
```bash
cd cloudflare-worker
wrangler deploy
```

### 3. Configure Routes in Cloudflare Dashboard
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker
3. Go to Settings → Triggers → Routes
4. Add routes:
   - `sard.com/novel/*`
   - `*.sard.com/novel/*` (if using subdomains)

### 4. Set Environment Variables (if needed)
```bash
wrangler secret put API_URL
# Enter your API URL when prompted
```

## Testing

### Test Bot Detection
```bash
# Simulate Googlebot
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  https://sard.com/novel/your-novel-slug

# Should return pre-rendered HTML with meta tags
```

### Test Regular User
```bash
# Normal request
curl https://sard.com/novel/your-novel-slug

# Should return React SPA
```

### Verify Cache Headers
```bash
curl -I https://sard.com/novel/your-novel-slug \
  -H "User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1)"

# Look for: Cache-Control: public, max-age=86400
```

## Troubleshooting

### Worker Not Triggering
- Check route patterns in Cloudflare Dashboard
- Verify worker is deployed and active
- Check worker logs: `wrangler tail`

### API Not Responding
- Verify `API_URL` environment variable
- Check CORS settings on your API
- Ensure API endpoints are accessible from Cloudflare network

### Cache Not Working
- Check Cache-Control headers in response
- Cloudflare may ignore caching for certain content types
- Verify cache is enabled in Cloudflare Dashboard (Caching → Configuration)

## Monitoring
```bash
# View live worker logs
wrangler tail

# View worker analytics in Cloudflare Dashboard
Workers & Pages → [Your Worker] → Analytics
```
