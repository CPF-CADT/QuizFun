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
import soloRouter from './routes/solo.routes'
import teamRouter from './routes/team.route'
// import { } from './middleware/apiKeyVerification.middleware';
import { swaggerPasswordProtect } from './middleware/swaggerProtect.middleware';
// import rateLimit from 'express-rate-limit';
const app = express();

app.use(cors({
  origin: config.frontEndUrl,     
  credentials: true  
}));
app.use(express.json());
app.use(cookieParser());
app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // Limit each IP to 100 requests per window
//     standardHeaders: true,
//     legacyHeaders: false,
//     // The 'trustProxy' setting is no longer needed here if set globally
// });
// app.use(limiter);


// API Routes
app.use('/api/user',userRouter);
app.use('/api/quizz' ,quizzRouter);
app.use('/api-docs',swaggerPasswordProtect ,swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/service',serviceRouter)
app.use('/api/session',gameRouter)
app.use('/api',userReportRouter)
app.use('/api/solo',soloRouter)
app.use('/api/teams',teamRouter)
app.use('/api/reports',reportRouter)

app.use(errHandle)  
export default app;
