import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './service/swaggerConfig';
import { userRouter } from './routes/users.route';
import { quizzRouter } from './routes/quizz.route';
import { errorHandler } from './middleware/errHandle.middleware';
import { serviceRouter } from './routes/service.route';
// import { createRandomGameHistory,createRandomGameSession,createRandomQuiz,createRandomUserData,createRandomVerificationCode } from './faker/seed';
import { runSeed } from './config/seed'; 
import { gameRouter } from './routes/game.route';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});

app.use('/api/user', userRouter);
app.use('/api/quizz', quizzRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/service',serviceRouter)
app.use('/api/game',gameRouter)

app.use(errorHandler)
runSeed();
export default app;
