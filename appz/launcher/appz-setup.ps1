<#
  Appz Windows Launcher setup  (Appz v11.1)
  ------------------------------------------------------------------
  Registers the appz:// custom URL protocol for the CURRENT USER ONLY (HKCU).
  No administrator rights are required. Nothing is written to HKLM.

  Usage:
    powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-setup.ps1 setup
    powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-setup.ps1 status
    powershell -NoProfile -ExecutionPolicy Bypass -File .\appz-setup.ps1 uninstall

  Optional: force a path instead of auto-detection
    ... -File .\appz-setup.ps1 setup -Cubase "D:\Steinberg\Cubase 12\Cubase12.exe"
    ... -File .\appz-setup.ps1 setup -FLStudio "D:\Image-Line\FL Studio 2026\FL64.exe"

  What setup does:
    1. auto-detects the Cubase and FL Studio executables on this PC
    2. writes %LOCALAPPDATA%\Appz\daw-paths.json   (never committed to git)
    3. copies appz-launcher.ps1 to %LOCALAPPDATA%\Appz\
    4. registers HKCU:\Software\Classes\appz
    5. reads the registry back and dry-runs rec / beat / mix + one invalid mode
       (dry run resolves paths only - no DAW is started)

  uninstall / remove deletes HKCU:\Software\Classes\appz again.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('setup', 'status', 'uninstall', 'remove')]
    [string]$Action = 'setup',

    [string]$Cubase,
    [string]$FLStudio
)

$ErrorActionPreference = 'Stop'

$AppzHome     = Join-Path $env:LOCALAPPDATA 'Appz'
$ConfigPath   = Join-Path $AppzHome 'daw-paths.json'
$TargetScript = Join-Path $AppzHome 'appz-launcher.ps1'
$SourceScript = Join-Path $PSScriptRoot 'appz-launcher.ps1'
$RegRoot      = 'HKCU:\Software\Classes\appz'
$RegCommand   = 'HKCU:\Software\Classes\appz\shell\open\command'

function Say  { param([string]$m) Write-Host "[Appz] $m" }
function Ok   { param([string]$m) Write-Host "  OK   $m" -ForegroundColor Green }
function Warn { param([string]$m) Write-Host "  WARN $m" -ForegroundColor Yellow }
function Bad  { param([string]$m) Write-Host "  FAIL $m" -ForegroundColor Red }

# ---------------------------------------------------------------- detection --
function Get-AppPathExe {
    param([string]$ExeName)
    foreach ($hive in 'HKCU:', 'HKLM:') {
        foreach ($node in 'Software\Microsoft\Windows\CurrentVersion\App Paths',
                          'Software\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths') {
            $key = Join-Path (Join-Path $hive $node) $ExeName
            try {
                $v = (Get-ItemProperty -LiteralPath $key -ErrorAction Stop).'(default)'
                if ($v) {
                    $v = $v.Trim('"')
                    if (Test-Path -LiteralPath $v -PathType Leaf) { return $v }
                }
            } catch { }
        }
    }
    return $null
}

function Get-UninstallLocations {
    param([string]$DisplayNameLike)
    $roots = @(
        'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
        'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
        'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
    )
    Get-ItemProperty -Path $roots -ErrorAction SilentlyContinue |
        Where-Object { $_.DisplayName -like $DisplayNameLike -and $_.InstallLocation } |
        ForEach-Object { $_.InstallLocation } |
        Where-Object { Test-Path -LiteralPath $_ -PathType Container }
}

function Get-BaseDirs {
    @(
        $env:ProgramFiles,
        ${env:ProgramFiles(x86)},
        $env:ProgramW6432,
        'C:\Program Files',
        'C:\Program Files (x86)'
    ) | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Container) } | Select-Object -Unique
}

function Get-VersionScore {
    param([string]$Text)
    $m = [regex]::Matches($Text, '\d+')
    if ($m.Count -eq 0) { return 0 }
    ($m | ForEach-Object { [int]$_.Value } | Measure-Object -Maximum).Maximum
}

function Find-CubaseExe {
    $hit = Get-AppPathExe 'Cubase12.exe'
    if ($hit) { return $hit }

    $dirs = @()
    foreach ($b in Get-BaseDirs) {
        $s = Join-Path $b 'Steinberg'
        if (Test-Path -LiteralPath $s -PathType Container) {
            $dirs += Get-ChildItem -LiteralPath $s -Directory -ErrorAction SilentlyContinue |
                     Where-Object { $_.Name -like 'Cubase*' }
        }
    }
    foreach ($loc in (Get-UninstallLocations 'Cubase*')) {
        $dirs += Get-Item -LiteralPath $loc -ErrorAction SilentlyContinue
    }

    $cands = @()
    foreach ($d in ($dirs | Where-Object { $_ } | Select-Object -Unique)) {
        $cands += Get-ChildItem -LiteralPath $d.FullName -Filter 'Cubase*.exe' -File -ErrorAction SilentlyContinue
    }
    if (-not $cands) { return $null }

    # Cubase 12 is the confirmed target: prefer it, otherwise take the newest found.
    $twelve = $cands | Where-Object { $_.FullName -match '12' }
    if ($twelve) { return ($twelve | Select-Object -First 1).FullName }

    return ($cands | Sort-Object { Get-VersionScore $_.FullName } -Descending | Select-Object -First 1).FullName
}

function Find-FLStudioExe {
    # Never hard-code the FL version: pick the newest installed one.
    $dirs = @()
    foreach ($b in Get-BaseDirs) {
        $s = Join-Path $b 'Image-Line'
        if (Test-Path -LiteralPath $s -PathType Container) {
            $dirs += Get-ChildItem -LiteralPath $s -Directory -ErrorAction SilentlyContinue |
                     Where-Object { $_.Name -like 'FL Studio*' }
        }
        $direct = Get-ChildItem -LiteralPath $b -Directory -ErrorAction SilentlyContinue |
                  Where-Object { $_.Name -like 'FL Studio*' }
        if ($direct) { $dirs += $direct }
    }
    foreach ($loc in (Get-UninstallLocations 'FL Studio*')) {
        $dirs += Get-Item -LiteralPath $loc -ErrorAction SilentlyContinue
    }

    $dirs = $dirs | Where-Object { $_ } | Sort-Object FullName -Unique
    $best = $null; $bestScore = -1

    foreach ($d in ($dirs | Sort-Object { Get-VersionScore $_.Name } -Descending)) {
        foreach ($name in 'FL64.exe', 'FL.exe', 'FL Studio.exe') {
            $p = Join-Path $d.FullName $name
            if (Test-Path -LiteralPath $p -PathType Leaf) {
                $score = Get-VersionScore $d.Name
                if ($score -gt $bestScore) { $best = $p; $bestScore = $score }
                break
            }
        }
    }
    if ($best) { return $best }

    $hit = Get-AppPathExe 'FL64.exe'
    if ($hit) { return $hit }
    return $null
}

# ------------------------------------------------------------------ actions --
function Show-Status {
    Say 'status'
    if (Test-Path -LiteralPath $ConfigPath) {
        Ok "config    $ConfigPath"
        try {
            $c = Get-Content -LiteralPath $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
            foreach ($k in 'cubase', 'flstudio') {
                $v = [string]$c.$k
                if ($v -and (Test-Path -LiteralPath $v -PathType Leaf)) { Ok "$k     $v" }
                else { Bad "$k     missing or not found ($v)" }
            }
        } catch { Bad 'config is not valid JSON' }
    } else { Warn "config    not created yet ($ConfigPath)" }

    if (Test-Path -LiteralPath $TargetScript) { Ok "launcher  $TargetScript" }
    else { Warn "launcher  not installed ($TargetScript)" }

    if (Test-Path -LiteralPath $RegCommand) {
        $cmd = (Get-ItemProperty -LiteralPath $RegCommand).'(default)'
        Ok  "protocol  HKCU:\Software\Classes\appz"
        Say "          $cmd"
    } else { Warn 'protocol  appz:// is NOT registered' }
}

function Invoke-Uninstall {
    Say 'uninstall'
    if (Test-Path -LiteralPath $RegRoot) {
        Remove-Item -LiteralPath $RegRoot -Recurse -Force
        Ok 'removed HKCU:\Software\Classes\appz'
    } else {
        Warn 'appz:// was not registered - nothing to remove'
    }
    Say "kept (delete by hand if you want): $AppzHome"
}

function Invoke-Setup {
    Say 'setup  (HKCU only - no admin rights needed)'

    if (-not (Test-Path -LiteralPath $SourceScript)) {
        Bad "appz-launcher.ps1 not found next to this script ($SourceScript)"
        exit 1
    }

    # 1. detect
    $cubaseExe = if ($Cubase)   { $Cubase }   else { Find-CubaseExe }
    $flExe     = if ($FLStudio) { $FLStudio } else { Find-FLStudioExe }

    if ($cubaseExe -and (Test-Path -LiteralPath $cubaseExe -PathType Leaf)) { Ok "Cubase     $cubaseExe" }
    else { Bad 'Cubase     not found. Re-run with  -Cubase "<full path to Cubase12.exe>"'; $cubaseExe = $null }

    if ($flExe -and (Test-Path -LiteralPath $flExe -PathType Leaf)) { Ok "FL Studio  $flExe" }
    else { Bad 'FL Studio  not found. Re-run with  -FLStudio "<full path to FL64.exe>"'; $flExe = $null }

    if (-not $cubaseExe -and -not $flExe) { Bad 'nothing detected - aborting'; exit 1 }

    # 2. config (stays local, never goes into the repo)
    if (-not (Test-Path -LiteralPath $AppzHome)) { New-Item -ItemType Directory -Path $AppzHome -Force | Out-Null }
    [ordered]@{
        cubase   = $cubaseExe
        flstudio = $flExe
        modes    = [ordered]@{ rec = 'cubase'; beat = 'flstudio'; mix = 'cubase' }
        updated  = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $ConfigPath -Encoding UTF8
    Ok "config     $ConfigPath"

    # 3. launcher copy
    Copy-Item -LiteralPath $SourceScript -Destination $TargetScript -Force
    Ok "launcher   $TargetScript"

    # 4. HKCU protocol
    $psExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
    if (-not (Test-Path -LiteralPath $psExe)) { $psExe = 'powershell.exe' }
    $cmd = '"{0}" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "{1}" "%1"' -f $psExe, $TargetScript

    New-Item -Path $RegCommand -Force | Out-Null
    Set-ItemProperty -LiteralPath $RegRoot    -Name '(default)'   -Value 'URL:Appz Protocol'
    Set-ItemProperty -LiteralPath $RegRoot    -Name 'URL Protocol' -Value ''
    Set-ItemProperty -LiteralPath $RegCommand -Name '(default)'   -Value $cmd

    # 5. readback + dry run
    $back = (Get-ItemProperty -LiteralPath $RegCommand).'(default)'
    if ($back -eq $cmd) { Ok 'protocol   appz:// registered and read back OK' }
    else { Bad "protocol   readback mismatch: $back"; exit 1 }

    Say 'dry run (resolves paths only - no DAW is started)'
    foreach ($u in 'appz://rec', 'appz://beat', 'appz://mix', 'appz://oops') {
        & $psExe -NoProfile -ExecutionPolicy Bypass -File $TargetScript $u -DryRun
    }

    Say 'done. Open https://xxkedy.github.io/keyz/appz/ , tick Windows in DAW LAUNCH, then press REC / BEAT / MIX.'
}

switch ($Action) {
    'setup'     { Invoke-Setup;     Show-Status }
    'status'    { Show-Status }
    'uninstall' { Invoke-Uninstall; Show-Status }
    'remove'    { Invoke-Uninstall; Show-Status }
}
