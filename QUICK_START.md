# Quick Start: Enable Google Sheets Tracking

## What You Need (5-minute setup)

### ✅ Step 1: Create Service Account

1. Go to: https://console.cloud.google.com/
2. Select project: **rappn-backend**
3. Go to **APIs & Services** > **Library**
4. Search and enable: **Google Sheets API**
5. Go to **APIs & Services** > **Credentials**
6. Click **Create Credentials** > **Service Account**
7. Name it: `rappn-click-tracker`
8. Click **Create and Continue** > **Done**
9. Click on the service account you just created
10. Go to **Keys** tab > **Add Key** > **Create new key** > **JSON**
11. Download the file (keep it safe!)

### ✅ Step 2: Create Google Sheet

1. Go to: https://sheets.google.com
2. Create new spreadsheet named: **Rappn Campaign Tracker**
3. Copy the ID from URL: `https://docs.google.com/spreadsheets/d/[COPY_THIS_ID]/edit`

### ✅ Step 3: Share Sheet with Service Account

1. In your new Google Sheet, click **Share** button
2. Add the email from the JSON file (looks like: `rappn-click-tracker@rappn-backend.iam.gserviceaccount.com`)
3. Give it **Editor** permission
4. Click **Share**

### ✅ Step 4: Configure .env File

Open `.env` file in your project and add:

```env
GOOGLE_SHEET_ID=paste_your_spreadsheet_id_here

GOOGLE_CREDENTIALS={"paste":"entire","json":"content","here":"as_one_line"}
```

**Important:** 
- Open the JSON file you downloaded in Step 1
- Copy the ENTIRE content
- Paste it all on one line for `GOOGLE_CREDENTIALS`

### ✅ Step 5: Restart Server

```bash
npm run dev
```

Look for this message:
```
📗 Google Sheets integration: ACTIVE
```

## Done! 🎉

Now every click will be automatically saved to your Google Sheet in real-time!

---

**Need detailed instructions?** See `GOOGLE_SHEETS_SETUP.md`
