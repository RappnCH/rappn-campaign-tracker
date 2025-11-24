/**
 * Helper utilities for campaign ID and naming conventions
 */

/**
 * Normalizes a string for use in campaign IDs
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 */
export function normalizeForId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Formats a date to YYYY-MM format
 */
export function formatDateToYYYYMM(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Pads a sequence number with leading zeros (e.g., 1 -> "01")
 */
export function padSequence(seq: number): string {
  return String(seq).padStart(2, '0');
}

/**
 * Builds a campaign ID following the convention:
 * YYYY-MM_GEO-CHANNEL-TYPE-CONCEPT-LANG
 * 
 * Example: 2025-10_ZH-FB-PAID-BASKET-DE
 */
export function buildCampaignId(params: {
  dateStart: string;
  geo: string;
  primaryChannel?: string;
  type: string;
  concept: string;
  language: string;
}): string {
  const {
    dateStart,
    geo,
    primaryChannel = 'MULTI',
    type,
    concept,
    language,
  } = params;

  const datePrefix = formatDateToYYYYMM(dateStart);
  const geoUpper = geo.toUpperCase();
  const channelUpper = primaryChannel.toUpperCase();
  const typeUpper = type.toUpperCase();
  const conceptNormalized = normalizeForId(concept).toUpperCase();
  const langUpper = language.toUpperCase();

  return `${datePrefix}_${geoUpper}-${channelUpper}-${typeUpper}-${conceptNormalized}-${langUpper}`;
}
