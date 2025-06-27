import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

const NotFound: React.FC = () => (
  <div style={{background:'#fff', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
    <motion.div 
      variants={cardVariants} 
      initial="hidden" 
      animate="visible"
      style={{
        background:'#fff',
        borderRadius:20,
        boxShadow:'0 4px 24px rgba(0,0,0,0.07)',
        padding:'3rem 2rem',
        maxWidth:500,
        width:'100%',
        textAlign:'center'
      }}
    >
      <motion.div 
        initial={{opacity:0, scale:0.8}} 
        animate={{opacity:1, scale:1}} 
        transition={{delay:0.2}}
        style={{fontSize:'4rem', marginBottom:'1rem'}}
      >
        🚫
      </motion.div>
      <h1 style={{
        fontSize:'3.5rem',
        fontWeight:900,
        color:'#007BFF',
        marginBottom:'1rem'
      }}>404</h1>
      <p style={{
        fontSize:'1.2rem',
        color:'#495057',
        marginBottom:'2rem',
        lineHeight:1.5
      }}>
        Sorry, the page you are looking for does not exist.
      </p>
      <motion.div
        initial={{opacity:0, y:20}} 
        animate={{opacity:1, y:0}} 
        transition={{delay:0.4}}
      >
        <Link 
          to="/dashboard" 
          style={{
            background:'#007BFF',
            color:'#fff',
            textDecoration:'none',
            padding:'0.8rem 1.5rem',
            borderRadius:12,
            fontWeight:600,
            fontSize:'1rem',
            display:'inline-block',
            transition:'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background='#0056B3'}
          onMouseOut={(e) => e.currentTarget.style.background='#007BFF'}
        >
          🏠 Go To Dashboard
        </Link>
      </motion.div>
    </motion.div>
  </div>
);

export default NotFound; 