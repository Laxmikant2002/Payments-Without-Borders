import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { KYCStatus, AMLStatus } from '../types';
import { connectDatabase } from '../config/database';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

async function createAdminUser() {
  try {
    await connectDatabase();
    logger.info('Connected to database for admin user creation');

    const adminEmail = 'admin@paymentswithoutborders.com';
    const adminPassword = 'admin123456';

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      logger.info('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phoneNumber: '+1000000000',
      dateOfBirth: new Date('1990-01-01'),
      country: 'US',
      currency: 'USD',
      kycStatus: KYCStatus.APPROVED,
      amlStatus: AMLStatus.CLEAR,
      isActive: true
    });

    await adminUser.save();
    logger.info('Admin user created successfully', { email: adminEmail });
    console.log('Admin user created:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Please change the password after first login.');

    process.exit(0);
  } catch (error) {
    logger.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdminUser();
