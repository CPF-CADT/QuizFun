import http  from 'http';
import { config } from './config/config';
import app from './app';
import connectDB from './config/mongo';
import socketSetup from './config/socket';

require('events').EventEmitter.defaultMaxListeners = 15;

connectDB();

const httpServer = http.createServer(app);
socketSetup(httpServer);

httpServer.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
});
