import express from 'express';
import multer from 'multer';
import { authenticateToken,optionalAuthMiddleware } from '../middleware/authenicate.middleware';
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
import { importPDFQuiz, testPDFParser } from '../controller/pdfImport.controller';
// import { } from '../middleware/ratelimit.middleware';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- PUBLIC & GENERAL QUIZ ROUTES ---
router.get('/', optionalAuthMiddleware,validate(quizSchemas.getAllQuizzes) ,getAllQuizzes);
router.get('/stats', authenticateToken, getDashboardStats);
router.get('/:quizzId/leaderboard', validate(quizSchemas.quizzIdParam), getQuizLeaderboard);

// --- QUIZ CRUD & ACTIONS ---
router.post('/', authenticateToken, validate(quizSchemas.createQuiz), createQuizz);
router.post('/create-from-import', authenticateToken, validate(quizSchemas.createQuizFromImport), createQuizzFromImport);
router.post('/import-pdf', authenticateToken, upload.single('pdf'), importPDFQuiz);
router.get('/test-parser', testPDFParser); // Test endpoint for development
router.post('/:quizzId/clone', authenticateToken, validate(quizSchemas.quizzIdParam), cloneQuizz);
router.get('/:quizzId', validate(quizSchemas.quizzIdParam), getQuizzById);
router.put('/:quizId', authenticateToken, validate(quizSchemas.quizIdParam), validate(quizSchemas.updateQuiz), handleUpdateQuiz);
router.delete('/:quizzId', authenticateToken, validate(quizSchemas.quizzIdParam), deleteQuizz);

// --- QUESTION ROUTES ---
router.post('/question', authenticateToken, validate(quizSchemas.addQuestion), addQuestionForQuizz);
router.put('/:quizzId/question/:questionId', authenticateToken, validate(quizSchemas.questionParams), validate(quizSchemas.updateQuestion), updateQuestion);
router.delete('/:quizzId/question/:questionId', authenticateToken, validate(quizSchemas.questionParams), deleteQuestion);

// --- OPTION ROUTES ---
router.put('/:quizzId/question/:questionId/option/:optionId', authenticateToken, validate(quizSchemas.optionParams), validate(quizSchemas.updateOption), updateOption);
router.delete('/:quizzId/question/:questionId/option/:optionId', authenticateToken, validate(quizSchemas.optionParams), deleteOption);

export default router;