# Rappn Campaign Tracker - API Documentation

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. ID & Naming Service

#### Generate Campaign ID
**POST** `/ids/campaign`

Generates a campaign ID following the convention: `YYYY-MM_GEO-CHANNEL-TYPE-CONCEPT-LANG`

**Request Body:**
```json
{
  "dateStart": "2025-10-15",
  "geo": "ZH",
  "primaryChannel": "FB",
  "type": "PAID",
  "concept": "Cheapest Basket",
  "language": "DE"
}
```

**Response:**
```json
{
  "campaign_id": "2025-10_ZH-FB-PAID-CHEAPEST-BASKET-DE"
}
```

**Notes:**
- `primaryChannel` defaults to "MULTI" if not provided
- `concept` is normalized (lowercased, spaces replaced with hyphens)

---

### 2. Campaign Service

#### Create Campaign
**POST** `/campaigns`

Creates a new campaign.

**Request Body:**
```json
{
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "name": "Zurich — Cheapest Basket (DE)",
  "date_start": "2025-10-01",
  "date_end": "2025-10-31",
  "geo": "ZH",
  "primary_channel": "FB",
  "type": "PAID",
  "concept": "Cheapest Basket",
  "language": "DE",
  "status": "active",
  "budget": 5000.00,
  "description": "Facebook campaign targeting Zurich"
}
```

**Response:** (201 Created)
```json
{
  "id": 1,
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "name": "Zurich — Cheapest Basket (DE)",
  "date_start": "2025-10-01",
  "date_end": "2025-10-31",
  "geo": "ZH",
  "primary_channel": "FB",
  "type": "PAID",
  "concept": "Cheapest Basket",
  "language": "DE",
  "status": "active",
  "budget": "5000.00",
  "description": "Facebook campaign targeting Zurich",
  "created_at": "2025-11-22T10:30:00.000Z",
  "updated_at": "2025-11-22T10:30:00.000Z"
}
```

#### List All Campaigns
**GET** `/campaigns`

Returns all campaigns sorted by start date (descending).

**Response:**
```json
[
  {
    "id": 1,
    "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
    "name": "Zurich — Cheapest Basket (DE)",
    ...
  },
  ...
]
```

#### Get Campaign by ID
**GET** `/campaigns/:id`

Returns a specific campaign by its `campaign_id`.

**Example:** `GET /campaigns/2025-10_ZH-FB-PAID-BASKET-DE`

**Response:**
```json
{
  "id": 1,
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "name": "Zurich — Cheapest Basket (DE)",
  ...
}
```

#### Update Campaign
**PUT** `/campaigns/:id`

Updates a campaign. The `campaign_id` cannot be changed.

**Request Body:**
```json
{
  "status": "completed",
  "budget": 7500.00
}
```

**Response:**
```json
{
  "id": 1,
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "status": "completed",
  "budget": "7500.00",
  ...
}
```

#### Delete Campaign
**DELETE** `/campaigns/:id`

Deletes a campaign and all associated placements.

**Response:**
```json
{
  "message": "Campaign deleted successfully",
  "campaign": { ... }
}
```

---

### 3. Tracking Service

#### Build Placement Link
**POST** `/tracking/build-placement-link`

Generates UTM parameters, QR ID (if applicable), and final tracking URL.

**Request Body:**
```json
{
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "placement_id_seq": 1,
  "channel": "facebook",
  "ad_type": "FEED",
  "base_url": "https://rappn.ch",
  "medium": "paid",
  "geo": "ZH",
  "language": "DE",
  "concept": "Cheapest Basket"
}
```

**Response:**
```json
{
  "utm_source": "facebook",
  "utm_medium": "paid",
  "utm_campaign": "2025-10_zh_cheapest-basket",
  "utm_content": "de_feed_01",
  "qr_id": "",
  "final_url": "https://rappn.ch?utm_source=facebook&utm_medium=paid&utm_campaign=2025-10_zh_cheapest-basket&utm_content=de_feed_01"
}
```

**QR Code Example:**
```json
{
  "campaign_id": "2025-10_ZH-FLYER-PAID-BASKET-DE",
  "placement_id_seq": 2,
  "channel": "flyer",
  "ad_type": "PRINT",
  "base_url": "https://rappn.ch",
  "medium": "qr",
  "geo": "ZH",
  "language": "DE",
  "concept": "Cheapest Basket"
}
```

**Response:**
```json
{
  "utm_source": "flyer",
  "utm_medium": "qr",
  "utm_campaign": "2025-10_zh_cheapest-basket",
  "utm_content": "de_print_02",
  "qr_id": "QR-ZH-FLYE-CHEAPEST-BASKET-DE-02",
  "final_url": "https://rappn.ch?utm_source=flyer&utm_medium=qr&utm_campaign=2025-10_zh_cheapest-basket&utm_content=de_print_02&qr_id=QR-ZH-FLYE-CHEAPEST-BASKET-DE-02"
}
```

#### Get Campaign Placements
**GET** `/tracking/placements/:campaign_id`

Returns all placements for a specific campaign.

**Example:** `GET /tracking/placements/2025-10_ZH-FB-PAID-BASKET-DE`

**Response:**
```json
[
  {
    "id": 1,
    "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
    "placement_id_seq": 1,
    "channel": "facebook",
    "ad_type": "FEED",
    "medium": "paid",
    "base_url": "https://rappn.ch",
    "utm_source": "facebook",
    "utm_medium": "paid",
    "utm_campaign": "2025-10_zh_cheapest-basket",
    "utm_content": "de_feed_01",
    "qr_id": null,
    "final_url": "https://rappn.ch?utm_source=facebook...",
    "created_at": "2025-11-22T10:30:00.000Z"
  }
]
```

---

## UTM Parameter Convention

### Standard Format
```
utm_source = {channel}              // lowercase
utm_medium = {medium}               // lowercase
utm_campaign = {YYYY-MM}_{geo}_{concept}  // lowercase, normalized
utm_content = {lang}_{adtype}_{seq}      // lowercase, padded
```

### Examples

| Campaign | Channel | Medium | Ad Type | Seq | utm_content |
|----------|---------|--------|---------|-----|-------------|
| ZH Basket | facebook | paid | FEED | 1 | `de_feed_01` |
| GE Route | instagram | organic | STORY | 5 | `fr_story_05` |
| ZH Flyer | flyer | qr | PRINT | 2 | `de_print_02` |

---

## QR ID Generation

QR IDs are only generated when:
- `medium === 'qr'` OR
- `channel === 'flyer'`

### Format
```
QR-{GEO}-{CHAN}-{CONCEPT}-{LANG}-{SEQ}
```

### Examples
- `QR-ZH-FLYE-CHEAPEST-BASKET-DE-01`
- `QR-GE-POST-MIXED-ROUTE-FR-03`

**Note:** Channel is truncated to 4 characters in QR IDs.

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "missingFields": ["field1", "field2"]  // if applicable
}
```

### Common Status Codes
- `400` - Bad Request (missing/invalid fields)
- `404` - Not Found
- `409` - Conflict (duplicate campaign_id)
- `500` - Internal Server Error
