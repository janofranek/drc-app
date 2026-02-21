$ErrorActionPreference = "Stop"

Write-Host "Preparing Local Testing Environment..." -ForegroundColor Cyan

# 1. Swap in the test Firebase credentials
Write-Host "[1/2] Copying test Firebase credentials..." -ForegroundColor Yellow
if (Test-Path "src\cred\firebase-test.js") {
  Copy-Item "src\cred\firebase-test.js" "src\cred\firebase.js" -Force
  Write-Host "[OK] Test credentials swapped successfully." -ForegroundColor Green
}
else {
  Write-Host "[ERROR] Cannot find src\cred\firebase-test.js!" -ForegroundColor Red
  exit 1
}

# 2. Run the local server
Write-Host "[2/2] Starting Vite development server..." -ForegroundColor Yellow
npm run local
