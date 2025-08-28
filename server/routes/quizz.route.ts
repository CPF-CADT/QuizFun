import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenicate.middleware';
import { validate } from '../middleware/validate';
import { quizSchemas } from '../validations/quiz.schemas';
import { 
    getAllQuizzes, 
    getDashboardStats, 
    getQuizLeaderboard,
    getQuizzById,
    cloneQuizz,
    handleUpdateQuiz,
    createQuizz,
    createQuizzFromImport,
    deleteQuizz,
    addQuestionForQuizz,
    updateQuestion,
    deleteQuestion,
    updateOption,
    deleteOption
} from '../controller/quizz.controller';
import { importPDFQuiz } from '../controller/pdfImport.controller';
import { globalRateLimit ,quizRateLimit} from '../middleware/ratelimit.middleware';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- PUBLIC & GENERAL QUIZ ROUTES ---
router.get('/', authenticateToken,validate(quizSchemas.getAllQuizzes) ,globalRateLimit,getAllQuizzes);
router.get('/stats', authenticateToken,globalRateLimit, getDashboardStats);
router.get('/:quizzId/leaderboard', validate(quizSchemas.quizzIdParam),globalRateLimit, getQuizLeaderboard);

// --- QUIZ CRUD & ACTIONS ---
router.post('/', authenticateToken, validate(quizSchemas.createQuiz),globalRateLimit, createQuizz);
router.post('/create-from-import', authenticateToken, validate(quizSchemas.createQuizFromImport),globalRateLimit, createQuizzFromImport);
router.post('/import-pdf', authenticateToken, upload.single('pdf'),globalRateLimit, importPDFQuiz);
router.post('/:quizzId/clone', authenticateToken, validate(quizSchemas.quizzIdParam),globalRateLimit, cloneQuizz);
router.get('/:quizzId', validate(quizSchemas.quizzIdParam),globalRateLimit, getQuizzById);
router.put('/:quizId', authenticateToken, validate(quizSchemas.quizIdParam),globalRateLimit, validate(quizSchemas.updateQuiz), handleUpdateQuiz);
router.delete('/:quizzId', authenticateToken, validate(quizSchemas.quizzIdParam),globalRateLimit, deleteQuizz);

// --- QUESTION ROUTES ---
router.post('/question', authenticateToken, validate(quizSchemas.addQuestion),globalRateLimit, addQuestionForQuizz);
router.put('/:quizzId/question/:questionId', authenticateToken, validate(quizSchemas.questionParams), validate(quizSchemas.updateQuestion),globalRateLimit, updateQuestion);
router.delete('/:quizzId/question/:questionId', authenticateToken, validate(quizSchemas.questionParams),globalRateLimit, deleteQuestion);

// --- OPTION ROUTES ---
router.put('/:quizzId/question/:questionId/option/:optionId', authenticateToken, validate(quizSchemas.optionParams), validate(quizSchemas.updateOption),globalRateLimit, updateOption);
router.delete('/:quizzId/question/:questionId/option/:optionId', authenticateToken, validate(quizSchemas.optionParams),globalRateLimit, deleteOption);

export default router;