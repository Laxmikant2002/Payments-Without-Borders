# PowerShell API Testing Script for Payments Without Borders
# Run this script to test all major endpoints

$BaseUrl = "http://localhost:3000"
$AuthToken = ""

Write-Host "🚀 Starting API Testing for Payments Without Borders" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET
    $healthResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: User Registration
Write-Host "Test 2: User Registration" -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    password = "SecurePass123!"
    firstName = "John"
    lastName = "Doe"
    phoneNumber = "+1234567890"
    countryCode = "US"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    $registerResponse | ConvertTo-Json -Depth 3
    $AuthToken = $registerResponse.data.token
    Write-Host "✅ Extracted Token: $AuthToken" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Registration failed: $($_.Exception.Message)" -ForegroundColor Yellow
    
    # Test 3: Try Login instead
    Write-Host "Test 3: Trying Login instead" -ForegroundColor Yellow
    $loginBody = @{
        email = "test@example.com"
        password = "SecurePass123!"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        $loginResponse | ConvertTo-Json -Depth 3
        $AuthToken = $loginResponse.data.token
        Write-Host "✅ Login Token: $AuthToken" -ForegroundColor Green
    } catch {
        Write-Host "❌ Login also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

if (-not $AuthToken) {
    Write-Host "❌ No auth token available. Cannot proceed with authenticated tests." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Authentication successful!" -ForegroundColor Green
Write-Host ""

# Test 4: Token Verification
Write-Host "Test 4: Token Verification" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $AuthToken" }
    $verifyResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/verify" -Method GET -Headers $headers
    $verifyResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Token verification failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: User Profile
Write-Host "Test 5: User Profile" -ForegroundColor Yellow
try {
    $profileResponse = Invoke-RestMethod -Uri "$BaseUrl/api/users/profile" -Method GET -Headers $headers
    $profileResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Profile fetch failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Exchange Rates
Write-Host "Test 6: Exchange Rates" -ForegroundColor Yellow
try {
    $ratesResponse = Invoke-RestMethod -Uri "$BaseUrl/api/cross-border/exchange-rates?from=USD&to=EUR" -Method GET -Headers $headers
    $ratesResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Exchange rates failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Payment Quote
Write-Host "Test 7: Payment Quote" -ForegroundColor Yellow
$quoteBody = @{
    senderId = "test@example.com"
    receiverId = "recipient@example.com"
    amount = 100
    sourceCurrency = "USD"
    targetCurrency = "EUR"
    payerType = "CONSUMER"
    payeeType = "CONSUMER"
} | ConvertTo-Json

try {
    $quoteResponse = Invoke-RestMethod -Uri "$BaseUrl/api/cross-border/quote" -Method POST -Body $quoteBody -ContentType "application/json" -Headers $headers
    $quoteResponse | ConvertTo-Json -Depth 3
    $QuoteId = $quoteResponse.data.quoteId
    Write-Host "✅ Quote ID: $QuoteId" -ForegroundColor Green
} catch {
    Write-Host "❌ Quote creation failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 8: Cross-border Transfer
if ($QuoteId) {
    Write-Host "Test 8: Cross-border Transfer" -ForegroundColor Yellow
    $transferBody = @{
        quoteId = $QuoteId
        senderId = "test@example.com"
        receiverId = "recipient@example.com"
        amount = 100
        sourceCurrency = "USD"
        targetCurrency = "EUR"
        description = "Test transfer"
    } | ConvertTo-Json
    
    try {
        $transferResponse = Invoke-RestMethod -Uri "$BaseUrl/api/cross-border/transfer" -Method POST -Body $transferBody -ContentType "application/json" -Headers $headers
        $transferResponse | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "❌ Transfer failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 9: Transaction History
Write-Host "Test 9: Transaction History" -ForegroundColor Yellow
try {
    $transactionsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/transactions?page=1&limit=10" -Method GET -Headers $headers
    $transactionsResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Transaction history failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 10: Transfer History
Write-Host "Test 10: Transfer History" -ForegroundColor Yellow
try {
    $historyResponse = Invoke-RestMethod -Uri "$BaseUrl/api/cross-border/history?page=1&limit=10" -Method GET -Headers $headers
    $historyResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Transfer history failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 11: Mojaloop Health
Write-Host "Test 11: Mojaloop Health" -ForegroundColor Yellow
try {
    $mojaloopResponse = Invoke-RestMethod -Uri "$BaseUrl/api/mojaloop/health" -Method GET -Headers $headers
    $mojaloopResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Mojaloop health failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
