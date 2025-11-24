import { Router, Request, Response } from 'express';
import { buildCampaignId } from '../utils/naming';
import { CampaignIdInput } from '../types';

const router = Router();

/**
 * POST /ids/campaign
 * Generate a campaign ID based on the naming convention
 */
router.post('/campaign', (req: Request, res: Response) => {
  try {
    const input: CampaignIdInput = req.body;

    // Validate required fields
    const requiredFields = ['dateStart', 'geo', 'type', 'concept', 'language'];
    const missingFields = requiredFields.filter(field => !input[field as keyof CampaignIdInput]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,
      });
    }

    const campaign_id = buildCampaignId(input);

    res.json({ campaign_id });
  } catch (error) {
    console.error('Error generating campaign ID:', error);
    res.status(500).json({
      error: 'Failed to generate campaign ID',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
