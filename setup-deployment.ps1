# Quick Deployment Setup Script
# Run this to prepare for Railway/Render deployment

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  🚀 RAPPN TRACKER DEPLOYMENT SETUP" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Step 1: Check if git is initialized
Write-Host "Step 1: Checking Git repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "✅ Git repo already exists`n" -ForegroundColor Green
} else {
    Write-Host "⚙️  Initializing Git repository..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Git initialized`n" -ForegroundColor Green
}

# Step 2: Stage all files
Write-Host "Step 2: Staging files for commit..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files staged`n" -ForegroundColor Green

# Step 3: Create initial commit
Write-Host "Step 3: Creating initial commit..." -ForegroundColor Yellow
$commitExists = git log --oneline 2>$null
if (-not $commitExists) {
    git commit -m "Initial commit: Rappn Campaign Tracker"
    Write-Host "✅ Initial commit created`n" -ForegroundColor Green
} else {
    Write-Host "✅ Commits already exist`n" -ForegroundColor Green
}

# Step 4: Instructions for GitHub
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  📋 NEXT STEPS (Manual)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "1. Create GitHub Repository:" -ForegroundColor Green
Write-Host "   → Go to: https://github.com/new" -ForegroundColor White
Write-Host "   → Name: rappn-campaign-tracker" -ForegroundColor White
Write-Host "   → Keep it private or public (your choice)" -ForegroundColor White
Write-Host "   → DO NOT add README, .gitignore, or license`n" -ForegroundColor White

Write-Host "2. Push to GitHub:" -ForegroundColor Green
Write-Host "   Copy/paste these commands after creating the repo:`n" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/rappn-campaign-tracker.git" -ForegroundColor Cyan
Write-Host "   git branch -M main" -ForegroundColor Cyan
Write-Host "   git push -u origin main`n" -ForegroundColor Cyan

Write-Host "3. Deploy to Railway (Recommended):" -ForegroundColor Green
Write-Host "   → Go to: https://railway.app" -ForegroundColor White
Write-Host "   → Click 'Start a New Project'" -ForegroundColor White
Write-Host "   → Select 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "   → Choose your rappn-campaign-tracker repo" -ForegroundColor White
Write-Host "   → Add environment variables (see DEPLOYMENT.md)`n" -ForegroundColor White

Write-Host "4. Get your public URL:" -ForegroundColor Green
Write-Host "   → Railway will show a URL like: https://rappn-tracker.up.railway.app" -ForegroundColor White
Write-Host "   → Copy this URL`n" -ForegroundColor White

Write-Host "5. Update TRACKING_BASE_URL:" -ForegroundColor Green
Write-Host "   → In Railway dashboard → Variables" -ForegroundColor White
Write-Host "   → Set TRACKING_BASE_URL to your Railway URL`n" -ForegroundColor White

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  ✅ Git setup complete!" -ForegroundColor Green
Write-Host "  📖 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
