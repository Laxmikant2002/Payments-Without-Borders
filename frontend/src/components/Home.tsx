import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from './Footer';

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }
};
const cardStagger = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15 + 0.2, duration: 0.7, ease: 'easeOut' } })
};

const howItWorks = [
  {
    icon: <span style={{fontSize:'2.2rem',color:'#007BFF'}}>&#128273;</span>,
    title: 'Connect Wallet',
    desc: 'Connect your Ethereum wallet to access the voting platform securely.'
  },
  {
    icon: <span style={{fontSize:'2.2rem',color:'#007BFF'}}>&#9989;</span>,
    title: 'Cast Your Vote',
    desc: 'Browse active elections, review candidates, and cast your vote securely on the blockchain.'
  },
  {
    icon: <span style={{fontSize:'2.2rem',color:'#007BFF'}}>&#128202;</span>,
    title: 'View Results',
    desc: 'See real-time election results and verify that your vote was recorded correctly.'
  }
];

const benefits = [
  {
    icon: <span style={{fontSize:'2rem',color:'#007BFF'}}>&#128269;</span>,
    title: 'Transparency',
    desc: 'All votes are publicly recorded on the blockchain, ensuring complete transparency.'
  },
  {
    icon: <span style={{fontSize:'2rem',color:'#007BFF'}}>&#128274;</span>,
    title: 'Security',
    desc: 'Cryptographic security ensures votes cannot be tampered with or altered.'
  },
  {
    icon: <span style={{fontSize:'2rem',color:'#007BFF'}}>&#128230;</span>,
    title: 'Immutability',
    desc: 'Once cast, votes are permanently recorded and cannot be modified or deleted.'
  },
  {
    icon: <span style={{fontSize:'2rem',color:'#17A2B8'}}>&#9989;</span>,
    title: 'Verifiability',
    desc: 'Voters can independently verify that their vote was counted correctly.'
  },
  {
    icon: <span style={{fontSize:'2rem',color:'#17A2B8'}}>&#127760;</span>,
    title: 'Accessibility',
    desc: 'Vote from anywhere with an internet connection and Ethereum wallet.'
  },
  {
    icon: <span style={{fontSize:'2rem',color:'#17A2B8'}}>&#128176;</span>,
    title: 'Cost Efficiency',
    desc: 'Reduces the cost and complexity of conducting secure elections.'
  }
];

const Home: React.FC = () => {
  return (
    <div style={{background:'#fff', color:'#212529'}}>
      {/* Hero Section */}
      <motion.section className="hero-section" style={{background:'linear-gradient(90deg, #f5f3ff 0%, #ede7fa 100%)', padding:'4rem 0 3rem 0'}} variants={heroVariants} initial="hidden" animate="visible">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:1200,margin:'0 auto',padding:'0 2rem',gap:'2.5rem',flexWrap:'wrap'}}>
          {/* Left */}
          <div style={{flex:'1 1 420px',minWidth:320}}>
            <div style={{color:'#7C3AED',fontWeight:600,fontSize:'1.1rem',marginBottom:'1.2rem'}}>The Future of Secure Elections</div>
            <h1 style={{fontSize:'3.2rem',fontWeight:900,marginBottom:'0.5rem',lineHeight:1.1}}>
              Welcome to <span style={{color:'#7C3AED'}}>Blockchain Voting</span>
            </h1>
            <p style={{fontSize:'1.25rem',color:'#495057',marginBottom:'2.2rem',maxWidth:520}}>
              Conduct secure and transparent elections using Ethereum blockchain technology. Vote with confidence knowing your ballot is immutable and verifiable.
            </p>
            <div style={{display:'flex',gap:'1.2rem',alignItems:'center'}}>
              <Link to="/register" className="btn btn-primary" style={{boxShadow:'0 4px 16px rgba(0,123,255,0.08)'}}>Connect Wallet</Link>
              <Link to="/login" className="btn btn-outline" style={{background:'#F1F3F9',color:'#212529',border:'none'}}>View Elections</Link>
            </div>
          </div>
          {/* Right Illustration */}
          <motion.div style={{flex:'1 1 340px',minWidth:280,display:'flex',justifyContent:'center',alignItems:'center'}} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{duration:0.8,delay:0.2}}>
            <div style={{background:'#7C3AED',borderRadius:24,padding:'2.5rem 2rem',boxShadow:'0 8px 32px rgba(124,58,237,0.10)',position:'relative',minWidth:220}}>
              <div style={{position:'absolute',top:18,right:18,opacity:0.12}}>
                {/* Hex pattern or SVG can go here */}
                <svg width="90" height="60"><g fill="#fff"><circle cx="15" cy="15" r="7"/><circle cx="45" cy="15" r="7"/><circle cx="75" cy="15" r="7"/><circle cx="30" cy="35" r="7"/><circle cx="60" cy="35" r="7"/><circle cx="45" cy="55" r="7"/></g></svg>
              </div>
              <div style={{fontSize:'2.5rem',color:'#fff',marginBottom:'1.2rem',textAlign:'center'}}>🗳️</div>
              <div style={{fontWeight:700,fontSize:'1.1rem',color:'#fff',marginBottom:'0.7rem',textAlign:'center'}}>Your Vote, Your Power</div>
              <div style={{display:'flex',gap:'0.7rem',justifyContent:'center',marginTop:'1.2rem'}}>
                <div style={{background:'#fff',borderRadius:12,padding:'0.5rem 0.8rem',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',color:'#7C3AED',fontWeight:700,fontSize:'1.2rem'}}>✔️</div>
                <div style={{background:'#fff',borderRadius:12,padding:'0.5rem 0.8rem',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',color:'#7C3AED',fontWeight:700,fontSize:'1.2rem'}}>🔒</div>
                <div style={{background:'#fff',borderRadius:12,padding:'0.5rem 0.8rem',boxShadow:'0 2px 8px rgba(0,0,0,0.04)',color:'#7C3AED',fontWeight:700,fontSize:'1.2rem'}}>📊</div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <section style={{background:'#fff',padding:'3.5rem 0 2.5rem 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 2rem'}}>
          <h2 style={{textAlign:'center',fontWeight:800,fontSize:'2.2rem',marginBottom:'2.5rem',color:'#212529'}}>How It Works</h2>
          <div style={{display:'flex',gap:'2rem',justifyContent:'center',flexWrap:'wrap'}}>
            {howItWorks.map((step,i) => (
              <motion.div key={i} className="how-card" style={{background:'#F8F9FA',borderRadius:18,padding:'2.2rem 2rem',boxShadow:'0 2px 12px rgba(0,0,0,0.04)',minWidth:260,maxWidth:340,flex:'1 1 260px',textAlign:'center'}} variants={cardStagger} initial="hidden" animate="visible" custom={i}>
                <div style={{fontWeight:800,fontSize:'1.1rem',color:'#007BFF',marginBottom:'0.7rem'}}>{i+1}</div>
                <div style={{marginBottom:'1.1rem'}}>{step.icon}</div>
                <div style={{fontWeight:700,fontSize:'1.15rem',marginBottom:'0.7rem',color:'#212529'}}>{step.title}</div>
                <div style={{color:'#495057',fontSize:'1rem'}}>{step.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{background:'#F8F9FA',padding:'3.5rem 0 2.5rem 0'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'0 2rem'}}>
          <h2 style={{textAlign:'center',fontWeight:800,fontSize:'2.2rem',marginBottom:'2.5rem',color:'#212529'}}>Benefits of Blockchain Voting</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'2rem'}}>
            {benefits.map((b,i) => (
              <motion.div key={i} className="benefit-card" style={{background:'#fff',borderRadius:18,padding:'2.2rem 2rem',boxShadow:'0 2px 12px rgba(0,0,0,0.04)',textAlign:'left',display:'flex',flexDirection:'column',alignItems:'flex-start'}} variants={cardStagger} initial="hidden" animate="visible" custom={i}>
                <div style={{marginBottom:'1.1rem'}}>{b.icon}</div>
                <div style={{fontWeight:700,fontSize:'1.15rem',marginBottom:'0.7rem',color:'#212529'}}>{b.title}</div>
                <div style={{color:'#495057',fontSize:'1rem'}}>{b.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;