# 🎨 Visual Guide - How Link Tracking Works

## 📊 The Flow

```
┌─────────────────────────────────────────────────────────────┐
│  VERCEL LANDING PAGE                                        │
│  https://rappn-landing-page.vercel.app                      │
│                                                              │
│  [Download iOS App] ← User clicks this button               │
│   href="/r/hero_ios"  (actually: your-tracker-url/r/hero_ios)│
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  CAMPAIGN TRACKER (Railway/Render)                          │
│  https://rappn-tracker.up.railway.app                       │
│                                                              │
│  GET /r/hero_ios                                            │
│    1. Find placement with code "hero_ios"                   │
│    2. Log to Google Sheets:                                 │
│       - Timestamp: 2025-11-24 14:23:45                      │
│       - Campaign: 2025-11_CH-WEB-LANDING                    │
│       - Placement: hero_ios                                 │
│       - UTM source: website                                 │
│       - UTM campaign: ch_main                               │
│       - IP: 203.0.113.42                                    │
│       - User-Agent: Mozilla/5.0...                          │
│    3. Redirect to final_url                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  APP STORE                                                  │
│  https://apps.apple.com/app/rappn                           │
│                                                              │
│  User sees: App Store page for Rappn                        │
│  (Seamless redirect - they don't notice the tracker)        │
└─────────────────────────────────────────────────────────────┘

Meanwhile...

┌─────────────────────────────────────────────────────────────┐
│  GOOGLE SHEETS                                              │
│  https://docs.google.com/spreadsheets/d/1Udw...             │
│                                                              │
│  New row added to "Clicks" tab:                             │
│  ┌────────┬──────────┬────────────┬───────────┬──────────┐  │
│  │ Time   │ Campaign │ Placement  │ UTM       │ IP       │  │
│  ├────────┼──────────┼────────────┼───────────┼──────────┤  │
│  │14:23:45│ 2025-11..│ hero_ios   │ website   │ 203.0... │  │
│  └────────┴──────────┴────────────┴───────────┴──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Points

### For Each Unique Link You Want to Track:

1. **Create a placement** in the tracker with a unique code
   - Example: `hero_ios`, `footer_android`, `qr_ios`

2. **Use the tracked URL** in your landing page
   - Not: `https://apps.apple.com/app/rappn`
   - But: `https://your-tracker.up.railway.app/r/hero_ios`

3. **Every click** creates a new row in Google Sheets automatically

---

## 📝 Example: Tracking Multiple Links

### Your Landing Page Has:

| Button Location | Purpose | Redirect Code | Tracked URL |
|----------------|---------|---------------|-------------|
| Hero section | iOS download | `hero_ios` | `https://tracker.../r/hero_ios` |
| Hero section | Android download | `hero_android` | `https://tracker.../r/hero_android` |
| Footer | iOS badge | `footer_ios` | `https://tracker.../r/footer_ios` |
| Footer | Android badge | `footer_android` | `https://tracker.../r/footer_android` |
| QR code (print) | iOS app | `qr_ios` | `https://tracker.../r/qr_ios` |
| CTA button | iOS app | `cta_ios` | `https://tracker.../r/cta_ios` |

### In Next.js Code:

```tsx
// app/[locale]/page.tsx

export default function LandingPage() {
  const TRACKER_URL = "https://rappn-tracker.up.railway.app";
  
  return (
    <>
      {/* Hero Section */}
      <section>
        <a 
          href={`${TRACKER_URL}/r/hero_ios`}
          className="app-store-button"
        >
          Download on App Store
        </a>
        
        <a 
          href={`${TRACKER_URL}/r/hero_android`}
          className="play-store-button"
        >
          Get it on Google Play
        </a>
      </section>

      {/* Footer */}
      <footer>
        <a href={`${TRACKER_URL}/r/footer_ios`}>
          <img src="/app-store-badge.png" alt="App Store" />
        </a>
        
        <a href={`${TRACKER_URL}/r/footer_android`}>
          <img src="/play-store-badge.png" alt="Play Store" />
        </a>
      </footer>
    </>
  );
}
```

---

## 📊 What Gets Tracked (Each Click)

Every time someone clicks a tracked link, Google Sheets gets:

```
Row in "Clicks" tab:
├─ click_id: 1732458225123-abc123xyz
├─ timestamp: 2025-11-24T14:23:45.123Z
├─ campaign_id: 2025-11_CH-WEB-LANDING
├─ placement_id: 1
├─ channel: website
├─ ad_type: button
├─ medium: organic
├─ utm_source: website
├─ utm_campaign: ch_main
├─ utm_medium: organic
├─ utm_content: hero_ios_01
├─ final_url: https://apps.apple.com/app/rappn
├─ ip_address: 203.0.113.42
├─ user_agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0...)
└─ referrer: https://rappn-landing-page.vercel.app/it
```

---

## ✅ Why This is Perfect for You

1. **No JavaScript needed** - Pure HTTP redirects
2. **Works on all devices** - Even with ad blockers
3. **100% reliable** - HTTP redirects can't fail
4. **No CORS issues** - It's just a link
5. **SEO friendly** - 302 redirects are fine
6. **Easy to update** - Change destination without updating Vercel
7. **Analytics ready** - All data in Google Sheets

---

## 🎯 After You Deploy

Run this command to get exact code for your landing page:

```powershell
.\generate-landing-links.ps1 -TrackerUrl "https://your-railway-url.up.railway.app"
```

It will output ready-to-copy TSX code for all your links!
