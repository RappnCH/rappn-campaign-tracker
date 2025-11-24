import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import idsRouter from './services/ids';
import campaignsRouter from './services/campaigns';
import trackingRouter from './services/tracking';
import { memoryDb } from './db/memory';
import { setupGoogleSheets } from './services/googleSheets';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for tracking (restrict in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: any, res: any, next: any) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    tracking_base_url: process.env.TRACKING_BASE_URL || 'NOT_SET',
    port: process.env.PORT || '3000'
  });
});

// API Routes
app.use('/ids', idsRouter);
app.use('/campaigns', campaignsRouter);
app.use('/tracking', trackingRouter);
app.use('/analytics', trackingRouter);
app.use('/r', trackingRouter);

// Serve index.html for any other routes (SPA support)
app.get('*', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Rappn Campaign Tracker API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize Google Sheets
  const sheetsInitialized = await setupGoogleSheets();
  if (sheetsInitialized) {
    console.log(`📗 Google Sheets integration: ACTIVE`);
    console.log(`   Spreadsheet ID: ${process.env.GOOGLE_SHEET_ID}`);
    
    // Load existing data from Google Sheets
    await memoryDb.initializeFromSheets();
  } else {
    console.log(`📕 Google Sheets integration: DISABLED (using in-memory storage)`);
    // Only seed data if Sheets is not available
    memoryDb.seedData();
  }
  
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health`);
  console.log(`  POST /ids/campaign`);
  console.log(`  POST /campaigns`);
  console.log(`  GET  /campaigns`);
  console.log(`  GET  /campaigns/:id`);
  console.log(`  PUT  /campaigns/:id`);
  console.log(`  DELETE /campaigns/:id`);
  console.log(`  POST /tracking/build-placement-link`);
  console.log(`  GET  /tracking/placements/:campaign_id`);
});

export default app;
