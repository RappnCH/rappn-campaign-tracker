import { normalizeForId, formatDateToYYYYMM, padSequence } from './naming';

/**
 * Builds UTM parameters following Rappn's standard convention
 * 
 * utm_source = {channel}
 * utm_medium = {medium}
 * utm_campaign = {YYYY-MM}_{geo}_{concept}
 * utm_content = {lang}_{adtype}_{seq}
 */
export function buildUtms(params: {
  channel: string;
  medium: string;
  dateStart: string;
  geo: string;
  concept: string;
  language: string;
  adType: string;
  sequence: number;
}): {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
} {
  const {
    channel,
    medium,
    dateStart,
    geo,
    concept,
    language,
    adType,
    sequence,
  } = params;

  // UTM Source: lowercase channel
  const utm_source = channel.toLowerCase();

  // UTM Medium: lowercase medium
  const utm_medium = medium.toLowerCase();

  // UTM Campaign: YYYY-MM_geo_concept (all lowercase, normalized)
  const datePrefix = formatDateToYYYYMM(dateStart);
  const geoLower = geo.toLowerCase();
  const conceptNormalized = normalizeForId(concept);
  const utm_campaign = `${datePrefix}_${geoLower}_${conceptNormalized}`;

  // UTM Content: lang_adtype_seq (all lowercase)
  const langLower = language.toLowerCase();
  const adTypeLower = adType.toLowerCase();
  const seqPadded = padSequence(sequence);
  const utm_content = `${langLower}_${adTypeLower}_${seqPadded}`;

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
  };
}

/**
 * Generates a QR ID for QR code placements
 * Pattern: QR-{GEO}-{CHAN}-{CONCEPT}-{LANG}-{SEQ}
 * 
 * Now generated for ALL placements to enable QR code tracking
 */
export function buildQrId(params: {
  channel: string;
  medium: string;
  geo: string;
  concept: string;
  language: string;
  sequence: number;
}): string {
  const { channel, medium, geo, concept, language, sequence } = params;

  const geoUpper = geo.toUpperCase();
  const channelShort = channel.substring(0, 4).toUpperCase();
  const conceptNormalized = normalizeForId(concept).toUpperCase();
  const langUpper = language.toUpperCase();
  const seqPadded = padSequence(sequence);

  return `QR-${geoUpper}-${channelShort}-${conceptNormalized}-${langUpper}-${seqPadded}`;
}

/**
 * Builds the final tracking URL with all UTM parameters and QR ID
 */
export function buildFinalUrl(
  baseUrl: string,
  utms: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
  },
  qrId: string
): string {
  const url = new URL(baseUrl);

  // Add UTM parameters
  url.searchParams.set('utm_source', utms.utm_source);
  url.searchParams.set('utm_medium', utms.utm_medium);
  url.searchParams.set('utm_campaign', utms.utm_campaign);
  url.searchParams.set('utm_content', utms.utm_content);

  // Add QR ID if present (using 'qr' parameter)
  if (qrId) {
    url.searchParams.set('qr', qrId);
  }

  return url.toString();
}
