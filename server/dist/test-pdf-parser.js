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
const pdfParser_1 = require("./service/pdfParser");
const fs_1 = __importDefault(require("fs"));
function testPDFParser() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Testing PDF Parser...');
        // You can test with a PDF file path
        const pdfPath = 'path/to/your/test.pdf';
        try {
            if (fs_1.default.existsSync(pdfPath)) {
                const pdfBuffer = fs_1.default.readFileSync(pdfPath);
                const result = yield pdfParser_1.PDFQuizParser.parsePDF(pdfBuffer);
                console.log('Parsing Results:');
                console.log(`Found ${result.questions.length} questions`);
                console.log('Questions:', JSON.stringify(result.questions, null, 2));
                console.log('Errors:', result.errors);
            }
            else {
                console.log('PDF file not found. Please create a PDF and update the path.');
                console.log('You can use the sample-quiz-questions.txt file as content.');
            }
        }
        catch (error) {
            console.error('Error testing PDF parser:', error);
        }
    });
}
testPDFParser();
