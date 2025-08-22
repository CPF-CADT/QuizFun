import { PDFQuizParser } from './service/pdfParser';
import fs from 'fs';
import path from 'path';

async function testPDFParser() {
    console.log('Testing PDF Parser...');
    
    // You can test with a PDF file path
    const pdfPath = 'path/to/your/test.pdf';
    
    try {
        if (fs.existsSync(pdfPath)) {
            const pdfBuffer = fs.readFileSync(pdfPath);
            const result = await PDFQuizParser.parsePDF(pdfBuffer);
            
            console.log('Parsing Results:');
            console.log(`Found ${result.questions.length} questions`);
            console.log('Questions:', JSON.stringify(result.questions, null, 2));
            console.log('Errors:', result.errors);
        } else {
            console.log('PDF file not found. Please create a PDF and update the path.');
            console.log('You can use the sample-quiz-questions.txt file as content.');
        }
    } catch (error) {
        console.error('Error testing PDF parser:', error);
    }
}

testPDFParser();
