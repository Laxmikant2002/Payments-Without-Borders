import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
    const { isLoggedIn, currentUser, handleLogout } = useAuth();
    const navigate = useNavigate();

    const onLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            handleLogout();
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    return (
        <nav className="main-navigation">
            <div className="nav-brand">
                <h2>PayHack</h2>
            </div>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                
                {isLoggedIn ? (
                    <>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li className="user-menu">
                            <span className="user-greeting">
                                Hello, {currentUser?.name?.split(' ')[0] || 'User'}
                            </span>
                            <button onClick={onLogout} className="logout-button">Logout</button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navigation;
