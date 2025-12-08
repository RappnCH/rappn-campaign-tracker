# CEO Cockpit: API Endpoint Specification

This document lists every API endpoint required to power the CEO Cockpit, detailing what UI elements they populate, the expected request parameters, and the backend function they serve.

---

## 1. Dashboard Overview (High-Level Cards)

These endpoints are called when the dashboard loads to populate the summary cards.

### **A. Growth Pulse**
*   **Endpoint:** `GET /api/v1/dashboard/growth`
*   **Populates:** 
    *   "Total Downloads" (Value, Growth %, Progress Bar)
    *   "Weekly Active Users" (Value, Growth %)
    *   "Live Users Now" (Value, Sparkline)
*   **Expects:** `?period=30d` (optional, defaults to 30d)
*   **Function:** Aggregates total unique clicks from `tracking_clicks` (for downloads) and counts distinct active users from `app_sessions` (for WAU/Live).

### **B. Retention**
*   **Endpoint:** `GET /api/v1/dashboard/retention`
*   **Populates:** "Day-30 Retention" card (Value vs Industry Avg).
*   **Expects:** None.
*   **Function:** Calculates the percentage of users who had a session 30-33 days after their registration date.

### **C. Viral Engine**
*   **Endpoint:** `GET /api/v1/dashboard/virality`
*   **Populates:** 
    *   "Lists Shared" (Count)
    *   "Lists Accepted" (Count)
    *   "Viral Conversion Rate" (%)
*   **Expects:** `?period=30d`
*   **Function:** Counts records in `list_invites` table, grouping by status (`pending` vs `accepted`).

### **D. Core Value & Product Mix**
*   **Endpoint:** `GET /api/v1/dashboard/engagement`
*   **Populates:** 
    *   "Product Mix" Bar (Offers % vs Generic %)
    *   "Offers Added", "Generic Items Added", "Offers Saved" counts.
*   **Expects:** `?period=30d`
*   **Function:** Aggregates `cart_items` by `item_type` and counts `user_favorites`.

### **E. Cart Usage**
*   **Endpoint:** `GET /api/v1/dashboard/instore-actions`
*   **Populates:** 
    *   "Items Bought" (Slided Right)
    *   "Items To Buy" (Slided Left)
    *   "Total Carts Created"
*   **Expects:** `?period=30d`
*   **Function:** Counts `item_interactions` grouped by action type.

*   **Endpoint:** `GET /api/v1/dashboard/financial-impact`
*   **Populates:** "Est. User Savings (YTD)"
*   **Expects:** None (Always YTD).
*   **Function:** Sums the `discount_value` of all `cart_items` marked as bought.

### **F. Geographic Distribution**
*   **Endpoint:** `GET /api/v1/dashboard/geo-distribution`
*   **Populates:** Top 5 Cantons list (Name, User Count, Growth).
*   **Expects:** None.
*   **Function:** Returns the top 5 cantons by user count from the `users` table.

---

## 2. Drill-Down Modals (Detailed Views)

These endpoints are called only when a user clicks on a specific card to open the modal.

### **A. Acquisition & Trend Analysis (Growth Modal)**
*   **Endpoint:** `GET /api/v1/analytics/growth-trend`
*   **Populates:** 
    *   "Active Users %" Bar Chart.
    *   "Total Downloads Breakdown" Pie Chart.
    *   "Active Users Breakdown" Pie Chart.
*   **Expects:** `?period=30d` (or `90d`, `1y`)
*   **Function:** Returns daily time-series data for downloads/WAU and a breakdown of sources (Organic, Referral, Campaign Name).

### **B. Cohort Retention (Retention Modal)**
*   **Endpoint:** `GET /api/v1/analytics/cohorts`
*   **Populates:** The Cohort Analysis Table (Month 0 to Month 3).
*   **Expects:** None (Standard last 6-12 months).
*   **Function:** Performs complex cohort analysis, grouping users by join month and calculating retention rates for subsequent months.

### **C. Viral Funnel (Viral Modal)**
*   **Endpoint:** `GET /api/v1/analytics/viral-funnel`
*   **Populates:** 
    *   "Invites Sent vs Accepted" Bar Chart.
    *   "Top Referrers" Leaderboard Table.
*   **Expects:** `?period=30d`
*   **Function:** Returns daily funnel data and a list of top `sender_id`s sorted by accepted invites.

### **D. Store Preference (Engagement Modal)**
*   **Endpoint:** `GET /api/v1/analytics/store-preference`
*   **Populates:** "Offers Added vs Favorited by Store" Bar Chart.
*   **Expects:** `?category=all` (Optional filter).
*   **Function:** Aggregates `cart_items` by `store_id`, optionally filtering by product category.

### **E. Shopping Times (Instore Modal)**
*   **Endpoint:** `GET /api/v1/analytics/shopping-times`
*   **Populates:** "Item Interaction Heatmap" (Day of Week vs Time of Day).
*   **Expects:** `?period=30d`
*   **Function:** Aggregates `item_interactions` timestamps into buckets (Morning/Lunch/Afternoon/Evening) per day of week.

### **F. Swiss Heatmap (Geo Modal)**
*   **Endpoint:** `GET /api/v1/analytics/geo-heatmap`
*   **Populates:** The Swiss Canton Tile Map (Sorted by Penetration).
*   **Expects:** None.
*   **Function:** Returns data for ALL 26 cantons, including User Count, Penetration Rate, and Growth Rate.
