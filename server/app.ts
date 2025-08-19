import express from 'express';
import cookieParser from 'cookie-parser'; 
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './service/swaggerConfig';
import { userRouter } from './routes/users.route';
import { quizzRouter } from './routes/quizz.route';
import { errorHandler } from './middleware/errHandle.middleware';
import { serviceRouter } from './routes/service.route';
import { runSeed } from './config/seed'; 
import {gameRouter} from './routes/game.route';
const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
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

app.use(errorHandler)
// runSeed();   
export default app;
