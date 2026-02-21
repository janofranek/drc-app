$ErrorActionPreference = "Stop"

Write-Host "Starting DRC App Production Deployment..." -ForegroundColor Cyan

# 1. Swap in the production Firebase credentials
Write-Host "[1/3] Copying production Firebase credentials..." -ForegroundColor Yellow
if (Test-Path "src\cred\firebase-prod.js") {
  Copy-Item "src\cred\firebase-prod.js" "src\cred\firebase.js" -Force
  Write-Host "[OK] Production credentials swapped successfully." -ForegroundColor Green
}
else {
  Write-Host "[ERROR] Cannot find src\cred\firebase-prod.js!" -ForegroundColor Red
  exit 1
}

# 2. Build the Vite project
Write-Host "[2/3] Building production bundle with Vite..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Build failed!" -ForegroundColor Red
  exit 1
}
Write-Host "[OK] Build completed successfully." -ForegroundColor Green


# 3. Deploy to Google Cloud App Engine
Write-Host "[3/3] Deploying to Google App Engine..." -ForegroundColor Yellow
# Using --quiet to skip the interactive confirmation prompt. Remove it if you want the prompt back.
gcloud app deploy --quiet
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERROR] Deployment failed!" -ForegroundColor Red
  exit 1
}

Write-Host "[DONE] Deployment finished successfully!" -ForegroundColor Green
