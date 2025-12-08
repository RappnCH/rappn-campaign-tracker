# CEO Cockpit: Technical Data & Tracking Specifications

This document details the exact data points, database schemas, and tracking logic required to power the CEO Cockpit.

---

## 1. Growth Pulse (Acquisition & Retention)

### **A. Data Requirements**
*   **Total Downloads (Estimated):** Derived from unique clicks on tracking links.
*   **Weekly Active Users (WAU):** Unique users with at least one session in the last 7 days.
*   **Retention:** % of users returning 30 days after signup.
*   **Live Users:** Count of active socket connections or sessions in the last 5 minutes.

### **B. Database Schema**

**Table: `tracking_clicks`** (For Acquisition)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique click ID. |
| `placement_id` | String | Links to the specific campaign source (e.g., 'bern-flyer'). |
| `timestamp` | Timestamp | When the click occurred. |
| `ip_hash` | String | Anonymized IP for de-duplication. |
| `user_agent` | String | To detect OS (iOS/Android). |

**Table: `app_sessions`** (For Activity & Retention)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique session ID. |
| `user_id` | UUID | Links to `users` table. |
| `start_time` | Timestamp | When the app was opened. |
| `end_time` | Timestamp | When the app was closed/backgrounded. |

### **C. Tracking Logic**
1.  **Downloads:** When a user hits a shortlink (`rappn.ch/r/xyz`), log to `tracking_clicks` *before* redirecting to the App Store.
2.  **WAU:** Query `app_sessions`: `COUNT(DISTINCT user_id) WHERE start_time > NOW() - 7 DAYS`.
3.  **Live Users:** Count active WebSocket connections OR query `app_sessions` where `last_heartbeat > NOW() - 5 MINUTES`.

---

## 2. The Viral Engine

### **A. Data Requirements**
*   **Invites Sent:** Number of times a shopping list was shared.
*   **Invites Accepted:** Number of new user registrations attributed to an invite.

### **B. Database Schema**

**Table: `list_invites`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique invite ID. |
| `sender_id` | UUID | User who shared the list. |
| `token` | String | Unique token included in the share link. |
| `status` | Enum | `'pending'`, `'accepted'`. |
| `created_at` | Timestamp | When the invite was sent. |
| `accepted_at` | Timestamp | When the new user registered (null if pending). |
| `recipient_id` | UUID | The new user ID (null if pending). |

### **C. Tracking Logic**
1.  **Sent:** When user clicks "Share List" in the app, call API `POST /api/invites/create`. Generate a link like `rappn.ch/join?t=TOKEN`.
2.  **Accepted:** When a new user installs the app and clicks the link (Deep Link), pass the `token` to the registration API. Update `list_invites` status to `'accepted'`.

---

## 3. Core Value & Product Mix

### **A. Data Requirements**
*   **Offers Added:** Count of promotional items added to carts.
*   **Generic Items Added:** Count of manual text entries added to carts.
*   **Offers Saved:** Count of items favorited.

### **B. Database Schema**

**Table: `cart_items`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique item ID. |
| `cart_id` | UUID | The shopping list it belongs to. |
| `item_type` | Enum | `'offer'`, `'generic'`. |
| `product_id` | UUID | ID of the offer (null if generic). |
| `store_id` | UUID | ID of the store (Migros, Coop, etc.). |
| `added_at` | Timestamp | When it was added. |

**Table: `user_favorites`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `user_id` | UUID | The user. |
| `offer_id` | UUID | The offer being saved. |
| `saved_at` | Timestamp | When it was saved. |

### **C. Tracking Logic**
1.  **Product Mix:** Query `cart_items`. Group by `item_type`.
2.  **Store Preference:** Query `cart_items` where `item_type = 'offer'`. Group by `store_id`.

---

## 4. Cart Usage

### **A. Data Requirements**
*   **Items Bought:** Items marked as done (slided right).
*   **Items To Buy:** Items currently pending (or slided left).
*   **User Savings:** Total discount value of "Bought" offers.

### **B. Database Schema**

**Table: `item_interactions`**
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique interaction ID. |
| `cart_item_id` | UUID | The item being interacted with. |
| `action` | Enum | `'slide_bought'`, `'slide_tobuy'`. |
| `timestamp` | Timestamp | Exact time of interaction. |

**Table: `offers`** (Reference)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Offer ID. |
| `discount_value` | Decimal | Value in CHF (e.g., 2.50). |

### **C. Tracking Logic**
1.  **Heatmap:** Query `item_interactions`. Extract `DayOfWeek` and `Hour` from `timestamp`. Count interactions per slot.
2.  **Savings:** Join `cart_items` (status='bought') with `offers`. Sum `discount_value`.

---

## 5. Geographic Distribution

### **A. Data Requirements**
*   **User Location:** Canton level distribution.
*   **Penetration:** Users per canton vs Total Population.

### **B. Database Schema**

**Table: `users`** (Additions)
| Field | Type | Description |
| :--- | :--- | :--- |
| `zip_code` | String | User's postal code (PLZ). |
| `canton_code` | String | Derived from PLZ (e.g., 'ZH', 'BE'). |

**Table: `geo_stats`** (Static Reference)
| Field | Type | Description |
| :--- | :--- | :--- |
| `canton_code` | String | 'ZH', 'BE', etc. |
| `population` | Integer | Total targetable population (18-65). |

### **C. Tracking Logic**
1.  **Capture:** During Onboarding (Step 2), ask user for "Postal Code" (PLZ).
2.  **Processing:** Backend maps PLZ to Canton (using a static mapping file) and stores `canton_code` in `users` table.
3.  **Calculation:**
    *   `Users` = `COUNT(*) FROM users GROUP BY canton_code`.
    *   `Penetration` = `(Users / geo_stats.population) * 100`.
