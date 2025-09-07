## SPDX-License-Identifier: MIT
## SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

# q5m.js Examples Runner (PowerShell Script)
# Run quantum computing examples for Windows

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Header {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "q5m.js Examples Runner" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Footer {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "Examples completed successfully!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Test-NodeInstalled {
    try {
        $null = Get-Command node -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Test-TsxAvailable {
    try {
        $result = npx tsx --version 2>&1
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

function Install-Tsx {
    Write-Host "Installing tsx..." -ForegroundColor Yellow
    try {
        npm install -g tsx
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install tsx"
        }
    }
    catch {
        Write-Host "Error: Failed to install tsx" -ForegroundColor Red
        if ($Host.Name -eq "ConsoleHost" -and [Environment]::UserInteractive) {
            try {
                Write-Host "Press any key to exit..."
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            } catch {}
        }
        exit 1
    }
}

function Run-Examples {
    Write-Host "Running examples..." -ForegroundColor Yellow
    try {
        npx tsx examples/run.ts
        if ($LASTEXITCODE -ne 0) {
            throw "Examples execution failed"
        }
    }
    catch {
        Write-Host "Error: Failed to run examples" -ForegroundColor Red
        if ($Host.Name -eq "ConsoleHost" -and [Environment]::UserInteractive) {
            try {
                Write-Host "Press any key to exit..."
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            } catch {}
        }
        exit 1
    }
}

# Main execution
try {
    Write-Header
    
    # Check if Node.js is installed
    if (-not (Test-NodeInstalled)) {
        Write-Host "Error: Node.js is not installed" -ForegroundColor Red
        Write-Host "Please install Node.js to run the examples" -ForegroundColor Yellow
        if ($Host.Name -eq "ConsoleHost" -and [Environment]::UserInteractive) {
            try {
                Write-Host "Press any key to exit..."
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            } catch {}
        }
        exit 1
    }
    
    # Check if tsx is available
    if (-not (Test-TsxAvailable)) {
        Install-Tsx
    }
    
    # Run the examples
    Run-Examples
    
    Write-Footer
}
catch {
    Write-Host "An unexpected error occurred: $_" -ForegroundColor Red
    if ($Host.Name -eq "ConsoleHost" -and [Environment]::UserInteractive) {
        try {
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        } catch {}
    }
    exit 1
}

# Pause before exit in interactive mode
if ($Host.Name -eq "ConsoleHost" -and [Environment]::UserInteractive) {
    try {
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    catch {
        # Ignore ReadKey errors in non-interactive environments
    }
}
