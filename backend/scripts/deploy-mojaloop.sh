#!/bin/bash

# Mojaloop Deployment Script for "Payments Without Borders"
# This script deploys Mojaloop using Helm charts on your local Kubernetes cluster

set -e

# Configuration
NAMESPACE="mojaloop"
RELEASE_NAME="payments-mojaloop"
CHART_VERSION="15.0.0"  # Use latest stable version
TIMEOUT="600s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check if helm is available
    if ! command -v helm &> /dev/null; then
        error "Helm is not installed or not in PATH"
        exit 1
    fi
    
    # Check if Kubernetes cluster is accessible
    if ! kubectl cluster-info &> /dev/null; then
        error "Kubernetes cluster is not accessible"
        exit 1
    fi
    
    # Check available resources
    AVAILABLE_MEMORY=$(kubectl top nodes --no-headers | awk '{sum += $3} END {print sum}' | sed 's/Mi//')
    if [ "${AVAILABLE_MEMORY:-0}" -lt 4000 ]; then
        warning "Available memory might be insufficient (recommended: 8GB+)"
    fi
    
    success "Prerequisites check passed"
}

# Add Helm repositories
add_helm_repos() {
    log "Adding Helm repositories..."
    
    helm repo add mojaloop http://mojaloop.io/helm/repo/
    helm repo add incubator https://charts.helm.sh/incubator
    helm repo add stable https://charts.helm.sh/stable
    helm repo add kiwigrid https://kiwigrid.github.io/helm-charts/
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    success "Helm repositories added and updated"
}

# Create namespace
create_namespace() {
    log "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        warning "Namespace $NAMESPACE already exists"
    else
        kubectl create namespace $NAMESPACE
        success "Namespace $NAMESPACE created"
    fi
}

# Deploy Mojaloop
deploy_mojaloop() {
    log "Deploying Mojaloop..."
    
    # Create custom values file
    cat > mojaloop-values.yaml << EOF
global:
  config:
    hub_name: "PaymentsWithoutBorders"
    currency: "USD"
    log_level: "info"
    central_ledger_admin_uri_prefix: "http://central-ledger:3001"
    central_ledger_admin_host: "central-ledger"
    central_ledger_admin_port: 3001

# Central Ledger Configuration
central-ledger:
  enabled: true
  replicaCount: 1
  image:
    repository: mojaloop/central-ledger
    tag: latest
  service:
    type: ClusterIP
    port: 3001
  config:
    db_type: mysql
    db_driver: mysql
    db_host: mysql
    db_port: 3306
    db_user: central_ledger
    db_password: password
    db_database: central_ledger

# ML API Adapter
ml-api-adapter:
  enabled: true
  replicaCount: 1
  image:
    repository: mojaloop/ml-api-adapter
    tag: latest
  service:
    type: ClusterIP
    port: 3000

# Account Lookup Service
account-lookup-service:
  enabled: true
  replicaCount: 1
  image:
    repository: mojaloop/account-lookup-service
    tag: latest
  service:
    type: ClusterIP
    port: 4001

# Quoting Service
quoting-service:
  enabled: true
  replicaCount: 1
  image:
    repository: mojaloop/quoting-service
    tag: latest
  service:
    type: ClusterIP
    port: 3002

# Central Settlement
central-settlement:
  enabled: true
  replicaCount: 1
  image:
    repository: mojaloop/central-settlement
    tag: latest

# Mojaloop Simulator
mojaloop-simulator:
  enabled: true
  replicaCount: 2
  image:
    repository: mojaloop/simulator
    tag: latest
  service:
    type: ClusterIP
    port: 3000
  config:
    schemeId: "paymentswithoutborders"

# MySQL Database
mysql:
  enabled: true
  mysqlRootPassword: "password"
  mysqlUser: "central_ledger"
  mysqlPassword: "password"
  mysqlDatabase: "central_ledger"
  persistence:
    enabled: true
    size: 8Gi

# Kafka (for event streaming)
kafka:
  enabled: true
  replicas: 1
  persistence:
    enabled: true
    size: 8Gi

# Monitoring (optional)
monitoring:
  enabled: false
EOF
    
    # Deploy Mojaloop
    if helm list -n $NAMESPACE | grep -q $RELEASE_NAME; then
        log "Upgrading existing Mojaloop deployment..."
        helm upgrade $RELEASE_NAME mojaloop/mojaloop \
            --namespace $NAMESPACE \
            --values mojaloop-values.yaml \
            --timeout $TIMEOUT
    else
        log "Installing new Mojaloop deployment..."
        helm install $RELEASE_NAME mojaloop/mojaloop \
            --namespace $NAMESPACE \
            --values mojaloop-values.yaml \
            --timeout $TIMEOUT \
            --create-namespace
    fi
    
    success "Mojaloop deployment completed"
}

# Wait for pods to be ready
wait_for_pods() {
    log "Waiting for pods to be ready..."
    
    # Wait for all pods to be running
    kubectl wait --for=condition=Ready pods --all -n $NAMESPACE --timeout=600s
    
    success "All pods are ready"
}

# Setup port forwarding
setup_port_forwarding() {
    log "Setting up port forwarding..."
    
    # Kill existing port forwards
    pkill -f "kubectl port-forward" || true
    
    # Central Ledger
    kubectl port-forward service/central-ledger 3001:3001 -n $NAMESPACE &
    
    # ML API Adapter
    kubectl port-forward service/ml-api-adapter 3000:3000 -n $NAMESPACE &
    
    # Account Lookup Service
    kubectl port-forward service/account-lookup-service 4001:4001 -n $NAMESPACE &
    
    # Quoting Service
    kubectl port-forward service/quoting-service 3002:3002 -n $NAMESPACE &
    
    # Mojaloop Simulator
    kubectl port-forward service/mojaloop-simulator 8444:3000 -n $NAMESPACE &
    
    sleep 5
    success "Port forwarding setup completed"
}

# Register DFSPs
register_dfsps() {
    log "Registering DFSPs..."
    
    # Wait for central ledger to be ready
    sleep 30
    
    # Register DFSP for USD
    curl -X POST http://localhost:3001/participants \
        -H "Content-Type: application/json" \
        -H "FSPIOP-Source: paymentswithoutborders" \
        -d '{
            "name": "dfsp-usd",
            "currency": "USD",
            "isActive": true
        }' || warning "Failed to register dfsp-usd (might already exist)"
    
    # Register DFSP for EUR
    curl -X POST http://localhost:3001/participants \
        -H "Content-Type: application/json" \
        -H "FSPIOP-Source: paymentswithoutborders" \
        -d '{
            "name": "dfsp-eur",
            "currency": "EUR",
            "isActive": true
        }' || warning "Failed to register dfsp-eur (might already exist)"
    
    # Register DFSP for NGN
    curl -X POST http://localhost:3001/participants \
        -H "Content-Type: application/json" \
        -H "FSPIOP-Source: paymentswithoutborders" \
        -d '{
            "name": "dfsp-ngn",
            "currency": "NGN",
            "isActive": true
        }' || warning "Failed to register dfsp-ngn (might already exist)"
    
    success "DFSPs registration completed"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    services=(
        "central-ledger:3001/health"
        "ml-api-adapter:3000/health"
        "account-lookup-service:4001/health"
        "quoting-service:3002/health"
        "mojaloop-simulator:8444/health"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r name endpoint <<< "$service"
        echo -n "Checking $name... "
        
        if curl -s "http://localhost:$endpoint" > /dev/null 2>&1; then
            success "OK"
        else
            warning "FAILED (service might still be starting)"
        fi
    done
}

# Display status
display_status() {
    log "Deployment Status:"
    echo ""
    echo "📊 Pods:"
    kubectl get pods -n $NAMESPACE
    echo ""
    echo "🌐 Services:"
    kubectl get services -n $NAMESPACE
    echo ""
    echo "🔗 Endpoints:"
    echo "  • Central Ledger: http://localhost:3001"
    echo "  • ML API Adapter: http://localhost:3000"
    echo "  • Account Lookup: http://localhost:4001"
    echo "  • Quoting Service: http://localhost:3002"
    echo "  • Simulator: http://localhost:8444"
    echo ""
    echo "🧪 Test your deployment:"
    echo "  npm run test:mojaloop"
    echo ""
    echo "📋 Logs:"
    echo "  kubectl logs -f deployment/central-ledger -n $NAMESPACE"
}

# Cleanup function
cleanup() {
    log "Cleaning up deployment..."
    
    # Stop port forwarding
    pkill -f "kubectl port-forward" || true
    
    # Delete Helm release
    helm uninstall $RELEASE_NAME -n $NAMESPACE || true
    
    # Delete namespace
    kubectl delete namespace $NAMESPACE || true
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    case "${1:-deploy}" in
        "deploy")
            log "🚀 Starting Mojaloop deployment for Payments Without Borders"
            check_prerequisites
            add_helm_repos
            create_namespace
            deploy_mojaloop
            wait_for_pods
            setup_port_forwarding
            register_dfsps
            health_check
            display_status
            success "🎉 Deployment completed successfully!"
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            display_status
            ;;
        "health")
            health_check
            ;;
        *)
            echo "Usage: $0 [deploy|cleanup|status|health]"
            echo ""
            echo "Commands:"
            echo "  deploy  - Deploy Mojaloop (default)"
            echo "  cleanup - Remove Mojaloop deployment"
            echo "  status  - Show deployment status"
            echo "  health  - Run health checks"
            exit 1
            ;;
    esac
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"
