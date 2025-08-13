import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './service/swaggerConfig';
import { userRouter } from './routes/users.route';
import { quizzRouter } from './routes/quizz.route';
import { errorHandler } from './middleware/errHandle.middleware';
import { serviceRouter } from './routes/service.route';
import { docsRouter } from './routes/docs.route';
// import { createRandomGameHistory,createRandomGameSession,createRandomQuiz,createRandomUserData,createRandomVerificationCode } from './faker/seed';
import { runSeed } from './config/seed'; 
import gameRouter from './routes/game.route';

const app = express();

app.use(cors({
    origin:"http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});

// Test page route
app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'api-tester.html'));
});

// API Routes
app.use('/api/user', userRouter);
app.use('/api/quizz', quizzRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/service',serviceRouter)
app.use('/api/games',gameRouter)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'QuizFun API Documentation'
}));

app.use(errorHandler)
// runSeed();   
export default app;
