import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import connectDB from './config/mongo';
import socketSetup from './config/socket';

require('events').EventEmitter.defaultMaxListeners = 15;

dotenv.config();
connectDB();

const httpServer = http.createServer(app);

socketSetup(httpServer);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
