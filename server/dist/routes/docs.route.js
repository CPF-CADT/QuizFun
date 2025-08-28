"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docsRouter = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.docsRouter = router;
/**
 * @swagger
 * /api/docs/info:
 *   get:
 *     summary: Get API information and available endpoints
 *     tags: [Service]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: QuizFun API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 description:
 *                   type: string
 *                   example: Real-time quiz application API
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: string
 *                     quizzes:
 *                       type: array
 *                       items:
 *                         type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         supported:
 *                           type: boolean
 *                         parameters:
 *                           type: array
 *                           items:
 *                             type: string
 */
router.get('/info', (req, res) => {
    res.json({
        name: 'QuizFun API',
        version: '1.0.0',
        description: 'Real-time quiz application API with comprehensive pagination support',
        documentation: `${req.protocol}://${req.get('host')}/api-docs`,
        endpoints: {
            users: [
                'GET /api/user - Get all users with pagination',
                'GET /api/user/by-role/:role - Get users by role with pagination',
                'POST /api/user/register - Register new user',
                'POST /api/user/login - User login',
                'PUT /api/user/:id - Update user',
                'POST /api/user/logout - User logout'
            ],
            quizzes: [
                'GET /api/quizz - Get all quizzes with pagination and search',
                'GET /api/quizz/:id - Get quiz by ID',
                'GET /api/quizz/user/:userId - Get user quizzes with pagination',
                'POST /api/quizz - Create new quiz',
                'POST /api/quizz/question - Add question to quiz',
                'PUT /api/quizz/:quizzId/question/:questionId - Update question',
                'DELETE /api/quizz/:quizzId - Delete quiz'
            ]
        },
        pagination: {
            supported: true,
            parameters: [
                'page (integer, default: 1) - Page number',
                'limit (integer, default: 10, max: 100) - Items per page',
                'search (string) - Search term',
                'sortBy (string) - Field to sort by',
                'sortOrder (asc|desc, default: desc) - Sort direction'
            ],
            features: [
                'Search functionality',
                'Flexible sorting',
                'Pagination metadata (hasNext, hasPrev)',
                'Total count and pages',
                'Maximum limit enforcement'
            ]
        },
        features: {
            authentication: 'JWT with refresh tokens',
            realTimeSupport: 'Socket.io integration',
            fileUploads: 'Cloudinary integration',
            emailVerification: 'Nodemailer support',
            documentation: 'Swagger/OpenAPI 3.0'
        }
    });
});
