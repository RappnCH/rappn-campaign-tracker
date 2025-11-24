import { Router, Request, Response } from 'express';
import { memoryDb } from '../db/memory';
import { Campaign } from '../types';
import { saveCampaignToSheets, updateCampaignStatusInSheets } from './googleSheets';

const router = Router();

/**
 * POST /campaigns
 * Create a new campaign
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const campaign: Campaign = req.body;

    // Validate required fields
    const requiredFields = ['campaign_id', 'name', 'date_start', 'geo', 'primary_channel', 'type', 'concept', 'language'];
    const missingFields = requiredFields.filter(field => !campaign[field as keyof Campaign]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,
      });
    }

    // Check for duplicate
    const existing = await memoryDb.getCampaignById(campaign.campaign_id);
    if (existing) {
      return res.status(409).json({
        error: 'Campaign ID already exists',
        message: 'A campaign with this ID already exists in the database',
      });
    }

    const result = await memoryDb.createCampaign(campaign);
    
    // Also save to Google Sheets (async, don't wait)
    saveCampaignToSheets({
      campaign_id: campaign.campaign_id,
      name: campaign.name,
      city: campaign.geo,
      status: 'active',
      start_date: campaign.date_start ? new Date(campaign.date_start) : undefined,
      end_date: campaign.date_end ? new Date(campaign.date_end) : undefined,
    }).catch(err => console.error('Failed to save campaign to Google Sheets:', err));
    
    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      error: 'Failed to create campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /campaigns
 * List all campaigns
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await memoryDb.getAllCampaigns();
    res.json(result);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      error: 'Failed to fetch campaigns',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /campaigns/:id
 * Get a campaign by campaign_id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await memoryDb.getCampaignById(id);

    if (!result) {
      return res.status(404).json({
        error: 'Campaign not found',
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      error: 'Failed to fetch campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PUT /campaigns/:id
 * Update a campaign
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<Campaign> = req.body;

    // Don't allow updating campaign_id
    delete updates.campaign_id;

    const fields = Object.keys(updates);
    if (fields.length === 0) {
      return res.status(400).json({
        error: 'No fields to update',
      });
    }

    const result = await memoryDb.updateCampaign(id, updates);

    if (!result) {
      return res.status(404).json({
        error: 'Campaign not found',
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      error: 'Failed to update campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /campaigns/:id
 * Delete a campaign (soft delete - sets status to inactive)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Instead of deleting, set status to inactive
    const result = await memoryDb.updateCampaign(id, { status: 'inactive' });

    if (!result) {
      return res.status(404).json({
        error: 'Campaign not found',
      });
    }

    // Update in Google Sheets
    updateCampaignStatusInSheets(id, 'inactive').catch(err => 
      console.error('Failed to update campaign status in Google Sheets:', err)
    );

    res.json({
      message: 'Campaign set to inactive successfully',
      campaign: result,
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      error: 'Failed to delete campaign',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /campaigns/:id/status
 * Toggle campaign status between active and inactive
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await memoryDb.getCampaignById(id);

    if (!campaign) {
      return res.status(404).json({
        error: 'Campaign not found',
      });
    }

    // Toggle status
    const newStatus = campaign.status === 'active' ? 'inactive' : 'active';
    const result = await memoryDb.updateCampaign(id, { status: newStatus });

    // Update in Google Sheets
    updateCampaignStatusInSheets(id, newStatus).catch(err => 
      console.error('Failed to update campaign status in Google Sheets:', err)
    );

    res.json({
      message: `Campaign status updated to ${newStatus}`,
      campaign: result,
    });
  } catch (error) {
    console.error('Error toggling campaign status:', error);
    res.status(500).json({
      error: 'Failed to toggle campaign status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
