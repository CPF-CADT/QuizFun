import mongoose from 'mongoose';
import { config } from './config';

const connectDB = async () => {
  try {

const mongoURI = config.mongoURI;
    console.log('Connecting to MongoDB.'); 
    
    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;