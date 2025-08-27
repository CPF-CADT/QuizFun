import { Request, Response } from 'express';
import { PDFQuizParser } from '../service/pdfParser';
import fs from 'fs';
import path from 'path';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

/**
 * @swagger
 * /api/quizz/import-pdf:
 *   post:
 *     summary: Import quiz questions from PDF file
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: PDF file containing quiz questions
 *     responses:
 *       200:
 *         description: PDF parsed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "PDF parsed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Question'
 *                     title:
 *                       type: string
 *                       nullable: true
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: No PDF file provided or invalid file
 *       500:
 *         description: Internal server error
 */
export async function importPDFQuiz(req: MulterRequest, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                message: 'No PDF file provided',
                error: 'Please upload a PDF file' 
            });
        }

        // Validate file type
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({ 
                message: 'Invalid file type',
                error: 'Only PDF files are allowed' 
            });
        }

        // Validate file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (req.file.size > maxSize) {
            return res.status(400).json({ 
                message: 'File too large',
                error: 'PDF file must be smaller than 10MB' 
            });
        }

        console.log('Processing PDF file:', req.file.originalname, 'Size:', req.file.size, 'bytes');
        
        // Parse the PDF
        const result = await PDFQuizParser.parsePDF(req.file.buffer);
        
        console.log(`Processing complete: Found ${result.questions.length} questions with ${result.errors.length} errors`);
        
        // Check if any questions were found
        if (result.questions.length === 0) {
            return res.status(400).json({
                message: 'No questions found in PDF',
                error: 'The PDF format is not supported or contains no valid questions',
                data: {
                    questions: [],
                    title: result.title,
                    errors: result.errors
                }
            });
        }

        console.log(`Successfully parsed ${result.questions.length} questions from PDF`);
        
        res.status(200).json({
            message: 'PDF parsed successfully',
            data: {
                questions: result.questions.map(q => ({
                    questionText: q.questionText,
                    point: q.point,
                    timeLimit: q.timeLimit,
                    options: q.options.map(opt => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect
                    })),
                    imageUrl: q.imageUrl,
                    tags: q.tags
                })),
                title: result.title,
                errors: result.errors
            }
        });

    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: 'Failed to process PDF file'
        });
    }
}

/**
 * Test endpoint to test parsing with sample text
 * For development and debugging purposes
 */
export async function testPDFParser(req: Request, res: Response) {
    try {
        // Read sample text file
        const samplePath = path.join(__dirname, '..', '..', 'sample-quiz-questions.txt');
        
        if (!fs.existsSync(samplePath)) {
            return res.status(404).json({
                message: 'Sample file not found',
                error: 'sample-quiz-questions.txt not found'
            });
        }

        const sampleText = fs.readFileSync(samplePath, 'utf8');
        console.log('Testing with sample text...');
        
        // Test the parser directly with text
        const result = (PDFQuizParser as any).parseTextToQuestions(sampleText);
        
        console.log(`Test complete: Found ${result.questions.length} questions with ${result.errors.length} errors`);
        
        res.status(200).json({
            message: 'Parser test completed',
            data: {
                questions: result.questions.map((q: any) => ({
                    questionText: q.questionText,
                    point: q.point,
                    timeLimit: q.timeLimit,
                    options: q.options.map((opt: any) => ({
                        text: opt.text,
                        isCorrect: opt.isCorrect
                    }))
                })),
                errors: result.errors,
                totalQuestions: result.questions.length
            }
        });

    } catch (error) {
        console.error('Error testing parser:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: 'Failed to test parser'
        });
    }
}
