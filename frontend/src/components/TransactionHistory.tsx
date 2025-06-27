import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const mockTransactions = [
  { id: 1, date: '2024-06-01', type: 'Send', amount: 100, currency: 'USD', status: 'Completed', recipient: 'alice@example.com' },
  { id: 2, date: '2024-06-02', type: 'Receive', amount: 50, currency: 'EUR', status: 'Completed', recipient: 'bob@example.com' },
  { id: 3, date: '2024-06-03', type: 'Send', amount: 200, currency: 'INR', status: 'Pending', recipient: 'carol@example.com' },
  { id: 4, date: '2024-06-04', type: 'Receive', amount: 75, currency: 'GBP', status: 'Failed', recipient: 'dave@example.com' },
];

const currencies = ['All', 'USD', 'EUR', 'GBP', 'INR'];
const types = ['All', 'Send', 'Receive'];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const TransactionHistory: React.FC = () => {
  const [filterCurrency, setFilterCurrency] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'confirm' | 'success' | 'error' | null>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const filtered = mockTransactions.filter(tx =>
    (filterCurrency === 'All' || tx.currency === filterCurrency) &&
    (filterType === 'All' || tx.type === filterType) &&
    (filterStatus === 'All' || tx.status === filterStatus)
  );

  const openModal = (type: 'confirm' | 'success' | 'error', tx: any) => {
    setModalType(type);
    setSelectedTx(tx);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setSelectedTx(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#28A745';
      case 'Pending': return '#FFC107';
      case 'Failed': return '#DC3545';
      default: return '#6C757D';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Send' ? '📤' : '📥';
  };

  return (
    <div style={{background:'#fff', minHeight:'100vh', padding:'2rem 0'}}>
      <div style={{maxWidth:1000, margin:'0 auto', padding:'0 2rem'}}>
        <motion.div 
          initial={{opacity:0, y:40}} 
          animate={{opacity:1, y:0}}
          style={{
            background:'#fff',
            borderRadius:20,
            boxShadow:'0 4px 24px rgba(0,0,0,0.07)',
            padding:'2.5rem 2rem'
          }}
        >
          <h1 style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem', textAlign:'center'}}>
            Transaction History
          </h1>
          <p style={{color:'#495057', textAlign:'center', marginBottom:'2rem'}}>
            View and manage your payment transactions
          </p>
          
          <div style={{textAlign:'center', color:'#6C757D', fontSize:'1rem'}}>
            📊 Transaction history will be displayed here
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{opacity:0}} 
            animate={{opacity:1}} 
            exit={{opacity:0}}
            style={{
              position:'fixed',
              top:0,
              left:0,
              width:'100vw',
              height:'100vh',
              background:'rgba(0,0,0,0.5)',
              zIndex:1000,
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              padding:'2rem'
            }}
            onClick={closeModal}
          >
            <motion.div 
              initial={{opacity:0, scale:0.9}} 
              animate={{opacity:1, scale:1}} 
              exit={{opacity:0, scale:0.9}}
              style={{
                background:'#fff',
                borderRadius:20,
                padding:'2rem',
                maxWidth:400,
                width:'100%',
                position:'relative',
                textAlign:'center'
              }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <button 
                onClick={closeModal} 
                style={{
                  position:'absolute',
                  top:16,
                  right:16,
                  background:'none',
                  border:'none',
                  color:'#6C757D',
                  fontSize:'1.5rem',
                  cursor:'pointer',
                  width:32,
                  height:32,
                  borderRadius:'50%',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  transition:'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background='#F8F9FA'}
                onMouseOut={(e) => e.currentTarget.style.background='transparent'}
              >
                ×
              </button>

              {modalType === 'confirm' && selectedTx && (
                <>
                  <div style={{fontSize:'2.5rem', marginBottom:'1rem'}}>📋</div>
                  <h3 style={{marginBottom:'1.5rem', color:'#212529', fontWeight:700}}>Transaction Details</h3>
                  <div style={{marginBottom:'1.5rem', textAlign:'left'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color:'#6C757D'}}>Date:</span>
                      <span style={{fontWeight:600, color:'#212529'}}>{selectedTx.date}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color:'#6C757D'}}>Type:</span>
                      <span style={{fontWeight:600, color:'#212529'}}>{selectedTx.type}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color:'#6C757D'}}>Amount:</span>
                      <span style={{fontWeight:600, color:'#212529'}}>{selectedTx.amount} {selectedTx.currency}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                      <span style={{color:'#6C757D'}}>Status:</span>
                      <span style={{fontWeight:600, color:getStatusColor(selectedTx.status)}}>{selectedTx.status}</span>
                    </div>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <span style={{color:'#6C757D'}}>Recipient:</span>
                      <span style={{fontWeight:600, color:'#212529'}}>{selectedTx.recipient}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {closeModal(); setTimeout(()=>openModal('success', selectedTx), 500);}}
                    style={{
                      background:'#007BFF',
                      color:'#fff',
                      border:'none',
                      borderRadius:12,
                      padding:'0.8rem 1.5rem',
                      fontWeight:600,
                      cursor:'pointer',
                      transition:'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background='#0056B3'}
                    onMouseOut={(e) => e.currentTarget.style.background='#007BFF'}
                  >
                    Confirm
                  </button>
                </>
              )}

              {modalType === 'success' && (
                <>
                  <div style={{fontSize:'2.5rem', marginBottom:'1rem', color:'#28A745'}}>✅</div>
                  <h3 style={{marginBottom:'1rem', color:'#212529', fontWeight:700}}>Transaction Confirmed</h3>
                  <button 
                    onClick={closeModal}
                    style={{
                      background:'#007BFF',
                      color:'#fff',
                      border:'none',
                      borderRadius:12,
                      padding:'0.8rem 1.5rem',
                      fontWeight:600,
                      cursor:'pointer',
                      transition:'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background='#0056B3'}
                    onMouseOut={(e) => e.currentTarget.style.background='#007BFF'}
                  >
                    Close
                  </button>
                </>
              )}

              {modalType === 'error' && (
                <>
                  <div style={{fontSize:'2.5rem', marginBottom:'1rem', color:'#DC3545'}}>❌</div>
                  <h3 style={{marginBottom:'1rem', color:'#212529', fontWeight:700}}>Transaction Failed</h3>
                  <button 
                    onClick={closeModal}
                    style={{
                      background:'#007BFF',
                      color:'#fff',
                      border:'none',
                      borderRadius:12,
                      padding:'0.8rem 1.5rem',
                      fontWeight:600,
                      cursor:'pointer',
                      transition:'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background='#0056B3'}
                    onMouseOut={(e) => e.currentTarget.style.background='#007BFF'}
                  >
                    Close
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionHistory; 