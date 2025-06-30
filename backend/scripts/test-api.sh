#!/bin/bash
# Quick API Testing Script for Payments Without Borders
# Run this script to test all major endpoints

BASE_URL="http://localhost:3000"
AUTH_TOKEN=""

echo "🚀 Starting API Testing for Payments Without Borders"
echo "============================================="

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s -X GET "$BASE_URL/health" | jq '.'
echo ""

# Test 2: User Registration
echo "Test 2: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "countryCode": "US",
    "dateOfBirth": "1990-01-01"
  }')

echo $REGISTER_RESPONSE | jq '.'

# Extract token
AUTH_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token // empty')
echo "Extracted Token: $AUTH_TOKEN"
echo ""

# Test 3: User Login (if registration failed)
if [ -z "$AUTH_TOKEN" ]; then
  echo "Test 3: User Login (Registration failed, trying login)"
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "SecurePass123!"
    }')
  
  echo $LOGIN_RESPONSE | jq '.'
  AUTH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')
  echo "Login Token: $AUTH_TOKEN"
fi

if [ -z "$AUTH_TOKEN" ]; then
  echo "❌ No auth token available. Cannot proceed with authenticated tests."
  exit 1
fi

echo "✅ Authentication successful!"
echo ""

# Test 4: Token Verification
echo "Test 4: Token Verification"
curl -s -X GET "$BASE_URL/api/auth/verify" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 5: User Profile
echo "Test 5: User Profile"
curl -s -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 6: Exchange Rates
echo "Test 6: Exchange Rates"
curl -s -X GET "$BASE_URL/api/cross-border/exchange-rates?from=USD&to=EUR" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 7: Payment Quote
echo "Test 7: Payment Quote"
QUOTE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/cross-border/quote" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "test@example.com",
    "receiverId": "recipient@example.com",
    "amount": 100,
    "sourceCurrency": "USD",
    "targetCurrency": "EUR",
    "payerType": "CONSUMER",
    "payeeType": "CONSUMER"
  }')

echo $QUOTE_RESPONSE | jq '.'
QUOTE_ID=$(echo $QUOTE_RESPONSE | jq -r '.data.quoteId // empty')
echo "Quote ID: $QUOTE_ID"
echo ""

# Test 8: Cross-border Transfer
if [ ! -z "$QUOTE_ID" ]; then
  echo "Test 8: Cross-border Transfer"
  curl -s -X POST "$BASE_URL/api/cross-border/transfer" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"quoteId\": \"$QUOTE_ID\",
      \"senderId\": \"test@example.com\",
      \"receiverId\": \"recipient@example.com\",
      \"amount\": 100,
      \"sourceCurrency\": \"USD\",
      \"targetCurrency\": \"EUR\",
      \"description\": \"Test transfer\"
    }" | jq '.'
  echo ""
fi

# Test 9: Transaction History
echo "Test 9: Transaction History"
curl -s -X GET "$BASE_URL/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 10: Transfer History
echo "Test 10: Transfer History"
curl -s -X GET "$BASE_URL/api/cross-border/history?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

# Test 11: Mojaloop Health
echo "Test 11: Mojaloop Health"
curl -s -X GET "$BASE_URL/api/mojaloop/health" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.'
echo ""

echo "🎉 API Testing Complete!"
echo "============================================="
