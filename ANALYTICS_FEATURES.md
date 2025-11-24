# Performance Analytics Dashboard

## Overview
Comprehensive analytics system for tracking campaign performance with real-time visualizations.

## Features Implemented

### 1. Analytics API Endpoints (`src/services/analytics.ts`)

#### `/analytics/overview` (GET)
Returns overall performance metrics across all campaigns:
- **Summary Stats**: Total clicks, total campaigns, active campaigns, channels
- **Clicks by Date**: Last 30 days of click data
- **Clicks by Campaign**: Performance breakdown by campaign (sorted by clicks)
- **Clicks by Channel**: Traffic source distribution
- **Clicks by Hour**: Today's hourly click pattern

#### `/analytics/campaign/:campaign_id` (GET)
Returns detailed analytics for a specific campaign:
- **Summary Stats**: Total clicks, placements, channels, status
- **Clicks by Date**: Daily click trend
- **Clicks by Placement**: Performance by placement ID
- **Clicks by Channel**: Channel breakdown for this campaign
- **Clicks by Hour**: Hourly distribution
- **Clicks by Day of Week**: Weekly pattern analysis
- **Recent Clicks**: Last 20 clicks with full details

### 2. Frontend Visualizations (`public/app.js`)

#### Overview Dashboard
When no campaign is selected in Performance view:
- **Summary Cards**: Total clicks, campaigns, active campaigns, channels
- **Line Chart**: 30-day click trend
- **Doughnut Chart**: Clicks by channel distribution
- **Bar Chart**: Today's clicks by hour
- **Campaign List**: Top 10 campaigns ranked by performance (clickable)

#### Campaign-Specific Analytics
When viewing a specific campaign:
- **Summary Cards**: Campaign-specific metrics
- **Line Chart**: Daily click trend for this campaign
- **Doughnut Chart**: Channel distribution
- **Bar Charts**: Clicks by hour and day of week
- **Performance Table**: Placement breakdown with visual progress bars
- **Recent Activity**: Last 20 clicks with timestamp, channel, UTM content, IP

### 3. Chart Rendering (`Chart.js 4.4.0`)
- Responsive charts with proper sizing
- Brand color scheme (Rappn green #3aaa35, blue #18a19a)
- Automatic chart cleanup to prevent memory leaks
- Smooth animations and hover effects

### 4. Data Loading Functions
- `loadOverviewAnalytics()`: Fetches overall performance data
- `loadCampaignAnalytics(campaign_id)`: Fetches campaign-specific data
- `viewCampaignAnalytics(campaign_id)`: Navigation helper
- Auto-loads data when switching to Performance view

### 5. View Management
- Updated `switchView()` to automatically load analytics when entering Performance view
- Destroys charts when leaving to prevent memory leaks
- Shows loading states while fetching data

## User Flows

### Viewing Overall Performance
1. Click "Performance" in sidebar
2. System loads overview analytics from all campaigns
3. Dashboard displays summary cards and charts
4. Click any campaign card to drill down

### Viewing Campaign Performance
1. From dashboard, click "View Analytics" on a campaign
2. OR from campaign detail page, click campaign in overview list
3. System loads campaign-specific analytics
4. Dashboard displays detailed metrics and visualizations

### Navigation
- Performance → Overview (default view when no campaign selected)
- Performance → Campaign Detail (click campaign card)
- Campaign Detail → Overview (click "Back to Overview")

## Technical Details

### Data Sources
- All data fetched from Google Sheets via analytics endpoints
- Real-time aggregation (no caching yet)
- Filters: Last 30 days for overview, all-time for campaigns

### Color Scheme
- Primary: Rappn Green (#3aaa35)
- Secondary: Rappn Blue (#18a19a)
- Charts: Gradient from green to blue
- Channel colors: Green, Blue, Yellow, Orange, Red, Purple

### Performance Optimizations
- Chart destruction on view change (prevents memory leaks)
- Lazy loading: Analytics loaded only when needed
- setTimeout delays for DOM-dependent rendering

## Next Steps (Potential Enhancements)
- [ ] Add date range filters
- [ ] Export analytics to PDF/CSV
- [ ] Real-time updates (polling or websockets)
- [ ] Comparison between campaigns
- [ ] Goal tracking and conversion metrics
- [ ] Geographic heat maps
- [ ] Device and browser analytics
- [ ] A/B testing insights

## Testing Checklist
- [x] Build succeeds without errors
- [x] Code committed and pushed to GitHub
- [ ] Railway deployment successful
- [ ] Overview analytics loads correctly
- [ ] Campaign analytics loads correctly
- [ ] All charts render properly
- [ ] Navigation works between views
- [ ] Charts cleanup on view change
- [ ] Responsive design on mobile
- [ ] Loading states display correctly
- [ ] Empty states handled gracefully

## Deployment
- **Repository**: https://github.com/RappnCH/rappn-campaign-tracker
- **Production URL**: https://rappn-campaign-tracker-production.up.railway.app
- **Auto-deploy**: Enabled via Railway GitHub integration
- **Last Deploy**: Commit `e547e10` - "Add comprehensive performance analytics with Chart.js visualizations"
