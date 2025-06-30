// Simple test to verify API connectivity
const testAPI = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/transactions', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('API Test Response:', data);
    
    if (data.success) {
      console.log(`✅ API working! Found ${data.data.pagination.totalTransactions} transactions`);
      console.log('Sample transaction:', data.data.transactions[0]);
    } else {
      console.log('❌ API returned error:', data.message);
    }
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};

testAPI();
