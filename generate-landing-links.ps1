# Generate Landing Page Link Code
# Run this AFTER deploying to Railway/Render

param(
    [Parameter(Mandatory=$true)]
    [string]$TrackerUrl
)

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🔗 LANDING PAGE LINK GENERATOR" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "Tracker URL: $TrackerUrl`n" -ForegroundColor Yellow

# Common landing page links
$links = @(
    @{
        Name = "Hero iOS Button"
        Description = "Main App Store button in hero section"
        Code = "hero_ios"
        FinalUrl = "https://apps.apple.com/app/rappn"
    },
    @{
        Name = "Hero Android Button"
        Description = "Main Play Store button in hero section"
        Code = "hero_android"
        FinalUrl = "https://play.google.com/store/apps/details?id=app.rappn"
    },
    @{
        Name = "Footer iOS Button"
        Description = "App Store button in footer"
        Code = "footer_ios"
        FinalUrl = "https://apps.apple.com/app/rappn"
    },
    @{
        Name = "Footer Android Button"
        Description = "Play Store button in footer"
        Code = "footer_android"
        FinalUrl = "https://play.google.com/store/apps/details?id=app.rappn"
    },
    @{
        Name = "QR Code iOS"
        Description = "QR code pointing to iOS app"
        Code = "qr_ios"
        FinalUrl = "https://apps.apple.com/app/rappn"
    },
    @{
        Name = "QR Code Android"
        Description = "QR code pointing to Android app"
        Code = "qr_android"
        FinalUrl = "https://play.google.com/store/apps/details?id=app.rappn"
    }
)

Write-Host "📋 Suggested Placements:`n" -ForegroundColor Green

$tsxCode = @"
// Copy these into your Next.js landing page components

// Example usage in app/[locale]/page.tsx or components:

"@

foreach ($link in $links) {
    Write-Host "  $($link.Name)" -ForegroundColor Cyan
    Write-Host "  Code: $($link.Code)" -ForegroundColor White
    Write-Host "  Tracked URL: $TrackerUrl/r/$($link.Code)" -ForegroundColor Yellow
    Write-Host "  Final destination: $($link.FinalUrl)`n" -ForegroundColor Gray
    
    $tsxCode += @"

// $($link.Name) - $($link.Description)
<a 
  href="$TrackerUrl/r/$($link.Code)"
  className="..."
>
  Download App
</a>

"@
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  📝 NEXT.JS CODE SNIPPETS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host $tsxCode -ForegroundColor White

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🎯 SETUP IN TRACKER UI" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "1. Open tracker UI: $TrackerUrl" -ForegroundColor White
Write-Host "2. Create a campaign: '2025-11_CH-WEB-LANDING'" -ForegroundColor White
Write-Host "3. For each link above, create a placement with:" -ForegroundColor White
Write-Host "   - Use the suggested code (e.g., 'hero_ios')" -ForegroundColor Gray
Write-Host "   - Set final URL to the destination (App/Play Store)" -ForegroundColor Gray
Write-Host "   - The tracker will generate /r/CODE redirect`n" -ForegroundColor Gray

Write-Host "4. Test each link:" -ForegroundColor White
Write-Host "   → Click the link from your landing page" -ForegroundColor Gray
Write-Host "   → Verify redirect works" -ForegroundColor Gray
Write-Host "   → Check Google Sheets for new row`n" -ForegroundColor Gray

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Save to file
$outputFile = "landing-page-links.txt"
$tsxCode | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✅ Code saved to: $outputFile" -ForegroundColor Green
Write-Host "📋 Copy the code snippets from this file into your Next.js components`n" -ForegroundColor Cyan
