import express from 'express'
import {addQuestionForQuizz,createQuizz, deleteOption, deleteQuestion, getAllQuizzes, getQuizzById, getQuizzByUser, updateOption, updateQuestion,deleteQuizz, getDashboardStats, cloneQuizz, getQuizLeaderboard, handleUpdateQuiz, createQuizzFromImport} from '../controller/quizz.controller'
import { validationBody } from '../middleware/validation.middleware';
import { quizzCreate } from '../config/CheckValidation';
import multer from 'multer';
import { handleImageUpload } from '../controller/service.controller';
import { authenticateToken } from '../middleware/authenicate.middleware';
import { importPDFQuiz } from '../controller/pdfImport.controller';
export const quizzRouter = express.Router();
const storage = multer.memoryStorage(); 
const upload = multer({ storage });
// ---- Public ----
quizzRouter.get('/', getAllQuizzes);
quizzRouter.get('/stats', getDashboardStats);
quizzRouter.get('/user/',authenticateToken, getQuizzByUser);
quizzRouter.get('/:quizzId/leaderboard', getQuizLeaderboard);
// ---- Single Quiz ----
quizzRouter.get('/:quizzId', getQuizzById);
quizzRouter.post('/:quizzId/clone', authenticateToken,cloneQuizz);
quizzRouter.put('/:quizId',authenticateToken, handleUpdateQuiz);

// quizzRouter.post('/',upload.single('image'),handleImageUpload('quizz_Image'),validationBody(quizzCreate),createQuizz);
quizzRouter.post('/',authenticateToken,createQuizz);
quizzRouter.post('/create-from-import', authenticateToken, createQuizzFromImport);

// ---- PDF Import ----
quizzRouter.post('/import-pdf', authenticateToken, upload.single('pdf'), importPDFQuiz);

// ---- Questions ----
quizzRouter.post('/question', addQuestionForQuizz);
quizzRouter.put('/:quizzId/question/:questionId', updateQuestion);
quizzRouter.put('/:quizzId/question/:questionId/option/:optionId', updateOption);
quizzRouter.delete('/:quizzId/question/:questionId', deleteQuestion);
quizzRouter.delete('/:quizzId/question/:questionId/option/:optionId', deleteOption);

quizzRouter.delete('/:quizzId', deleteQuizz);