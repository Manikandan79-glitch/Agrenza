Write-Host "Starting FarmLink..."
Set-Location -LiteralPath $PSScriptRoot

"ps1 started $(Get-Date -Format o) node=$(node -v 2>&1)" | Set-Content -Encoding utf8 -Path (Join-Path $PSScriptRoot "app\next-error.txt")

Remove-Item Env:PORT -ErrorAction SilentlyContinue
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
$env:NODE_ENV = "development"

$next = Join-Path $PSScriptRoot "node_modules\next\dist\bin\next"
Write-Host "Using $next"
Write-Host "Open Chrome: http://127.0.0.1:3000/auth/admin-login"

& node $next dev . -H 0.0.0.0 -p 3000 *>&1 | Tee-Object -FilePath (Join-Path $PSScriptRoot "app\next-error.txt") -Append
$code = $LASTEXITCODE
Add-Content -Path (Join-Path $PSScriptRoot "app\next-error.txt") -Value "exit $code"
if ($code -ne 0) { exit $code }
