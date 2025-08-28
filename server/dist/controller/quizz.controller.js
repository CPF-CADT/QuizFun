"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllQuizzes = getAllQuizzes;
exports.getQuizzById = getQuizzById;
exports.createQuizz = createQuizz;
exports.createQuizzFromImport = createQuizzFromImport;
exports.cloneQuizz = cloneQuizz;
exports.getQuizLeaderboard = getQuizLeaderboard;
exports.addQuestionForQuizz = addQuestionForQuizz;
exports.updateQuestion = updateQuestion;
exports.updateOption = updateOption;
exports.deleteQuestion = deleteQuestion;
exports.deleteOption = deleteOption;
exports.deleteQuizz = deleteQuizz;
exports.getDashboardStats = getDashboardStats;
exports.handleUpdateQuiz = handleUpdateQuiz;
const quizz_repositories_1 = require("../repositories/quizz.repositories");
const game_repositories_1 = require("../repositories/game.repositories");
const mongoose_1 = require("mongoose");
/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Quiz Management
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64d8f9d3f1234a5678b90123"
 *         title:
 *           type: string
 *           example: "Basic Math Quiz"
 *         description:
 *           type: string
 *           example: "A quiz on basic arithmetic"
 *         creatorId:
 *           type: string
 *           example: "64d8f9d3f1234a5678b90123"
 *         visibility:
 *           type: string
 *           enum: [public, private]
 *           example: "public"
 *         dificulty:
 *           type: string
 *           enum: [Hard, Medium, Easy]
 *           example: "Hard"
 *         templateImgUrl:
 *           type: string
 *           format: uri
 *           example: "https://example.com/quiz-thumbnail.png"
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Question'
 *     Option:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           example: "Option A"
 *         isCorrect:
 *           type: boolean
 *           example: true
 *     Question:
 *       type: object
 *       properties:
 *         questionText:
 *           type: string
 *           example: "What is 2 + 2?"
 *         point:
 *           type: integer
 *           example: 5
 *         timeLimit:
 *           type: integer
 *           example: 30
 *         options:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Option'
 *         imageUrl:
 *           type: string
 *           format: uri
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 */
/**
 * @swagger
 * /api/quizz:
 *   get:
 *     summary: Get all quizzes with advanced pagination, filtering, and sorting
 *     tags: [Quiz]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of quizzes per page (max 100)
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *           enum: [me, others, all]
 *           default: all
 *         description: |
 *           Filter quizzes by ownership:
 *             - `me`: only quizzes created by the current user
 *             - `others`: only quizzes created by other users
 *             - `all`: (default) all visible quizzes (public or owned)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search quizzes by title or description
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by multiple tags (comma-separated)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, updatedAt]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of quizzes with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 hasNext:
 *                   type: boolean
 *                   example: true
 *                 hasPrev:
 *                   type: boolean
 *                   example: false
 *                 quizzes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quiz'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch quizzes
 *                 error:
 *                   type: string
 *                   example: Unknown error
 */
function getAllQuizzes(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { page, limit, sortBy, sortOrder, search, tags, owner } = req.validated.query;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        try {
            const result = yield quizz_repositories_1.QuizzRepositories.getAllQuizzes(page, limit, sortBy, sortOrder, search, tags, userId, owner);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                message: 'Failed to fetch quizzes',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}:
 *   get:
 *     summary: Get quiz data by ID
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: The quiz ID
 *     responses:
 *       200:
 *         description: Quiz data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 visibility:
 *                   type: string
 *                   enum: [public, private]
 *                 questions:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Quiz not found
 *       500:
 *         description: Internal server error
 */
function getQuizzById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quizzId } = req.params;
        const quiz = yield quizz_repositories_1.QuizzRepositories.findById(quizzId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).json(quiz);
    });
}
/**
 * @swagger
 * /api/quizz:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - creatorId
 *               - visibility
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Basic Math Quiz"
 *               description:
 *                 type: string
 *                 example: "A quiz on basic arithmetic"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 example: "public"
 *               dificulty:
 *                 type: string
 *                 enum: [Hard, Medium, Easy]
 *                 example: "Hard"
 *               templateImgUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/quiz-thumbnail.png"
 *     responses:
 *       201:
 *         description: Quiz created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: quizz create success
 *                 data:
 *                   $ref: '#/components/schemas/Quiz'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Some error message
 */
function createQuizz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { title, description, visibility, templateImgUrl, dificulty } = req.body;
        const userId = new mongoose_1.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        const quizz = yield quizz_repositories_1.QuizzRepositories.createQuizz({
            title,
            description,
            creatorId: userId,
            visibility,
            templateImgUrl,
            dificulty,
        });
        res.status(201).json({ message: 'quizz create success', data: quizz });
    });
}
/**
 * @swagger
 * /api/quizz/create-from-import:
 *   post:
 *     summary: Create a quiz with imported questions
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Imported Quiz"
 *               description:
 *                 type: string
 *                 example: "Quiz created from PDF import"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 example: "private"
 *               dificulty:
 *                 type: string
 *                 enum: [Hard, Medium, Easy]
 *                 example: "Medium"
 *               templateImgUrl:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               questions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Quiz created successfully with imported questions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz created successfully with imported questions"
 *                 data:
 *                   $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Invalid input or missing questions
 *       500:
 *         description: Internal server error
 */
function createQuizzFromImport(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { title, description, visibility, templateImgUrl, dificulty, questions } = req.body;
            const userId = new mongoose_1.Types.ObjectId((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
            // Validate that questions are provided
            if (!questions || !Array.isArray(questions) || questions.length === 0) {
                return res.status(400).json({
                    message: 'No questions provided',
                    error: 'At least one question is required to create a quiz'
                });
            }
            // Create the quiz with questions
            const quizz = yield quizz_repositories_1.QuizzRepositories.createQuizz({
                title,
                description,
                creatorId: userId,
                visibility: visibility || 'private',
                templateImgUrl,
                dificulty: dificulty || 'Medium',
                questions
            });
            res.status(201).json({
                message: 'Quiz created successfully with imported questions',
                data: quizz
            });
        }
        catch (error) {
            console.error('Error creating quiz from import:', error);
            res.status(500).json({
                message: 'Internal server error',
                error: 'Failed to create quiz'
            });
        }
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}/clone:
 *   post:
 *     summary: Clone a quiz
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: The quiz ID to clone
 *     responses:
 *       201:
 *         description: Quiz cloned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       400:
 *         description: Missing parameters
 *       404:
 *         description: Quiz not found
 *       500:
 *         description: Internal server error
 */
function cloneQuizz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { quizzId } = req.params;
            const userId = req.user.id;
            if (!quizzId || !userId) {
                return res.status(400).json({ message: 'Quiz ID and user ID are required' });
            }
            const quiz = yield quizz_repositories_1.QuizzRepositories.cloneQuizz(quizzId, userId);
            if (!quiz) {
                return res.status(404).json({ message: 'Quiz not found' });
            }
            res.status(201).json(quiz);
        }
        catch (error) {
            res.status(500).json({
                message: 'Failed to clone quiz',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}/leaderboard:
 *   get:
 *     summary: Get the leaderboard for a specific quiz
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: The quiz ID
 *     responses:
 *       200:
 *         description: Leaderboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   rank:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   score:
 *                     type: integer
 *                   profileUrl:
 *                     type: string
 *       404:
 *         description: Quiz not found or no completed games
 *       500:
 *         description: Internal server error
 */
function getQuizLeaderboard(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { quizzId } = req.params;
            const leaderboard = yield game_repositories_1.GameRepository.getLeaderboardForQuiz(quizzId);
            if (!leaderboard || leaderboard.length === 0) {
                return res.status(404).json({ message: 'No leaderboard data found for this quiz.' });
            }
            res.status(200).json(leaderboard);
        }
        catch (error) {
            res.status(500).json({
                message: 'Failed to fetch quiz leaderboard',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}
/**
 * @swagger
 * /api/quizz/question:
 *   post:
 *     summary: Add a question to a quiz
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quizzId
 *               - question
 *             properties:
 *               quizzId:
 *                 type: string
 *                 example: "64d8f9d3f1234a5678b90123"
 *               question:
 *                 $ref: '#/components/schemas/Question'
 *     responses:
 *       201:
 *         description: Question added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: quizz create success
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 *                   example: Some error message
 */
function addQuestionForQuizz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quizzId, question } = req.body;
        yield quizz_repositories_1.QuizzRepositories.addQuestion(quizzId, question);
        res.status(201).json({ message: 'add question success' });
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}/question/{questionId}:
 *   put:
 *     summary: Update a question in a quiz
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Question'
 *     responses:
 *       200:
 *         description: Question updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question updated successfully
 *                 question:
 *                   $ref: '#/components/schemas/Question'
 *       404:
 *         description: Quiz or question not found
 *       500:
 *         description: Internal server error
 */
function updateQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quizzId, questionId } = req.params;
        const questionUpdate = req.body;
        const updatedQuestion = yield quizz_repositories_1.QuizzRepositories.updateQuestion(quizzId, questionId, questionUpdate);
        if (!updatedQuestion) {
            res.status(404).json({ message: 'Quiz or Question not found' });
        }
        res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}/question/{questionId}/option/{optionId}:
 *   put:
 *     summary: Update an option inside a question
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID
 *       - in: path
 *         name: optionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Option ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Option'
 *     responses:
 *       200:
 *         description: Option updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Option updated successfully
 *                 option:
 *                   $ref: '#/components/schemas/Option'
 *       404:
 *         description: Quiz, question or option not found
 *       500:
 *         description: Internal server error
 */
function updateOption(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quizzId, questionId, optionId } = req.params;
        const optionUpdate = req.body;
        const updatedOption = yield quizz_repositories_1.QuizzRepositories.updateOption(quizzId, questionId, optionId, optionUpdate);
        if (!updatedOption) {
            return res.status(404).json({ message: 'Quiz, Question or Option not found' });
        }
        res.status(200).json({ message: 'Option updated successfully', option: updatedOption });
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}/question/{questionId}:
 *   delete:
 *     summary: Delete a question from a quiz
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Question deleted successfully
 *       404:
 *         description: Quiz or question not found
 *       500:
 *         description: Internal server error
 */
function deleteQuestion(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quizzId, questionId } = req.params;
        const deleted = yield quizz_repositories_1.QuizzRepositories.deleteQuestion(quizzId, questionId);
        if (!deleted) {
            return res.status(404).json({ message: 'Quiz or Question not found' });
        }
        res.status(200).json({ message: 'Question deleted successfully' });
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}/question/{questionId}/option/{optionId}:
 *   delete:
 *     summary: Delete an option from a question
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *       - in: path
 *         name: questionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Question ID
 *       - in: path
 *         name: optionId
 *         schema:
 *           type: string
 *         required: true
 *         description: Option ID
 *     responses:
 *       200:
 *         description: Option deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Option deleted successfully
 *       404:
 *         description: Quiz, question or option not found
 *       500:
 *         description: Internal server error
 */
function deleteOption(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { quizzId, questionId, optionId } = req.params;
        const deleted = yield quizz_repositories_1.QuizzRepositories.deleteOption(quizzId, questionId, optionId);
        if (!deleted) {
            return res.status(404).json({ message: 'Quiz, Question or Option not found' });
        }
        res.status(200).json({ message: 'Option deleted successfully' });
    });
}
/**
 * @swagger
 * /api/quizz/{quizzId}:
 *   delete:
 *     summary: Delete a quizz from a quiz
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: quizzId
 *         schema:
 *           type: string
 *         required: true
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quizz deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Quizz deleted successfully
 *       404:
 *         description: Quiz or Quizz not found
 *       500:
 *         description: Internal server error
 */
function deleteQuizz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { quizzId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(404).json({ message: 'User not found' });
        }
        const deleted = yield quizz_repositories_1.QuizzRepositories.deleteQuizz(quizzId, userId);
        if (!deleted) {
            return res.status(404).json({ message: 'Quiz or Question not found' });
        }
        return res.status(200).json({ message: 'Question deleted successfully' });
    });
}
function getDashboardStats(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(403).json({ message: 'Invalid User' });
        }
        const stats = yield quizz_repositories_1.QuizzRepositories.getDashboardStats(userId);
        return res.status(200).json(stats);
    });
}
function handleUpdateQuiz(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { quizId } = req.params;
        const creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!creatorId) {
            return res.status(403).json({ error: 'Invalid ownerid' });
        }
        const { title, description, visibility, dificulty, tags } = req.body;
        if (!title) {
            return res.status(400).json({ error: 'Title is required.' });
        }
        const updateData = {
            title,
            description,
            visibility,
            dificulty,
            tags,
        };
        try {
            const updatedQuiz = yield quizz_repositories_1.QuizzRepositories.updateQuizz(quizId, creatorId, updateData);
            if (!updatedQuiz) {
                return res.status(404).json({ error: 'Quiz not found or you do not have permission to edit it.' });
            }
            console.log('Quiz updated successfully.');
            return res.status(200).json({
                message: 'Quiz updated successfully!',
                data: updatedQuiz,
            });
        }
        catch (error) {
            console.error('Failed to update quiz.', error);
            return res.status(500).json({ error: 'Failed to update quiz. Please try again later.' });
        }
    });
}
;
