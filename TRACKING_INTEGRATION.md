# Landing Page Tracking Integration

To track visits to your landing page at `https://rappn-landing-page.vercel.app/it`, you need to add tracking code to that page.

## Method 1: Tracking Pixel (Recommended)

Add this code to your landing page HTML, right before the closing `</body>` tag:

```html
<script>
  // Extract UTM parameters and QR code from URL
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

  // Only track if UTM parameters are present
  if (trackingData.utm_source || trackingData.utm_campaign) {
    // Send tracking data to your server
    fetch('http://localhost:3000/tracking/page-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
      mode: 'no-cors' // For cross-origin requests
    }).catch(err => console.log('Tracking failed:', err));
  }
</script>
```

## Method 2: Tracking Pixel Image

Add this HTML to your landing page:

```html
<script>
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('utm_source')) {
    const trackingUrl = 'http://localhost:3000/tracking/pixel.gif?' + 
      'utm_source=' + encodeURIComponent(urlParams.get('utm_source') || '') +
      '&utm_medium=' + encodeURIComponent(urlParams.get('utm_medium') || '') +
      '&utm_campaign=' + encodeURIComponent(urlParams.get('utm_campaign') || '') +
      '&utm_content=' + encodeURIComponent(urlParams.get('utm_content') || '') +
      '&qr=' + encodeURIComponent(urlParams.get('qr') || '') +
      '&page_url=' + encodeURIComponent(window.location.href);
    
    const img = new Image(1, 1);
    img.src = trackingUrl;
  }
</script>
```

## For Production

Replace `http://localhost:3000` with your actual tracking server URL when deploying.

## Important Notes

1. The landing page must be able to make requests to your tracking server
2. You may need to enable CORS on your tracking server for cross-domain requests
3. Consider using HTTPS for production
4. The tracking server must be publicly accessible if your landing page is on Vercel

