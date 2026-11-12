# install.ps1 - Run this in a separate PowerShell window to install dependencies
# Usage: cd mobile; powershell -ExecutionPolicy Bypass -File install.ps1

Write-Host "PaperTrail Mobile - Dependency Installer" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Configure npm for reliability
npm config set fetch-timeout 300000
npm config set fetch-retry-mintimeout 60000  
npm config set fetch-retry-maxtimeout 300000
npm config set fetch-retries 5

Write-Host "Running npm install..." -ForegroundColor Yellow
Write-Host "(This will take 3-5 minutes on first run)" -ForegroundColor Gray

# Run npm install with output streaming
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "npm"
$psi.Arguments = "install --legacy-peer-deps --no-audit --no-fund"
$psi.WorkingDirectory = $PSScriptRoot
$psi.UseShellExecute = $false
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.CreateNoWindow = $false

$proc = New-Object System.Diagnostics.Process
$proc.StartInfo = $psi

$proc.add_OutputDataReceived({
  param($sender, $e)
  if ($e.Data) { Write-Host $e.Data }
})
$proc.add_ErrorDataReceived({
  param($sender, $e)
  if ($e.Data) { Write-Host $e.Data -ForegroundColor Red }
})

$proc.Start() | Out-Null
$proc.BeginOutputReadLine()
$proc.BeginErrorReadLine()
$proc.WaitForExit(600000)  # 10 minute timeout

if ($proc.ExitCode -eq 0) {
  Write-Host ""
  Write-Host "npm install completed successfully!" -ForegroundColor Green
  
  $count = (Get-ChildItem "node_modules" -Directory).Count
  Write-Host "Installed $count packages" -ForegroundColor Green
  Write-Host ""
  Write-Host "Now run: npx expo start --clear" -ForegroundColor Cyan
} else {
  Write-Host ""
  Write-Host "npm install failed with exit code: $($proc.ExitCode)" -ForegroundColor Red
  Write-Host "Try running manually: npm install --legacy-peer-deps" -ForegroundColor Yellow
}
