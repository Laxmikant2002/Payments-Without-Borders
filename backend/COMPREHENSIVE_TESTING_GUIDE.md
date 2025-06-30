# Comprehensive Testing Guide - Payments Without Borders API

## Overview
This guide provides comprehensive testing instructions for all API endpoints including the newly added user management features. The system now includes enhanced user profile management, preferences, security settings, and address management.

## Prerequisites
1. Ensure the server is running on `http://localhost:3000`
2. MongoDB Atlas and Redis Cloud connections are established
3. Environment variables are properly configured
4. PowerShell (for testing scripts) or any REST client like Postman

## Quick Start Testing

### Option 1: Run the Comprehensive Test Script
```powershell
# Execute the comprehensive test script
./test-all-endpoints.ps1
```

### Option 2: Manual Testing Steps

## 1. Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
```

## 2. Authentication Endpoints

### Register User
```powershell
$registerBody = @{
    email = "testuser@example.com"
    password = "TestPass123!"
    firstName = "John"
    lastName = "Doe"
    phoneNumber = "+1234567890"
    countryCode = "US"
    dateOfBirth = "1990-01-01"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
```

### Login User
```powershell
$loginBody = @{
    email = "testuser@example.com"
    password = "TestPass123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
$headers = @{ "Authorization" = "Bearer $token" }
```

### Verify Token
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/verify" -Method GET -Headers $headers
```

## 3. User Management Endpoints (NEW & Enhanced)

### Get User Profile
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Method GET -Headers $headers
```

### Update User Profile
```powershell
$updateBody = @{
    firstName = "John Updated"
    lastName = "Doe Updated"
    phoneNumber = "+1987654321"
    currency = "EUR"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile" -Method PUT -Body $updateBody -ContentType "application/json" -Headers $headers
```

### 🆕 User Preferences Management
```powershell
# Get Preferences
Invoke-RestMethod -Uri "http://localhost:3000/api/users/preferences" -Method GET -Headers $headers

# Update Preferences
$preferencesBody = @{
    notifications = @{
        email = $true
        sms = $true
        push = $false
    }
    language = "es"
    timezone = "America/New_York"
    twoFactorAuth = $true
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/api/users/preferences" -Method PUT -Body $preferencesBody -ContentType "application/json" -Headers $headers
```

### 🆕 Address Management
```powershell
# Add Address
$addressBody = @{
    street = "123 Main Street"
    city = "New York"
    state = "NY"
    postalCode = "10001"
    country = "US"
    isPrimary = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/address" -Method POST -Body $addressBody -ContentType "application/json" -Headers $headers

# Get All Addresses
Invoke-RestMethod -Uri "http://localhost:3000/api/users/addresses" -Method GET -Headers $headers
```

### 🆕 Profile Picture Management
```powershell
$profilePicBody = @{
    imageUrl = "https://example.com/profile.jpg"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/profile-picture" -Method POST -Body $profilePicBody -ContentType "application/json" -Headers $headers
```

### 🆕 Security Settings
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/users/security-settings" -Method GET -Headers $headers
```

### Change Password
```powershell
$passwordBody = @{
    currentPassword = "TestPass123!"
    newPassword = "NewTestPass456!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/change-password" -Method PUT -Body $passwordBody -ContentType "application/json" -Headers $headers
```

### KYC Document Upload
```powershell
$kycBody = @{
    documentType = "passport"
    documentNumber = "ABC123456"
    documentUrl = "https://example.com/passport.jpg"
    additionalInfo = "Valid until 2030"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/kyc-upload" -Method POST -Body $kycBody -ContentType "application/json" -Headers $headers
```

### 🆕 Account Deactivation
```powershell
$deactivateBody = @{
    password = "NewTestPass456!"
    reason = "Account no longer needed"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/users/deactivate" -Method PUT -Body $deactivateBody -ContentType "application/json" -Headers $headers
```

## 4. Transaction Endpoints

### Get Transaction History
```powershell
# Basic history
Invoke-RestMethod -Uri "http://localhost:3000/api/transactions" -Method GET -Headers $headers

# With pagination and filters
Invoke-RestMethod -Uri "http://localhost:3000/api/transactions?page=1&limit=5&status=completed" -Method GET -Headers $headers
```

### Get Transaction Details
```powershell
# Replace {id} with actual transaction ID
Invoke-RestMethod -Uri "http://localhost:3000/api/transactions/{id}" -Method GET -Headers $headers
```

## 5. Compliance Endpoints

### KYC Status
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/compliance/kyc-status" -Method GET -Headers $headers
```

### Submit KYC Documents
```powershell
$kycSubmitBody = @{
    documentType = "passport"
    documentNumber = "P123456789"
    documentUrl = "https://example.com/passport.jpg"
    address = "123 Test Street, Test City, TC 12345"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/compliance/kyc-submit" -Method POST -Body $kycSubmitBody -ContentType "application/json" -Headers $headers
```

### AML Screening
```powershell
$amlBody = @{
    transactionAmount = 5000
    recipientCountry = "GB"
    recipientName = "Jane Smith"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/compliance/aml-check" -Method POST -Body $amlBody -ContentType "application/json" -Headers $headers
```

### Sanctions Check
```powershell
$sanctionsBody = @{
    name = "John Doe"
    dateOfBirth = "1990-01-01"
    country = "US"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/compliance/sanctions-check" -Method POST -Body $sanctionsBody -ContentType "application/json" -Headers $headers
```

## 6. Mojaloop Integration Endpoints

### Status Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mojaloop/status" -Method GET
```

### Get Participants
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/mojaloop/participants" -Method GET -Headers $headers
```

### Party Lookup
```powershell
$partyBody = @{
    partyIdType = "EMAIL"
    partyIdentifier = "recipient@example.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/mojaloop/party-lookup" -Method POST -Body $partyBody -ContentType "application/json" -Headers $headers
```

### Request Quote
```powershell
$quoteBody = @{
    payee = @{
        partyIdInfo = @{
            partyIdType = "EMAIL"
            partyIdentifier = "payee@example.com"
        }
    }
    payer = @{
        partyIdInfo = @{
            partyIdType = "EMAIL"
            partyIdentifier = "testuser@example.com"
        }
    }
    amountType = "SEND"
    amount = @{
        currency = "USD"
        amount = "100"
    }
    transactionType = @{
        scenario = "TRANSFER"
        initiator = "PAYER"
        initiatorType = "CONSUMER"
    }
} | ConvertTo-Json -Depth 4

Invoke-RestMethod -Uri "http://localhost:3000/api/mojaloop/quote" -Method POST -Body $quoteBody -ContentType "application/json" -Headers $headers
```

## 7. Cross-Border Payment Endpoints

### Initiate Transfer
```powershell
$transferBody = @{
    receiverId = "recipient123"
    amount = 150.50
    sourceCurrency = "USD"
    targetCurrency = "EUR"
    receiverName = "Jane Smith"
    receiverPhone = "+44123456789"
    description = "Payment for services"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/cross-border/transfers" -Method POST -Body $transferBody -ContentType "application/json" -Headers $headers
```

## 8. Notification Endpoints

### Get Notifications
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications" -Method GET -Headers $headers
```

### Get Unread Count
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/unread-count" -Method GET -Headers $headers
```

### Mark as Read
```powershell
# Replace {id} with actual notification ID
Invoke-RestMethod -Uri "http://localhost:3000/api/notifications/{id}/read" -Method PUT -Headers $headers
```

## 9. Admin Endpoints (if admin user exists)

### Get All Users
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/users" -Method GET -Headers $adminHeaders
```

### Dashboard Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/dashboard/stats" -Method GET -Headers $adminHeaders
```

## New Features Added

### Enhanced User Management
1. **Preferences Management**: Control notifications, language, timezone, and 2FA settings
2. **Address Management**: Add and manage multiple addresses with primary designation
3. **Profile Picture**: Upload and manage profile pictures
4. **Security Settings**: View account security information
5. **Account Deactivation**: Self-service account deactivation with reason tracking

### Technical Improvements
1. **Enhanced Validation**: Better input validation across all endpoints
2. **Improved Error Handling**: More descriptive error messages
3. **Audit Logging**: Enhanced logging for user actions
4. **Data Structure**: Flexible schema for user preferences and addresses

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Validation errors if applicable
}
```

## Expected Success Responses

All successful responses follow this format:
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    // Relevant data
  }
}
```

## Environment-Specific Testing

### Mock Mode (MOCK_EXTERNAL_SERVICES=true)
- Mojaloop integration returns mock responses
- KYC verification is automatically approved after 5 seconds
- AML and sanctions checks return simulated results

### Production Mode
- Real integrations with external services
- Actual KYC processing
- Live compliance checks

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Ensure token is valid and included in Authorization header
2. **404 Not Found**: Check endpoint URL and HTTP method
3. **400 Bad Request**: Verify request body structure and required fields
4. **500 Internal Server Error**: Check server logs for detailed error information

### Server Logs
Monitor the server console for detailed logging of all operations, including:
- Authentication attempts
- API calls with user context
- Error details
- Performance metrics

## Performance Notes

- All endpoints are rate-limited
- Pagination is implemented for list endpoints
- Caching is used for frequently accessed data
- Database queries are optimized with proper indexing

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Input Validation**: Comprehensive validation on all inputs
3. **Rate Limiting**: Protection against abuse
4. **Data Sanitization**: Prevention of injection attacks
5. **Audit Logging**: Complete audit trail of user actions

This testing guide ensures comprehensive coverage of all system functionality including the new user management features.
