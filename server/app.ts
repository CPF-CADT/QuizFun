import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './service/swaggerConfig';
import { userRouter } from './routes/users.route';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.redirect('/api-docs/');
});

app.use('/api/user', userRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
