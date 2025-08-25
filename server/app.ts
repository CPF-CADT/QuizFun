import express from 'express';
import cookieParser from 'cookie-parser'; 
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './service/swaggerConfig';
import userRouter from './routes/users.route';
import quizzRouter from './routes/quizz.route';
import { errHandle } from './middleware/errHandle.middleware';
import { serviceRouter } from './routes/service.route';
import {gameRouter} from './routes/game.route';
import { reportRouter } from './routes/report.route';
import { config } from './config/config';
import { authenticateToken } from './middleware/authenicate.middleware';
const app = express();

// const allowedOrigins = [   
//   'http://localhost:5173',    
//   'https://quiz-fun-ebon.vercel.app'
// ];

app.use(cors({
  origin: true,      // allow all origins
  credentials: true  // allow cookies/auth headers
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});

// API Routes
app.use('/api/user', userRouter);
app.use('/api/quizz', quizzRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/service',serviceRouter)
app.use('/api/session',gameRouter)
app.use('/api/reports',authenticateToken,reportRouter)

app.use(errHandle)  
export default app;
