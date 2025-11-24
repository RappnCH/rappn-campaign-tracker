# Quick Start Guide

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies
```powershell
cd "c:\Users\39389\OneDrive\Desktop\Rappn_Landing_Page\Rappn Campaign Tracker"
npm install
```

### 2. Set Up PostgreSQL Database
```powershell
# Create the database (using psql or pgAdmin)
createdb rappn_campaigns

# Or using psql:
psql -U postgres -c "CREATE DATABASE rappn_campaigns;"
```

### 3. Configure Environment
```powershell
# Copy the example environment file
cp .env.example .env

# Edit .env with your database credentials
# Example for Windows with PostgreSQL:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/rappn_campaigns
```

### 4. Run Database Migrations
```powershell
npm run db:migrate
```

Expected output:
```
Running database migrations...
✅ Database migrations completed successfully
```

### 5. Seed Initial Data
```powershell
npm run db:seed
```

Expected output:
```
Seeding database with initial campaigns...
✅ Seed data inserted successfully
   - 2025-10_ZH-FB-PAID-BASKET-DE (Zurich — Cheapest Basket)
   - 2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR (Genève — Mixed Route)
```

### 6. Start the Development Server
```powershell
npm run dev
```

Expected output:
```
🚀 Rappn Campaign Tracker API running on http://localhost:3000
📊 Environment: development

Available endpoints:
  GET  /health
  POST /ids/campaign
  POST /campaigns
  GET  /campaigns
  GET  /campaigns/:id
  PUT  /campaigns/:id
  DELETE /campaigns/:id
  POST /tracking/build-placement-link
  GET  /tracking/placements/:campaign_id
```

## Testing the API

### Option 1: Using the REST Client (Recommended)
1. Install the "REST Client" extension in VS Code
2. Open `test.http`
3. Click "Send Request" above any request

### Option 2: Using curl
```powershell
# Test health endpoint
curl http://localhost:3000/health

# Generate a campaign ID
curl -X POST http://localhost:3000/ids/campaign `
  -H "Content-Type: application/json" `
  -d '{\"dateStart\":\"2025-10-15\",\"geo\":\"ZH\",\"primaryChannel\":\"FB\",\"type\":\"PAID\",\"concept\":\"Cheapest Basket\",\"language\":\"DE\"}'

# List campaigns
curl http://localhost:3000/campaigns

# Build a placement link
curl -X POST http://localhost:3000/tracking/build-placement-link `
  -H "Content-Type: application/json" `
  -d '{\"campaign_id\":\"2025-10_ZH-FB-PAID-BASKET-DE\",\"placement_id_seq\":1,\"channel\":\"facebook\",\"ad_type\":\"FEED\",\"base_url\":\"https://rappn.ch\",\"medium\":\"paid\",\"geo\":\"ZH\",\"language\":\"DE\",\"concept\":\"Cheapest Basket\"}'
```

### Option 3: Using Postman
Import the endpoints from `API.md` into Postman and test interactively.

## Project Structure
```
Rappn Campaign Tracker/
├── src/
│   ├── db/
│   │   ├── connection.ts      # Database connection pool
│   │   ├── migrate.ts         # Migration runner
│   │   ├── schema.sql         # Database schema
│   │   └── seed.ts            # Seed data script
│   ├── services/
│   │   ├── ids.ts             # ID & Naming Service
│   │   ├── campaigns.ts       # Campaign CRUD Service
│   │   └── tracking.ts        # Tracking & UTM Service
│   ├── utils/
│   │   ├── naming.ts          # Campaign ID generation logic
│   │   └── tracking.ts        # UTM and QR ID generation
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── index.ts               # Main application entry
├── .env                       # Environment configuration
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript configuration
├── API.md                    # API documentation
└── test.http                 # REST Client test file
```

## Next Steps

1. **Test the seeded campaigns:**
   - Visit http://localhost:3000/campaigns to see the two pre-populated campaigns

2. **Generate tracking URLs:**
   - Use the `/tracking/build-placement-link` endpoint to create UTM-tagged URLs

3. **Create new campaigns:**
   - First generate a campaign ID with `/ids/campaign`
   - Then create the campaign with `/campaigns`

4. **Explore QR code tracking:**
   - Test with `medium: "qr"` or `channel: "flyer"` to see QR ID generation

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check your DATABASE_URL in `.env`
- Ensure the database exists: `psql -l | findstr rappn_campaigns`

### Port Already in Use
- Change the PORT in `.env` to something else (e.g., 3001)
- Or stop the process using port 3000

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Run `npm run build` to check for compilation errors

## Production Build

```powershell
# Build the TypeScript code
npm run build

# Start the production server
npm start
```
