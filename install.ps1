# SuperInstance Single - Windows Installation Script
# Version: 1.0.0
# Date: 2026-03-14
#
# This script installs SuperInstance Single on Windows systems.
#
# Usage:
#   Set-ExecutionPolicy Bypass -Scope Process -Force
#   iex ((New-Object System.Net.WebClient).DownloadString('https://superinstance.io/install.ps1'))

[CmdletBinding()]
param(
    [string]$InstallDir = "$env:USERPROFILE\.superinstance",
    [string]$Version = "latest",
    [switch]$Force = $false,
    [switch]$SkipGPU = $false
)

# Configuration
$ErrorActionPreference = "Stop"

# Input validation and sanitization
function Test-SafePath {
    param([string]$Path)

    # Resolve to absolute path and validate
    try {
        $resolved = (Resolve-Path $Path -ErrorAction SilentlyContinue).Path
        if (-not $resolved) {
            # Path doesn't exist yet, validate the format
            $resolved = [IO.Path]::GetFullPath($Path)
        }

        # Check for path traversal attempts
        if ($resolved -match '\.\.') {
            Write-Error "Path traversal detected in: $Path"
            return $false
        }

        # Check for invalid characters
        $invalidChars = [IO.Path]::GetInvalidPathChars()
        if ($resolved.IndexOfAny($invalidChars) -ge 0) {
            Write-Error "Invalid characters in path: $Path"
            return $false
        }

        return $true
    } catch {
        Write-Error "Invalid path: $Path"
        return $false
    }
}

function Test-SafeVersion {
    param([string]$Ver)

    # Only allow semantic versions or "latest"
    if ($Ver -eq "latest") {
        return $true
    }

    if ($Ver -match '^v?\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$') {
        return $true
    }

    Write-Error "Invalid version format: $Ver"
    Write-Error "Version must be 'latest' or semantic version (e.g., 1.0.0)"
    return $false
}

function Test-SafeRepo {
    param([string]$Repository)

    # Only allow alphanumeric, dots, hyphens, and forward slashes
    if ($Repository -match '^[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+$') {
        return $true
    }

    Write-Error "Invalid repository format: $Repository"
    Write-Error "Repository must be in format: owner/repo"
    return $false
}

# Validate and sanitize inputs
if (-not (Test-SafePath -Path $InstallDir)) {
    exit 1
}

if (-not (Test-SafeVersion -Ver $Version)) {
    exit 1
}

# Ensure InstallDir is absolute path
$InstallDir = [IO.Path]::GetFullPath($InstallDir)
$Repo = "SuperInstance/superinstance-single"
$Platform = "Windows"
$Arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "386" }

# Rollback state tracking
$RollbackFile = Join-Path $env:TEMP "superinstance_install_rollback.txt"
if (Test-Path $RollbackFile) {
    Remove-Item $RollbackFile -Force
}

$RollbackActions = [System.Collections.Generic.List[string]]::new()

function Register-RollbackAction {
    param([string]$Action)
    $RollbackActions.Add($Action)
    $RollbackActions | Out-File $RollbackFile -Force
}

function Invoke-Rollback {
    Write-Error "Installation failed. Rolling back changes..."

    if (Test-Path $RollbackFile) {
        $actions = Get-Content $RollbackFile
        # Reverse order for rollback
        [Array]::Reverse($actions)

        foreach ($action in $actions) {
            Write-Info "Rolling back: $action"

            switch ($action) {
                "create_install_dir" {
                    if (Test-Path $InstallDir) {
                        Remove-Item $InstallDir -Recurse -Force -ErrorAction SilentlyContinue
                        Write-Info "Removed installation directory"
                    }
                }
                "add_to_path" {
                    # Remove from user PATH
                    try {
                        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
                        $newPath = $currentPath -replace [regex]::Escape("$InstallDir\bin"), ""
                        [Environment]::SetEnvironmentVariable("Path", $newPath.TrimEnd(';'), "User")
                        Write-Info "Removed PATH modifications"
                    } catch {
                        Write-Warning "Failed to remove from PATH"
                    }
                }
                "start_docker" {
                    try {
                        Push-Location $InstallDir
                        docker-compose down -ErrorAction SilentlyContinue
                        Pop-Location
                        Write-Info "Stopped Docker containers"
                    } catch {
                        # Ignore errors during rollback
                    }
                }
            }
        }

        Remove-Item $RollbackFile -Force -ErrorAction SilentlyContinue
    }

    Write-Error "Installation rolled back due to errors"
    exit 1
}

# Set up error handling for rollback
trap {
    Invoke-Rollback
}

# Functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

function Print-Header {
    Write-Host ""
    Write-ColorOutput "==================================================" "Cyan"
    Write-ColorOutput "    SuperInstance Single - Installer             " "Cyan"
    Write-ColorOutput "    The Spreadsheet Moment for AI                 " "Cyan"
    Write-ColorOutput "==================================================" "Cyan"
    Write-Host ""
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."

    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Error "PowerShell 5.0 or higher is required"
        exit 1
    }

    # Check if Docker Desktop is installed
    $dockerInstalled = $false
    try {
        $null = Get-Command docker -ErrorAction Stop
        $dockerInstalled = $true
    } catch {
        Write-Warning "Docker not found. Installing Docker Desktop..."
        Write-Info "Please download and install Docker Desktop from:"
        Write-ColorOutput "https://www.docker.com/products/docker-desktop" "Cyan"
        Write-Info "Then run this script again."
        exit 1
    }

    # Check if Docker is running
    try {
        $null = docker version 2>$null
    } catch {
        Write-Warning "Docker is not running. Please start Docker Desktop and try again."
        exit 1
    }

    # Check if Git is installed
    try {
        $null = Get-Command git -ErrorAction Stop
    } catch {
        Write-Warning "Git not found. Attempting to install..."

        # Check if winget is available
        $wingetAvailable = $false
        try {
            $null = Get-Command winget -ErrorAction Stop
            $wingetAvailable = $true
        } catch {
            # winget not available
        }

        if ($wingetAvailable) {
            Write-Info "Installing Git using winget..."
            try {
                # Execute winget with explicit parameters and error handling
                $wingetProcess = Start-Process -FilePath "winget" -ArgumentList @("install", "--id", "Git.Git", "-e", "--silent", "--accept-source-agreements", "--accept-package-agreements") -Wait -PassThru -NoNewWindow -ErrorAction Stop

                if ($wingetProcess.ExitCode -eq 0) {
                    Write-Success "Git installed successfully"
                } else {
                    Write-Error "winget installation failed with exit code: $($wingetProcess.ExitCode)"
                    Write-Info "Please install Git manually from: https://git-scm.com/download/win"
                    exit 1
                }
            } catch {
                Write-Error "Failed to install Git via winget: $_"
                Write-Info "Please install Git manually from: https://git-scm.com/download/win"
                exit 1
            }
        } else {
            Write-Error "winget not available for installation"
            Write-Info "Please install Git manually from: https://git-scm.com/download/win"
            exit 1
        }

        # Verify installation
        try {
            $null = Get-Command git -ErrorAction Stop
            Write-Success "Git verified"
        } catch {
            Write-Error "Git installation verification failed"
            Write-Info "Please install Git manually from: https://git-scm.com/download/win"
            exit 1
        }
    }

    # Check Python
    try {
        $null = Get-Command python -ErrorAction Stop
    } catch {
        Write-Warning "Python not found. Some features may not work."
    }

    Write-Success "Prerequisites check complete"
}

function Test-GPU {
    Write-Info "Detecting GPU availability..."

    $script:GPUAvailable = $false
    $script:GPUType = "none"

    # Check for NVIDIA GPU
    try {
        $nvidiaSmi = Get-Command nvidia-smi -ErrorAction Stop
        if ($nvidiaSmi) {
            $script:GPUAvailable = $true
            $script:GPUType = "nvidia"
            Write-Success "NVIDIA GPU detected"
        }
    } catch {
        # No NVIDIA GPU
    }

    # Check for AMD GPU
    try {
        # AMD GPU detection would go here
        # For now, we'll skip AMD detection on Windows
    } catch {
        # No AMD GPU
    }

    if (-not $script:GPUAvailable -and -not $SkipGPU) {
        Write-Warning "No GPU detected. Will use CPU-only mode."
        Write-Info "GPU performance is 10-50x faster. Consider installing a GPU if available."
    }

    if ($SkipGPU) {
        Write-Info "GPU detection skipped (CPU-only mode)"
        $script:GPUAvailable = $false
    }
}

function Initialize-InstallDirectory {
    Write-Info "Creating installation directory..."

    if (Test-Path $InstallDir) {
        Write-Warning "Installation directory already exists: $InstallDir"
        if (-not $Force) {
            $response = Read-Host "Continue with existing installation? (Y/N)"
            if ($response -ne "Y" -and $response -ne "y") {
                Write-Info "Installation cancelled"
                exit 0
            }
        }
    } else {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        Write-Success "Created installation directory: $InstallDir"
    }

    # Create subdirectories
    @("bin", "config", "data", "logs") | ForEach-Object {
        $path = Join-Path $InstallDir $_
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
        }
    }
}

function Download-SuperInstance {
    Write-Info "Downloading SuperInstance Single..."

    Push-Location $InstallDir

    try {
        # Get latest version
        if ($Version -eq "latest") {
            $releaseUrl = "https://api.github.com/repos/$Repo/releases/latest"

            # Validate URL format
            if ($releaseUrl -notmatch '^https://api\.github\.com/repos/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+/releases/latest$') {
                Write-Error "Invalid GitHub API URL format"
                exit 1
            }

            # Download with timeout and error handling
            try {
                $release = Invoke-RestMethod -Uri $releaseUrl -TimeoutSec 30 -ErrorAction Stop
            } catch {
                Write-Error "Failed to fetch release information from GitHub: $_"
                Write-Info "Please check your internet connection or specify a version manually"
                exit 1
            }

            # Validate response
            if (-not $release.tag_name) {
                Write-Error "Invalid response from GitHub API"
                exit 1
            }

            $Version = $release.tag_name
            Write-Info "Latest version: $Version"
        }

        # Construct download URL
        $downloadUrl = "https://github.com/$Repo/releases/download/$Version/superinstance-windows-$Arch.zip"

        # Validate download URL format
        if ($downloadUrl -notmatch '^https://github\.com/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+/releases/download/[^/]+/superinstance-windows-[a-zA-Z0-9_\-]+\.zip$') {
            Write-Error "Invalid download URL format"
            exit 1
        }

        $outputFile = Join-Path $InstallDir "superinstance.zip"

        Write-Info "Downloading from: $downloadUrl"

        # Download with timeout and error handling
        try {
            $webClient = New-Object System.Net.WebClient
            $webClient.Headers.Add("User-Agent", "SuperInstance-Installer")
            $webClient.DownloadFile($downloadUrl, $outputFile)
        } catch {
            Write-Error "Failed to download SuperInstance Single: $_"
            Write-Info "Please check the URL or try again with a specific version"
            exit 1
        }

        # Verify download is a valid zip file
        try {
            $zipTest = [System.IO.Compression.ZipFile]::OpenRead($outputFile)
            $zipTest.Dispose()
        } catch {
            Write-Error "Downloaded file is not a valid zip archive"
            Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
            exit 1
        }

        # Extract
        Write-Info "Extracting..."
        try {
            Expand-Archive -Path $outputFile -DestinationPath $InstallDir -Force -ErrorAction Stop
        } catch {
            Write-Error "Failed to extract archive: $_"
            Remove-Item $outputFile -Force -ErrorAction SilentlyContinue
            exit 1
        }

        Remove-Item $outputFile

        Write-Success "Download complete"
    } finally {
        Pop-Location
    }
}

function Initialize-Configuration {
    Write-Info "Setting up configuration..."

    $configFile = Join-Path $InstallDir "config\superinstance.yaml"

    $configContent = @"
# SuperInstance Single Configuration

# Cell Configuration
cells:
  max_cells: 100
  default_memory: "2Gi"
  default_cpu: "1"

# GPU Configuration
gpu:
  enabled: $($script:GPUAvailable.ToString().ToLower())
  type: $($script:GPUType)
  memory: "4Gi"

# VLLM Backend
vllm:
  enabled: true
  model_cache_size: "10Gi"
  max_model_size: "7B"

# Messenger Interface
messenger:
  platform: auto  # auto, discord, telegram, slack
  bot_token: ""

# Pointman Cell
pointman:
  enabled: true
  personality: friendly

# Logging
logging:
  level: info
  file: "$InstallDir\logs\superinstance.log"

# API Server
api:
  enabled: true
  host: "0.0.0.0"
  port: 8080
  tls_enabled: false

# Provenance
provenance:
  enabled: true
  storage: "$InstallDir\data\provenance"

# Rate Metrics
metrics:
  enabled: true
  retention_days: 30
"@

    Set-Content -Path $configFile -Value $configContent

    Write-Success "Configuration created"
}

function Install-CLI {
    Write-Info "Installing CLI..."

    $binDir = Join-Path $InstallDir "bin"
    $cliFile = Join-Path $binDir "superinstance.ps1"

    $cliContent = @'
# SuperInstance CLI

$InstallDir = "$env:USERPROFILE\.superinstance"
$ConfigFile = Join-Path $InstallDir "config\superinstance.yaml"
$DockerComposeFile = Join-Path $InstallDir "docker-compose.yml"

# Load configuration
if (-not (Test-Path $ConfigFile)) {
    Write-Error "Configuration not found. Please run: superinstance init"
    exit 1
}

# Command handler
switch ($args[0]) {
    "start" {
        docker-compose -f $DockerComposeFile up -d
    }
    "stop" {
        docker-compose -f $DockerComposeFile down
    }
    "restart" {
        docker-compose -f $DockerComposeFile restart
    }
    "status" {
        docker-compose -f $DockerComposeFile ps
    }
    "logs" {
        if ($args[1]) {
            docker-compose -f $DockerComposeFile logs -f $args[1]
        } else {
            docker-compose -f $DockerComposeFile logs -f
        }
    }
    "deploy" {
        if (-not $args[1]) {
            Write-Error "Usage: superinstance deploy <model_file>"
            exit 1
        }
        & (Join-Path $InstallDir "bin\deploy-model.ps1") $args[1]
    }
    "list" {
        & (Join-Path $InstallDir "bin\list-cells.ps1")
    }
    "info" {
        if ($args[1]) {
            & (Join-Path $InstallDir "bin\cell-info.ps1") $args[1]
        } else {
            Write-Error "Usage: superinstance info <cell_id>"
            exit 1
        }
    }
    "shell" {
        if (-not $args[1]) {
            Write-Error "Usage: superinstance shell <cell_id>"
            exit 1
        }
        & (Join-Path $InstallDir "bin\cell-shell.ps1") $args[1]
    }
    "monitor" {
        Start-Process "http://localhost:8080"
    }
    "help" {
        @'

SuperInstance Single - The Spreadsheet Moment for AI

Commands:
  start              Start SuperInstance
  stop               Stop SuperInstance
  restart            Restart SuperInstance
  status             Show status
  logs [service]     Show logs
  deploy <model>     Deploy a model
  list               List all cells
  info <cell>        Show cell information
  shell <cell>       Open shell in cell
  monitor            Open monitoring dashboard
  help               Show this help

Examples:
  superinstance start
  superinstance deploy my_model.onnx
  superinstance list
  superinstance info llama-2-7b

For more information: https://superinstance.io/docs
'@
    }
    default {
        Write-Error "Unknown command: $($args[0])"
        Write-Host "Run 'superinstance help' for usage"
        exit 1
    }
}
'@

    Set-Content -Path $cliFile -Value $cliContent

    # Create wrapper batch file
    $batchFile = Join-Path $binDir "superinstance.bat"
    $batchContent = "@powershell -NoProfile -ExecutionPolicy Bypass -File `"$cliFile`" %*"
    Set-Content -Path $batchFile -Value $batchContent

    # Add to PATH
    $envPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($envPath -notlike "*$binDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$envPath;$binDir", "User")
        Write-Info "Added to PATH: $binDir"
        Write-Warning "Please restart your terminal for PATH changes to take effect"
    }

    Write-Success "CLI installed"
}

function New-DockerCompose {
    Write-Info "Creating Docker Compose configuration..."

    $composeFile = Join-Path $InstallDir "docker-compose.yml"

    $composeContent = @"
version: '3.8'

services:
  # Pointman Cell - Management Interface
  pointman:
    image: superinstance/pointman:latest
    container_name: si-pointman
    restart: unless-stopped
    environment:
      - SI_CONFIG=/config/superinstance.yaml
      - SI_MESSENGER_PLATFORM=`${MESSENGER_PLATFORM:-auto}
    volumes:
      - ./config/superinstance.yaml:/config/superinstance.yaml:ro
      - ./data/pointman:/data
    ports:
      - "8080:8080"
    networks:
      - superinstance

  # VLLM Backend - Auto-scaling Inference
  vllm:
    image: superinstance/vllm:latest
    container_name: si-vllm
    restart: unless-stopped
    environment:
      - SI_CONFIG=/config/superinstance.yaml
      - SI_GPU_ENABLED=`${GPU_ENABLED:-true}
      - SI_GPU_MEMORY_RATIO=0.9
    volumes:
      - ./config/superinstance.yaml:/config/superinstance.yaml:ro
      - ./data/models:/models
      - ./data/cache:/cache
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    ports:
      - "8000:8000"
    networks:
      - superinstance

  # Cell Runtime - Worker Cells
  cell-runtime:
    image: superinstance/cell-runtime:latest
    container_name: si-cell-runtime
    restart: unless-stopped
    environment:
      - SI_CONFIG=/config/superinstance.yaml
      - SI_MAX_CELLS=100
    volumes:
      - ./config/superinstance.yaml:/config/superinstance.yaml:ro
      - ./data/cells:/cells
      - ./data/provenance:/provenance
    networks:
      - superinstance

  # Provenance Store - Merkle-DAG Storage
  provenance:
    image: superinstance/provenance:latest
    container_name: si-provenance
    restart: unless-stopped
    environment:
      - SI_CONFIG=/config/superinstance.yaml
    volumes:
      - ./config/superinstance.yaml:/config/superinstance.yaml:ro
      - ./data/provenance:/data
    ports:
      - "9000:9000"
    networks:
      - superinstance

  # Metrics Collector - Rate Metrics (dD/dt, dT/dt, dΦ/dt)
  metrics:
    image: superinstance/metrics:latest
    container_name: si-metrics
    restart: unless-stopped
    environment:
      - SI_CONFIG=/config/superinstance.yaml
      - SI_RETENTION_DAYS=30
    volumes:
      - ./config/superinstance.yaml:/config/superinstance.yaml:ro
      - ./data/metrics:/data
    ports:
      - "9090:9090"
    networks:
      - superinstance

  # Message Bus - Cell Communication
  message-bus:
    image: redis:7-alpine
    container_name: si-message-bus
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - ./data/redis:/data
    networks:
      - superinstance

networks:
  superinstance:
    driver: bridge

volumes:
  models:
  cache:
  cells:
  provenance:
  metrics:
  redis:
"@

    Set-Content -Path $composeFile -Value $composeContent

    Write-Success "Docker Compose configuration created"
}

function Install-PythonDependencies {
    Write-Info "Installing Python dependencies..."

    try {
        $null = Get-Command python -ErrorAction Stop

        # Create virtual environment
        $venvDir = Join-Path $InstallDir "venv"
        python -m venv $venvDir

        # Activate and install
        $activateScript = Join-Path $venvDir "Scripts\Activate.ps1"
        & $activateScript

        # Upgrade pip
        python -m pip install --quiet --upgrade pip

        # Install SuperInstance Python SDK
        python -m pip install --quiet superinstance-sdk

        # Install vLLM
        if ($script:GPUAvailable -and $script:GPUType -eq "nvidia") {
            Write-Info "Installing vLLM with CUDA support..."
            python -m pip install --quiet "vllm[cuda]"
        } else {
            Write-Info "Installing vLLM (CPU mode)..."
            python -m pip install --quiet "vllm[cpu]"
        }

        Write-Success "Python dependencies installed"
    } catch {
        Write-Warning "Python not found. Skipping Python dependencies."
    }
}

function Test-HealthCheck {
    Write-Info "Running health check..."

    Start-Sleep -Seconds 5

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "API is responding"
        }
    } catch {
        Write-Warning "API not yet responding. This is normal on first start."
    }
}

function Show-SuccessMessage {
    @"

╔════════════════════════════════════════════════════════════╗
║          Installation Complete!                            ║
╚════════════════════════════════════════════════════════════╝

SuperInstance Single is now installed on your system!

Next Steps:

1. Restart your terminal (for PATH changes to take effect)

2. Start SuperInstance:
   superinstance start

3. Open the monitoring dashboard:
   superinstance monitor
   (opens http://localhost:8080)

4. Deploy your first model:
   superinstance deploy my_model.onnx

5. Connect your messenger:
   - Discord: Create a bot at https://discord.com/developers/applications
   - Telegram: BotFather: /newbot
   - Add your bot token to: $InstallDir\config\superinstance.yaml

6. Get help:
   superinstance help

Documentation:
https://superinstance.io/docs

Community:
Discord: https://discord.gg/superinstance
GitHub: https://github.com/SuperInstance/superinstance-single

Support:
Email: hello@superinstance.io

Welcome to the Spreadsheet Moment for AI! 🚀

"@
}

# Main installation flow
function Main {
    Print-Header

    if (-not $Force) {
        Write-Host "This will install SuperInstance Single to: $InstallDir"
        $response = Read-Host "Continue? (Y/N)"
        if ($response -ne "Y" -and $response -ne "y") {
            Write-Info "Installation cancelled"
            exit 0
        }
    }

    Test-Prerequisites
    Test-GPU
    Initialize-InstallDirectory
    Download-SuperInstance
    Initialize-Configuration
    Install-CLI
    New-DockerCompose
    Install-PythonDependencies

    Write-Info "Starting SuperInstance..."
    Push-Location $InstallDir
    docker-compose up -d
    Pop-Location

    Test-HealthCheck
    Show-SuccessMessage
}

# Run main function
Main
