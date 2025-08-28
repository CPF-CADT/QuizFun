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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFQuizParser = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mongoose_1 = require("mongoose");
class PDFQuizParser {
    /**
     * Parse PDF buffer and extract quiz questions
     */
    static parsePDF(buffer) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield (0, pdf_parse_1.default)(buffer);
                const text = data.text;
                console.log(`Extracted text length: ${text.length} characters`);
                console.log('Text preview:', text.substring(0, 200) + '...');
                const result = this.parseTextToQuestions(text);
                console.log(`Parsing complete: Found ${result.questions.length} questions, ${result.errors.length} errors`);
                return result;
            }
            catch (error) {
                console.error('Error parsing PDF:', error);
                return {
                    questions: [],
                    errors: ['Failed to parse PDF file']
                };
            }
        });
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
    static parseTextToQuestions(text) {
        const allQuestions = [];
        const allErrors = [];
        // Clean up the text
        const cleanText = text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n+/g, '\n')
            .trim();
        // Try different parsing patterns and combine results
        const patterns = [
            this.parsePatternQA(cleanText),
            this.parsePatternNumbered(cleanText),
            this.parsePatternSimple(cleanText)
        ];
        let foundQuestions = false;
        console.log('Trying parsing patterns...');
        for (let i = 0; i < patterns.length; i++) {
            const result = patterns[i];
            const patternNames = ['Q1: format', 'numbered format', 'simple format'];
            console.log(`Pattern ${i + 1} (${patternNames[i]}): Found ${result.questions.length} questions`);
            if (result.questions.length > 0) {
                // Add questions that don't already exist (avoid duplicates)
                for (const question of result.questions) {
                    const isDuplicate = allQuestions.some(existing => existing.questionText.toLowerCase().trim() === question.questionText.toLowerCase().trim());
                    if (!isDuplicate) {
                        allQuestions.push(question);
                        foundQuestions = true;
                        console.log(`Added question: ${question.questionText.substring(0, 50)}...`);
                    }
                    else {
                        console.log(`Skipped duplicate: ${question.questionText.substring(0, 50)}...`);
                    }
                }
                allErrors.push(...result.errors);
            }
        }
        if (!foundQuestions) {
            return {
                questions: [],
                errors: ['No valid question format found in PDF. Please ensure your PDF follows the supported format.']
            };
        }
        return {
            questions: allQuestions,
            errors: allErrors
        };
    }
    /**
     * Parse Q1: ... A) ... B) ... Answer: pattern
     */
    static parsePatternQA(text) {
        const questions = [];
        const errors = [];
        // Regex to match Q1: question text followed by options A) B) C) D) and Answer:
        // More flexible pattern to handle spacing variations
        const questionPattern = /Q(\d+):\s*(.*?)\s*\n((?:\s*[A-D]\)\s*.*?\s*\n)+)\s*(?:Answer:\s*([A-D]))/gi;
        let match;
        while ((match = questionPattern.exec(text)) !== null) {
            const [, questionNum, questionText, optionsText, correctAnswer] = match;
            // Parse options with more flexible spacing
            const optionPattern = /([A-D])\)\s*(.*?)(?=\s*\n|$)/g;
            const options = [];
            let optionMatch;
            while ((optionMatch = optionPattern.exec(optionsText)) !== null) {
                const [, letter, optionText] = optionMatch;
                options.push({
                    _id: new mongoose_1.Types.ObjectId(),
                    text: optionText.trim(),
                    isCorrect: letter === correctAnswer
                });
            }
            if (options.length >= 2 && correctAnswer) {
                // Ensure at least one option is marked as correct for Q pattern
                const hasCorrectAnswer = options.some(opt => opt.isCorrect);
                if (!hasCorrectAnswer && options.length > 0) {
                    // If no correct answer found, mark the first option as correct
                    options[0].isCorrect = true;
                    errors.push(`Question ${questionNum}: No correct answer found, defaulting to first option`);
                }
                questions.push({
                    _id: new mongoose_1.Types.ObjectId(),
                    questionText: questionText.trim(),
                    point: 10,
                    timeLimit: 30,
                    options
                });
            }
            else {
                errors.push(`Question ${questionNum}: Invalid format or missing correct answer`);
            }
        }
        return { questions, errors };
    }
    /**
     * Parse 1. ... a) ... b) ... Correct Answer: pattern
     */
    static parsePatternNumbered(text) {
        const questions = [];
        const errors = [];
        // Regex to match numbered questions with lowercase options
        // More flexible pattern to handle spacing variations
        const questionPattern = /(\d+)\.\s*(.*?)\s*\n((?:\s*[a-d]\)\s*.*?\s*\n)+)\s*(?:Correct Answer:\s*([a-d]))/gi;
        let match;
        while ((match = questionPattern.exec(text)) !== null) {
            const [, questionNum, questionText, optionsText, correctAnswer] = match;
            // Parse options with more flexible spacing
            const optionPattern = /([a-d])\)\s*(.*?)(?=\s*\n|$)/g;
            const options = [];
            let optionMatch;
            while ((optionMatch = optionPattern.exec(optionsText)) !== null) {
                const [, letter, optionText] = optionMatch;
                options.push({
                    _id: new mongoose_1.Types.ObjectId(),
                    text: optionText.trim(),
                    isCorrect: letter === correctAnswer
                });
            }
            if (options.length >= 2 && correctAnswer) {
                questions.push({
                    _id: new mongoose_1.Types.ObjectId(),
                    questionText: questionText.trim(),
                    point: 10,
                    timeLimit: 30,
                    options
                });
            }
            else {
                errors.push(`Question ${questionNum}: Invalid format or missing correct answer`);
            }
        }
        return { questions, errors };
    }
    /**
     * Parse simple format with question and answer pairs
     */
    static parsePatternSimple(text) {
        const questions = [];
        const errors = [];
        // Split by double newlines to separate questions
        const sections = text.split(/\n\s*\n/).filter(section => section.trim());
        for (let i = 0; i < sections.length; i++) {
            const section = sections[i].trim();
            // Look for question ending with ?
            const lines = section.split('\n').map(line => line.trim()).filter(line => line);
            if (lines.length < 3)
                continue; // Need at least question + 2 options
            const questionLine = lines.find(line => line.includes('?') || line.match(/^\d+\./) || line.match(/^Q\d+/));
            if (!questionLine)
                continue;
            // Extract options (lines that start with letters or numbers)
            const optionLines = lines.filter(line => line.match(/^[A-D]\)/) ||
                line.match(/^[a-d]\)/) ||
                line.match(/^\d+\./) ||
                line.match(/^[A-D]\./) ||
                line.match(/^[a-d]\./));
            if (optionLines.length < 2)
                continue;
            // Look for answer indicator
            const answerLine = lines.find(line => line.toLowerCase().includes('answer') ||
                line.toLowerCase().includes('correct'));
            let correctAnswerIndex = 0; // Default to first option if no answer found
            if (answerLine) {
                const answerMatch = answerLine.match(/[A-Da-d]/);
                if (answerMatch) {
                    const answerLetter = answerMatch[0].toUpperCase();
                    correctAnswerIndex = answerLetter.charCodeAt(0) - 'A'.charCodeAt(0);
                }
            }
            const options = optionLines.map((line, index) => {
                // Remove the letter/number prefix
                const text = line.replace(/^[A-Da-d0-9]\)\s*/, '').replace(/^[A-Da-d0-9]\.\s*/, '').trim();
                return {
                    _id: new mongoose_1.Types.ObjectId(),
                    text,
                    isCorrect: index === correctAnswerIndex
                };
            });
            questions.push({
                _id: new mongoose_1.Types.ObjectId(),
                questionText: questionLine.replace(/^Q?\d+[:\.]?\s*/, '').trim(),
                point: 10,
                timeLimit: 30,
                options
            });
        }
        return { questions, errors };
    }
}
exports.PDFQuizParser = PDFQuizParser;
