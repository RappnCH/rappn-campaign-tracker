# Rappn Campaign Tracker - Phase 1

Core tracking infrastructure for Rappn Marketing Campaign Manager with **Google Sheets** integration for real-time click tracking!

## Features

- **ID & Naming Service**: Generate campaign IDs following the pattern `YYYY-MM_GEO-CHANNEL-TYPE-CONCEPT-LANG`
- **Campaign Service**: CRUD operations for campaigns
- **Tracking Service**: Generate UTM parameters and QR IDs for placement tracking
- **📊 Google Sheets Database**: Real-time click tracking saved to Google Sheets (FREE!)
- **Click Analytics**: Track every click with UTM parameters, IP, user agent, and referrer
- **QR Code Generation**: Branded QR codes for offline campaigns

## Quick Start with Google Sheets

**Want real-time tracking in Google Sheets?** See `QUICK_START.md` for 5-minute setup!

The app works immediately with in-memory storage, but for persistent tracking:
1. Create a Google Service Account (FREE)
2. Create a Google Sheet
3. Share it with the service account
4. Add credentials to `.env`

**Detailed guide:** See `GOOGLE_SHEETS_SETUP.md`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Optional: Add Google Sheets credentials for persistent tracking
```

3. Start development server:
```bash
npm run dev
```

4. Open browser:
```
http://localhost:3000
```

## How It Works

- **In-Memory Mode** (default): Works immediately, data resets on restart
- **Google Sheets Mode** (recommended): All clicks, campaigns, and placements saved to Google Sheets in real-time

## API Endpoints

### ID & Naming Service
- `POST /ids/campaign` - Generate campaign ID

### Campaign Service
- `POST /campaigns` - Create campaign
- `GET /campaigns` - List all campaigns
- `GET /campaigns/:id` - Get campaign by ID
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign

### Tracking Service
- `POST /tracking/build-placement-link` - Generate tracking URL with UTMs and QR ID

## Database Schema

See `src/db/schema.sql` for the complete database schema.
