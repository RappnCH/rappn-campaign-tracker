/**
 * Rappn Campaign Tracking Script
 * 
 * Add this script to your landing page at https://rappn-landing-page.vercel.app/it
 * Place it right before the closing </body> tag
 * 
 * This will automatically track all visits with UTM parameters
 */

(function() {
  // Extract UTM parameters from the current page URL
  const urlParams = new URLSearchParams(window.location.search);
  
  const trackingData = {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    qr: urlParams.get('qr'),
    page_url: window.location.href,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };

  // Only track if we have UTM parameters (campaign traffic)
  if (trackingData.utm_source || trackingData.utm_campaign) {
    console.log('📊 Tracking campaign visit:', trackingData);
    
    // Send tracking data to your tracking server
    fetch('http://localhost:3000/tracking/page-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
      mode: 'cors'
    })
    .then(response => response.json())
    .then(data => console.log('✅ Visit tracked successfully'))
    .catch(error => console.log('⚠️ Tracking failed:', error));
  }
})();
