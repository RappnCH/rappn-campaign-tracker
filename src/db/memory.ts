import { Campaign, Placement } from '../types';

// In-memory storage
const campaigns: Map<string, Campaign> = new Map();
const placements: Map<string, Placement[]> = new Map();
const clicks: Map<string, any[]> = new Map(); // key: placement_id or campaign_id
const redirectCodes: Map<string, { placement_id: number; final_url: string }> = new Map();

export const memoryDb = {
  // Campaigns
  async createCampaign(campaign: Campaign): Promise<Campaign> {
    const id = campaigns.size + 1;
    const campaignWithId = {
      ...campaign,
      id,
      created_at: new Date(),
      updated_at: new Date(),
      status: campaign.status || 'draft',
    };
    campaigns.set(campaign.campaign_id, campaignWithId);
    return campaignWithId;
  },

  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(campaigns.values()).sort((a, b) => 
      new Date(b.date_start).getTime() - new Date(a.date_start).getTime()
    );
  },

  async getCampaignById(campaign_id: string): Promise<Campaign | null> {
    return campaigns.get(campaign_id) || null;
  },

  async updateCampaign(campaign_id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
    const campaign = campaigns.get(campaign_id);
    if (!campaign) return null;
    
    const updated = {
      ...campaign,
      ...updates,
      campaign_id: campaign.campaign_id, // Don't allow changing ID
      updated_at: new Date(),
    };
    campaigns.set(campaign_id, updated);
    return updated;
  },

  async deleteCampaign(campaign_id: string): Promise<Campaign | null> {
    const campaign = campaigns.get(campaign_id);
    if (!campaign) return null;
    
    campaigns.delete(campaign_id);
    placements.delete(campaign_id);
    return campaign;
  },

  // Placements
  async createPlacement(placement: Placement): Promise<Placement> {
    const id = Date.now();
    const placementWithId = {
      ...placement,
      id,
      created_at: new Date(),
    };
    
    const campaignPlacements = placements.get(placement.campaign_id) || [];
    campaignPlacements.push(placementWithId);
    placements.set(placement.campaign_id, campaignPlacements);
    
    return placementWithId;
  },

  async getPlacementsByCampaign(campaign_id: string): Promise<Placement[]> {
    return placements.get(campaign_id) || [];
  },

  async getPlacementById(id: number): Promise<Placement | null> {
    for (const campaignPlacements of placements.values()) {
      const placement = campaignPlacements.find(p => p.id === id);
      if (placement) return placement;
    }
    return null;
  },

  // Click Tracking
  async recordClick(data: { placement_id?: number; campaign_id?: string; url: string; user_agent?: string; ip?: string }): Promise<void> {
    const click = {
      ...data,
      timestamp: new Date(),
      id: Date.now(),
    };

    if (data.placement_id) {
      const key = `placement_${data.placement_id}`;
      const existingClicks = clicks.get(key) || [];
      existingClicks.push(click);
      clicks.set(key, existingClicks);
    }

    if (data.campaign_id) {
      const key = `campaign_${data.campaign_id}`;
      const existingClicks = clicks.get(key) || [];
      existingClicks.push(click);
      clicks.set(key, existingClicks);
    }
  },

  async getCampaignAnalytics(campaign_id: string) {
    const campaignClicks = clicks.get(`campaign_${campaign_id}`) || [];
    const campaignPlacements = placements.get(campaign_id) || [];

    const placementStats = campaignPlacements.map(p => {
      const placementClicks = clicks.get(`placement_${p.id}`) || [];
      return {
        placement_id: p.placement_id_seq,
        channel: p.channel,
        ad_type: p.ad_type,
        medium: p.medium,
        clicks: placementClicks.length,
        final_url: p.final_url,
        tracked_url: p.tracked_url,
      };
    });

    return {
      campaign_id,
      total_clicks: campaignClicks.length,
      total_placements: campaignPlacements.length,
      placements: placementStats,
    };
  },

  async getPlacementAnalytics(placement_id: number) {
    const allPlacements: Placement[] = [];
    placements.forEach(p => allPlacements.push(...p));
    const placement = allPlacements.find(p => p.id === placement_id);
    
    if (!placement) return null;

    const placementClicks = clicks.get(`placement_${placement_id}`) || [];

    return {
      placement_id: placement.placement_id_seq,
      campaign_id: placement.campaign_id,
      channel: placement.channel,
      ad_type: placement.ad_type,
      clicks: placementClicks.length,
      click_history: placementClicks.map(c => ({
        timestamp: c.timestamp,
        user_agent: c.user_agent,
      })),
    };
  },

  // Redirect codes for short URLs
  async createRedirectCode(placement_id: number, final_url: string): Promise<string> {
    const code = Math.random().toString(36).substring(2, 8);
    redirectCodes.set(code, { placement_id, final_url });
    return code;
  },

  async getRedirectData(code: string) {
    return redirectCodes.get(code) || null;
  },

  // Initialize from Google Sheets
  async initializeFromSheets() {
    try {
      const { loadCampaignsFromSheets, loadPlacementsFromSheets } = await import('../services/googleSheets');
      
      // Load campaigns
      const sheetCampaigns = await loadCampaignsFromSheets();
      sheetCampaigns.forEach((c: any) => {
        if (!campaigns.has(c.campaign_id)) {
          campaigns.set(c.campaign_id, c);
        }
      });

      // Load placements
      const sheetPlacements = await loadPlacementsFromSheets();
      sheetPlacements.forEach((p: any) => {
        const campaignPlacements = placements.get(p.campaign_id) || [];
        const exists = campaignPlacements.some(existing => existing.id === p.id);
        if (!exists) {
          campaignPlacements.push(p);
          placements.set(p.campaign_id, campaignPlacements);
          
          // Re-create redirect code if it exists
          if (p.tracked_url && p.final_url) {
            const codeMatch = p.tracked_url.match(/\/r\/([a-z0-9]+)/);
            if (codeMatch) {
              redirectCodes.set(codeMatch[1], { placement_id: p.id, final_url: p.final_url });
            }
          }
        }
      });

      console.log(`✅ Initialized database with ${campaigns.size} campaigns and ${sheetPlacements.length} placements from Google Sheets`);
    } catch (error) {
      console.warn('⚠️  Could not load from Google Sheets, using seed data:', error);
      this.seedData();
    }
  },

  // Seed data
  seedData() {
    const campaign1: Campaign = {
      campaign_id: '2025-10_ZH-FB-PAID-BASKET-DE',
      name: 'Zurich — Cheapest Basket (DE)',
      date_start: '2025-10-01',
      date_end: '2025-10-31',
      geo: 'ZH',
      primary_channel: 'FB',
      type: 'PAID',
      concept: 'Cheapest Basket',
      language: 'DE',
      status: 'active',
      description: 'Facebook paid campaign targeting German speakers in Zurich, promoting the cheapest basket offering.',
    };

    const campaign2: Campaign = {
      campaign_id: '2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR',
      name: 'Genève — Mixed Route (FR)',
      date_start: '2025-11-01',
      date_end: '2025-11-30',
      geo: 'GE',
      primary_channel: 'MULTI',
      type: 'ORGANIC',
      concept: 'Mixed Route',
      language: 'FR',
      status: 'active',
      description: 'Multi-channel organic campaign for French speakers in Geneva, featuring mixed delivery routes.',
    };

    this.createCampaign(campaign1);
    this.createCampaign(campaign2);

    // Create sample placements with QR codes
    const placement1Id = 1001;
    const placement2Id = 1002;
    const placement3Id = 1003;
    
    const placement1: Placement = {
      id: placement1Id,
      campaign_id: '2025-10_ZH-FB-PAID-BASKET-DE',
      placement_id_seq: 1,
      channel: 'facebook',
      ad_type: 'FEED',
      medium: 'paid',
      base_url: 'https://rappn-landing-page.vercel.app/it',
      utm_source: 'facebook',
      utm_medium: 'paid',
      utm_campaign: '2025-10_ZH_BASKET_DE',
      utm_content: 'FEED_01',
      qr_id: 'QR-ZH-FB-BASKET-DE-01',
      final_url: 'https://rappn-landing-page.vercel.app/it?utm_source=facebook&utm_medium=paid&utm_campaign=2025-10_ZH_BASKET_DE&utm_content=FEED_01&qr=QR-ZH-FB-BASKET-DE-01',
      created_at: new Date(),
    };

    const placement2: Placement = {
      id: placement2Id,
      campaign_id: '2025-10_ZH-FB-PAID-BASKET-DE',
      placement_id_seq: 2,
      channel: 'instagram',
      ad_type: 'STORY',
      medium: 'paid',
      base_url: 'https://rappn-landing-page.vercel.app/it',
      utm_source: 'instagram',
      utm_medium: 'paid',
      utm_campaign: '2025-10_ZH_BASKET_DE',
      utm_content: 'STORY_02',
      final_url: 'https://rappn-landing-page.vercel.app/it?utm_source=instagram&utm_medium=paid&utm_campaign=2025-10_ZH_BASKET_DE&utm_content=STORY_02',
      created_at: new Date(),
    };

    const placement3: Placement = {
      id: placement3Id,
      campaign_id: '2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR',
      placement_id_seq: 1,
      channel: 'flyer',
      ad_type: 'PRINT',
      medium: 'qr',
      base_url: 'https://rappn-landing-page.vercel.app/it',
      utm_source: 'flyer',
      utm_medium: 'qr',
      utm_campaign: '2025-11_GE_MIXED-ROUTE_FR',
      utm_content: 'PRINT_01',
      qr_id: 'QR-GE-FLYER-MIXED-ROUTE-FR-01',
      final_url: 'https://rappn-landing-page.vercel.app/it?utm_source=flyer&utm_medium=qr&utm_campaign=2025-11_GE_MIXED-ROUTE_FR&utm_content=PRINT_01&qr=QR-GE-FLYER-MIXED-ROUTE-FR-01',
      created_at: new Date(),
    };

    placements.set('2025-10_ZH-FB-PAID-BASKET-DE', [placement1, placement2]);
    placements.set('2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR', [placement3]);

    const seedTrackingBase = (process.env.TRACKING_BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
    [placement1, placement2, placement3].forEach(p => {
      if (!p.id || !p.final_url) return;
      const code = Math.random().toString(36).substring(2, 8);
      redirectCodes.set(code, { placement_id: p.id, final_url: p.final_url });
      p.redirect_code = code;
      p.tracked_url = `${seedTrackingBase}/r/${code}`;
    });
    
    // Generate realistic click data for Zurich campaign
    const campaignClicks: any[] = [];
    const now = Date.now();
    
    // Facebook Feed placement - 25 clicks over 7 days
    for (let i = 0; i < 25; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const clickTime = now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000);
      
      const click = {
        placement_id: placement1Id,
        campaign_id: '2025-10_ZH-FB-PAID-BASKET-DE',
        url: placement1.final_url,
        timestamp: new Date(clickTime),
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        ip: '185.93.0.' + Math.floor(Math.random() * 255),
        id: 2000 + i
      };
      
      campaignClicks.push(click);
      const p1Clicks = clicks.get(`placement_${placement1Id}`) || [];
      p1Clicks.push(click);
      clicks.set(`placement_${placement1Id}`, p1Clicks);
    }
    
    // Instagram Story placement - 18 clicks over 7 days
    for (let i = 0; i < 18; i++) {
      const daysAgo = Math.floor(Math.random() * 7);
      const hoursAgo = Math.floor(Math.random() * 24);
      const clickTime = now - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000);
      
      const click = {
        placement_id: placement2Id,
        campaign_id: '2025-10_ZH-FB-PAID-BASKET-DE',
        url: placement2.final_url,
        timestamp: new Date(clickTime),
        user_agent: 'Mozilla/5.0 (Android 12; Mobile)',
        ip: '185.93.0.' + Math.floor(Math.random() * 255),
        id: 3000 + i
      };
      
      campaignClicks.push(click);
      const p2Clicks = clicks.get(`placement_${placement2Id}`) || [];
      p2Clicks.push(click);
      clicks.set(`placement_${placement2Id}`, p2Clicks);
    }
    
    // Set campaign-level clicks
    clicks.set(`campaign_2025-10_ZH-FB-PAID-BASKET-DE`, campaignClicks);
    
    console.log('✅ Seeded 2 campaigns, 3 placements, and 43 demo clicks to in-memory database');
  }
};
