import React, { useEffect, useState } from 'react';
import { getUserWallets, createWallet, depositFunds, WalletData } from '../services/wallet';

const Wallet: React.FC = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCurrency, setNewCurrency] = useState<string>('USD');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [depositDescription, setDepositDescription] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user's wallets on component mount
  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserWallets();
      
      if (response.success && response.data?.wallets) {
        setWallets(response.data.wallets);
      } else {
        setError(response.message || 'Failed to fetch wallets');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await createWallet(newCurrency);
      
      if (response.success && response.data?.wallet) {
        setWallets([...wallets, response.data.wallet]);
        setSuccessMessage(`New ${newCurrency} wallet created successfully!`);
        setNewCurrency('USD');
      } else {
        setError(response.message || 'Failed to create wallet');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedWallet || !depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please select a wallet and enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      const amount = parseFloat(depositAmount);
      const response = await depositFunds(selectedWallet, amount, depositDescription);
      
      if (response.success) {
        // Update the wallet balance in the state
        setWallets(wallets.map(wallet => {
          if (wallet.id === selectedWallet && response.data?.newBalance !== undefined) {
            return { ...wallet, balance: response.data.newBalance };
          }
          return wallet;
        }));
        
        setSuccessMessage(`Successfully deposited ${amount} to your wallet!`);
        setDepositAmount('');
        setDepositDescription('');
      } else {
        setError(response.message || 'Failed to deposit funds');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while depositing funds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <h1>My Wallets</h1>
      
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {loading && wallets.length === 0 ? (
        <div className="loading">Loading wallets...</div>
      ) : (
        <div className="wallets-section">
          {wallets.length === 0 ? (
            <div className="no-wallets">
              <p>You don't have any wallets yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="wallets-grid">
              {wallets.map(wallet => (
                <div className="wallet-card" key={wallet.id}>
                  <div className="wallet-header">
                    <h3>{wallet.currency} Wallet</h3>
                    <span className={`status ${wallet.isActive ? 'active' : 'inactive'}`}>
                      {wallet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="wallet-balance">
                    <span className="balance-label">Balance</span>
                    <span className="balance-amount">
                      {wallet.currency === 'USD' ? '$' : wallet.currency === 'EUR' ? '€' : wallet.currency === 'GBP' ? '£' : ''}
                      {wallet.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="wallet-details">
                    <p><strong>Wallet Address:</strong> {wallet.walletAddress}</p>
                    <p><strong>Created:</strong> {new Date(wallet.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="wallet-actions">
            <div className="create-wallet">
              <h3>Create New Wallet</h3>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select 
                  id="currency" 
                  value={newCurrency} 
                  onChange={e => setNewCurrency(e.target.value)}
                  disabled={loading}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
              <button 
                onClick={handleCreateWallet} 
                disabled={loading} 
                className="btn btn-primary"
              >
                Create Wallet
              </button>
            </div>

            {wallets.length > 0 && (
              <div className="deposit-funds">
                <h3>Deposit Funds</h3>
                <form onSubmit={handleDeposit}>
                  <div className="form-group">
                    <label htmlFor="wallet">Select Wallet</label>
                    <select 
                      id="wallet" 
                      value={selectedWallet || ''} 
                      onChange={e => setSelectedWallet(e.target.value)}
                      required
                      disabled={loading}
                    >
                      <option value="">-- Select wallet --</option>
                      {wallets
                        .filter(wallet => wallet.isActive)
                        .map(wallet => (
                          <option key={wallet.id} value={wallet.id}>
                            {wallet.currency} Wallet ({wallet.walletAddress})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="amount">Amount</label>
                    <input 
                      type="number" 
                      id="amount"
                      value={depositAmount} 
                      onChange={e => setDepositAmount(e.target.value)}
                      min="0.01" 
                      step="0.01"
                      required
                      disabled={loading}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="description">Description (optional)</label>
                    <input 
                      type="text" 
                      id="description"
                      value={depositDescription} 
                      onChange={e => setDepositDescription(e.target.value)}
                      disabled={loading}
                      placeholder="Add a note to your deposit"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn btn-success"
                  >
                    {loading ? 'Processing...' : 'Deposit Funds'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
