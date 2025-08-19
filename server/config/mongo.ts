import mongoose from 'mongoose';



const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || '';
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