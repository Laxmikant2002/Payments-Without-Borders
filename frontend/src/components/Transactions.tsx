import React, { useState, useEffect } from 'react';
import { getRecentTransactions, Transaction } from '../services/wallet';

const Transactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch all recent transactions (larger limit)
                const response = await getRecentTransactions(30);
                if (response.success && response.data?.recentTransactions) {
                    setTransactions(response.data.recentTransactions);
                }
            } catch (err: any) {
                console.error("Error fetching transactions:", err);
                setError(err.message || "Failed to load transactions");
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
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
        <div className="transactions-container">
            <h1>Transactions History</h1>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            {loading ? (
                <div className="loading-spinner">Loading transactions...</div>
            ) : (
                <>
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
                                        <th>Description</th>
                                        <th>Reference</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(transaction => (
                                        <tr key={transaction.id} className={`transaction-row ${transaction.status}`}>
                                            <td>{new Date(transaction.createdAt).toLocaleDateString()} {new Date(transaction.createdAt).toLocaleTimeString()}</td>
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
                                            <td>{transaction.description || '-'}</td>
                                            <td className="reference">{transaction.reference}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Transactions;
