import React from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
};

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log errorInfo to an error reporting service here
    // console.error(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
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
              ⚠️
            </motion.div>
            <h1 style={{
              fontSize:'3rem',
              fontWeight:900,
              color:'#DC3545',
              marginBottom:'1rem'
            }}>500</h1>
            <p style={{
              fontSize:'1.2rem',
              color:'#495057',
              marginBottom:'2rem',
              lineHeight:1.5
            }}>
              Something went wrong. Please try again later.
            </p>
            <motion.div
              initial={{opacity:0, y:20}} 
              animate={{opacity:1, y:0}} 
              transition={{delay:0.4}}
            >
              <button 
                onClick={this.handleReload}
                style={{
                  background:'#007BFF',
                  color:'#fff',
                  border:'none',
                  padding:'0.8rem 1.5rem',
                  borderRadius:12,
                  fontWeight:600,
                  fontSize:'1rem',
                  cursor:'pointer',
                  transition:'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background='#0056B3'}
                onMouseOut={(e) => e.currentTarget.style.background='#007BFF'}
              >
                🔄 Reload Page
              </button>
            </motion.div>
          </motion.div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 