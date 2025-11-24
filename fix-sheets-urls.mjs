import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const PLACEMENTS_SHEET_NAME = 'Placements';
const TRACKING_BASE_URL = 'https://rappn-campaign-tracker-production.up.railway.app';

async function fixTrackedUrls() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Read all placements
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${PLACEMENTS_SHEET_NAME}!A2:H`,
    });

    const rows = response.data.values || [];
    console.log(`Found ${rows.length} placements`);

    const updates = [];
    
    rows.forEach((row, index) => {
      const trackedUrl = row[6] || ''; // Column G (index 6)
      
      // Check if it's a localhost URL or has double slashes
      if (trackedUrl.includes('localhost') || trackedUrl.includes('//r/')) {
        // Extract the redirect code
        const codeMatch = trackedUrl.match(/\/r\/([a-z0-9]+)/);
        if (codeMatch) {
          const code = codeMatch[1];
          const newUrl = `${TRACKING_BASE_URL}/r/${code}`;
          
          updates.push({
            range: `${PLACEMENTS_SHEET_NAME}!G${index + 2}`, // +2 because: 1 for header, 1 for 0-index
            values: [[newUrl]]
          });
          
          console.log(`Will update row ${index + 2}: ${trackedUrl} -> ${newUrl}`);
        }
      }
    });

    if (updates.length === 0) {
      console.log('✅ No URLs need fixing!');
      return;
    }

    console.log(`\nUpdating ${updates.length} URLs...`);

    // Batch update all tracked URLs
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log(`\n✅ Successfully updated ${updates.length} tracked URLs!`);
    console.log('\nAll URLs now point to:');
    console.log(TRACKING_BASE_URL);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixTrackedUrls();
