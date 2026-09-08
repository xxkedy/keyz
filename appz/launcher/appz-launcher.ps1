<#
  Appz Windows Launcher  (Appz v11.1)
  ------------------------------------------------------------------
  appz://rec   -> Cubase
  appz://beat  -> FL Studio
  appz://mix   -> Cubase

  This script only OPENS the DAW application.
  It never opens a project file (.cpr / .flp) and never changes DAW settings.

  Usage (normally called by the appz:// protocol handler):
    powershell -NoProfile -ExecutionPolicy Bypass -File appz-launcher.ps1 "appz://rec"

  Safe test (resolves the path, launches nothing):
    powershell -NoProfile -ExecutionPolicy Bypass -File appz-launcher.ps1 "appz://rec" -DryRun
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Url,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

$AppzHome   = Join-Path $env:LOCALAPPDATA 'Appz'
$ConfigPath = Join-Path $AppzHome 'daw-paths.json'
$LogPath    = Join-Path $AppzHome 'launcher.log'

# mode -> config key. Only these three modes are ever accepted.
$ModeMap = @{
    'rec'  = 'cubase'
    'beat' = 'flstudio'
    'mix'  = 'cubase'
}

function Write-Log {
    param([string]$Message)
    try {
        if (-not (Test-Path -LiteralPath $AppzHome)) {
            New-Item -ItemType Directory -Path $AppzHome -Force | Out-Null
        }
        $line = '{0}  {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
        Add-Content -LiteralPath $LogPath -Value $line -Encoding UTF8
    } catch { }
}

function Fail {
    param([string]$Message, [int]$Code)
    Write-Log ("ERROR  {0}" -f $Message)
    Write-Host "[Appz] $Message" -ForegroundColor Yellow
    exit $Code
}

# ---- 1. parse + validate the url -------------------------------------------
if ([string]::IsNullOrWhiteSpace($Url)) {
    Fail 'No URL given. Expected appz://rec, appz://beat or appz://mix.' 2
}

# strict: scheme + one word + optional single slash. Nothing else is accepted.
$m = [regex]::Match($Url.Trim(), '^appz://([A-Za-z]+)/?$', 'IgnoreCase')
if (-not $m.Success) {
    Fail ("Malformed URL: '{0}'" -f $Url) 2
}

$mode = $m.Groups[1].Value.ToLowerInvariant()

if (-not $ModeMap.ContainsKey($mode)) {
    Fail ("Unknown mode '{0}'. Nothing was launched." -f $mode) 3
}

$dawKey = $ModeMap[$mode]

# ---- 2. load the local config ----------------------------------------------
if (-not (Test-Path -LiteralPath $ConfigPath)) {
    Fail ("Config not found: {0}`n       Run appz-setup.ps1 once to create it." -f $ConfigPath) 4
}

try {
    $raw = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8
    $raw = $raw.TrimStart([char]0xFEFF)   # tolerate a UTF-8 BOM
    $config = $raw | ConvertFrom-Json
} catch {
    Fail ("Config is not valid JSON: {0}" -f $ConfigPath) 4
}

$exe = $null
if ($config.PSObject.Properties.Name -contains $dawKey) {
    $exe = [string]$config.$dawKey
}

if ([string]::IsNullOrWhiteSpace($exe)) {
    Fail ("No executable configured for '{0}' (mode {1})." -f $dawKey, $mode) 5
}

if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) {
    Fail ("Executable not found: {0}" -f $exe) 5
}

# ---- 3. launch (or dry run) -------------------------------------------------
Write-Log ("mode={0} daw={1} exe={2} dryrun={3}" -f $mode, $dawKey, $exe, [bool]$DryRun)

if ($DryRun) {
    Write-Host ("[Appz] DRY RUN  {0} -> {1} -> {2}" -f $mode, $dawKey, $exe) -ForegroundColor Cyan
    exit 0
}

try {
    # No arguments are passed on purpose: open the app only, never a project file.
    Start-Process -FilePath $exe -WorkingDirectory (Split-Path -LiteralPath $exe -Parent) | Out-Null
    Write-Log ("launched {0}" -f $exe)
    exit 0
} catch {
    Fail ("Could not start {0}: {1}" -f $exe, $_.Exception.Message) 6
}
