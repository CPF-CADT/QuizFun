import express from 'express'
import {addQuestionForQuizz,createQuizz, deleteOption, deleteQuestion, getAllQuizzes, getQuizzById, getQuizzByUser, updateOption, updateQuestion} from '../controller/quizz.controller'
export const quizzRouter = express.Router();
quizzRouter.get('/', getAllQuizzes); 
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