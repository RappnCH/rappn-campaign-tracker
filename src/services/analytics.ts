import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

const router = Router();
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const CLICKS_SHEET_NAME = 'Clicks';
const CAMPAIGNS_SHEET_NAME = 'Campaigns';
const PLACEMENTS_SHEET_NAME = 'Placements';

let sheets: any = null;

async function initializeSheets() {
  if (sheets) return sheets;

  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS;
    if (!credentialsJson) return null;

    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient as any });
    return sheets;
  } catch (error) {
    console.error('Error initializing Google Sheets:', error);
    return null;
  }
}

/**
 * GET /analytics/overview
 * Get overall analytics across all campaigns
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const api = await initializeSheets();
    if (!api) {
      return res.status(503).json({ error: 'Google Sheets not available' });
    }

    // Fetch all clicks
    const clicksResponse = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CLICKS_SHEET_NAME}!A2:O`,
    });

    const clicks = clicksResponse.data.values || [];

    // Fetch all campaigns
    const campaignsResponse = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CAMPAIGNS_SHEET_NAME}!A2:G`,
    });

    const campaigns = campaignsResponse.data.values || [];

    // Calculate totals
    const totalClicks = clicks.length;
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter((c: any) => c[3] === 'active').length;

    // Get unique channels
    const channels = [...new Set(clicks.map((c: any) => c[4]))];

    // Calculate clicks by date (last 30 days)
    const clicksByDate: { [key: string]: number } = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    clicks.forEach((click: any) => {
      const timestamp = new Date(click[1]);
      if (timestamp >= thirtyDaysAgo) {
        const dateKey = timestamp.toISOString().split('T')[0];
        clicksByDate[dateKey] = (clicksByDate[dateKey] || 0) + 1;
      }
    });

    // Calculate clicks by campaign
    const clicksByCampaign: { [key: string]: any } = {};
    clicks.forEach((click: any) => {
      const campaignId = click[2];
      if (!clicksByCampaign[campaignId]) {
        clicksByCampaign[campaignId] = {
          campaign_id: campaignId,
          clicks: 0,
          channels: new Set(),
        };
      }
      clicksByCampaign[campaignId].clicks++;
      clicksByCampaign[campaignId].channels.add(click[4]);
    });

    // Convert to array and add campaign names
    const campaignStats = Object.values(clicksByCampaign).map((stat: any) => {
      const campaign = campaigns.find((c: any) => c[0] === stat.campaign_id);
      return {
        campaign_id: stat.campaign_id,
        campaign_name: campaign ? campaign[1] : stat.campaign_id,
        clicks: stat.clicks,
        channels: Array.from(stat.channels),
      };
    }).sort((a: any, b: any) => b.clicks - a.clicks);

    // Calculate clicks by channel
    const clicksByChannel: { [key: string]: number } = {};
    clicks.forEach((click: any) => {
      const channel = click[4] || 'unknown';
      clicksByChannel[channel] = (clicksByChannel[channel] || 0) + 1;
    });

    // Calculate clicks by hour (for today)
    const clicksByHour: { [key: number]: number } = {};
    const today = new Date().toISOString().split('T')[0];
    clicks.forEach((click: any) => {
      const timestamp = new Date(click[1]);
      if (timestamp.toISOString().split('T')[0] === today) {
        const hour = timestamp.getHours();
        clicksByHour[hour] = (clicksByHour[hour] || 0) + 1;
      }
    });

    res.json({
      summary: {
        total_clicks: totalClicks,
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaigns,
        channels: channels.length,
      },
      clicks_by_date: Object.entries(clicksByDate)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      clicks_by_campaign: campaignStats,
      clicks_by_channel: Object.entries(clicksByChannel)
        .map(([channel, clicks]) => ({ channel, clicks }))
        .sort((a, b) => b.clicks - a.clicks),
      clicks_by_hour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        clicks: clicksByHour[hour] || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching overview analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /analytics/campaign/:campaign_id
 * Get detailed analytics for a specific campaign
 */
router.get('/campaign/:campaign_id', async (req: Request, res: Response) => {
  try {
    const { campaign_id } = req.params;
    const api = await initializeSheets();
    if (!api) {
      return res.status(503).json({ error: 'Google Sheets not available' });
    }

    // Fetch all clicks for this campaign
    const clicksResponse = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CLICKS_SHEET_NAME}!A2:O`,
    });

    const allClicks = clicksResponse.data.values || [];
    const clicks = allClicks.filter((c: any) => c[2] === campaign_id);

    // Fetch campaign details
    const campaignsResponse = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CAMPAIGNS_SHEET_NAME}!A2:G`,
    });

    const campaigns = campaignsResponse.data.values || [];
    const campaign = campaigns.find((c: any) => c[0] === campaign_id);

    // Fetch placements for this campaign
    const placementsResponse = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PLACEMENTS_SHEET_NAME}!A2:H`,
    });

    const allPlacements = placementsResponse.data.values || [];
    const placements = allPlacements.filter((p: any) => p[1] === campaign_id);

    // Calculate clicks by date
    const clicksByDate: { [key: string]: number } = {};
    clicks.forEach((click: any) => {
      const timestamp = new Date(click[1]);
      const dateKey = timestamp.toISOString().split('T')[0];
      clicksByDate[dateKey] = (clicksByDate[dateKey] || 0) + 1;
    });

    // Calculate clicks by placement
    const clicksByPlacement: { [key: number]: number } = {};
    clicks.forEach((click: any) => {
      const placementId = parseInt(click[3]);
      clicksByPlacement[placementId] = (clicksByPlacement[placementId] || 0) + 1;
    });

    // Calculate clicks by channel
    const clicksByChannel: { [key: string]: number } = {};
    clicks.forEach((click: any) => {
      const channel = click[4] || 'unknown';
      clicksByChannel[channel] = (clicksByChannel[channel] || 0) + 1;
    });

    // Calculate clicks by hour of day
    const clicksByHour: { [key: number]: number } = {};
    clicks.forEach((click: any) => {
      const timestamp = new Date(click[1]);
      const hour = timestamp.getHours();
      clicksByHour[hour] = (clicksByHour[hour] || 0) + 1;
    });

    // Calculate clicks by day of week
    const clicksByDayOfWeek: { [key: number]: number } = {};
    clicks.forEach((click: any) => {
      const timestamp = new Date(click[1]);
      const dayOfWeek = timestamp.getDay(); // 0 = Sunday, 6 = Saturday
      clicksByDayOfWeek[dayOfWeek] = (clicksByDayOfWeek[dayOfWeek] || 0) + 1;
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    res.json({
      campaign: {
        campaign_id,
        name: campaign ? campaign[1] : campaign_id,
        city: campaign ? campaign[2] : '',
        status: campaign ? campaign[3] : '',
        start_date: campaign ? campaign[4] : '',
        end_date: campaign ? campaign[5] : '',
      },
      summary: {
        total_clicks: clicks.length,
        total_placements: placements.length,
        channels: [...new Set(clicks.map((c: any) => c[4]))].length,
      },
      clicks_by_date: Object.entries(clicksByDate)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      clicks_by_placement: placements.map((p: any) => ({
        placement_id: parseInt(p[0]),
        channel: p[2],
        ad_type: p[3],
        clicks: clicksByPlacement[parseInt(p[0])] || 0,
      })),
      clicks_by_channel: Object.entries(clicksByChannel)
        .map(([channel, clicks]) => ({ channel, clicks }))
        .sort((a, b) => b.clicks - a.clicks),
      clicks_by_hour: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        clicks: clicksByHour[hour] || 0,
      })),
      clicks_by_day_of_week: Array.from({ length: 7 }, (_, day) => ({
        day: dayNames[day],
        clicks: clicksByDayOfWeek[day] || 0,
      })),
      recent_clicks: clicks.slice(-20).reverse().map((c: any) => ({
        timestamp: c[1],
        channel: c[4],
        utm_content: c[10],
        ip: c[12],
      })),
    });
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
