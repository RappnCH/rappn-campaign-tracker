# Deploy Campaign Tracker - Complete Guide

## 🎯 Goal
Deploy the tracker to get a permanent public URL like `https://rappn-tracker.up.railway.app`

Then use redirect links (`/r/:code`) to track every unique link on your landing page.

---

## 📦 Option 1: Railway (Recommended - Easiest)

### Step 1: Push to GitHub
```powershell
# Initialize git repo
git init
git add .
git commit -m "Initial commit: Campaign Tracker"

# Create GitHub repo (go to github.com/new)
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/rappn-tracker.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `rappn-tracker` repo
5. Railway will auto-detect Node.js and use `railway.json` config

### Step 3: Add Environment Variables
In Railway dashboard → Variables:
```
NODE_ENV=production
PORT=3000
GOOGLE_SHEET_ID=1Udw-HYVgSUXconkd30_WycN-CtlqXIVPOCeDjsWICmE
GOOGLE_CREDENTIALS=[paste entire JSON from .env file]
TRACKING_BASE_URL=https://rappn-tracker.up.railway.app
```

**Note:** For `TRACKING_BASE_URL`, use the Railway URL shown in your dashboard (will be like `https://rappn-tracker.up.railway.app` or similar).

### Step 4: Done! 
Your tracker is live at the Railway URL. Test it:
```
https://your-railway-url.railway.app/health
```

---

## 📦 Option 2: Render (Alternative)

### Steps:
1. Push to GitHub (same as above)
2. Go to https://render.com
3. "New +" → "Web Service"
4. Connect your GitHub repo
5. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Add environment variables (same as Railway)
7. Deploy

Your tracker will be at `https://rappn-tracker.onrender.com`

---

## 🔗 Using Tracked Links on Your Landing Page

### Once Deployed:

1. **Access Tracker UI:**
   - Go to your deployed URL: `https://your-tracker-url/`
   
2. **Create Placements:**
   - Create a campaign (e.g., "2025-11_CH-WEB-LANDING")
   - For each unique link on landing page, create a placement:
     - "Hero App Store Button" → placement #1
     - "Footer App Store Button" → placement #2
     - "Hero Play Store Button" → placement #3
     - etc.

3. **Get Tracked URLs:**
   - Each placement will have a `tracked_url` like:
     ```
     https://your-tracker-url/r/abc123
     ```
   - This automatically redirects to App Store/Play Store
   - AND logs the click to Google Sheets

4. **Update Landing Page:**
   In your Next.js code, replace direct store URLs:
   
   ```tsx
   // Before:
   <a href="https://apps.apple.com/app/rappn?utm_source=...">
   
   // After:
   <a href="https://your-tracker-url/r/abc123">
   ```

---

## 🧪 Testing

After deployment:

1. Visit: `https://your-tracker-url/r/abc123`
2. Check:
   - ✅ Redirects to correct destination
   - ✅ New row appears in Google Sheets
   - ✅ Console logs show the click

---

## 💡 Why This Approach is Best

✅ **No tunnels needed** - permanent URL  
✅ **No client scripts** - works 100% via redirects  
✅ **No Vercel env vars** - landing page just uses the redirect URLs  
✅ **Already implemented** - backend code is ready  
✅ **Tracks everything** - clicks go straight to Google Sheets  

You set it up once, then just copy/paste the redirect URLs into your landing page code.
