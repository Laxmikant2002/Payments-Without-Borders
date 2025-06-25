# Pay Hack - Secure Payment Application

This is a secure payment application built using React with TypeScript, featuring JWT authentication, wallet management, transaction tracking, and a comprehensive dashboard. The application includes secure routing, two-factor authentication, email verification, and secure API interactions using Axios.

### Prerequisites

Make sure you have the following installed:

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```
   cd pay_hack/frontend
   ```

3. Install the dependencies:

   ```
   npm install
   ```

### Running the Application

To run the application in development mode, use the following command:

```
npm start
```

This will start the development server and open the application in your default web browser.

### Building for Production

To build the application for production, use the following command:

```
npm run build
```

This will create an optimized build of the application in the `build` directory.

### Folder Structure

- `public/`: Contains static files like `index.html` and `favicon.ico`.
- `src/`: Contains the source code for the application.
  - `components/`: React components for the UI.
    - `App.tsx`: Main application component.
    - `Dashboard.tsx`: Dashboard component showing wallet balances and transactions.
    - `Layout.tsx`: Layout wrapper for consistent UI.
    - `Login.tsx` & `Register.tsx`: Authentication forms.
    - `Navigation.tsx`: Navigation bar component.
    - `Wallet.tsx`: Wallet management interface.
    - `Security.tsx`: Two-factor authentication and email verification.
    - `Transactions.tsx`: Transaction history component.
    - `TokenRefresher.tsx`: Background component for JWT refresh.
    - `AuthGuard.tsx`: Route protection component.
  - `contexts/`: React context providers.
    - `AuthContext.tsx`: Authentication context for user state management.
  - `hooks/`: Custom React hooks.
    - `useApi.ts`: Hook for API interactions.
    - `useForm.ts`: Form handling hook.
  - `routes/`: Routing configuration.
    - `index.tsx`: Main route definitions with auth protection.
  - `services/`: API and business logic.
    - `api.ts`: API configuration and request helpers.
    - `auth.ts`: Authentication service.
    - `wallet.ts`: Wallet and transaction services.
  - `types/`: TypeScript type definitions.
- `package.json`: Project metadata and dependencies.
- `tsconfig.json`: TypeScript configuration file.

### Features

- **Secure Authentication**
  - JWT-based authentication with automatic token refresh
  - Two-factor authentication (2FA)
  - Email verification
  - Protected routes

- **Wallet Management**
  - Create wallets in multiple currencies
  - View wallet balances and details
  - Deposit funds to wallets
  - Track transaction history

- **Dashboard**
  - Summary of total balances across all wallets
  - Currency breakdown visualization
  - Recent transactions list
  - Wallet quick view

- **Security**
  - Secure API calls with token authentication
  - Protected routes with AuthGuard
  - Input validation

### Backend Integration

This frontend application connects to a Node.js/Express backend (in the `../backend` directory) that provides the following:

- User authentication and management API
- Wallet and transaction API
- Security features like 2FA and email verification

To run the complete application, make sure to also set up and run the backend service.

### License

This project is licensed under the MIT License.