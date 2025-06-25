import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Layout: React.FC = () => {
    return (
        <div className="app-container">
            <Navigation />
            <main className="content">
                <Outlet />
            </main>
            <footer className="app-footer">
                <p>© 2025 PayHack. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
