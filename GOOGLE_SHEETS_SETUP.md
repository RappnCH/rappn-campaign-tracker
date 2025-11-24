# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets as your database for tracking campaign clicks in real-time.

## Overview

The system will automatically save all clicks, campaigns, and placements to Google Sheets, creating a real-time tracking spreadsheet that you can view and analyze in Google Sheets.

## Prerequisites

- Google Account
- Google Cloud Project (can use your existing "rappn-backend" project)

## Step-by-Step Setup

### 1. Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **rappn-backend**
3. Navigate to **APIs & Services** > **Library**
4. Search for "**Google Sheets API**"
5. Click **Enable**

### 2. Create a Service Account

1. In Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details:
   - **Service account name**: `rappn-click-tracker`
   - **Description**: `Service account for Rappn Campaign Tracker to write click data to Google Sheets`
4. Click **Create and Continue**
5. Skip the optional steps (no role needed for this use case)
6. Click **Done**

### 3. Create JSON Key for Service Account

1. Click on the service account you just created (e.g., `rappn-click-tracker@rappn-backend.iam.gserviceaccount.com`)
2. Go to the **Keys** tab
3. Click **Add Key** > **Create new key**
4. Choose **JSON** format
5. Click **Create**
6. The JSON file will download to your computer - **keep this file safe!**

### 4. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: **Rappn Campaign Tracker**
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/1abc...xyz/edit
                                            ^^^^^^^^^ This is your Spreadsheet ID
   ```

### 5. Share Sheet with Service Account

1. In your Google Sheet, click the **Share** button (top right)
2. Add the service account email address:
   - It looks like: `rappn-click-tracker@rappn-backend.iam.gserviceaccount.com`
   - You can find this in the JSON file you downloaded (`client_email` field)
3. Set permission to **Editor**
4. Uncheck "Notify people"
5. Click **Share**

### 6. Configure Environment Variables

1. Open the `.env` file in your project (or create one)
2. Add the following configuration:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=YOUR_SPREADSHEET_ID_HERE

# Google Service Account Credentials (paste the entire JSON as a single line)
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Important Notes:**
- Replace `YOUR_SPREADSHEET_ID_HERE` with the ID you copied from step 4
- For `GOOGLE_CREDENTIALS`, open the JSON file you downloaded and copy the ENTIRE content as a single line
- Make sure to keep the JSON properly formatted (with quotes and escape characters)

### 7. Start Your Application

```bash
npm run dev
```

You should see this message if everything is configured correctly:

```
✅ Google Sheets API initialized
✅ Google Sheets setup complete
📗 Google Sheets integration: ACTIVE
   Spreadsheet ID: YOUR_SPREADSHEET_ID
```

## What Gets Tracked

The system will automatically create 3 sheets in your spreadsheet:

### 1. **Clicks** Sheet
Every click will be recorded with:
- Click ID
- Timestamp
- Campaign ID
- Placement ID
- Channel (Facebook, Instagram, Google, etc.)
- Ad Type (Feed, Story, Search, Display, etc.)
- Medium (Paid, Organic, QR Code)
- UTM Parameters (source, campaign, medium, content)
- Final URL
- IP Address
- User Agent
- Referrer

### 2. **Campaigns** Sheet
Every campaign will be saved with:
- Campaign ID
- Name
- City
- Status
- Start Date
- End Date
- Created At

### 3. **Placements** Sheet
Every placement will be saved with:
- Placement ID
- Campaign ID
- Channel
- Ad Type
- Medium
- Final URL
- Created At

## Testing

1. Create a campaign in your app
2. Add a placement with tracking URL
3. Click the tracking URL
4. Check your Google Sheet - you should see the click data appear instantly!

## Troubleshooting

### "Google Sheets integration: DISABLED"

- Check that `GOOGLE_SHEET_ID` is set in your `.env` file
- Verify that `GOOGLE_CREDENTIALS` contains valid JSON
- Make sure the JSON is on a single line

### Permission Errors

- Verify you shared the spreadsheet with the service account email
- The service account needs "Editor" permission

### Authentication Errors

- Double-check that you copied the entire JSON content from the service account key file
- Make sure there are no line breaks in the `GOOGLE_CREDENTIALS` value
- Verify the JSON is properly escaped

## Benefits

✅ **Real-time tracking** - See clicks as they happen
✅ **Easy analysis** - Use Google Sheets built-in charts and pivot tables
✅ **Shareable** - Share the spreadsheet with your team
✅ **Free** - No database hosting costs
✅ **Reliable** - Google's infrastructure handles the storage
✅ **Exportable** - Download as Excel, CSV, etc.

## Optional: Create Charts

Once you have data:

1. In Google Sheets, select data from the Clicks sheet
2. Click **Insert** > **Chart**
3. Create charts for:
   - Clicks over time
   - Clicks by channel
   - Clicks by campaign
   - Performance by ad type

## Need Help?

If you encounter any issues, check:
1. That the Google Sheets API is enabled in your Google Cloud project
2. That the service account has been created
3. That you've shared the spreadsheet with the service account email
4. That the `.env` file has the correct values

---

**Ready to track your campaigns!** 🚀
