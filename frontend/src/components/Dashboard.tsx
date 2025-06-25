import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserWallets, getRecentTransactions, getWalletSummary, WalletData, Transaction, WalletSummary } from '../services/wallet';

const Dashboard: React.FC = () => {
    const { currentUser } = useAuth();
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalBalance, setTotalBalance] = useState<number>(0);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [summary, setSummary] = useState<WalletSummary | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch user's wallets
                const walletsResponse = await getUserWallets();
                if (walletsResponse.success && walletsResponse.data?.wallets) {
                    setWallets(walletsResponse.data.wallets);
                }
                
                // Fetch wallet summary
                const summaryResponse = await getWalletSummary();
                if (summaryResponse.success && summaryResponse.data?.summary) {
                    setSummary(summaryResponse.data.summary);
                    setTotalBalance(summaryResponse.data.summary.totalBalance);
                }
                
                // Fetch recent transactions
                const transactionsResponse = await getRecentTransactions(10);
                if (transactionsResponse.success && transactionsResponse.data?.recentTransactions) {
                    setTransactions(transactionsResponse.data.recentTransactions);
                    
                    // Count pending transactions
                    const pendingTransactions = transactionsResponse.data.recentTransactions.filter(
                        tx => tx.status === 'pending'
                    ).length;
                    setPendingCount(pendingTransactions);
                }
                
            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper function to format currency
    const formatCurrency = (amount: number, currency: string = 'USD'): string => {
        const currencySymbols: Record<string, string> = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
        
        return `${currencySymbols[currency] || ''}${amount.toFixed(2)}`;
    };

    return (
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="dashboard-content">
                <p>Welcome to your dashboard{currentUser?.name ? `, ${currentUser.name}` : ''}! This is where you'll see your personalized content.</p>
                
                {loading ? (
                    <div className="loading-spinner">Loading dashboard data...</div>
                ) : (
                    <>
                        <div className="dashboard-stats">
                            <div className="stat-card">
                                <h3>Transactions</h3>
                                <p className="stat-number">{transactions.length}</p>
                                <small>Recent transactions</small>
                            </div>
                            <div className="stat-card">
                                <h3>Total Balance</h3>
                                <p className="stat-number">{formatCurrency(totalBalance)}</p>
                                <small>Across {summary?.walletCount || 0} wallets</small>
                            </div>
                            <div className="stat-card">
                                <h3>Pending</h3>
                                <p className="stat-number">{pendingCount}</p>
                                <small>Transactions in progress</small>
                            </div>
                        </div>

                        {/* Currency breakdown section */}
                        {summary && Object.keys(summary.totalByCurrency).length > 0 && (
                            <div className="currency-breakdown">
                                <div className="section-header">
                                    <h2>Balances by Currency</h2>
                                </div>
                                <div className="currency-breakdown-grid">
                                    {Object.entries(summary.totalByCurrency).map(([currency, amount]) => (
                                        <div key={currency} className="currency-card">
                                            <div className="currency-icon">{currency}</div>
                                            <div className="currency-amount">{formatCurrency(amount, currency)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Wallet summary section */}
                        <div className="wallet-summary">
                            <div className="section-header">
                                <h2>My Wallets</h2>
                                <Link to="/wallet" className="btn btn-sm btn-outline">View All</Link>
                            </div>
                            
                            {wallets.length === 0 ? (
                                <div className="no-data-message">
                                    <p>You don't have any wallets yet.</p>
                                    <Link to="/wallet" className="btn btn-primary">Create Wallet</Link>
                                </div>
                            ) : (
                                <div className="wallets-grid">
                                    {wallets.slice(0, 3).map(wallet => (
                                        <div key={wallet.id} className="wallet-summary-card">
                                            <div className="wallet-header">
                                                <h4>{wallet.currency} Wallet</h4>
                                                <span className={`status-badge ${wallet.isActive ? 'active' : 'inactive'}`}>
                                                    {wallet.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="wallet-balance">
                                                {formatCurrency(wallet.balance, wallet.currency)}
                                            </div>
                                            <div className="wallet-footer">
                                                <span className="wallet-id">ID: {wallet.walletAddress}</span>
                                                <Link to={`/wallet/${wallet.id}`} className="btn btn-sm btn-outline">
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {wallets.length > 3 && (
                                        <div className="more-wallets">
                                            <span>+{wallets.length - 3} more wallets</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Recent transactions section */}
                        <div className="recent-transactions">
                            <div className="section-header">
                                <h2>Recent Transactions</h2>
                                <Link to="/transactions" className="btn btn-sm btn-outline">View All</Link>
                            </div>
                            
                            {transactions.length === 0 ? (
                                <div className="no-data-message">
                                    <p>No transaction history yet.</p>
                                </div>
                            ) : (
                                <div className="transactions-table-container">
                                    <table className="transactions-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Reference</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.map(transaction => (
                                                <tr key={transaction.id} className={`transaction-row ${transaction.status}`}>
                                                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                                                    <td className="transaction-type">{transaction.type}</td>
                                                    <td className={`amount ${transaction.type === 'deposit' ? 'positive' : transaction.type === 'withdrawal' ? 'negative' : ''}`}>
                                                        {transaction.type === 'withdrawal' ? '- ' : transaction.type === 'deposit' ? '+ ' : ''}
                                                        {formatCurrency(transaction.amount, transaction.currency)}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${transaction.status}`}>
                                                            {transaction.status}
                                                        </span>
                                                    </td>
                                                    <td className="reference">{transaction.reference}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="dashboard-actions">
                    <div className="action-card">
                        <h3>Profile</h3>
                        <p>View and edit your profile information</p>
                        <Link to="/profile" className="btn btn-primary">Manage Profile</Link>
                    </div>
                    <div className="action-card">
                        <h3>Security</h3>
                        <p>Enable email verification and two-factor authentication</p>
                        <Link to="/security" className="btn btn-secondary">Security Settings</Link>
                    </div>
                    <div className="action-card">
                        <h3>Wallet</h3>
                        <p>Manage your wallets and transactions</p>
                        <Link to="/wallet" className="btn btn-success">My Wallets</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
