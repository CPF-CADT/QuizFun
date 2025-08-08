import { Request, Response } from 'express';
import { IQuiz, IQuestion, IOption } from '../model/Quiz';
import { QuizzRepositories } from '../repositories/quizz.repositories';

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
 *     summary: Get all quizzes with pagination
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
 *         description: Number of quizzes per page
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
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 quizzes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quiz'
 */
export async function getAllQuizzes(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await QuizzRepositories.getAllQuizzes(page, limit);

        return res.status(200).json({
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
            quizzes: result.quizzes
        });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch quizzes', error });
    }
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


export async function getQuizzById(req: Request, res: Response) {
    try {
        const { quizzId } = req.params;
        const quiz = await QuizzRepositories.findById(quizzId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        return res.status(200).json(quiz);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

/**
 * @swagger
 * /api/quizz/user/{userId}:
 *   get:
 *     summary: Get all quizzes created by a specific user
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of quizzes created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: No quizzes found for the user
 *       500:
 *         description: Internal server error
 */

export async function getQuizzByUser(req: Request, res: Response) {
    try {
        const { userId } = req.params;
        const quizzes = await QuizzRepositories.getQuizzByUser(userId);

        if (!quizzes || quizzes.length === 0) {
            return res.status(404).json({ message: 'No quizzes found for this user.' });
        }

        res.status(200).json(quizzes);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
    }
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
 *               creatorId:
 *                 type: string
 *                 example: "64d8f9d3f1234a5678b90123"
 *               visibility:
 *                 type: string
 *                 enum: [public, private]
 *                 example: "public"
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

export async function createQuizz(req: Request, res: Response) {
    const { title, description, creatorId, visibility, templateImgUrl } = req.body;
    try {
        const quizz = await QuizzRepositories.createQuizz({
            title,
            description,
            creatorId,
            visibility,
            templateImgUrl,
        } as IQuiz);
        res.status(201).json({ message: 'quizz create success', data: quizz });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: (err as Error).message });
    }
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

export async function addQuestionForQuizz(req: Request, res: Response) {
    const { quizzId, question } = req.body;
    try {
        await QuizzRepositories.addQuestion(quizzId as string, question as IQuestion);
        res.status(201).json({ message: 'add question success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: (err as Error).message });
    }
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
export async function updateQuestion(req: Request, res: Response) {
    const { quizzId, questionId } = req.params;
    const questionUpdate = req.body as IQuestion;

    try {
        const updatedQuestion = await QuizzRepositories.updateQuestion(quizzId, questionId, questionUpdate);
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Quiz or Question not found' });
        }
        res.status(200).json({ message: 'Question updated successfully', question: updatedQuestion });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: (err as Error).message });
    }
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
export async function updateOption(req: Request, res: Response) {
    const { quizzId, questionId, optionId } = req.params;
    const optionUpdate = req.body as IOption;

    try {
        const updatedOption = await QuizzRepositories.updateOption(quizzId, questionId, optionId, optionUpdate);
        if (!updatedOption) {
            return res.status(404).json({ message: 'Quiz, Question or Option not found' });
        }
        res.status(200).json({ message: 'Option updated successfully', option: updatedOption });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: (err as Error).message });
    }
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
export async function deleteQuestion(req: Request, res: Response) {
    const { quizzId, questionId } = req.params;

    try {
        const deleted = await QuizzRepositories.deleteQuestion(quizzId, questionId);
        if (!deleted) {
            return res.status(404).json({ message: 'Quiz or Question not found' });
        }
        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: (err as Error).message });
    }
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
export async function deleteOption(req: Request, res: Response) {
    const { quizzId, questionId, optionId } = req.params;

    try {
        const deleted = await QuizzRepositories.deleteOption(quizzId, questionId, optionId);
        if (!deleted) {
            return res.status(404).json({ message: 'Quiz, Question or Option not found' });
        }
        res.status(200).json({ message: 'Option deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: (err as Error).message });
    }
}

