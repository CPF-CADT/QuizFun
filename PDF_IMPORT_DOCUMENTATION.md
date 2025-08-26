# PDF Quiz Import Feature

This feature allows users to import quiz questions from PDF files and automatically create quizzes from them. Users can then edit the imported questions as needed.

## Recent Improvements

- **Fixed Multiple Format Support**: The parser now properly combines questions from different formats in the same PDF
- **Enhanced Logging**: Better debugging information to track parsing progress
- **Improved Regex Patterns**: More flexible handling of spacing and formatting variations
- **Duplicate Detection**: Prevents duplicate questions when multiple patterns match the same content

## Supported PDF Formats

The PDF parser supports several question formats:

### Format 1: Q1/Q2 with A-D options
```
Q1: What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid
Answer: B

Q2: What is 2 + 2?
A) 3
B) 4
C) 5
D) 6
Answer: B
```

### Format 2: Numbered questions with a-d options
```
1. What is the largest planet in our solar system?
a) Earth
b) Jupiter
c) Mars
d) Venus
Correct Answer: b

2. What is the chemical symbol for gold?
a) Go
b) Gd
c) Au
d) Ag
Correct Answer: c
```

### Format 3: Simple format (auto-detected)
```
What is the speed of light?
A) 300,000 km/s
B) 150,000 km/s
C) 450,000 km/s
D) 600,000 km/s
Answer: A

Which programming language is known for machine learning?
1. JavaScript
2. Python
3. PHP
4. CSS
Correct: 2
```

## Features

1. **PDF Upload**: Users can drag and drop or select PDF files
2. **Automatic Parsing**: The system automatically extracts questions and answers
3. **Format Detection**: Multiple question formats are supported
4. **Question Preview**: Users can preview parsed questions before creating the quiz
5. **Error Reporting**: The system reports any parsing issues or warnings
6. **Quiz Creation**: Two modes:
   - Create a new quiz from imported questions (Dashboard)
   - Add questions to an existing quiz (Quiz Editor)

## Usage

### Creating a New Quiz from PDF (Dashboard)
1. Go to Dashboard
2. Click "Import from PDF" button
3. Upload your PDF file
4. Review parsed questions
5. Fill in quiz details (title, description, difficulty)
6. Click "Create Quiz"

### Adding Questions to Existing Quiz (Quiz Editor)
1. Open a quiz in the Quiz Editor
2. Click "Import from PDF" button in the sidebar
3. Upload your PDF file
4. Review parsed questions
5. Click "Add X Questions" to add them to your quiz

## File Requirements

- **File Type**: PDF only
- **File Size**: Maximum 10MB
- **Content**: Text-based PDFs (scanned images may not work properly)
- **Questions**: Minimum 2 options per question
- **Answers**: Each question must have a correct answer indicated

## Default Question Settings

When questions are imported, they receive default settings:
- **Points**: 10 points per question
- **Time Limit**: 30 seconds per question
- **Difficulty**: Inherits from quiz settings

These can be edited after import using the Quiz Editor.

## API Endpoints

### Import PDF
```
POST /api/quizz/import-pdf
Content-Type: multipart/form-data

Body: {
  pdf: <PDF file>
}

Response: {
  message: "PDF parsed successfully",
  data: {
    questions: [...],
    errors: [...]
  }
}
```

### Test Parser (Development Only)
```
GET /api/quizz/test-parser

Response: {
  message: "Parser test completed",
  data: {
    questions: [...],
    errors: [],
    totalQuestions: number
  }
}
```

### Create Quiz from Import
```
POST /api/quizz/create-from-import
Content-Type: application/json

Body: {
  title: "Quiz Title",
  description: "Quiz Description",
  visibility: "private",
  dificulty: "Medium",
  questions: [...]
}

Response: {
  message: "Quiz created successfully with imported questions",
  data: <Quiz object>
}
```
