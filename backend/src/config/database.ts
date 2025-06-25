import mongoose from 'mongoose';

export const connectDatabase = async () => {
    try {
        // Set global options to address deprecation warnings
        mongoose.set('strictQuery', false);
        
        const connection = await mongoose.connect(process.env.DATABASE_URL || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        } as mongoose.ConnectOptions);
        
        console.log(`MongoDB Atlas connected: ${connection.connection.host}`);
    } catch (error: any) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};