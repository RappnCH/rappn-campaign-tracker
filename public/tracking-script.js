/**
 * Rappn Campaign Tracking Script
 * 
 * Add this script to your landing page (e.g., https://rappn-landing-page.vercel.app)
 * Place it right before the closing </body> tag
 * 
 * This will automatically track ALL visits (Organic, Direct, and Paid)
 * Updated: 2025-12-03
 */

(function() {
  // CONFIGURATION
  // Change this to your production backend URL
  const TRACKING_API_URL = 'https://rappn-campaign-tracker-production.up.railway.app/tracking/page-view';
  
  // Extract UTM parameters from the current page URL
  const urlParams = new URLSearchParams(window.location.search);
  
  // Helper to get cookie value
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Check if user has consented to analytics (optional, depends on your cookie banner)
  // If you want to track everyone regardless of consent (for basic stats), remove this check
  // or adjust based on your specific consent cookie name
  const hasConsent = getCookie('cookie_consent') === 'accepted' || true; // Defaulting to true for now to ensure tracking works

  if (hasConsent) {
    // Gather tracking data
    const trackingData = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      qr: urlParams.get('qr'),
      page_url: window.location.href,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      // Optional: Client-side gathered location data if you have it
      // country: ..., 
      // city: ...
    };

    console.log('📊 Sending tracking data:', trackingData);
    
    // Send tracking data to your tracking server
    fetch(TRACKING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
      keepalive: true, // Ensures request completes even if page unloads
      mode: 'cors'
    })
    .then(response => {
      if (response.ok) {
        console.log('✅ Visit tracked successfully');
      } else {
        console.warn('⚠️ Tracking server returned error:', response.status);
      }
    })
    .catch(error => console.error('❌ Tracking failed:', error));
  }
})();
