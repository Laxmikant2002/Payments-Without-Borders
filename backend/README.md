# Payments Without Borders - Backend

A comprehensive TypeScript-based payment system leveraging Mojaloop for real-time cross-border transactions.

## 🚀 Features

- **Real-time Transaction Processing**: Instant payment processing with WebSocket support
- **Multi-currency Support**: Handle transactions in multiple currencies with real-time exchange rates
- **Mojaloop Integration**: Built on the open-source Mojaloop platform for inclusive payment systems
- **KYC/AML Compliance**: Comprehensive compliance framework for international regulations
- **Security First**: JWT authentication, encryption, rate limiting, and security headers
- **Scalable Architecture**: Microservices-ready with Redis caching and MongoDB
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Real-time Monitoring**: Transaction tracking and system health monitoring

## 🏗️ Architecture

```
├── src/
│   ├── controllers/         # API route handlers
│   ├── services/           # Business logic layer
│   ├── middleware/         # Express middleware
│   ├── models/            # Database models
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── routes/            # API route definitions
```

## 🛠️ Technology Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis
- **Payment Platform**: Mojaloop SDK
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.IO
- **Testing**: Jest
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js (v18+)
- MongoDB
- Redis
- Docker (optional)

## 🚀 Getting Started

### Quick Setup (Windows)

1. **Run the setup script**:
   ```powershell
   npm run setup:windows
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Test Mojaloop integration**:
   ```bash
   npm run test:mojaloop
   ```

### Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Configuration

Set the following environment variables:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/payments
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
MOJALOOP_HUB_ENDPOINT=http://localhost:3001
```

## 📖 API Documentation

Once running, visit `http://localhost:3000/api-docs` for interactive API documentation.

## 🧪 Testing

```bash
npm test
npm run test:watch
```

## 🐳 Docker Support

```bash
npm run docker:build
npm run docker:run
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.
