import { Router, Request, Response } from 'express';
import { memoryDb } from '../db/memory';
import { Campaign } from '../types';
import { saveCampaignToSheets } from './googleSheets';

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
 * Delete a campaign
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await memoryDb.deleteCampaign(id);

    if (!result) {
      return res.status(404).json({
        error: 'Campaign not found',
      });
    }

    res.json({
      message: 'Campaign deleted successfully',
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

export default router;
