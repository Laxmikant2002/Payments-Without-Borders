import React, { ErrorInfo, ReactNode } from 'react';
import AppRoutes from '../routes';
import { AuthProvider } from '../contexts/AuthContext';
import TokenRefresher from './TokenRefresher';

// Error boundary component to gracefully handle rendering errors
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Application error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <h1>Something went wrong.</h1>
                    <p>The application encountered an error. Please refresh the page or try again later.</p>
                    <button onClick={() => this.setState({ hasError: false })}>Try again</button>
                </div>
            );
        }

        return this.props.children;
    }
}

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <TokenRefresher />
                <AppRoutes />
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
