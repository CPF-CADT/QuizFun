"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const authenicate_middleware_1 = require("../middleware/authenicate.middleware");
const validate_1 = require("../middleware/validate");
const quiz_schemas_1 = require("../validations/quiz.schemas");
const quizz_controller_1 = require("../controller/quizz.controller");
const pdfImport_controller_1 = require("../controller/pdfImport.controller");
const ratelimit_middleware_1 = require("../middleware/ratelimit.middleware");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// --- PUBLIC & GENERAL QUIZ ROUTES ---
router.get('/', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.getAllQuizzes), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.getAllQuizzes);
router.get('/stats', authenicate_middleware_1.authenticateToken, ratelimit_middleware_1.globalRateLimit, quizz_controller_1.getDashboardStats);
router.get('/:quizzId/leaderboard', (0, validate_1.validate)(quiz_schemas_1.quizSchemas.quizzIdParam), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.getQuizLeaderboard);
// --- QUIZ CRUD & ACTIONS ---
router.post('/', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.createQuiz), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.createQuizz);
router.post('/create-from-import', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.createQuizFromImport), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.createQuizzFromImport);
router.post('/import-pdf', authenicate_middleware_1.authenticateToken, upload.single('pdf'), ratelimit_middleware_1.globalRateLimit, pdfImport_controller_1.importPDFQuiz);
router.get('/test-parser', pdfImport_controller_1.testPDFParser); // Test endpoint for development
router.post('/:quizzId/clone', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.quizzIdParam), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.cloneQuizz);
router.get('/:quizzId', (0, validate_1.validate)(quiz_schemas_1.quizSchemas.quizzIdParam), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.getQuizzById);
router.put('/:quizId', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.quizIdParam), ratelimit_middleware_1.globalRateLimit, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.updateQuiz), quizz_controller_1.handleUpdateQuiz);
router.delete('/:quizzId', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.quizzIdParam), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.deleteQuizz);
// --- QUESTION ROUTES ---
router.post('/question', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.addQuestion), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.addQuestionForQuizz);
router.put('/:quizzId/question/:questionId', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.questionParams), (0, validate_1.validate)(quiz_schemas_1.quizSchemas.updateQuestion), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.updateQuestion);
router.delete('/:quizzId/question/:questionId', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.questionParams), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.deleteQuestion);
// --- OPTION ROUTES ---
router.put('/:quizzId/question/:questionId/option/:optionId', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.optionParams), (0, validate_1.validate)(quiz_schemas_1.quizSchemas.updateOption), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.updateOption);
router.delete('/:quizzId/question/:questionId/option/:optionId', authenicate_middleware_1.authenticateToken, (0, validate_1.validate)(quiz_schemas_1.quizSchemas.optionParams), ratelimit_middleware_1.globalRateLimit, quizz_controller_1.deleteOption);
exports.default = router;
