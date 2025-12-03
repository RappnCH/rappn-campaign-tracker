import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const CLICKS_SHEET_NAME = 'Clicks';
const CAMPAIGNS_SHEET_NAME = 'Campaigns';
const PLACEMENTS_SHEET_NAME = 'Placements';

// Initialize Google Sheets API
let sheets: any = null;

async function initializeSheets() {
  if (sheets) return sheets;

  try {
    // Parse credentials from environment variable
    const credentialsJson = process.env.GOOGLE_CREDENTIALS;
    
    if (!credentialsJson) {
      console.warn('⚠️  Google Sheets credentials not found. Using in-memory storage.');
      return null;
    }

    const credentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    sheets = google.sheets({ version: 'v4', auth: authClient as any });

    console.log('✅ Google Sheets API initialized');
    return sheets;
  } catch (error) {
    console.error('❌ Error initializing Google Sheets:', error);
    return null;
  }
}

// Initialize sheets data structure
export async function setupGoogleSheets() {
  const api = await initializeSheets();
  if (!api) return false;

  try {
    // Create headers for Clicks sheet
    const clicksHeaders = [
      'Click ID',
      'Timestamp',
      'Campaign ID',
      'Placement ID',
      'Channel',
      'Ad Type',
      'Medium',
      'UTM Source',
      'UTM Campaign',
      'UTM Medium',
      'UTM Content',
      'Final URL',
      'IP Address',
      'User Agent',
      'Referrer',
      'Country',
      'Region',
      'City',
      'ISP'
    ];

    // Create headers for Campaigns sheet
    const campaignsHeaders = [
      'Campaign ID',
      'Name',
      'City',
      'Status',
      'Start Date',
      'End Date',
      'Created At'
    ];

    // Create headers for Placements sheet
    const placementsHeaders = [
      'Placement ID',
      'Campaign ID',
      'Channel',
      'Ad Type',
      'Medium',
      'Final URL',
      'Tracked URL',
      'Created At'
    ];

    // Check if sheets exist, if not create them
    const spreadsheet = await api.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const existingSheets = spreadsheet.data.sheets?.map((s: any) => s.properties.title) || [];

    // Create Clicks sheet if it doesn't exist
    if (!existingSheets.includes(CLICKS_SHEET_NAME)) {
      await api.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: CLICKS_SHEET_NAME }
            }
          }]
        }
      });

      // Add headers
      await api.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CLICKS_SHEET_NAME}!A1:O1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [clicksHeaders]
        }
      });
    }

    // Create Campaigns sheet if it doesn't exist
    if (!existingSheets.includes(CAMPAIGNS_SHEET_NAME)) {
      await api.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: CAMPAIGNS_SHEET_NAME }
            }
          }]
        }
      });

      await api.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CAMPAIGNS_SHEET_NAME}!A1:G1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [campaignsHeaders]
        }
      });
    }

    // Create Placements sheet if it doesn't exist
    if (!existingSheets.includes(PLACEMENTS_SHEET_NAME)) {
      await api.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            addSheet: {
              properties: { title: PLACEMENTS_SHEET_NAME }
            }
          }]
        }
      });

      await api.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${PLACEMENTS_SHEET_NAME}!A1:H1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [placementsHeaders]
        }
      });
    }

    console.log('✅ Google Sheets setup complete');
    return true;
  } catch (error) {
    console.error('❌ Error setting up Google Sheets:', error);
    return false;
  }
}

// Save a click to Google Sheets
export async function saveClickToSheets(clickData: {
  click_id: string;
  campaign_id: string;
  placement_id: number;
  channel: string;
  ad_type: string;
  medium: string;
  utm_source: string;
  utm_campaign: string;
  utm_medium: string;
  utm_content: string;
  final_url: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
}) {
  const api = await initializeSheets();
  if (!api) return false;

  try {
    const timestamp = new Date().toISOString();
    const row = [
      clickData.click_id,
      timestamp,
      clickData.campaign_id,
      clickData.placement_id,
      clickData.channel,
      clickData.ad_type,
      clickData.medium,
      clickData.utm_source,
      clickData.utm_campaign,
      clickData.utm_medium,
      clickData.utm_content,
      clickData.final_url,
      clickData.ip_address || '',
      clickData.user_agent || '',
      clickData.referrer || '',
      clickData.country || '',
      clickData.region || '',
      clickData.city || '',
      clickData.isp || ''
    ];

    await api.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CLICKS_SHEET_NAME}!A:S`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row]
      }
    });

    console.log(`✅ Click saved to Google Sheets: ${clickData.click_id}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving click to Google Sheets:', error);
    return false;
  }
}

// Save a campaign to Google Sheets
export async function saveCampaignToSheets(campaign: {
  campaign_id: string;
  name: string;
  city: string;
  status: string;
  start_date?: Date | string;
  end_date?: Date | string;
}) {
  const api = await initializeSheets();
  if (!api) return false;

  try {
    const formatDate = (date?: Date | string) => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      return date.toISOString();
    };

    const row = [
      campaign.campaign_id,
      campaign.name,
      campaign.city,
      campaign.status,
      formatDate(campaign.start_date),
      formatDate(campaign.end_date),
      new Date().toISOString()
    ];

    await api.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CAMPAIGNS_SHEET_NAME}!A:G`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row]
      }
    });

    console.log(`✅ Campaign saved to Google Sheets: ${campaign.campaign_id}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving campaign to Google Sheets:', error);
    return false;
  }
}

// Save a placement to Google Sheets
export async function savePlacementToSheets(placement: {
  placement_id: number;
  campaign_id: string;
  channel: string;
  ad_type: string;
  medium: string;
  final_url: string;
  tracked_url?: string;
}) {
  const api = await initializeSheets();
  if (!api) return false;

  try {
    const row = [
      placement.placement_id,
      placement.campaign_id,
      placement.channel,
      placement.ad_type,
      placement.medium,
      placement.final_url,
      placement.tracked_url || '',
      new Date().toISOString()
    ];

    await api.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PLACEMENTS_SHEET_NAME}!A:H`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [row]
      }
    });

    console.log(`✅ Placement saved to Google Sheets: ${placement.placement_id}`);
    return true;
  } catch (error) {
    console.error('❌ Error saving placement to Google Sheets:', error);
    return false;
  }
}

// Get all clicks from Google Sheets
export async function getClicksFromSheets(campaignId?: string) {
  const api = await initializeSheets();
  if (!api) return [];

  try {
    const response = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CLICKS_SHEET_NAME}!A2:O`,
    });

    const rows = response.data.values || [];
    
    const clicks = rows.map((row: any[]) => ({
      click_id: row[0],
      timestamp: row[1],
      campaign_id: row[2],
      placement_id: parseInt(row[3]),
      channel: row[4],
      ad_type: row[5],
      medium: row[6],
      utm_source: row[7],
      utm_campaign: row[8],
      utm_medium: row[9],
      utm_content: row[10],
      final_url: row[11],
      ip_address: row[12],
      user_agent: row[13],
      referrer: row[14],
      country: row[15],
      region: row[16],
      city: row[17],
      isp: row[18]
    }));

    if (campaignId) {
      return clicks.filter((c: any) => c.campaign_id === campaignId);
    }

    return clicks;
  } catch (error) {
    console.error('❌ Error getting clicks from Google Sheets:', error);
    return [];
  }
}

// Get analytics for a campaign from Google Sheets
export async function getCampaignAnalyticsFromSheets(campaignId: string) {
  const api = await initializeSheets();
  if (!api) return null;

  try {
    // Get all clicks for this campaign
    const clicks = await getClicksFromSheets(campaignId);
    
    // Group clicks by placement
    const placementMap = new Map<number, any>();
    
    clicks.forEach((click: any) => {
      const placementId = click.placement_id;
      if (!placementMap.has(placementId)) {
        placementMap.set(placementId, {
          placement_id: placementId,
          channel: click.channel,
          ad_type: click.ad_type,
          medium: click.medium,
          final_url: click.final_url,
          clicks: 0
        });
      }
      placementMap.get(placementId).clicks++;
    });

    const placements = Array.from(placementMap.values());

    return {
      campaign_id: campaignId,
      total_clicks: clicks.length,
      total_placements: placements.length,
      placements
    };
  } catch (error) {
    console.error('❌ Error getting analytics from Google Sheets:', error);
    return null;
  }
}

// Load all campaigns from Google Sheets
export async function loadCampaignsFromSheets() {
  const api = await initializeSheets();
  if (!api) return [];

  try {
    const response = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CAMPAIGNS_SHEET_NAME}!A2:G`,
    });

    const rows = response.data.values || [];
    
    const campaigns = rows.map((row: any[]) => {
      const campaign_id = row[0] || '';
      
      // Parse campaign_id to extract fields: YYYY-MM_GEO-CHAN-TYPE-CONCEPT-LANG
      const parts = campaign_id.split('_');
      const date = parts[0] || '';
      const details = parts[1]?.split('-') || [];
      
      return {
        campaign_id,
        name: row[1] || '',
        geo: row[2] || details[0] || '',
        status: row[3] || 'draft',
        date_start: row[4] || date + '-01',
        date_end: row[5] || '',
        created_at: row[6] ? new Date(row[6]) : new Date(),
        // Derived fields from campaign_id
        primary_channel: details[1] || 'MULTI',
        type: details[2] || 'ORGANIC',
        concept: details.slice(3, -1).join('-') || 'General',
        language: details[details.length - 1] || 'EN',
      };
    });

    console.log(`✅ Loaded ${campaigns.length} campaigns from Google Sheets`);
    return campaigns;
  } catch (error) {
    console.error('❌ Error loading campaigns from Google Sheets:', error);
    return [];
  }
}

// Load all placements from Google Sheets
export async function loadPlacementsFromSheets() {
  const api = await initializeSheets();
  if (!api) return [];

  try {
    const response = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PLACEMENTS_SHEET_NAME}!A2:H`,
    });

    const rows = response.data.values || [];
    
    const placements = rows.map((row: any[]) => {
      const placement: any = {
        id: parseInt(row[0]) || 0,
        campaign_id: row[1] || '',
        channel: row[2] || '',
        ad_type: row[3] || '',
        medium: row[4] || '',
        final_url: row[5] || '',
        tracked_url: row[6] || '',
        created_at: row[7] ? new Date(row[7]) : new Date(),
      };
      
      // Extract UTM parameters from final URL if available
      if (placement.final_url) {
        try {
          const url = new URL(placement.final_url);
          placement.utm_source = url.searchParams.get('utm_source') || '';
          placement.utm_medium = url.searchParams.get('utm_medium') || '';
          placement.utm_campaign = url.searchParams.get('utm_campaign') || '';
          placement.utm_content = url.searchParams.get('utm_content') || '';
          placement.qr_id = url.searchParams.get('qr') || '';
          
          // Reconstruct base_url from origin + pathname (preserves /it or any other path)
          let base = url.origin + url.pathname;
          
          // FIX: Ensure base_url always ends with /it for Rappn landing page
          if (url.origin === 'https://rappn-landing-page.vercel.app' && !url.pathname.includes('/it')) {
            base = 'https://rappn-landing-page.vercel.app/it';
            // Rebuild final_url with correct base
            const newUrl = new URL(base);
            url.searchParams.forEach((value, key) => newUrl.searchParams.set(key, value));
            placement.final_url = newUrl.toString();
            console.log(`🔧 Fixed placement ${placement.id} final_url to include /it`);
          }
          
          placement.base_url = base;
          
          // Extract placement sequence from utm_content (e.g., "FEED_01" -> 1)
          const contentMatch = placement.utm_content?.match(/_(\d+)$/);
          placement.placement_id_seq = contentMatch ? parseInt(contentMatch[1]) : 0;
        } catch (e) {
          console.warn('Failed to parse placement final_url:', placement.final_url);
        }
      }
      
      return placement;
    });

    console.log(`✅ Loaded ${placements.length} placements from Google Sheets`);
    return placements;
  } catch (error) {
    console.error('❌ Error loading placements from Google Sheets:', error);
    return [];
  }
}

// Update campaign status in Google Sheets
export async function updateCampaignStatusInSheets(campaignId: string, newStatus: string) {
  const api = await initializeSheets();
  if (!api) return false;

  try {
    // First, find the row with this campaign_id
    const response = await api.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CAMPAIGNS_SHEET_NAME}!A:D`,
    });

    const rows = response.data.values || [];
    
    // Find the row index (skipping header)
    const rowIndex = rows.findIndex((row: any, index: number) => index > 0 && row[0] === campaignId);
    
    if (rowIndex === -1) {
      console.log(`Campaign ${campaignId} not found in Google Sheets`);
      return false;
    }

    // Update the status column (D = column 4, index 3)
    const updateRange = `${CAMPAIGNS_SHEET_NAME}!D${rowIndex + 1}`;
    await api.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newStatus]]
      }
    });

    console.log(`✅ Campaign ${campaignId} status updated to ${newStatus} in Google Sheets`);
    return true;
  } catch (error) {
    console.error('❌ Error updating campaign status in Google Sheets:', error);
    return false;
  }
}
