# Mojaloop Deployment Script for Windows PowerShell
# Deploy Mojaloop using Helm charts for "Payments Without Borders"

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "cleanup", "status", "health")]
    [string]$Action = "deploy"
)

# Configuration
$NAMESPACE = "mojaloop"
$RELEASE_NAME = "payments-mojaloop"
$TIMEOUT = "600s"

# Helper functions
function Write-Log {
    param([string]$Message)
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check kubectl
    try {
        kubectl version --client --short | Out-Null
        Write-Success "kubectl is available"
    }
    catch {
        Write-Error "kubectl is not installed or not in PATH"
        exit 1
    }
    
    # Check helm
    try {
        helm version --short | Out-Null
        Write-Success "Helm is available"
    }
    catch {
        Write-Error "Helm is not installed or not in PATH"
        exit 1
    }
    
    # Check Kubernetes cluster
    try {
        kubectl cluster-info --request-timeout=5s | Out-Null
        Write-Success "Kubernetes cluster is accessible"
    }
    catch {
        Write-Error "Kubernetes cluster is not accessible"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

function Add-HelmRepos {
    Write-Log "Adding Helm repositories..."
    
    helm repo add mojaloop http://mojaloop.io/helm/repo/
    helm repo add incubator https://charts.helm.sh/incubator
    helm repo add stable https://charts.helm.sh/stable
    helm repo add kiwigrid https://kiwigrid.github.io/helm-charts/
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    Write-Success "Helm repositories added and updated"
}

function New-Namespace {
    Write-Log "Creating namespace: $NAMESPACE"
    
    try {
        kubectl get namespace $NAMESPACE | Out-Null
        Write-Warning "Namespace $NAMESPACE already exists"
    }
    catch {
        kubectl create namespace $NAMESPACE
        Write-Success "Namespace $NAMESPACE created"
    }
}

function Deploy-Mojaloop {
    Write-Log "Deploying Mojaloop..."
    
    # Create custom values file
    $valuesContent = @"
global:
  config:
    hub_name: "PaymentsWithoutBorders"
    currency: "USD"
    log_level: "info"

central-ledger:
  enabled: true
  replicaCount: 1
  service:
    type: ClusterIP
    port: 3001

ml-api-adapter:
  enabled: true
  replicaCount: 1
  service:
    type: ClusterIP
    port: 3000

account-lookup-service:
  enabled: true
  replicaCount: 1
  service:
    type: ClusterIP
    port: 4001

quoting-service:
  enabled: true
  replicaCount: 1
  service:
    type: ClusterIP
    port: 3002

central-settlement:
  enabled: true
  replicaCount: 1

mojaloop-simulator:
  enabled: true
  replicaCount: 2
  service:
    type: ClusterIP
    port: 3000
  config:
    schemeId: "paymentswithoutborders"

mysql:
  enabled: true
  auth:
    rootPassword: "password"
    username: "central_ledger"
    password: "password"
    database: "central_ledger"

kafka:
  enabled: true
  replicaCount: 1
"@
    
    $valuesContent | Out-File -FilePath "mojaloop-values.yaml" -Encoding UTF8
    
    # Check if release exists
    $releaseExists = $false
    try {
        helm list -n $NAMESPACE | Select-String $RELEASE_NAME | Out-Null
        $releaseExists = $true
    }
    catch {
        $releaseExists = $false
    }
    
    if ($releaseExists) {
        Write-Log "Upgrading existing Mojaloop deployment..."
        helm upgrade $RELEASE_NAME mojaloop/mojaloop `
            --namespace $NAMESPACE `
            --values mojaloop-values.yaml `
            --timeout $TIMEOUT
    }
    else {
        Write-Log "Installing new Mojaloop deployment..."
        helm install $RELEASE_NAME mojaloop/mojaloop `
            --namespace $NAMESPACE `
            --values mojaloop-values.yaml `
            --timeout $TIMEOUT `
            --create-namespace
    }
    
    Write-Success "Mojaloop deployment completed"
}

function Wait-ForPods {
    Write-Log "Waiting for pods to be ready..."
    
    # Wait for pods with timeout
    $timeout = 600
    $elapsed = 0
    
    do {
        $notReadyPods = kubectl get pods -n $NAMESPACE --field-selector=status.phase!=Running -o name 2>$null
        if (-not $notReadyPods) {
            break
        }
        
        Start-Sleep -Seconds 10
        $elapsed += 10
        
        if ($elapsed % 60 -eq 0) {
            Write-Log "Still waiting for pods... ($elapsed/$timeout seconds)"
        }
    } while ($elapsed -lt $timeout)
    
    if ($elapsed -ge $timeout) {
        Write-Warning "Timeout waiting for pods to be ready"
    }
    else {
        Write-Success "All pods are ready"
    }
}

function Start-PortForwarding {
    Write-Log "Setting up port forwarding..."
    
    # Kill existing port forwards
    Get-Process | Where-Object { $_.ProcessName -eq "kubectl" -and $_.CommandLine -like "*port-forward*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Start port forwarding in background jobs
    Start-Job -ScriptBlock { kubectl port-forward service/central-ledger 3001:3001 -n $using:NAMESPACE }
    Start-Job -ScriptBlock { kubectl port-forward service/ml-api-adapter 3000:3000 -n $using:NAMESPACE }
    Start-Job -ScriptBlock { kubectl port-forward service/account-lookup-service 4001:4001 -n $using:NAMESPACE }
    Start-Job -ScriptBlock { kubectl port-forward service/quoting-service 3002:3002 -n $using:NAMESPACE }
    Start-Job -ScriptBlock { kubectl port-forward service/mojaloop-simulator 8444:3000 -n $using:NAMESPACE }
    
    Start-Sleep -Seconds 5
    Write-Success "Port forwarding setup completed"
}

function Register-DFSPs {
    Write-Log "Registering DFSPs..."
    
    # Wait for services to be ready
    Start-Sleep -Seconds 30
    
    $dfsps = @(
        @{ name = "dfsp-usd"; currency = "USD" },
        @{ name = "dfsp-eur"; currency = "EUR" },
        @{ name = "dfsp-ngn"; currency = "NGN" }
    )
    
    foreach ($dfsp in $dfsps) {
        $body = @{
            name = $dfsp.name
            currency = $dfsp.currency
            isActive = $true
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "http://localhost:3001/participants" `
                -Method POST `
                -Headers @{ 
                    "Content-Type" = "application/json"
                    "FSPIOP-Source" = "paymentswithoutborders"
                } `
                -Body $body `
                -TimeoutSec 10
            
            Write-Success "Registered $($dfsp.name)"
        }
        catch {
            Write-Warning "Failed to register $($dfsp.name) (might already exist)"
        }
    }
    
    Write-Success "DFSPs registration completed"
}

function Test-Health {
    Write-Log "Performing health checks..."
    
    $services = @(
        @{ name = "central-ledger"; endpoint = "http://localhost:3001/health" },
        @{ name = "ml-api-adapter"; endpoint = "http://localhost:3000/health" },
        @{ name = "account-lookup-service"; endpoint = "http://localhost:4001/health" },
        @{ name = "quoting-service"; endpoint = "http://localhost:3002/health" },
        @{ name = "mojaloop-simulator"; endpoint = "http://localhost:8444/health" }
    )
    
    foreach ($service in $services) {
        Write-Host "Checking $($service.name)... " -NoNewline
        
        try {
            $response = Invoke-WebRequest -Uri $service.endpoint -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "OK"
            }
            else {
                Write-Warning "FAILED (status: $($response.StatusCode))"
            }
        }
        catch {
            Write-Warning "FAILED (service might still be starting)"
        }
    }
}

function Show-Status {
    Write-Log "Deployment Status:"
    Write-Host ""
    Write-Host "📊 Pods:" -ForegroundColor Cyan
    kubectl get pods -n $NAMESPACE
    Write-Host ""
    Write-Host "🌐 Services:" -ForegroundColor Cyan
    kubectl get services -n $NAMESPACE
    Write-Host ""
    Write-Host "🔗 Endpoints:" -ForegroundColor Cyan
    Write-Host "  • Central Ledger: http://localhost:3001"
    Write-Host "  • ML API Adapter: http://localhost:3000"
    Write-Host "  • Account Lookup: http://localhost:4001"
    Write-Host "  • Quoting Service: http://localhost:3002"
    Write-Host "  • Simulator: http://localhost:8444"
    Write-Host ""
    Write-Host "🧪 Test your deployment:" -ForegroundColor Cyan
    Write-Host "  npm run test:mojaloop"
    Write-Host ""
    Write-Host "📋 View logs:" -ForegroundColor Cyan
    Write-Host "  kubectl logs -f deployment/central-ledger -n $NAMESPACE"
}

function Remove-Deployment {
    Write-Log "Cleaning up deployment..."
    
    # Stop background jobs
    Get-Job | Stop-Job -PassThru | Remove-Job
    
    # Stop port forwarding processes
    Get-Process | Where-Object { $_.ProcessName -eq "kubectl" -and $_.CommandLine -like "*port-forward*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Delete Helm release
    try {
        helm uninstall $RELEASE_NAME -n $NAMESPACE
        Write-Success "Helm release removed"
    }
    catch {
        Write-Warning "Failed to remove Helm release (might not exist)"
    }
    
    # Delete namespace
    try {
        kubectl delete namespace $NAMESPACE --ignore-not-found=true
        Write-Success "Namespace removed"
    }
    catch {
        Write-Warning "Failed to remove namespace"
    }
    
    Write-Success "Cleanup completed"
}

# Main execution
switch ($Action) {
    "deploy" {
        Write-Log "🚀 Starting Mojaloop deployment for Payments Without Borders"
        Test-Prerequisites
        Add-HelmRepos
        New-Namespace
        Deploy-Mojaloop
        Wait-ForPods
        Start-PortForwarding
        Register-DFSPs
        Test-Health
        Show-Status
        Write-Success "🎉 Deployment completed successfully!"
    }
    "cleanup" {
        Remove-Deployment
    }
    "status" {
        Show-Status
    }
    "health" {
        Test-Health
    }
}

Write-Host ""
Write-Host "Usage: .\deploy-mojaloop.ps1 [deploy|cleanup|status|health]" -ForegroundColor Gray
