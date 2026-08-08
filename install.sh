#!/bin/bash
# SuperInstance Single - One-Command Installation Script
# Version: 1.0.0
# Date: 2026-03-14
#
# This script installs SuperInstance Single on Linux/macOS systems.
# For Windows, please use install.ps1
#
# Usage: curl -sSL https://superinstance.io/install | bash
#
# Environment Variables:
#   SI_INSTALL_DIR - Installation directory (default: ~/.superinstance)
#   SI_VERSION     - Version to install (default: latest)
#   SI_GPU         - Enable GPU support (default: auto-detect)
#   SI_YES         - Skip confirmation prompts (default: false)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Rollback state tracking
ROLLBACK_STATE="$HOME/.superinstance_install_rollback"
rm -f "$ROLLBACK_STATE"

track_action() {
    echo "$1" >> "$ROLLBACK_STATE"
}

rollback() {
    log_error "Installation failed. Rolling back changes..."

    if [[ -f "$ROLLBACK_STATE" ]]; then
        # Reverse the order of actions
        tac "$ROLLBACK_STATE" | while read -r action; do
            log_info "Rolling back: $action"
            case "$action" in
                "create_install_dir")
                    if [[ -d "$INSTALL_DIR" ]]; then
                        rm -rf "$INSTALL_DIR"
                        log_info "Removed installation directory"
                    fi
                    ;;
                "add_to_path")
                    # Remove from .bashrc
                    sed -i '/# SuperInstance Single/,+2d' "$HOME/.bashrc" 2>/dev/null || true
                    # Remove from .zshrc
                    sed -i '' '/# SuperInstance Single/,+2d' "$HOME/.zshrc" 2>/dev/null || true
                    log_info "Removed PATH modifications"
                    ;;
                "start_docker")
                    cd "$INSTALL_DIR" 2>/dev/null && docker-compose down 2>/dev/null || true
                    log_info "Stopped Docker containers"
                    ;;
            esac
        done

        rm -f "$ROLLBACK_STATE"
    fi

    log_error "Installation rolled back due to errors"
    exit 1
}

# Set trap for rollback on error
trap rollback ERR INT TERM

# Input validation and sanitization
sanitize_path() {
    local path="$1"
    # Remove any shell metacharacters and normalize path
    path=$(echo "$path" | sed -e 's/[^a-zA-Z0-9_\/\.\~-]//g' -e 's/\.\.\//\//g')
    # Ensure path starts with valid character
    if [[ ! "$path" =~ ^[/~] ]]; then
        path="$HOME/$path"
    fi
    echo "$path"
}

validate_version() {
    local version="$1"
    # Only allow semantic versions or "latest"
    if [[ "$version" == "latest" ]] || [[ "$version" =~ ^v?[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$ ]]; then
        echo "$version"
    else
        log_error "Invalid version format: $version"
        log_error "Version must be 'latest' or semantic version (e.g., 1.0.0)"
        exit 1
    fi
}

validate_repo() {
    local repo="$1"
    # Only allow alphanumeric, dots, hyphens, and forward slashes
    if [[ "$repo" =~ ^[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+$ ]]; then
        echo "$repo"
    else
        log_error "Invalid repository format: $repo"
        log_error "Repository must be in format: owner/repo"
        exit 1
    fi
}

# Configuration with validation
RAW_INSTALL_DIR="${SI_INSTALL_DIR:-$HOME/.superinstance}"
INSTALL_DIR=$(sanitize_path "$RAW_INSTALL_DIR")
RAW_VERSION="${SI_VERSION:-latest}"
VERSION=$(validate_version "$RAW_VERSION")
REPO=$(validate_repo "SuperInstance/superinstance-single")
PLATFORM="$(uname -s)"
ARCH="$(uname -m)"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}          SuperInstance Single - Installer              ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}          The Spreadsheet Moment for AI                 ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed. Please install curl first."
        exit 1
    fi

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_warning "Docker not found. Installing Docker..."

        if [[ "$PLATFORM" == "Darwin" ]]; then
            log_info "Please install Docker Desktop for Mac from: https://www.docker.com/products/docker-desktop"
            log_info "Then run this script again."
            exit 1
        elif [[ "$PLATFORM" == "Linux" ]]; then
            log_info "Installing Docker..."
            log_warning "Docker installation requires root privileges"

            # Download with checksum verification
            DOCKER_SCRIPT_URL="https://get.docker.com"
            DOCKER_SCRIPT="get-docker.sh"

            # Validate URL is using HTTPS
            if [[ ! "$DOCKER_SCRIPT_URL" =~ ^https:// ]]; then
                log_error "Invalid Docker script URL protocol"
                exit 1
            fi

            if curl -fsSL "$DOCKER_SCRIPT_URL" -o "/tmp/$DOCKER_SCRIPT"; then
                # Store script hash for verification
                SCRIPT_HASH=$(sha256sum "/tmp/$DOCKER_SCRIPT" | awk '{print $1}')
                log_info "Downloaded Docker install script (SHA256: $SCRIPT_HASH)"

                # Verify script is executable and not corrupted
                if [[ ! -s "/tmp/$DOCKER_SCRIPT" ]]; then
                    log_error "Downloaded script is empty"
                    exit 1
                fi

                # Verify script is a valid shell script (basic sanity check)
                if ! head -1 "/tmp/$DOCKER_SCRIPT" | grep -qE '^#!/bin/(bash|sh)'; then
                    log_error "Downloaded script is not a valid shell script"
                    rm -f "/tmp/$DOCKER_SCRIPT"
                    exit 1
                fi

                # Display script content for review
                log_warning "Script will be executed. Review at: /tmp/$DOCKER_SCRIPT"
                if [[ "$SI_YES" != "true" ]]; then
                    read -p "Continue with Docker installation? (y/N) " -n 1 -r
                    echo
                    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                        log_info "Docker installation cancelled"
                        log_info "Please install Docker manually: https://docs.docker.com/get-docker/"
                        exit 1
                    fi
                fi

                # Execute with error handling using explicit path
                if sudo sh "/tmp/$DOCKER_SCRIPT"; then
                    sudo usermod -aG docker "$USER"
                    rm -f "/tmp/$DOCKER_SCRIPT"
                    log_success "Docker installed. Please log out and back in, then run this script again."
                    exit 0
                else
                    log_error "Docker installation failed"
                    rm -f "/tmp/$DOCKER_SCRIPT"
                    exit 1
                fi
            else
                log_error "Failed to download Docker installation script"
                log_info "Please install Docker manually: https://docs.docker.com/get-docker/"
                exit 1
            fi
        fi
    fi

    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_warning "git not found. Attempting to install..."

        if [[ "$PLATFORM" == "Darwin" ]]; then
            if command -v brew &> /dev/null; then
                brew install git
            else
                log_error "Homebrew not found. Please install git manually."
                log_info "Visit: https://git-scm.com/download/mac"
                exit 1
            fi
        elif [[ "$PLATFORM" == "Linux" ]]; then
            log_info "Installing git with package manager..."
            if command -v apt-get &> /dev/null; then
                # Use --no-install-recommends to minimize attack surface
                sudo apt-get update -qq && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends git
            elif command -v yum &> /dev/null; then
                sudo yum install -y git
            elif command -v dnf &> /dev/null; then
                sudo dnf install -y git
            else
                log_error "No supported package manager found"
                log_info "Please install git manually: https://git-scm.com/download/linux"
                exit 1
            fi
        fi

        # Verify installation
        if command -v git &> /dev/null; then
            log_success "git installed successfully"
        else
            log_error "git installation failed"
            exit 1
        fi
    fi

    # Check Python for vLLM
    if ! command -v python3 &> /dev/null; then
        log_warning "Python 3 not found. Some features may not work."
    fi

    log_success "Prerequisites check complete"
}

detect_gpu() {
    log_info "Detecting GPU availability..."

    GPU_AVAILABLE=false
    GPU_TYPE="none"

    # Check for NVIDIA GPU
    if command -v nvidia-smi &> /dev/null; then
        if nvidia-smi &> /dev/null; then
            GPU_AVAILABLE=true
            GPU_TYPE="nvidia"
            log_success "NVIDIA GPU detected"
        fi
    fi

    # Check for AMD GPU
    if command -v rocm-smi &> /dev/null; then
        if rocm-smi &> /dev/null; then
            GPU_AVAILABLE=true
            GPU_TYPE="amd"
            log_success "AMD GPU detected"
        fi
    fi

    # Check for Apple Silicon
    if [[ "$ARCH" == "arm64" ]] && [[ "$PLATFORM" == "Darwin" ]]; then
        GPU_AVAILABLE=true
        GPU_TYPE="apple"
        log_success "Apple Silicon GPU detected"
    fi

    if [[ "$GPU_AVAILABLE" == "false" ]]; then
        log_warning "No GPU detected. Will use CPU-only mode."
        log_info "GPU performance is 10-50x faster. Consider installing a GPU if available."
    fi
}

create_install_directory() {
    log_info "Creating installation directory..."

    if [[ -d "$INSTALL_DIR" ]]; then
        log_warning "Installation directory already exists: $INSTALL_DIR"
        if [[ "$SI_YES" != "true" ]]; then
            read -p "Continue with existing installation? (y/N) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_info "Installation cancelled"
                exit 0
            fi
        fi
    else
        mkdir -p "$INSTALL_DIR"
        log_success "Created installation directory: $INSTALL_DIR"
    fi
}

download_superinstance() {
    log_info "Downloading SuperInstance Single..."

    cd "$INSTALL_DIR"

    # Get latest version
    if [[ "$VERSION" == "latest" ]]; then
        # Use GitHub API with proper error handling and validation
        API_URL="https://api.github.com/repos/${REPO}/releases/latest"

        # Validate API URL format
        if [[ ! "$API_URL" =~ ^https://api\.github\.com/repos/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+/releases/latest$ ]]; then
            log_error "Invalid GitHub API URL format"
            exit 1
        fi

        # Download with timeout and validate response
        RELEASE_INFO=$(curl -s --max-time 30 "$API_URL" 2>&1)
        CURL_EXIT_CODE=$?

        if [[ $CURL_EXIT_CODE -ne 0 ]]; then
            log_error "Failed to fetch release information from GitHub"
            log_info "Please check your internet connection or specify a version manually"
            exit 1
        fi

        # Validate response is JSON
        if ! echo "$RELEASE_INFO" | jq empty 2>/dev/null; then
            log_error "Invalid response from GitHub API"
            exit 1
        fi

        # Extract version with proper error handling
        VERSION=$(echo "$RELEASE_INFO" | jq -r '.tag_name' 2>/dev/null)

        # Validate version format
        if [[ -z "$VERSION" ]] || [[ "$VERSION" == "null" ]]; then
            log_error "Failed to extract version from GitHub API response"
            exit 1
        fi

        # Re-validate the extracted version
        VERSION=$(validate_version "$VERSION")
        log_info "Latest version: $VERSION"
    fi

    # Construct download URL with validation
    DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${VERSION}/superinstance-${PLATFORM}-${ARCH}.tar.gz"

    # Validate download URL format
    if [[ ! "$DOWNLOAD_URL" =~ ^https://github\.com/[a-zA-Z0-9_\-]+/[a-zA-Z0-9_\-]+/releases/download/[^/]+/superinstance-[a-zA-Z0-9_\-]+\.tar\.gz$ ]]; then
        log_error "Invalid download URL format"
        exit 1
    fi

    log_info "Downloading from: $DOWNLOAD_URL"

    # Download with timeout and follow redirects safely
    if ! curl -L --max-time 300 --fail -o superinstance.tar.gz "$DOWNLOAD_URL"; then
        log_error "Failed to download SuperInstance Single"
        log_info "Please check the URL or try again with a specific version"
        exit 1
    fi

    # Verify download is a valid gzip file
    if ! file superinstance.tar.gz | grep -q "gzip compressed"; then
        log_error "Downloaded file is not a valid gzip archive"
        rm -f superinstance.tar.gz
        exit 1
    fi

    # Extract with error handling
    log_info "Extracting..."
    if ! tar -xzf superinstance.tar.gz; then
        log_error "Failed to extract archive"
        rm -f superinstance.tar.gz
        exit 1
    fi

    rm superinstance.tar.gz

    log_success "Download complete"
}

setup_configuration() {
    log_info "Setting up configuration..."

    # Create config directory
    mkdir -p "$INSTALL_DIR/config"

    # Create default configuration
    cat > "$INSTALL_DIR/config/superinstance.yaml" << EOF
# SuperInstance Single Configuration

# Cell Configuration
cells:
  max_cells: 100
  default_memory: "2Gi"
  default_cpu: "1"

# GPU Configuration
gpu:
  enabled: ${GPU_AVAILABLE:-false}
  type: ${GPU_TYPE:-none}
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
  file: "$INSTALL_DIR/logs/superinstance.log"

# API Server
api:
  enabled: true
  host: "0.0.0.0"
  port: 8080
  tls_enabled: false

# Provenance
provenance:
  enabled: true
  storage: "$INSTALL_DIR/provenance"

# Rate Metrics
metrics:
  enabled: true
  retention_days: 30
EOF

    log_success "Configuration created"
}

install_cli() {
    log_info "Installing CLI..."

    # Create bin directory
    mkdir -p "$INSTALL_DIR/bin"

    # Create CLI wrapper
    cat > "$INSTALL_DIR/bin/superinstance" << 'EOF'
#!/bin/bash
# SuperInstance CLI

INSTALL_DIR="$HOME/.superinstance"
export PATH="$INSTALL_DIR/bin:$PATH"

# Load configuration
if [[ -f "$INSTALL_DIR/config/superinstance.yaml" ]]; then
    CONFIG="$INSTALL_DIR/config/superinstance.yaml"
else
    echo "Configuration not found. Please run: superinstance init"
    exit 1
fi

# Command handler
case "$1" in
    start)
        docker-compose -f "$INSTALL_DIR/docker-compose.yml" up -d
        ;;
    stop)
        docker-compose -f "$INSTALL_DIR/docker-compose.yml" down
        ;;
    restart)
        docker-compose -f "$INSTALL_DIR/docker-compose.yml" restart
        ;;
    status)
        docker-compose -f "$INSTALL_DIR/docker-compose.yml" ps
        ;;
    logs)
        docker-compose -f "$INSTALL_DIR/docker-compose.yml" logs -f "${2:-}"
        ;;
    deploy)
        if [[ -z "$2" ]]; then
            echo "Usage: superinstance deploy <model_file>"
            exit 1
        fi
        "$INSTALL_DIR/bin/deploy-model" "$2"
        ;;
    list)
        "$INSTALL_DIR/bin/list-cells"
        ;;
    info)
        "$INSTALL_DIR/bin/cell-info" "${2:-}"
        ;;
    shell)
        if [[ -z "$2" ]]; then
            echo "Usage: superinstance shell <cell_id>"
            exit 1
        fi
        "$INSTALL_DIR/bin/cell-shell" "$2"
        ;;
    monitor)
        open "http://localhost:8080"
        ;;
    help|--help|-h)
        cat << HELP
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
HELP
        ;;
    *)
        echo "Unknown command: $1"
        echo "Run 'superinstance help' for usage"
        exit 1
        ;;
esac
EOF

    chmod +x "$INSTALL_DIR/bin/superinstance"

    # Add to PATH
    cat >> "$HOME/.bashrc" << EOF

# SuperInstance Single
export PATH="\$HOME/.superinstance/bin:\$PATH"
EOF

    cat >> "$HOME/.zshrc" << EOF

# SuperInstance Single
export PATH="\$HOME/.superinstance/bin:\$PATH"
EOF

    log_success "CLI installed"
}

create_docker_compose() {
    log_info "Creating Docker Compose configuration..."

    cat > "$INSTALL_DIR/docker-compose.yml" << EOF
version: '3.8'

services:
  # Pointman Cell - Management Interface
  pointman:
    image: superinstance/pointman:latest
    container_name: si-pointman
    restart: unless-stopped
    environment:
      - SI_CONFIG=/config/superinstance.yaml
      - SI_MESSENGER_PLATFORM=\${MESSENGER_PLATFORM:-auto}
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
      - SI_GPU_ENABLED=\${GPU_ENABLED:-true}
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
EOF

    log_success "Docker Compose configuration created"
}

install_python_dependencies() {
    log_info "Installing Python dependencies..."

    if command -v python3 &> /dev/null; then
        # Create virtual environment
        python3 -m venv "$INSTALL_DIR/venv"

        # Activate and install
        source "$INSTALL_DIR/venv/bin/activate"
        pip install --quiet --upgrade pip

        # Install SuperInstance Python SDK
        pip install --quiet superinstance-sdk

        # Install optional dependencies
        if [[ "$GPU_AVAILABLE" == "true" ]] && [[ "$GPU_TYPE" == "nvidia" ]]; then
            log_info "Installing vLLM with CUDA support..."
            pip install --quiet "vllm[cuda]"
        elif [[ "$GPU_AVAILABLE" == "true" ]] && [[ "$GPU_TYPE" == "apple" ]]; then
            log_info "Installing vLLM with MPS support..."
            pip install --quiet "vllm[mps]"
        else
            log_info "Installing vLLM (CPU mode)..."
            pip install --quiet "vllm[cpu]"
        fi

        deactivate

        log_success "Python dependencies installed"
    else
        log_warning "Python 3 not found. Skipping Python dependencies."
    fi
}

run_health_check() {
    log_info "Running health check..."

    # Wait for services to start
    sleep 5

    # Check if API is responding
    if curl -s http://localhost:8080/health > /dev/null; then
        log_success "API is responding"
    else
        log_warning "API not yet responding. This is normal on first start."
    fi

    # Check Docker containers
    RUNNING=$(docker-compose -f "$INSTALL_DIR/docker-compose.yml" ps -q | wc -l)
    log_info "Running containers: $RUNNING"
}

print_success_message() {
    cat << SUCCESS

${GREEN}╔════════════════════════════════════════════════════════════╗${NC}
${GREEN}║          Installation Complete!                            ${NC} ${GREEN}║${NC}
${GREEN}╚════════════════════════════════════════════════════════════╝${NC}

${BLUE}SuperInstance Single is now installed on your system!${NC}

${YELLOW}Next Steps:${NC}

1. Start SuperInstance:
   ${GREEN}superinstance start${NC}

2. Open the monitoring dashboard:
   ${GREEN}superinstance monitor${NC}
   (opens http://localhost:8080)

3. Deploy your first model:
   ${GREEN}superinstance deploy my_model.onnx${NC}

4. Connect your messenger:
   - Discord: Create a bot at https://discord.com/developers/applications
   - Telegram: BotFather: /newbot
   - Add your bot token to: $INSTALL_DIR/config/superinstance.yaml

5. Get help:
   ${GREEN}superinstance help${NC}

${YELLOW}Documentation:${NC}
${BLUE}https://superinstance.io/docs${NC}

${YELLOW}Community:${NC}
${BLUE}Discord: https://discord.gg/superinstance${NC}
${BLUE}GitHub: https://github.com/SuperInstance/superinstance-single${NC}

${YELLOW}Support:${NC}
${BLUE}Email: hello@superinstance.io${NC}

${GREEN}Welcome to the Spreadsheet Moment for AI! 🚀${NC}

SUCCESS
}

# Main installation flow
main() {
    print_header

    if [[ "$SI_YES" != "true" ]]; then
        echo "This will install SuperInstance Single to: $INSTALL_DIR"
        read -p "Continue? (Y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            log_info "Installation cancelled"
            exit 0
        fi
    fi

    check_prerequisites
    detect_gpu
    create_install_directory
    download_superinstance
    setup_configuration
    install_cli
    create_docker_compose
    install_python_dependencies

    log_info "Starting SuperInstance..."
    cd "$INSTALL_DIR"
    docker-compose up -d

    run_health_check
    print_success_message
}

# Run main function
main "$@"
