import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserWallets, getRecentTransactions, getWalletSummary, WalletData, Transaction, WalletSummary } from '../services/wallet';
import './Dashboard.css';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

Chart.register(ArcElement, Tooltip, Legend);

const fadeSlide = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};
const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } }
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } }
};

const fadeStagger = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.13 + 0.2, duration: 0.7, ease: 'easeOut' } })
};

const mockBalances = {
  total: 500.00,
  primary: 'USD',
  breakdown: { USD: 300, EUR: 150, INR: 50 }
};
const mockTransactions = [
  { id: 1, date: '2024-06-01', type: 'Send', amount: 100, currency: 'USD', status: 'Completed', recipient: 'alice@example.com' },
  { id: 2, date: '2024-06-02', type: 'Receive', amount: 50, currency: 'EUR', status: 'Completed', recipient: 'bob@example.com' },
  { id: 3, date: '2024-06-03', type: 'Send', amount: 200, currency: 'INR', status: 'Pending', recipient: 'carol@example.com' },
  { id: 4, date: '2024-06-04', type: 'Receive', amount: 75, currency: 'GBP', status: 'Failed', recipient: 'dave@example.com' },
];
const mockPending = mockTransactions.filter(tx => tx.status === 'Pending');
const mockWallets = 3;
const mockSecurity = { email: true, twoFA: true };

const Dashboard: React.FC = () => {
    // const { currentUser } = useAuth();
    const navigate = useNavigate();
    // const [wallets, setWallets] = useState<WalletData[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // const [error, setError] = useState<string | null>(null);
    // const [totalBalance, setTotalBalance] = useState<number>(0);
    // const [pendingCount, setPendingCount] = useState<number>(0);
    const [summary, setSummary] = useState<WalletSummary | null>(null);
    const [currency, setCurrency] = useState<string>('USD');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // setError(null);
                
                // Fetch user's wallets
                // const walletsResponse = await getUserWallets();
                // if (walletsResponse.success && walletsResponse.data?.wallets) {
                //     setWallets(walletsResponse.data.wallets);
                // }
                
                // Fetch wallet summary
                const summaryResponse = await getWalletSummary();
                if (summaryResponse.success && summaryResponse.data?.summary) {
                    setSummary(summaryResponse.data.summary);
                    // setTotalBalance(summaryResponse.data.summary.totalBalance);
                }
                
                // Fetch recent transactions
                const transactionsResponse = await getRecentTransactions(5);
                if (transactionsResponse.success && transactionsResponse.data?.recentTransactions) {
                    setTransactions(transactionsResponse.data.recentTransactions);
                    
                    // Count pending transactions
                    // const pendingTransactions = transactionsResponse.data.recentTransactions.filter(
                    //     tx => tx.status === 'pending'
                    // ).length;
                    // setPendingCount(pendingTransactions);
                }
                
            } catch (err: any) {
                console.error("Error fetching dashboard data:", err);
                // setError(err.message || "Failed to load dashboard data");
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
            'EUR': '\u20ac',
            'GBP': '\u00a3',
            'INR': '\u20b9',
        };
        
        return `${currencySymbols[currency] || ''}${amount.toFixed(2)}`;
    };

    // Pie chart data for currency breakdown
    const pieData = summary && Object.keys(summary.totalByCurrency).length > 0 ? {
        labels: Object.keys(summary.totalByCurrency),
        datasets: [
            {
                data: Object.values(summary.totalByCurrency),
                backgroundColor: [
                    '#007BFF', '#28A745', '#17A2B8', '#343A40', '#6C757D', '#F8F9FA'
                ],
                borderWidth: 1,
            },
        ],
    } : null;

    // Skeleton loader for wallet summary
    const WalletSkeleton = () => (
        <motion.div className="wallet-summary skeleton" variants={scaleIn} initial="hidden" animate="visible">
            <div className="skeleton-title" />
            <div className="skeleton-balance" />
            <div className="skeleton-select" />
            <div className="skeleton-actions">
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
            </div>
        </motion.div>
    );

    // Skeleton loader for transactions
    const TransactionsSkeleton = () => (
        <motion.div className="recent-transactions skeleton" variants={scaleIn} initial="hidden" animate="visible">
            <div className="skeleton-title" />
            <div className="skeleton-table-row" />
            <div className="skeleton-table-row" />
            <div className="skeleton-table-row" />
        </motion.div>
    );

    return (
        <div style={{background:'#fff', minHeight:'100vh', color:'#212529', display:'flex', flexDirection:'column'}}>
            <Navbar />
            <main style={{flex:1, width:'100%', background:'#F8F9FA', padding:'3rem 0'}}>
                <div style={{maxWidth:1200, margin:'0 auto', padding:'0 2rem'}}>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:'2.5rem'}}>
                        {/* Wallet Balance Card */}
                        <motion.div className="dashboard-card" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.2rem 2rem', display:'flex', flexDirection:'column', alignItems:'flex-start'}} variants={fadeStagger} initial="hidden" animate="visible" custom={0}>
                            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'0.7rem', color:'#007BFF'}}>Wallet Balance</div>
                            <div style={{fontSize:'2.5rem', fontWeight:900, color:'#007BFF', marginBottom:'0.5rem'}}>
                                {mockBalances.primary} {mockBalances.total.toLocaleString(undefined, {minimumFractionDigits:2})}
                            </div>
                            <div style={{marginBottom:'1.2rem', color:'#495057', fontSize:'1.1rem'}}>
                                {Object.entries(mockBalances.breakdown).map(([cur, amt], i) => (
                                    <span key={cur}>{cur} {amt}{i < Object.keys(mockBalances.breakdown).length-1 ? ' + ' : ''}</span>
                                ))}
                            </div>
                            <div style={{display:'flex', gap:'1rem'}}>
                                <button className="btn btn-primary">Add Funds</button>
                                <button className="btn btn-outline">View Details</button>
                            </div>
                        </motion.div>

                        {/* Recent Transactions Card */}
                        <motion.div className="dashboard-card" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.2rem 2rem', display:'flex', flexDirection:'column'}} variants={fadeStagger} initial="hidden" animate="visible" custom={1}>
                            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'1.2rem', color:'#212529'}}>Recent Transactions</div>
                            <div style={{overflowX:'auto'}}>
                                <table style={{width:'100%', borderCollapse:'collapse'}}>
                                    <thead>
                                        <tr style={{color:'#6C757D', fontWeight:600, fontSize:'0.98rem'}}>
                                            <th style={{padding:'0.5rem'}}>Date</th>
                                            <th style={{padding:'0.5rem'}}>Type</th>
                                            <th style={{padding:'0.5rem'}}>Amount</th>
                                            <th style={{padding:'0.5rem'}}>Currency</th>
                                            <th style={{padding:'0.5rem'}}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockTransactions.slice(0,4).map((tx, i) => (
                                            <motion.tr key={tx.id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay:i*0.08+0.2}}>
                                                <td style={{padding:'0.5rem', color:'#495057'}}>{tx.date}</td>
                                                <td style={{padding:'0.5rem'}}>{tx.type}</td>
                                                <td style={{padding:'0.5rem', fontWeight:600}}>{tx.amount}</td>
                                                <td style={{padding:'0.5rem'}}>{tx.currency}</td>
                                                <td style={{padding:'0.5rem'}}>
                                                    <span style={{
                                                        display:'inline-block',
                                                        padding:'0.25rem 0.8rem',
                                                        borderRadius:12,
                                                        fontWeight:600,
                                                        fontSize:'0.95rem',
                                                        background: tx.status==='Completed' ? '#E6F9ED' : tx.status==='Failed' ? '#FDE8E8' : '#E6F6FA',
                                                        color: tx.status==='Completed' ? '#28A745' : tx.status==='Failed' ? '#DC3545' : '#17A2B8'
                                                    }}>{tx.status}</span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{marginTop:'1.2rem', textAlign:'right'}}>
                                <Link to="/transactions/history" className="btn btn-outline btn-sm">View All</Link>
                            </div>
                        </motion.div>

                        {/* Pending Transactions Card */}
                        <motion.div className="dashboard-card" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.2rem 2rem', display:'flex', flexDirection:'column', alignItems:'flex-start'}} variants={fadeStagger} initial="hidden" animate="visible" custom={2}>
                            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'0.7rem', color:'#17A2B8'}}>Pending Transactions</div>
                            <div style={{fontSize:'2rem', fontWeight:800, color:'#17A2B8', marginBottom:'0.5rem'}}>{mockPending.length} Pending</div>
                            <div style={{marginBottom:'1.2rem', color:'#495057', fontSize:'1.1rem'}}>
                                {mockPending.length === 0 ? 'No pending transactions.' : mockPending.map((tx, i) => (
                                    <div key={tx.id} style={{marginBottom:'0.5rem'}}>
                                        {tx.amount} {tx.currency} - {tx.date}
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-accent">Review</button>
                        </motion.div>

                        {/* Quick Actions Card */}
                        <motion.div className="dashboard-card" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.2rem 2rem', display:'flex', flexDirection:'column', alignItems:'flex-start'}} variants={fadeStagger} initial="hidden" animate="visible" custom={3}>
                            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'1.2rem', color:'#212529'}}>Quick Actions</div>
                            <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
                                <button className="btn btn-primary" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <span style={{fontSize:'1.2rem'}}>➡️</span> Send Money
                                </button>
                                <button className="btn btn-accent" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <span style={{fontSize:'1.2rem'}}>📥</span> Receive Money
                                </button>
                                <button className="btn btn-secondary" style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <span style={{fontSize:'1.2rem'}}>💼</span> Add Funds
                                </button>
                            </div>
                        </motion.div>

                        {/* Currency Breakdown Card */}
                        <motion.div className="dashboard-card" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.2rem 2rem', display:'flex', flexDirection:'column', alignItems:'flex-start'}} variants={fadeStagger} initial="hidden" animate="visible" custom={4}>
                            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'1.2rem', color:'#007BFF'}}>Currency Breakdown</div>
                            <div style={{display:'flex',gap:'2rem',alignItems:'center',flexWrap:'wrap'}}>
                                {/* Pie chart placeholder */}
                                <div style={{width:120,height:120,background:'linear-gradient(135deg,#007BFF 60%,#28A745 100%)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'1.5rem',boxShadow:'0 2px 8px rgba(0,123,255,0.08)'}}>Pie</div>
                                <div>
                                    {Object.entries(mockBalances.breakdown).map(([cur, amt]) => (
                                        <div key={cur} style={{fontWeight:600,color:'#212529',fontSize:'1.1rem',marginBottom:'0.3rem'}}>{cur}: <span style={{color:'#007BFF'}}>{amt}</span></div>
                                    ))}
                                </div>
                            </div>
                            <div style={{marginTop:'1.2rem',color:'#495057',fontSize:'1rem'}}>Total: <span style={{fontWeight:700,color:'#007BFF'}}>{mockBalances.primary} {mockBalances.total.toLocaleString(undefined, {minimumFractionDigits:2})}</span></div>
                        </motion.div>

                        {/* Account Overview Card */}
                        <motion.div className="dashboard-card" style={{background:'#fff', borderRadius:20, boxShadow:'0 4px 24px rgba(0,0,0,0.07)', padding:'2.2rem 2rem', display:'flex', flexDirection:'column', alignItems:'flex-start'}} variants={fadeStagger} initial="hidden" animate="visible" custom={5}>
                            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'1.2rem', color:'#212529'}}>Account Overview</div>
                            <div style={{display:'flex',alignItems:'center',gap:'1.5rem',marginBottom:'1.2rem'}}>
                                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <span style={{fontSize:'1.3rem',color:'#007BFF'}}>💳</span>
                                    <span style={{fontWeight:600}}>{mockWallets} Wallets</span>
                                </div>
                                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <span style={{fontSize:'1.3rem',color:'#28A745'}}>🔒</span>
                                    <span style={{fontWeight:600}}>{mockSecurity.email ? 'Email Verified' : 'Email Not Verified'}</span>
                                </div>
                                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                                    <span style={{fontSize:'1.3rem',color:'#17A2B8'}}>🛡️</span>
                                    <span style={{fontWeight:600}}>{mockSecurity.twoFA ? '2FA Enabled' : '2FA Disabled'}</span>
                                </div>
                            </div>
                            <Link to="/settings" className="btn btn-outline btn-sm">Security Settings</Link>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Dashboard;
