# Testing Checklist

Use this checklist to verify all Phase 1 features are working correctly.

## Prerequisites
- [ ] PostgreSQL is running
- [ ] Database `rappn_campaigns` exists
- [ ] `.env` file is configured with correct DATABASE_URL
- [ ] Dependencies installed (`npm install`)
- [ ] Migrations run (`npm run db:migrate`)
- [ ] Seed data loaded (`npm run db:seed`)
- [ ] Development server running (`npm run dev`)

## 1. ID & Naming Service Tests

### Test 1.1: Generate Campaign ID (Single Channel)
**Request:** POST `/ids/campaign`
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
**Expected Result:**
```json
{
  "campaign_id": "2025-10_ZH-FB-PAID-CHEAPEST-BASKET-DE"
}
```
- [ ] Returns correct campaign_id
- [ ] Date formatted as YYYY-MM
- [ ] GEO is uppercase
- [ ] Channel is uppercase
- [ ] Concept is normalized (lowercase, hyphens, uppercase in ID)

### Test 1.2: Generate Campaign ID (Multi Channel - Default)
**Request:** POST `/ids/campaign`
```json
{
  "dateStart": "2025-11-01",
  "geo": "GE",
  "type": "ORGANIC",
  "concept": "Mixed Route",
  "language": "FR"
}
```
**Expected Result:**
```json
{
  "campaign_id": "2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR"
}
```
- [ ] Defaults to MULTI when primaryChannel not provided
- [ ] Multi-word concepts properly normalized

### Test 1.3: Error Handling - Missing Fields
**Request:** POST `/ids/campaign`
```json
{
  "dateStart": "2025-10-15",
  "geo": "ZH"
}
```
**Expected Result:** 400 Bad Request
```json
{
  "error": "Missing required fields",
  "missingFields": ["type", "concept", "language"]
}
```
- [ ] Returns 400 status code
- [ ] Lists all missing fields

---

## 2. Campaign Service Tests

### Test 2.1: Create Campaign
**Request:** POST `/campaigns`
```json
{
  "campaign_id": "2025-12_BS-IG-PAID-FLASH-SALE-DE",
  "name": "Basel — Flash Sale (DE)",
  "date_start": "2025-12-01",
  "date_end": "2025-12-15",
  "geo": "BS",
  "primary_channel": "IG",
  "type": "PAID",
  "concept": "Flash Sale",
  "language": "DE",
  "status": "draft",
  "budget": 3000.00,
  "description": "Instagram campaign for Basel flash sale"
}
```
**Expected Result:** 201 Created
- [ ] Returns created campaign with id
- [ ] Contains created_at and updated_at timestamps
- [ ] Budget formatted as decimal
- [ ] Status is "draft"

### Test 2.2: List All Campaigns
**Request:** GET `/campaigns`

**Expected Result:** 200 OK
- [ ] Returns array of campaigns
- [ ] Contains at least 2 seeded campaigns
- [ ] Sorted by date_start DESC
- [ ] Each campaign has all fields

### Test 2.3: Get Specific Campaign
**Request:** GET `/campaigns/2025-10_ZH-FB-PAID-BASKET-DE`

**Expected Result:** 200 OK
- [ ] Returns single campaign object
- [ ] campaign_id matches request
- [ ] All fields populated

### Test 2.4: Get Non-Existent Campaign
**Request:** GET `/campaigns/DOES-NOT-EXIST`

**Expected Result:** 404 Not Found
- [ ] Returns 404 status code
- [ ] Error message indicates campaign not found

### Test 2.5: Update Campaign
**Request:** PUT `/campaigns/2025-10_ZH-FB-PAID-BASKET-DE`
```json
{
  "status": "active",
  "budget": 6000.00
}
```
**Expected Result:** 200 OK
- [ ] Returns updated campaign
- [ ] Status changed to "active"
- [ ] Budget updated to 6000.00
- [ ] updated_at timestamp is newer
- [ ] Other fields unchanged

### Test 2.6: Duplicate Campaign ID
**Request:** POST `/campaigns` (with existing campaign_id)

**Expected Result:** 409 Conflict
- [ ] Returns 409 status code
- [ ] Error message indicates duplicate campaign_id

### Test 2.7: Delete Campaign
**Request:** DELETE `/campaigns/2025-12_BS-IG-PAID-FLASH-SALE-DE`

**Expected Result:** 200 OK
- [ ] Returns success message
- [ ] Subsequent GET returns 404

---

## 3. Tracking Service Tests

### Test 3.1: Build Facebook Feed Placement
**Request:** POST `/tracking/build-placement-link`
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
**Expected Result:** 200 OK
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
- [ ] utm_source is lowercase channel
- [ ] utm_medium is lowercase medium
- [ ] utm_campaign follows YYYY-MM_geo_concept pattern
- [ ] utm_content follows lang_adtype_seq pattern
- [ ] Sequence is zero-padded (01)
- [ ] qr_id is empty (not a QR placement)
- [ ] final_url contains all UTM parameters

### Test 3.2: Build Instagram Story Placement
**Request:** POST `/tracking/build-placement-link`
```json
{
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "placement_id_seq": 2,
  "channel": "instagram",
  "ad_type": "STORY",
  "base_url": "https://rappn.ch",
  "medium": "paid",
  "geo": "ZH",
  "language": "DE",
  "concept": "Cheapest Basket"
}
```
**Expected Result:** 200 OK
- [ ] utm_source is "instagram"
- [ ] utm_content is "de_story_02"
- [ ] Sequence incremented to 02
- [ ] qr_id still empty

### Test 3.3: Build QR Code Placement (Flyer)
**Request:** POST `/tracking/build-placement-link`
```json
{
  "campaign_id": "2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR",
  "placement_id_seq": 1,
  "channel": "flyer",
  "ad_type": "PRINT",
  "base_url": "https://rappn.ch",
  "medium": "qr",
  "geo": "GE",
  "language": "FR",
  "concept": "Mixed Route"
}
```
**Expected Result:** 200 OK
```json
{
  "utm_source": "flyer",
  "utm_medium": "qr",
  "utm_campaign": "2025-11_ge_mixed-route",
  "utm_content": "fr_print_01",
  "qr_id": "QR-GE-FLYE-MIXED-ROUTE-FR-01",
  "final_url": "https://rappn.ch?utm_source=flyer&utm_medium=qr&utm_campaign=2025-11_ge_mixed-route&utm_content=fr_print_01&qr_id=QR-GE-FLYE-MIXED-ROUTE-FR-01"
}
```
- [ ] qr_id is generated (medium is 'qr')
- [ ] qr_id follows QR-GEO-CHAN-CONCEPT-LANG-SEQ pattern
- [ ] Channel is truncated to 4 chars (FLYE)
- [ ] final_url includes qr_id parameter

### Test 3.4: Build QR Code Placement (Poster)
**Request:** POST `/tracking/build-placement-link`
```json
{
  "campaign_id": "2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR",
  "placement_id_seq": 2,
  "channel": "poster",
  "ad_type": "OUTDOOR",
  "base_url": "https://rappn.ch",
  "medium": "qr",
  "geo": "GE",
  "language": "FR",
  "concept": "Mixed Route"
}
```
**Expected Result:** 200 OK
- [ ] qr_id is "QR-GE-POST-MIXED-ROUTE-FR-02"
- [ ] Channel shows as POST (truncated from poster)
- [ ] Sequence is 02

### Test 3.5: Get Campaign Placements
**Request:** GET `/tracking/placements/2025-10_ZH-FB-PAID-BASKET-DE`

**Expected Result:** 200 OK
- [ ] Returns array of placements
- [ ] Contains Facebook and Instagram placements from previous tests
- [ ] Sorted by placement_id_seq
- [ ] Each has all UTM fields
- [ ] Created_at timestamps present

### Test 3.6: Verify Placement Storage
After creating placements in tests 3.1-3.4:
**Request:** GET `/tracking/placements/2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR`

**Expected Result:** 200 OK
- [ ] Returns both flyer and poster placements
- [ ] qr_id populated for both
- [ ] Placement details match creation requests

### Test 3.7: Error Handling - Missing Fields
**Request:** POST `/tracking/build-placement-link`
```json
{
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "channel": "facebook"
}
```
**Expected Result:** 400 Bad Request
- [ ] Returns missing fields error
- [ ] Lists all required missing fields

### Test 3.8: Error Handling - Invalid Campaign ID Format
**Request:** POST `/tracking/build-placement-link`
```json
{
  "campaign_id": "INVALID-FORMAT",
  "placement_id_seq": 1,
  "channel": "facebook",
  "ad_type": "FEED",
  "base_url": "https://rappn.ch",
  "medium": "paid",
  "geo": "ZH",
  "language": "DE",
  "concept": "Test"
}
```
**Expected Result:** 400 Bad Request
- [ ] Returns error about invalid campaign_id format
- [ ] Mentions requirement for YYYY-MM prefix

---

## 4. Integration Tests

### Test 4.1: Full Workflow - Create Campaign and Placements
1. Generate campaign ID
   - [ ] POST `/ids/campaign` returns valid ID

2. Create campaign with that ID
   - [ ] POST `/campaigns` succeeds

3. Create multiple placements
   - [ ] Create Facebook placement (seq 1)
   - [ ] Create Instagram placement (seq 2)
   - [ ] Create Flyer QR placement (seq 3)

4. Retrieve all placements
   - [ ] GET `/tracking/placements/:id` returns all 3 placements
   - [ ] Sequences are 01, 02, 03
   - [ ] Only flyer has qr_id

### Test 4.2: Seeded Campaigns Verification
**Request:** GET `/campaigns`

- [ ] "Zurich — Cheapest Basket (DE)" exists
  - campaign_id: 2025-10_ZH-FB-PAID-BASKET-DE
  - geo: ZH
  - language: DE

- [ ] "Genève — Mixed Route (FR)" exists
  - campaign_id: 2025-11_GE-MULTI-ORGANIC-MIXED-ROUTE-FR
  - geo: GE
  - language: FR

### Test 4.3: URL Parameter Encoding
Create placement with special characters in base URL:
**Request:** POST `/tracking/build-placement-link`
```json
{
  "campaign_id": "2025-10_ZH-FB-PAID-BASKET-DE",
  "placement_id_seq": 99,
  "channel": "facebook",
  "ad_type": "FEED",
  "base_url": "https://rappn.ch/products?category=food",
  "medium": "paid",
  "geo": "ZH",
  "language": "DE",
  "concept": "Cheapest Basket"
}
```
- [ ] final_url properly appends UTMs to existing query params
- [ ] No duplicate '?' characters
- [ ] All parameters properly URL encoded

---

## 5. Database Tests

### Test 5.1: Check Campaigns Table
```sql
SELECT * FROM campaigns ORDER BY date_start DESC;
```
- [ ] All campaigns have unique campaign_id
- [ ] created_at and updated_at populated
- [ ] Status defaults to 'draft' when not specified

### Test 5.2: Check Placements Table
```sql
SELECT * FROM placements ORDER BY campaign_id, placement_id_seq;
```
- [ ] All placements linked to valid campaign_id
- [ ] No duplicate (campaign_id, placement_id_seq) pairs
- [ ] UTM fields populated
- [ ] qr_id only for QR/flyer placements

### Test 5.3: Foreign Key Constraint
Delete a campaign with placements:
- [ ] Placements are cascade deleted
- [ ] No orphaned placements remain

---

## Performance & Edge Cases

### Test 6.1: Large Sequence Numbers
Create placement with seq 999:
- [ ] utm_content shows "de_feed_999" (not "de_feed_09")
- [ ] Padding only for numbers < 100

### Test 6.2: Special Characters in Concept
Generate ID with concept "50% Off! (Limited Time)":
- [ ] Concept normalized to valid ID format
- [ ] Special characters removed/replaced

### Test 6.3: Multiple Concurrent Placements
Create 10 placements rapidly:
- [ ] All stored successfully
- [ ] No race conditions
- [ ] Sequences remain unique

---

## Summary Checklist

### Core Functionality
- [ ] All ID generation tests pass
- [ ] All campaign CRUD operations work
- [ ] All tracking/UTM generation works
- [ ] QR ID logic correct

### Data Integrity
- [ ] Database constraints enforced
- [ ] Timestamps auto-managed
- [ ] Foreign keys working
- [ ] Unique constraints prevent duplicates

### Error Handling
- [ ] Validation errors return 400
- [ ] Not found returns 404
- [ ] Duplicates return 409
- [ ] Server errors return 500
- [ ] All errors have helpful messages

### Documentation
- [ ] API.md examples match actual behavior
- [ ] SETUP.md instructions work
- [ ] test.http file has working examples
- [ ] All endpoints documented

---

## Health Check
**Request:** GET `/health`

**Expected Result:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T..."
}
```
- [ ] Returns 200 OK
- [ ] Timestamp is current

---

## Notes
- Use the `test.http` file with REST Client extension for easy testing
- Check terminal logs for any errors during operations
- Verify database state after each test group
- All tests should be repeatable (idempotent where possible)
