import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payments Without Borders API',
      version: '1.0.0',
      description: 'A comprehensive cross-border payment system built with Mojaloop and TypeScript',
      contact: {
        name: 'PayHack Team',
        email: 'support@paymentswithoutborders.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phoneNumber: { type: 'string' },
            country: { type: 'string' },
            currency: { type: 'string' },
            kycStatus: { 
              type: 'string',
              enum: ['pending', 'in_progress', 'approved', 'rejected', 'expired']
            },
            amlStatus: {
              type: 'string',
              enum: ['clear', 'under_review', 'flagged', 'blocked']
            },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            senderId: { type: 'string' },
            receiverId: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            targetCurrency: { type: 'string' },
            exchangeRate: { type: 'number' },
            finalAmount: { type: 'number' },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']
            },
            type: {
              type: 'string',
              enum: ['p2p', 'merchant', 'withdrawal', 'deposit', 'cross_border']
            },
            description: { type: 'string' },
            fees: {
              type: 'object',
              properties: {
                serviceFee: { type: 'number' },
                exchangeFee: { type: 'number' },
                networkFee: { type: 'number' },
                total: { type: 'number' }
              }
            },
            mojaloopTransactionId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            message: { type: 'string' },
            error: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
