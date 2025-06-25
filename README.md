# Pay Hack - Secure Payment Application

A full-stack secure payment application with wallet management, transaction tracking, and robust security features.

## Overview

Pay Hack is a comprehensive payment application that demonstrates modern web security practices including JWT authentication, two-factor authentication, email verification, and secure API interactions. The application allows users to create and manage wallets in multiple currencies, perform transactions, and view detailed dashboard analytics.

## Project Structure

The project is divided into two main parts:

- **Frontend**: React/TypeScript application with a modern UI
- **Backend**: Node.js/Express/TypeScript API server with MongoDB

## Features

- **User Authentication**
  - JWT-based authentication flow
  - Email verification
  - Two-factor authentication
  - Automatic token refresh

- **Wallet Management**
  - Multi-currency wallet support
  - Fund deposits
  - Transaction history
  - Wallet summary statistics

- **Dashboard**
  - Visual representation of wallet balances
  - Recent transaction list
  - Summary statistics
  - Quick action links

- **Security**
  - Protected routes
  - Secure API calls
  - Input validation
  - Session management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Setup and Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd pay_hack
   ```

2. Setup the backend:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file with:
   ```
   SECRET_KEY=your_jwt_secret_key
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   ```

4. Setup the frontend:
   ```
   cd ../frontend
   npm install
   ```

5. Run the application:

   In the backend directory:
   ```
   npm run dev
   ```

   In the frontend directory:
   ```
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Documentation

- [Frontend Documentation](./frontend/README.md)
- [Backend API Documentation](./backend/README.md)

## Project Configuration

- **Git Configuration**: The project includes `.gitignore` files at the root, frontend, and backend directories to properly exclude environment-specific files, dependencies, and build artifacts from version control.
  
- **TypeScript**: Both frontend and backend use TypeScript for type safety and better developer experience.

- **Environment Variables**: Sensitive configuration is managed through `.env` files (not included in version control).

## License

This project is licensed under the MIT License.
