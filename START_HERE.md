# 🚀 QUICK START - 3 Commands to Production

## Your Current Status
✅ Git initialized and committed  
✅ Google Sheets credentials configured  
✅ Railway config files ready  

---

## The 3-Step Deploy (10 minutes total)

### 1️⃣ Create GitHub Repo (2 min)
Go to: **https://github.com/new**
- Name: `rappn-campaign-tracker`
- Private or Public (your choice)
- **Don't check any boxes**
- Click "Create repository"

### 2️⃣ Push Code (1 min)
Copy/paste from GitHub's instructions, replacing YOUR_USERNAME:

```bash
git remote add origin https://github.com/YOUR_USERNAME/rappn-campaign-tracker.git
git branch -M main
git push -u origin main
```

### 3️⃣ Deploy to Railway (7 min)
1. Go to: **https://railway.app**
2. Sign in with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select `rappn-campaign-tracker`
5. **Add these variables** (Settings → Variables):

```
NODE_ENV=production
PORT=3000
GOOGLE_SHEET_ID=1Udw-HYVgSUXconkd30_WycN-CtlqXIVPOCeDjsWICmE
GOOGLE_CREDENTIALS=[copy entire JSON from your .env file]
TRACKING_BASE_URL=https://YOUR-APP.up.railway.app
```

**Note:** For `TRACKING_BASE_URL`, Railway will show your URL in the dashboard (looks like `rappn-tracker.up.railway.app`). Copy it and set as the variable value.

---

## ✅ After Deployment

1. **Test it works:**
   ```
   https://your-railway-url.up.railway.app/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Generate landing page links:**
   ```powershell
   .\generate-landing-links.ps1 -TrackerUrl "https://your-railway-url.up.railway.app"
   ```

3. **Copy URLs into your Next.js landing page**

4. **Done!** Every click is tracked to Google Sheets.

---

## 🎯 What You Get

Each unique link on your landing page becomes:
```
https://your-tracker.up.railway.app/r/hero_ios
```

When clicked:
1. ✅ Logs to Google Sheets (timestamp, UTM params, IP, user agent)
2. ✅ Redirects to App Store/Play Store
3. ✅ Works 100% reliably from Vercel

---

## 📞 Need Help?

See `COMPLETE_SOLUTION.md` for detailed explanations.

---

## 🔑 Environment Variables Quick Copy

You'll need these values from your `.env` file:

- **GOOGLE_SHEET_ID:** Already set ✅
- **GOOGLE_CREDENTIALS:** Already set ✅
- **TRACKING_BASE_URL:** Get from Railway after first deploy

**Tip:** Keep your `.env` file open to copy/paste the credentials into Railway.
