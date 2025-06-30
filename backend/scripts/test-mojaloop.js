#!/usr/bin/env node

/**
 * Mojaloop Integration Test Script
 * Tests the connection and basic functionality with local Mojaloop setup
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const config = {
  mojaloopSimulator: process.env.MOJALOOP_SIMULATOR_ENDPOINT || 'http://localhost:3001',
  mojaloopHub: process.env.MOJALOOP_HUB_ENDPOINT || 'http://localhost:3003',
  dfspId: process.env.MOJALOOP_DFSP_ID || 'paymentswithoutborders',
  appEndpoint: process.env.APP_ENDPOINT || 'http://localhost:3000'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Test functions
async function testServiceHealth() {
  log('\n🏥 Testing service health...', colors.blue);
  
  const tests = [
    { name: 'Application Health', url: `${config.appEndpoint}/health` },
    { name: 'Mojaloop Simulator', url: `${config.mojaloopSimulator}/health` },
    { name: 'Mojaloop Hub', url: `${config.mojaloopHub}/health` }
  ];

  for (const test of tests) {
    try {
      const response = await axios.get(test.url, { timeout: 5000 });
      log(`✅ ${test.name}: OK (${response.status})`, colors.green);
    } catch (error) {
      log(`❌ ${test.name}: Failed - ${error.message}`, colors.red);
    }
  }
}

async function testMojaloopParticipants() {
  log('\n👥 Testing Mojaloop participants...', colors.blue);
  
  try {
    // Register our DFSP
    const participantData = {
      name: config.dfspId,
      currency: 'USD'
    };

    const response = await axios.post(
      `${config.mojaloopSimulator}/participants`,
      participantData,
      {
        headers: {
          'Content-Type': 'application/json',
          'FSPIOP-Source': config.dfspId
        }
      }
    );

    log(`✅ DFSP registered successfully: ${config.dfspId}`, colors.green);
  } catch (error) {
    if (error.response && error.response.status === 409) {
      log(`✅ DFSP already exists: ${config.dfspId}`, colors.green);
    } else {
      log(`❌ Failed to register DFSP: ${error.message}`, colors.red);
    }
  }
}

async function testQuoteRequest() {
  log('\n💰 Testing quote request...', colors.blue);

  const quoteRequest = {
    quoteId: uuidv4(),
    transactionId: uuidv4(),
    payer: {
      partyIdType: 'MSISDN',
      partyIdentifier: '1234567890',
      fspId: config.dfspId
    },
    payee: {
      partyIdType: 'MSISDN',
      partyIdentifier: '0987654321',
      fspId: 'testfsp'
    },
    amountType: 'SEND',
    amount: {
      amount: '100',
      currency: 'USD'
    },
    transactionType: {
      scenario: 'TRANSFER',
      initiator: 'PAYER',
      initiatorType: 'CONSUMER'
    }
  };

  try {
    const response = await axios.post(
      `${config.mojaloopSimulator}/quotes`,
      quoteRequest,
      {
        headers: {
          'Content-Type': 'application/vnd.interoperability.quotes+json;version=1.0',
          'Date': new Date().toISOString(),
          'FSPIOP-Source': config.dfspId,
          'FSPIOP-Destination': 'testfsp'
        }
      }
    );

    log(`✅ Quote request successful: ${quoteRequest.quoteId}`, colors.green);
    return quoteRequest;
  } catch (error) {
    log(`❌ Quote request failed: ${error.message}`, colors.red);
    return null;
  }
}

async function testTransferRequest(quoteData) {
  log('\n🔄 Testing transfer request...', colors.blue);

  if (!quoteData) {
    log('❌ Skipping transfer test - no quote data', colors.yellow);
    return;
  }

  const transferRequest = {
    transferId: uuidv4(),
    payerFsp: config.dfspId,
    payeeFsp: 'testfsp',
    amount: {
      amount: '100',
      currency: 'USD'
    },
    condition: 'YlK5TZyhflbXaDRPtR',  // Mock condition
    expiration: new Date(Date.now() + 60000).toISOString(),
    ilpPacket: 'AYIBgQAAAAAAAASwNGxldmVsb25lLmRmc3AxLm1lci45T2RTOF81MDdqUUZERmZlakgyOVc4bXFmNEpLMHlGTFGCAUBQU0svNVNkD09zCdHfYA'
  };

  try {
    const response = await axios.post(
      `${config.mojaloopSimulator}/transfers`,
      transferRequest,
      {
        headers: {
          'Content-Type': 'application/vnd.interoperability.transfers+json;version=1.0',
          'Date': new Date().toISOString(),
          'FSPIOP-Source': config.dfspId,
          'FSPIOP-Destination': 'testfsp'
        }
      }
    );

    log(`✅ Transfer request successful: ${transferRequest.transferId}`, colors.green);
  } catch (error) {
    log(`❌ Transfer request failed: ${error.message}`, colors.red);
  }
}

async function testApplicationAPI() {
  log('\n🔌 Testing application API integration...', colors.blue);

  // Test user registration
  const userData = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    country: 'US',
    currency: 'USD'
  };

  try {
    const registerResponse = await axios.post(
      `${config.appEndpoint}/api/auth/register`,
      userData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    log('✅ User registration successful', colors.green);

    // Test login
    const loginResponse = await axios.post(
      `${config.appEndpoint}/api/auth/login`,
      {
        email: userData.email,
        password: userData.password
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const token = loginResponse.data.token;
    log('✅ User login successful', colors.green);

    // Test transaction initiation
    const transactionData = {
      receiverId: 'test-receiver-id',
      amount: 100,
      currency: 'USD',
      description: 'Test cross-border payment'
    };

    const transactionResponse = await axios.post(
      `${config.appEndpoint}/api/transactions/initiate`,
      transactionData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    log('✅ Transaction initiation successful', colors.green);

  } catch (error) {
    log(`❌ Application API test failed: ${error.message}`, colors.red);
  }
}

async function testCurrencyExchange() {
  log('\n💱 Testing currency exchange rates...', colors.blue);

  try {
    const response = await axios.get(`${config.appEndpoint}/api/transactions/rates?from=USD&to=EUR`);
    log(`✅ Exchange rate fetched: 1 USD = ${response.data.rate} EUR`, colors.green);
  } catch (error) {
    log(`❌ Currency exchange test failed: ${error.message}`, colors.red);
  }
}

// Main test runner
async function runTests() {
  log('🚀 Starting Mojaloop Integration Tests', colors.blue);
  log('=====================================', colors.blue);

  try {
    await testServiceHealth();
    await testMojaloopParticipants();
    
    const quoteData = await testQuoteRequest();
    await testTransferRequest(quoteData);
    
    await testApplicationAPI();
    await testCurrencyExchange();

    log('\n🎉 All tests completed!', colors.green);
    log('\nTest Summary:', colors.yellow);
    log('- Service health checks', colors.white);
    log('- Mojaloop participant registration', colors.white);
    log('- Quote and transfer requests', colors.white);
    log('- Application API integration', colors.white);
    log('- Currency exchange functionality', colors.white);

  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Mojaloop Integration Test Script

Usage: node test-mojaloop.js [options]

Options:
  --help, -h     Show this help message
  --config       Show current configuration

Environment Variables:
  MOJALOOP_SIMULATOR_ENDPOINT  Mojaloop simulator URL (default: http://localhost:3001)
  MOJALOOP_HUB_ENDPOINT       Mojaloop hub URL (default: http://localhost:3003)
  MOJALOOP_DFSP_ID           DFSP identifier (default: paymentswithoutborders)
  APP_ENDPOINT               Application API URL (default: http://localhost:3000)
  `);
  process.exit(0);
}

if (process.argv.includes('--config')) {
  console.log('Current Configuration:');
  console.log(JSON.stringify(config, null, 2));
  process.exit(0);
}

// Run the tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, colors.red);
  process.exit(1);
});
