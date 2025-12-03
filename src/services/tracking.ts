import { Router, Request, Response } from 'express';
import { buildUtms, buildQrId, buildFinalUrl } from '../utils/tracking';
import { TrackingInput, TrackingOutput } from '../types';
import { memoryDb } from '../db/memory';
import { saveClickToSheets, savePlacementToSheets } from './googleSheets';

// Get tracking base URL dynamically to ensure env vars are loaded
function getTrackingBaseUrl(): string {
  return (process.env.TRACKING_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
}

const router = Router();

/**
 * POST /tracking/build-placement-link
 * Generate tracking URL with UTMs and QR ID for a placement
 */
router.post('/build-placement-link', async (req: Request, res: Response) => {
  try {
    const input: TrackingInput = req.body;

    // Validate required fields
    const requiredFields = [
      'campaign_id',
      'placement_id_seq',
      'channel',
      'ad_type',
      'base_url',
      'medium',
      'geo',
      'language',
      'concept',
    ];
    const missingFields = requiredFields.filter(
      field => !input[field as keyof TrackingInput]
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,
      });
    }

    // Extract date from campaign_id (format: YYYY-MM_...)
    const dateMatch = input.campaign_id.match(/^(\d{4}-\d{2})/);
    if (!dateMatch) {
      return res.status(400).json({
        error: 'Invalid campaign_id format',
        message: 'Campaign ID must start with YYYY-MM',
      });
    }
    const dateStart = dateMatch[1] + '-01'; // Use first day of month

    // Build UTM parameters
    const utms = buildUtms({
      channel: input.channel,
      medium: input.medium,
      dateStart,
      geo: input.geo,
      concept: input.concept,
      language: input.language,
      adType: input.ad_type,
      sequence: input.placement_id_seq,
    });

    // Generate QR ID if applicable
    const qr_id = buildQrId({
      channel: input.channel,
      medium: input.medium,
      geo: input.geo,
      concept: input.concept,
      language: input.language,
      sequence: input.placement_id_seq,
    });

    // Build final URL
    const final_url = buildFinalUrl(input.base_url, utms, qr_id);

    // Save placement to database (optional but recommended for tracking)
    let tracked_url = final_url;
    try {
      const placement = await memoryDb.createPlacement({
        campaign_id: input.campaign_id,
        placement_id_seq: input.placement_id_seq,
        channel: input.channel,
        ad_type: input.ad_type,
        medium: input.medium,
        base_url: input.base_url,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        utm_content: utms.utm_content,
        qr_id: qr_id || undefined,
        final_url,
      });

      try {
        const redirectCode = await memoryDb.createRedirectCode(placement.id || 0, final_url);
        tracked_url = `${getTrackingBaseUrl()}/r/${redirectCode}`;
        placement.redirect_code = redirectCode;
        placement.tracked_url = tracked_url;
      } catch (redirectError) {
        console.warn('Failed to generate redirect code:', redirectError);
      }

      // Also save to Google Sheets (async, don't wait)
      savePlacementToSheets({
        placement_id: placement.id || 0,
        campaign_id: input.campaign_id,
        channel: input.channel,
        ad_type: input.ad_type,
        medium: input.medium,
        final_url,
        tracked_url,
      }).catch(err => console.error('Failed to save placement to Google Sheets:', err));
    } catch (dbError) {
      // Log but don't fail if database save fails
      console.warn('Failed to save placement to database:', dbError);
    }

    const output: TrackingOutput = {
      campaign_id: input.campaign_id,
      placement_id: `${input.channel}_${input.ad_type.toLowerCase()}_${input.placement_id_seq}`.toLowerCase(),
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      utm_content: utms.utm_content,
      qr_id,
      final_url,
      tracked_url,
    };

    res.json(output);
  } catch (error) {
    console.error('Error building placement link:', error);
    res.status(500).json({
      error: 'Failed to build placement link',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /tracking/placements/:campaign_id
 * Get all placements for a campaign
 */
router.get('/placements/:campaign_id', async (req: Request, res: Response) => {
  try {
    const { campaign_id } = req.params;
    const result = await memoryDb.getPlacementsByCampaign(campaign_id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching placements:', error);
    res.status(500).json({
      error: 'Failed to fetch placements',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /tracking/placements/:campaign_id
 * Delete all placements for a campaign
 */
router.delete('/placements/:campaign_id', async (req: Request, res: Response) => {
  try {
    const { campaign_id } = req.params;
    await memoryDb.deleteAllPlacementsForCampaign(campaign_id);
    res.json({ success: true, message: `All placements deleted for campaign ${campaign_id}` });
  } catch (error) {
    console.error('Error deleting placements:', error);
    res.status(500).json({
      error: 'Failed to delete placements',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /tracking/click
 * Record a click for analytics
 */
router.post('/click', async (req: Request, res: Response) => {
  try {
    const { placement_id, campaign_id, url, channel, ad_type, medium, utm_source, utm_campaign, utm_medium, utm_content } = req.body;
    const user_agent = req.headers['user-agent'];
    const ip = req.ip;
    const refererHeader = req.headers['referer'] || req.headers['referrer'];
    const referrer = Array.isArray(refererHeader) ? refererHeader[0] : refererHeader;

    const placement = placement_id ? await memoryDb.getPlacementById(placement_id) : null;
    const resolvedCampaignId = campaign_id || placement?.campaign_id;
    const resolvedUrl = url || placement?.final_url || placement?.tracked_url || '';

    console.log(`📍 Direct click: placement_id=${placement_id}, campaign_id=${resolvedCampaignId}`);

    // Record in memory database
    await memoryDb.recordClick({
      placement_id,
      campaign_id: resolvedCampaignId,
      url: resolvedUrl,
      user_agent,
      ip,
    });

    // Save to Google Sheets (await to ensure it completes)
    console.log(`💾 Saving direct click to Google Sheets`);
    await saveClickToSheets({
      click_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      campaign_id: resolvedCampaignId || '',
      placement_id: placement_id || 0,
      channel: channel || placement?.channel || '',
      ad_type: ad_type || placement?.ad_type || '',
      medium: medium || placement?.medium || '',
      utm_source: utm_source || placement?.utm_source || '',
      utm_campaign: utm_campaign || placement?.utm_campaign || '',
      utm_medium: utm_medium || placement?.utm_medium || '',
      utm_content: utm_content || placement?.utm_content || '',
      final_url: placement?.final_url || resolvedUrl,
      ip_address: ip,
      user_agent,
      referrer,
    });
    console.log(`✅ Direct click saved to Google Sheets`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording click:', error);
    res.status(500).json({
      error: 'Failed to record click',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /analytics/campaign/:campaign_id
 * Get analytics for a campaign
 */
router.get('/analytics/campaign/:campaign_id', async (req: Request, res: Response) => {
  try {
    const { campaign_id } = req.params;
    const analytics = await memoryDb.getCampaignAnalytics(campaign_id);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching campaign analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /analytics/placement/:placement_id
 * Get analytics for a specific placement
 */
router.get('/analytics/placement/:placement_id', async (req: Request, res: Response) => {
  try {
    const placement_id = parseInt(req.params.placement_id);
    const analytics = await memoryDb.getPlacementAnalytics(placement_id);
    
    if (!analytics) {
      return res.status(404).json({ error: 'Placement not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching placement analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /tracking/page-view
 * Track page views from the landing page
 */
router.post('/page-view', async (req: Request, res: Response) => {
  try {
    const { 
      utm_source, 
      utm_medium, 
      utm_campaign, 
      utm_content, 
      qr, 
      page_url, 
      referrer,
      ip_address,
      country,
      region,
      city,
      isp
    } = req.body;
    
    console.log(`\n📊 ====== PAGE VIEW TRACKED ======`);
    console.log(`Page URL: ${page_url}`);
    console.log(`UTM Source: ${utm_source}`);
    console.log(`UTM Campaign: ${utm_campaign}`);
    console.log(`QR Code: ${qr}`);
    console.log(`Location: ${city}, ${region}, ${country}`);
    
    const user_agent = req.headers['user-agent'];
    
    // Sanitize IP address (basic sanitization)
    let sanitizedIp = ip_address || req.ip;
    if (sanitizedIp && typeof sanitizedIp === 'string') {
      // Remove any non-standard characters, keep only valid IP chars
      sanitizedIp = sanitizedIp.replace(/[^0-9a-fA-F:.]/g, '');
    }

    // Determine campaign/source/medium if missing
    let finalCampaignId = campaign_id || utm_campaign;
    let finalChannel = utm_source;
    let finalMedium = utm_medium;

    // If no UTMs, try to infer from referrer
    if (!finalCampaignId && !finalChannel) {
      if (referrer) {
        try {
          const refUrl = new URL(referrer);
          const hostname = refUrl.hostname.toLowerCase();
          
          if (hostname.includes('google') || hostname.includes('bing') || hostname.includes('yahoo') || hostname.includes('duckduckgo')) {
            finalCampaignId = 'organic-search';
            finalChannel = 'search_engine';
            finalMedium = 'organic';
          } else if (hostname.includes('facebook') || hostname.includes('instagram') || hostname.includes('linkedin') || hostname.includes('twitter') || hostname.includes('t.co')) {
            finalCampaignId = 'social-organic';
            finalChannel = 'social';
            finalMedium = 'organic';
          } else if (hostname.includes(new URL(page_url).hostname)) {
             // Internal traffic
             finalCampaignId = 'internal';
             finalChannel = 'internal';
             finalMedium = 'referral';
          } else {
            finalCampaignId = 'referral';
            finalChannel = 'referral';
            finalMedium = 'referral';
          }
        } catch (e) {
          // Invalid referrer URL
          finalCampaignId = 'direct-traffic';
          finalChannel = 'direct';
          finalMedium = 'none';
        }
      } else {
        // Direct traffic (no referrer)
        finalCampaignId = 'direct-traffic';
        finalChannel = 'direct';
        finalMedium = 'none';
      }
    }

    // Find the matching placement based on UTM parameters
    let placement_id = 0;
    
    // Try to find placement by matching UTM content
    if (utm_content) {
      const allPlacements: any[] = [];
      const campaigns = await memoryDb.getAllCampaigns();
      
      for (const campaign of campaigns) {
        const campaignPlacements = await memoryDb.getPlacementsByCampaign(campaign.campaign_id);
        allPlacements.push(...campaignPlacements);
      }
      
      const matchedPlacement = allPlacements.find(p => 
        p.utm_source === utm_source && 
        p.utm_campaign === utm_campaign &&
        p.utm_content === utm_content
      );
      
      if (matchedPlacement) {
        placement_id = matchedPlacement.id;
        finalCampaignId = matchedPlacement.campaign_id; // Use the real campaign ID if matched
        console.log(`✅ Matched to Placement ID: ${placement_id}, Campaign: ${finalCampaignId}`);
      }
    }

    // Save to Google Sheets
    await saveClickToSheets({
      click_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      campaign_id: finalCampaignId || 'unknown',
      placement_id: placement_id || 0,
      channel: finalChannel || 'direct',
      ad_type: 'page-view',
      medium: finalMedium || 'unknown',
      utm_source: utm_source || '',
      utm_campaign: utm_campaign || '',
      utm_medium: utm_medium || '',
      utm_content: utm_content || '',
      final_url: page_url || '',
      ip_address: sanitizedIp,
      user_agent,
      referrer,
      country,
      region,
      city,
      isp
    });
    
    console.log(`✅ Page view saved to Google Sheets`);
    console.log(`====== END PAGE VIEW ======\n`);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error tracking page view:', error);
    res.status(500).json({ success: false, error: 'Failed to track page view' });
  }
});

/**
 * GET /tracking/pixel.gif
 * Tracking pixel for landing pages
 */
router.get('/pixel.gif', async (req: Request, res: Response) => {
  try {
    const { utm_source, utm_medium, utm_campaign, utm_content, qr, page_url } = req.query;
    
    console.log(`\n📷 ====== PIXEL TRACKING ======`);
    console.log(`Page URL: ${page_url}`);
    console.log(`UTM Source: ${utm_source}`);
    
    const user_agent = req.headers['user-agent'];
    const ip = req.ip;
    const refererHeader = req.headers['referer'] || req.headers['referrer'];
    const referrer = Array.isArray(refererHeader) ? refererHeader[0] : refererHeader;

    // Find matching placement
    let placement_id = 0;
    let campaign_id = '';
    
    if (utm_content) {
      const allPlacements: any[] = [];
      const campaigns = await memoryDb.getAllCampaigns();
      
      for (const campaign of campaigns) {
        const campaignPlacements = await memoryDb.getPlacementsByCampaign(campaign.campaign_id);
        allPlacements.push(...campaignPlacements);
      }
      
      const matchedPlacement = allPlacements.find(p => 
        p.utm_source === utm_source && 
        p.utm_campaign === utm_campaign &&
        p.utm_content === utm_content
      );
      
      if (matchedPlacement) {
        placement_id = matchedPlacement.id;
        campaign_id = matchedPlacement.campaign_id;
      }
    }

    // Save to Google Sheets
    await saveClickToSheets({
      click_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      campaign_id: campaign_id || (utm_campaign as string) || 'unknown',
      placement_id: placement_id || 0,
      channel: (utm_source as string) || 'direct',
      ad_type: 'pixel',
      medium: (utm_medium as string) || 'unknown',
      utm_source: (utm_source as string) || '',
      utm_campaign: (utm_campaign as string) || '',
      utm_medium: (utm_medium as string) || '',
      utm_content: (utm_content as string) || '',
      final_url: (page_url as string) || '',
      ip_address: ip,
      user_agent,
      referrer,
    });
    
    console.log(`✅ Pixel tracking saved to Google Sheets`);
    console.log(`====== END PIXEL ======\n`);

    // Return a 1x1 transparent GIF
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(pixel);
  } catch (error) {
    console.error('❌ Error tracking pixel:', error);
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif' });
    res.end(pixel);
  }
});

/**
 * GET /:code
 * Redirect handler for tracked short URLs
 * Note: This router is mounted at /r, so /:code matches /r/:code
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    console.log(`\n📱 ====== REDIRECT REQUEST ======`);
    console.log(`Code: ${code}`);
    
    const redirectData = await memoryDb.getRedirectData(code);
    
    if (!redirectData) {
      console.log(`❌ Redirect code not found: ${code}`);
      return res.status(404).json({ error: 'Redirect code not found' });
    }

    console.log(`✅ Redirect data found:`);
    console.log(`   Placement ID: ${redirectData.placement_id}`);
    console.log(`   Final URL: ${redirectData.final_url}`);

    const placement = await memoryDb.getPlacementById(redirectData.placement_id);
    
    if (placement) {
      console.log(`✅ Placement found:`);
      console.log(`   Campaign: ${placement.campaign_id}`);
      console.log(`   Channel: ${placement.channel}`);
      console.log(`   Base URL: ${placement.base_url}`);
      console.log(`   Final URL from placement: ${placement.final_url}`);
    }
    
    const user_agent = req.headers['user-agent'];
    const ip = req.ip;
    const refererHeader = req.headers['referer'] || req.headers['referrer'];
    const referrer = Array.isArray(refererHeader) ? refererHeader[0] : refererHeader;

    // Record the click in memory
    await memoryDb.recordClick({
      placement_id: redirectData.placement_id,
      campaign_id: placement?.campaign_id,
      url: redirectData.final_url,
      user_agent,
      ip,
    });
    console.log(`✅ Click recorded in memory`);

    // Save to Google Sheets immediately (await to ensure it completes)
    if (placement) {
      console.log(`💾 Saving click to Google Sheets...`);
      try {
        await saveClickToSheets({
          click_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          campaign_id: placement.campaign_id,
          placement_id: placement.id || redirectData.placement_id,
          channel: placement.channel,
          ad_type: placement.ad_type,
          medium: placement.medium,
          utm_source: placement.utm_source || '',
          utm_campaign: placement.utm_campaign || '',
          utm_medium: placement.utm_medium || '',
          utm_content: placement.utm_content || '',
          final_url: placement.final_url || redirectData.final_url,
          ip_address: ip,
          user_agent,
          referrer,
        });
        console.log(`✅ Click saved to Google Sheets successfully`);
      } catch (sheetError) {
        console.error(`❌ Failed to save to Google Sheets:`, sheetError);
      }
    } else {
      console.warn(`⚠️  No placement found for redirect code ${code}`);
    }

    console.log(`🔄 Redirecting to: ${redirectData.final_url}`);
    console.log(`====== END REDIRECT ======\n`);
    
    // Redirect to final URL
    res.redirect(302, redirectData.final_url);
  } catch (error) {
    console.error('❌ Error handling redirect:', error);
    res.status(500).json({
      error: 'Failed to redirect',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
