export interface Campaign {
  id?: number;
  campaign_id: string;
  name: string;
  date_start: string;
  date_end?: string;
  geo: string;
  primary_channel: string;
  type: string;
  concept: string;
  language: string;
  status?: string;
  budget?: number;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Placement {
  id?: number;
  campaign_id: string;
  placement_id_seq: number;
  channel: string;
  ad_type: string;
  medium: string;
  base_url: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  qr_id?: string;
  final_url?: string;
  tracked_url?: string;
  redirect_code?: string;
  created_at?: Date;
}

export interface CampaignIdInput {
  dateStart: string;
  geo: string;
  primaryChannel?: string;
  type: string;
  concept: string;
  language: string;
}

export interface TrackingInput {
  campaign_id: string;
  placement_id_seq: number;
  channel: string;
  ad_type: string;
  base_url: string;
  medium: string;
  geo: string;
  language: string;
  concept: string;
}

export interface TrackingOutput {
  campaign_id: string;
  placement_id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  qr_id: string;
  final_url: string;
  tracked_url: string;
  redirect_code?: string;
}
