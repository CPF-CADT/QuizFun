import express from 'express'
<<<<<<< refs/remotes/origin/chhunhour
import {addQuestionForQuizz,createQuizz, deleteOption, deleteQuestion, getAllQuizzes, getQuizzById, getQuizzByUser, updateOption, updateQuestion,deleteQuizz} from '../controller/quizz.controller'

export const quizzRouter = express.Router();

quizzRouter.get('/', getAllQuizzes); 
=======
import {addQuestionForQuizz,createQuizz, deleteOption, deleteQuestion, getAllQuizzes, getQuizzById, getQuizzByUser, updateOption, updateQuestion,deleteQuizz, getDashboardStats} from '../controller/quizz.controller'
import { validationBody } from '../middleware/validation.middleware';
import { quizzCreate } from '../config/CheckValidation';
export const quizzRouter = express.Router();
quizzRouter.get('/', getAllQuizzes);
quizzRouter.get('/stats', getDashboardStats); 
>>>>>>> local
quizzRouter.get('/:quizzId', getQuizzById);
quizzRouter.get('/user/:userId', getQuizzByUser);
quizzRouter.post('/',createQuizz);
quizzRouter.post('/question',addQuestionForQuizz);
quizzRouter.post('/', createQuizz);
quizzRouter.post('/question', addQuestionForQuizz);
quizzRouter.put('/:quizzId/question/:questionId', updateQuestion);
quizzRouter.put('/:quizzId/question/:questionId/option/:optionId', updateOption);
quizzRouter.delete('/:quizzId/question/:questionId', deleteQuestion);
quizzRouter.delete('/:quizzId/question/:questionId/option/:optionId', deleteOption);
quizzRouter.delete('/:quizzId', deleteQuizz);