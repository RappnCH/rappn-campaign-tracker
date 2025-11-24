-- Database Schema for Rappn Campaign Tracker

-- Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE,
    geo VARCHAR(50) NOT NULL,
    primary_channel VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    concept VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    budget DECIMAL(10, 2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Placements Table (for tracking individual placements within campaigns)
CREATE TABLE IF NOT EXISTS placements (
    id SERIAL PRIMARY KEY,
    campaign_id VARCHAR(100) NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
    placement_id_seq INTEGER NOT NULL,
    channel VARCHAR(50) NOT NULL,
    ad_type VARCHAR(50) NOT NULL,
    medium VARCHAR(50) NOT NULL,
    base_url TEXT NOT NULL,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    qr_id VARCHAR(100),
    final_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, placement_id_seq)
);

-- Create indexes for better query performance
CREATE INDEX idx_campaigns_campaign_id ON campaigns(campaign_id);
CREATE INDEX idx_campaigns_geo ON campaigns(geo);
CREATE INDEX idx_campaigns_date_start ON campaigns(date_start);
CREATE INDEX idx_placements_campaign_id ON placements(campaign_id);
CREATE INDEX idx_placements_qr_id ON placements(qr_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
