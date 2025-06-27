import React, { useState } from 'react';
import { motion } from 'framer-motion';

const currencies = ['USD', 'EUR', 'GBP', 'INR'];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const ReceiveMoney: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestLink, setRequestLink] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        setError('Please enter a valid amount.');
        setLoading(false);
        return;
      }
      setRequestLink(`https://payhack.app/request?amount=${amount}&currency=${currency}&note=${encodeURIComponent(note)}`);
      setShowQR(true);
      setLoading(false);
    }, 1200);
  };

  return (
    <div style={{background:'#fff', minHeight:'100vh', padding:'2rem 0'}}>
      <div style={{maxWidth:500, margin:'0 auto', padding:'0 2rem'}}>
        <motion.div 
          variants={cardVariants} 
          initial="hidden" 
          animate="visible"
          style={{
            background:'#fff',
            borderRadius:20,
            boxShadow:'0 4px 24px rgba(0,0,0,0.07)',
            padding:'2.5rem 2rem'
          }}
        >
          <h1 style={{fontWeight:900, fontSize:'2.2rem', color:'#007BFF', marginBottom:'0.5rem', textAlign:'center'}}>
            Receive Money
          </h1>
          <p style={{color:'#495057', textAlign:'center', marginBottom:'2rem'}}>
            Generate payment requests and QR codes
          </p>

          {error && (
            <motion.div 
              initial={{opacity:0, y:-10}} 
              animate={{opacity:1, y:0}}
              style={{
                background:'#F8D7DA',
                color:'#721C24',
                padding:'1rem',
                borderRadius:12,
                marginBottom:'1.5rem',
                border:'1px solid #F5C6CB'
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{display:'grid', gap:'1.2rem'}}>
              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.1}}
              >
                <label htmlFor="amount" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{
                    width:'100%',
                    padding:'0.8rem 1rem',
                    borderRadius:12,
                    border:'1px solid #E9ECEF',
                    fontSize:'1rem',
                    transition:'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor='#007BFF'}
                  onBlur={(e) => e.target.style.borderColor='#E9ECEF'}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  autoComplete="off"
                />
              </motion.div>

              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.2}}
              >
                <label htmlFor="currency" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  style={{
                    width:'100%',
                    padding:'0.8rem 1rem',
                    borderRadius:12,
                    border:'1px solid #E9ECEF',
                    fontSize:'1rem',
                    background:'#fff',
                    transition:'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor='#007BFF'}
                  onBlur={(e) => e.target.style.borderColor='#E9ECEF'}
                >
                  {currencies.map(cur => (
                    <option key={cur} value={cur}>{cur}</option>
                  ))}
                </select>
              </motion.div>

              <motion.div 
                initial={{opacity:0, x:-20}} 
                animate={{opacity:1, x:0}} 
                transition={{delay:0.3}}
              >
                <label htmlFor="note" style={{fontWeight:600, color:'#212529', display:'block', marginBottom:'0.5rem'}}>Note (optional)</label>
                <input
                  type="text"
                  id="note"
                  name="note"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{
                    width:'100%',
                    padding:'0.8rem 1rem',
                    borderRadius:12,
                    border:'1px solid #E9ECEF',
                    fontSize:'1rem',
                    transition:'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor='#007BFF'}
                  onBlur={(e) => e.target.style.borderColor='#E9ECEF'}
                  placeholder="Add a note for the payer"
                  autoComplete="off"
                />
              </motion.div>
            </div>

            <motion.button 
              type="submit" 
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}} 
              transition={{delay:0.4}}
              style={{
                width:'100%',
                background:'#007BFF',
                color:'#fff',
                border:'none',
                borderRadius:12,
                padding:'1rem 1.5rem',
                fontWeight:700,
                fontSize:'1.1rem',
                marginTop:'1.5rem',
                cursor:'pointer',
                transition:'all 0.2s ease'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#0056B3'}
              onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.background='#007BFF'}
              disabled={loading}
            >
              {loading ? <span>⏳ Generating...</span> : '📱 Generate Request'}
            </motion.button>
          </form>

          {showQR && requestLink && (
            <motion.div 
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}} 
              transition={{delay:0.5}}
              style={{
                marginTop:'2rem',
                textAlign:'center',
                padding:'1.5rem',
                background:'#F8F9FA',
                borderRadius:16,
                border:'1px solid #E9ECEF'
              }}
            >
              <div style={{marginBottom:'1.5rem'}}>
                <div style={{
                  width:140,
                  height:140,
                  background:'#007BFF',
                  borderRadius:16,
                  display:'inline-flex',
                  alignItems:'center',
                  justifyContent:'center',
                  margin:'0 auto',
                  boxShadow:'0 4px 16px rgba(0,123,255,0.2)'
                }}>
                  <span style={{color:'#fff',fontSize:'3rem'}}>🔳</span>
                </div>
              </div>
              <div style={{marginBottom:'1rem', wordBreak:'break-all'}}>
                <a 
                  href={requestLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                    color:'#007BFF',
                    textDecoration:'underline',
                    fontSize:'0.9rem',
                    fontWeight:500
                  }}
                >
                  {requestLink}
                </a>
              </div>
              <div style={{color:'#6C757D', fontSize:'0.9rem'}}>
                Share this link or QR code to receive payment
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReceiveMoney; 