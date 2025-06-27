import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const linkVariants = {
    hover: { 
      y: -2,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  };

  return (
    <motion.footer 
      className="footer"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <motion.div className="footer-brand" variants={linkVariants} whileHover="hover">
              <h3 className="footer-logo">PayHack</h3>
              <p className="footer-description">
                Making global payments simple, fast, and secure.
              </p>
            </motion.div>
            <div className="social-links">
              <motion.a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                variants={linkVariants}
                whileHover="hover"
                aria-label="Twitter"
              >
                <span className="social-icon">🐦</span>
              </motion.a>
              <motion.a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                variants={linkVariants}
                whileHover="hover"
                aria-label="LinkedIn"
              >
                <span className="social-icon">💼</span>
              </motion.a>
              <motion.a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="social-link"
                variants={linkVariants}
                whileHover="hover"
                aria-label="GitHub"
              >
                <span className="social-icon">📚</span>
              </motion.a>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-section">
            <h4 className="footer-title">Product</h4>
            <ul className="footer-links">
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/features" className="footer-link">Features</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/pricing" className="footer-link">Pricing</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/api" className="footer-link">API</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/security" className="footer-link">Security</Link>
              </motion.li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/about" className="footer-link">About</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/careers" className="footer-link">Careers</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/press" className="footer-link">Press</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/blog" className="footer-link">Blog</Link>
              </motion.li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/help" className="footer-link">Help Center</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/contact" className="footer-link">Contact</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/status" className="footer-link">Status</Link>
              </motion.li>
              <motion.li variants={linkVariants} whileHover="hover">
                <Link to="/support" className="footer-link">Support</Link>
              </motion.li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <motion.div className="legal-links" variants={linkVariants} whileHover="hover">
              <Link to="/terms" className="legal-link">Terms of Service</Link>
              <Link to="/privacy" className="legal-link">Privacy Policy</Link>
              <Link to="/cookies" className="legal-link">Cookie Policy</Link>
            </motion.div>
            <div className="footer-copyright">
              © 2025 PayHack. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer; 