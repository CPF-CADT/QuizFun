import pdf from 'pdf-parse';
import { IQuestion, IOption } from '../model/Quiz';
import { Types } from 'mongoose';

export interface ParsedQuizData {
    questions: IQuestion[];
    title?: string;
    errors: string[];
}

export class PDFQuizParser {
    
    /**
     * Parse PDF buffer and extract quiz questions
     */
    static async parsePDF(buffer: Buffer): Promise<ParsedQuizData> {
        try {
            const data = await pdf(buffer);
            const text = data.text;
            
            return this.parseTextToQuestions(text);
        } catch (error) {
            console.error('Error parsing PDF:', error);
            return {
                questions: [],
                errors: ['Failed to parse PDF file']
            };
        }
    }

    /**
     * Parse text content to extract questions and answers
     * Expected format:
     * Q1: Question text?
     * A) Option 1
     * B) Option 2
     * C) Option 3
     * D) Option 4
     * Answer: A
     * 
     * or 
     * 
     * 1. Question text?
     * a) Option 1
     * b) Option 2
     * c) Option 3
     * d) Option 4
     * Correct Answer: a
     */
    private static parseTextToQuestions(text: string): ParsedQuizData {
        const questions: Omit<IQuestion, '_id'>[] = [];
        const errors: string[] = [];
        
        // Clean up the text
        const cleanText = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n+/g, '\n')
            .trim();

        // Try different parsing patterns
        const patterns = [
            this.parsePatternQA(cleanText),
            this.parsePatternNumbered(cleanText),
            this.parsePatternSimple(cleanText)
        ];

        for (const result of patterns) {
            if (result.questions.length > 0) {
                return result;
            }
        }

        return {
            questions: [],
            errors: ['No valid question format found in PDF. Please ensure your PDF follows the supported format.']
        };
    }

    /**
     * Parse Q1: ... A) ... B) ... Answer: pattern
     */
    private static parsePatternQA(text: string): ParsedQuizData {
        const questions: IQuestion[] = [];
        const errors: string[] = [];

        // Regex to match Q1: question text followed by options A) B) C) D) and Answer:
        const questionPattern = /Q(\d+):\s*(.*?)\n((?:[A-D]\)\s*.*?\n)+)(?:Answer:\s*([A-D]))/gi;
        
        let match;
        while ((match = questionPattern.exec(text)) !== null) {
            const [, questionNum, questionText, optionsText, correctAnswer] = match;
            
            // Parse options
            const optionPattern = /([A-D])\)\s*(.*?)(?=\n|$)/g;
            const options: IOption[] = [];
            
            let optionMatch;
            while ((optionMatch = optionPattern.exec(optionsText)) !== null) {
                const [, letter, optionText] = optionMatch;
                options.push({
                    _id: new Types.ObjectId(),
                    text: optionText.trim(),
                    isCorrect: letter === correctAnswer
                });
            }

            if (options.length >= 2 && correctAnswer) {
                questions.push({
                    _id: new Types.ObjectId(),
                    questionText: questionText.trim(),
                    point: 10,
                    timeLimit: 30,
                    options
                });
            } else {
                errors.push(`Question ${questionNum}: Invalid format or missing correct answer`);
            }
        }

        return { questions, errors };
    }

    /**
     * Parse 1. ... a) ... b) ... Correct Answer: pattern
     */
    private static parsePatternNumbered(text: string): ParsedQuizData {
        const questions: IQuestion[] = [];
        const errors: string[] = [];

        // Regex to match numbered questions with lowercase options
        const questionPattern = /(\d+)\.\s*(.*?)\n((?:[a-d]\)\s*.*?\n)+)(?:Correct Answer:\s*([a-d]))/gi;
        
        let match;
        while ((match = questionPattern.exec(text)) !== null) {
            const [, questionNum, questionText, optionsText, correctAnswer] = match;
            
            // Parse options
            const optionPattern = /([a-d])\)\s*(.*?)(?=\n|$)/g;
            const options: IOption[] = [];
            
            let optionMatch;
            while ((optionMatch = optionPattern.exec(optionsText)) !== null) {
                const [, letter, optionText] = optionMatch;
                options.push({
                    _id: new Types.ObjectId(),
                    text: optionText.trim(),
                    isCorrect: letter === correctAnswer
                });
            }

            if (options.length >= 2 && correctAnswer) {
                questions.push({
                    _id: new Types.ObjectId(),
                    questionText: questionText.trim(),
                    point: 10,
                    timeLimit: 30,
                    options
                });
            } else {
                errors.push(`Question ${questionNum}: Invalid format or missing correct answer`);
            }
        }

        return { questions, errors };
    }

    /**
     * Parse simple format with question and answer pairs
     */
    private static parsePatternSimple(text: string): ParsedQuizData {
        const questions: IQuestion[] = [];
        const errors: string[] = [];

        // Split by double newlines to separate questions
        const sections = text.split(/\n\s*\n/).filter(section => section.trim());

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i].trim();
            
            // Look for question ending with ?
            const lines = section.split('\n').map(line => line.trim()).filter(line => line);
            
            if (lines.length < 3) continue; // Need at least question + 2 options

            const questionLine = lines.find(line => line.includes('?') || line.match(/^\d+\./) || line.match(/^Q\d+/));
            if (!questionLine) continue;

            // Extract options (lines that start with letters or numbers)
            const optionLines = lines.filter(line => 
                line.match(/^[A-D]\)/) || 
                line.match(/^[a-d]\)/) || 
                line.match(/^\d+\./) ||
                line.match(/^[A-D]\./) ||
                line.match(/^[a-d]\./)
            );

            if (optionLines.length < 2) continue;

            // Look for answer indicator
            const answerLine = lines.find(line => 
                line.toLowerCase().includes('answer') || 
                line.toLowerCase().includes('correct')
            );

            let correctAnswerIndex = 0; // Default to first option if no answer found
            
            if (answerLine) {
                const answerMatch = answerLine.match(/[A-Da-d]/);
                if (answerMatch) {
                    const answerLetter = answerMatch[0].toUpperCase();
                    correctAnswerIndex = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
                }
            }

            const options: IOption[] = optionLines.map((line, index) => {
                // Remove the letter/number prefix
                const text = line.replace(/^[A-Da-d0-9]\)\s*/, '').replace(/^[A-Da-d0-9]\.\s*/, '').trim();
                return {
                    _id: new Types.ObjectId(),
                    text,
                    isCorrect: index === correctAnswerIndex
                };
            });

            questions.push({
                _id: new Types.ObjectId(),
                questionText: questionLine.replace(/^Q?\d+[:\.]?\s*/, '').trim(),
                point: 10,
                timeLimit: 30,
                options
            });
        }

        return { questions, errors };
    }
}
