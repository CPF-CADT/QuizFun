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
const express_1 = require("express");
const bugReport_1 = require("../model/bugReport");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: BugReport
 *   description: Bug reporting system
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     BugReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 64f123a1b5d6789abcdef012
 *         title:
 *           type: string
 *           example: "Login button not working"
 *         description:
 *           type: string
 *           example: "Clicking the login button does nothing"
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-08-26T11:22:33.000Z"
 *     PaginatedBugReports:
 *       type: object
 *       properties:
 *         bugs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BugReport'
 *         total:
 *           type: integer
 *           example: 100
 *         page:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 10
 *         hasNext:
 *           type: boolean
 *           example: true
 *         hasPrev:
 *           type: boolean
 *           example: false
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: refreshToken
 */
/* ----------------------- CREATE BUG REPORT ----------------------- */
/**
 * @swagger
 * /api/bug-report:
 *   post:
 *     summary: Create a new bug report
 *     tags: [BugReport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - faceRating
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Login button not working"
 *               description:
 *                 type: string
 *                 example: "Clicking login button does nothing on Chrome"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 2
 *     responses:
 *       201:
 *         description: Bug report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BugReport'
 *       500:
 *         description: Failed to create bug report
 */
router.post('/bug-report', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, rating } = req.body;
        const newBug = new bugReport_1.BugReport({ title, description, rating });
        yield newBug.save();
        res.status(201).json(newBug);
    }
    catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        res.status(500).json({ error: 'Failed to save bug report', details: errorMessage });
    }
}));
/* ----------------------- GET ALL BUG REPORTS ----------------------- */
/**
 * @swagger
 * /api/bug-reports:
 *   get:
 *     summary: Get all bug reports with pagination
 *     tags: [BugReport]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: List of bug reports with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedBugReports'
 *       500:
 *         description: Server error
 */
router.get('/bug-reports', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bugs = yield bugReport_1.BugReport.find().sort({ createdAt: -1 });
        res.json(bugs);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch bug reports' });
    }
}));
exports.default = router;
