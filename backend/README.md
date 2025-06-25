# Pay Hack - Backend API

This is the backend service for the Pay Hack secure payment application, built with Node.js, Express, TypeScript, and MongoDB (via Mongoose). It provides secure API endpoints for user authentication, wallet management, transactions, and security features.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pay-hack.git
   ```

2. Navigate to the project directory:
   ```
   cd pay_hack/backend
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Create a `.env` file based on the `.env.example` file and fill in the required environment variables:
   ```
   SECRET_KEY=your_jwt_secret_key
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

2. Start the application:
   ```
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

3. Run tests:
   ```
   npm test
   ```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate a user and return JWT
- `POST /auth/refresh-token` - Refresh JWT access token

### Security
- `POST /auth/verify-email/send` - Send email verification link
- `POST /auth/verify-email/confirm` - Confirm email verification
- `POST /auth/2fa/setup` - Set up two-factor authentication
- `POST /auth/2fa/verify` - Verify and enable 2FA

### Wallet Management
- `POST /wallet` - Create a new wallet
- `GET /wallet` - Get all user wallets
- `GET /wallet/:id` - Get a specific wallet by ID
- `POST /wallet/:id/deposit` - Add funds to wallet
- `GET /wallet/transactions/recent` - Get recent transactions
- `GET /wallet/summary` - Get wallet summary with total balance

### User Management
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile

## Folder Structure

```
backend
├── src
│   ├── app.ts               # Application entry point
│   ├── controllers          # API route controllers
│   │   ├── auth.controller.ts     # Authentication controller
│   │   ├── security.controller.ts # Security features controller
│   │   ├── wallet.controller.ts   # Wallet operations controller
│   │   └── index.ts
│   ├── middleware           # Express middleware
│   │   ├── auth.middleware.ts      # JWT authentication middleware
│   │   ├── validation.middleware.ts # Request validation
│   │   └── index.ts
│   ├── models               # MongoDB/Mongoose models
│   │   ├── user.model.ts          # User model with auth fields
│   │   ├── wallet.model.ts        # Wallet model
│   │   ├── transaction.model.ts   # Transaction model
│   │   └── index.ts
│   ├── routes               # API route definitions
│   │   ├── auth.routes.ts         # Authentication routes
│   │   ├── security.routes.ts     # Security feature routes
│   │   ├── wallet.routes.ts       # Wallet management routes
│   │   ├── user.routes.ts         # User management routes
│   │   └── index.ts
│   ├── config               # Configuration files
│   │   └── database.ts            # MongoDB connection setup
│   └── types                # TypeScript type definitions
├── tests                    # Test files
├── package.json             # NPM package configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Security Features

- JWT Authentication with automatic token refresh
- Password hashing with bcrypt
- Email verification
- Two-factor authentication
- Protected routes with authentication middleware

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.