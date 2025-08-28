import express from 'express';
import cookieParser from 'cookie-parser'; 
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './service/swaggerConfig';
import userRouter from './routes/users.route';
import quizzRouter from './routes/quizz.route';
import { errHandle } from './middleware/errHandle.middleware';
import serviceRouter from './routes/service.route';
import {gameRouter} from './routes/game.route';
import { reportRouter } from './routes/report.route';
import { config } from './config/config';
import userReportRouter from './routes/bug.report.route'
import { authenticateToken } from './middleware/authenicate.middleware';
import { verifyApiKey } from './middleware/apiKeyVerification.middleware';
import { swaggerPasswordProtect } from './middleware/swaggerProtect.middleware';
const app = express();
app.set('trust proxy', true);
app.use(cors({
  origin: config.frontEndUrl,     
  credentials: true  
}));
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});

// API Routes
app.use('/api/user', verifyApiKey,userRouter);
app.use('/api/quizz',verifyApiKey ,quizzRouter);
app.use('/api-docs',swaggerPasswordProtect ,swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/service',verifyApiKey,serviceRouter)
app.use('/api/session',verifyApiKey,gameRouter)
app.use('/api',verifyApiKey,userReportRouter)
app.use('/api/reports',verifyApiKey,authenticateToken,reportRouter)

app.use(errHandle)  
export default app;
