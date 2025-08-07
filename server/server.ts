import { Server } from 'http';
import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/mongo';
require('events').EventEmitter.defaultMaxListeners = 15;

dotenv.config();

connectDB()
const httpServer = new Server(app);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
