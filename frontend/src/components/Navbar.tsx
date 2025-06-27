import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, handleLogout } = useAuth();

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const menuVariants = {
    closed: { 
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    open: { 
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeInOut' }
    }
  };

  return (
    <motion.nav 
      className="navbar"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">PayHack</span>
            <span className="logo-dot"></span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/send" 
            className={`nav-link ${isActive('/send') ? 'active' : ''}`}
          >
            Send Money
          </Link>
          <Link 
            to="/receive" 
            className={`nav-link ${isActive('/receive') ? 'active' : ''}`}
          >
            Receive Money
          </Link>
          <Link 
            to="/transactions/history" 
            className={`nav-link ${isActive('/transactions/history') ? 'active' : ''}`}
          >
            Transactions
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            Profile
          </Link>
        </div>

        {/* User Actions */}
        <div className="navbar-actions">
          {currentUser ? (
            <div className="user-menu">
              <span className="user-email">{currentUser.email}</span>
              <button className="btn btn-outline btn-sm" onClick={handleLogoutClick}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="mobile-nav"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="mobile-nav-links">
              <Link 
                to="/dashboard" 
                className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/send" 
                className={`mobile-nav-link ${isActive('/send') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Send Money
              </Link>
              <Link 
                to="/receive" 
                className={`mobile-nav-link ${isActive('/receive') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Receive Money
              </Link>
              <Link 
                to="/transactions/history" 
                className={`mobile-nav-link ${isActive('/transactions/history') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Transactions
              </Link>
              <Link 
                to="/profile" 
                className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              {currentUser && (
                <button className="mobile-nav-link logout-btn" onClick={handleLogoutClick}>
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar; 