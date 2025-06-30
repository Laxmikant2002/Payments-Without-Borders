# Payments Without Borders - Frontend

A modern React TypeScript frontend application for the cross-border payment system powered by Mojaloop.

## 🚀 Features

### Authentication & Security
- Secure login/register with JWT tokens
- Two-factor authentication (2FA)
- Password reset functionality
- Session management
- Role-based access control (User/Admin)

### Payment Features
- **Domestic Transfers**: Send money within the same country
- **Cross-Border Payments**: International transfers via Mojaloop
- **Real-time Exchange Rates**: Live currency conversion
- **Transaction History**: Comprehensive transaction tracking
- **Payment Receipts**: Downloadable transaction receipts

### KYC & Compliance
- Document upload and verification
- Real-time KYC status updates
- Address verification
- Phone and email verification
- Compliance requirement checking by country

### Real-time Features
- WebSocket integration for live updates
- Real-time transaction status changes
- Instant notifications
- Live exchange rate updates
- System alerts and announcements

### User Experience
- Responsive Material-UI design
- Dark/Light theme support
- Multi-language support (coming soon)
- Offline capability (coming soon)
- Progressive Web App (PWA) features

### Admin Features
- User management and oversight
- KYC review and approval
- Transaction monitoring
- System health dashboard
- Mojaloop integration management

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Form Handling**: React Hook Form
- **Validation**: Yup
- **Build Tool**: Vite
- **Development**: Hot Module Replacement

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── common/          # Common/shared components
│   ├── dashboard/       # Dashboard specific components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   ├── notifications/   # Notification components
│   ├── transactions/    # Transaction components
│   └── user/            # User profile components
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   ├── auth/            # Authentication pages
│   └── error/           # Error pages
├── services/            # API services
├── store/               # Redux store and slices
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── assets/              # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API server running on port 8000

### Installation

1. **Clone and setup:**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_SOCKET_URL=http://localhost:8000
   VITE_APP_NAME=Payments Without Borders
   VITE_APP_VERSION=1.0.0
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🏗️ Key Components

### Service Layer
- **authService**: Authentication and user management
- **transactionService**: Payment processing and history
- **userService**: User profile and preferences
- **complianceService**: KYC and document management
- **notificationService**: Real-time notifications
- **mojaloopService**: Mojaloop integration
- **socketService**: WebSocket real-time communication

### State Management
- **authSlice**: User authentication state
- **transactionSlice**: Transaction data and operations
- **userSlice**: User profile information
- **notificationSlice**: Notification management
- **complianceSlice**: KYC and compliance status
- **mojaloopSlice**: Mojaloop connection status
- **uiSlice**: UI state and preferences

### Pages & Components
- **Authentication**: Login, Register, Password Reset
- **Dashboard**: Account overview and quick actions
- **Payments**: Send money forms and transaction history
- **Profile**: User settings and preferences
- **KYC**: Document upload and verification
- **Admin**: User management and system monitoring

## 🌐 API Integration

The frontend integrates with the backend REST API:

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: Bearer JWT tokens
- **Real-time**: WebSocket connection for live updates
- **File Upload**: Multipart form data for documents

### Key Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /transactions` - Get transactions
- `POST /cross-border/transfers` - Initiate cross-border transfer
- `GET /compliance/kyc-status` - Get KYC status
- `POST /mojaloop/party-lookup` - Lookup payment recipient

## 🔐 Security Features

- JWT token authentication with refresh
- Automatic token refresh handling
- Protected routes with role-based access
- Secure file upload with validation
- XSS and CSRF protection
- Input validation and sanitization

## 📱 Responsive Design

The application is fully responsive and works across:
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet devices (iPad, Android tablets)
- Mobile phones (iOS, Android)
- Progressive Web App (PWA) capabilities

## 🌍 Internationalization

Future support for multiple languages:
- English (default)
- French
- Spanish
- Portuguese
- Swahili

## 🚀 Performance Optimizations

- Code splitting with React.lazy()
- Image optimization and lazy loading
- Bundle size optimization with Vite
- Service worker for caching (coming soon)
- Virtualized lists for large datasets

## 🧪 Testing (Coming Soon)

- Unit tests with Jest and React Testing Library
- Integration tests for API services
- E2E tests with Cypress
- Performance testing with Lighthouse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for financial inclusion and cross-border payments.
