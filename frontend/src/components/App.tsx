import React from 'react';
import AppRoutes from '../routes';
import { AuthProvider } from '../contexts/AuthContext';
import TokenRefresher from './TokenRefresher';

const App: React.FC = () => {
    return (
        <AuthProvider>
            <TokenRefresher />
            <AppRoutes />
        </AuthProvider>
    );
};

export default App;