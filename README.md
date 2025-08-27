# 🎯 QuizFun - Interactive Real-time Quiz Platform

<div align="center">

![QuizFun Logo](https://img.shields.io/badge/QuizFun-Interactive%20Quiz%20Platform-blue?style=for-the-badge&logo=quiz&logoColor=white)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

*A modern, full-stack quiz platform with real-time multiplayer capabilities, PDF import features, and comprehensive analytics.*

[🚀 Live Demo](#) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/CPF-CADT/QuizFun/issues) • [✨ Request Feature](https://github.com/CPF-CADT/QuizFun/issues)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🛠️ Technology Stack](#️-technology-stack)
- [📚 API Documentation](#-api-documentation)
- [🎮 Game Features](#-game-features)
- [📄 PDF Import](#-pdf-import)
- [🔧 Configuration](#-configuration)
- [🧪 Testing](#-testing)
- [📈 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 Core Functionality
- **🎮 Real-time Multiplayer Quizzes** - Live quiz sessions with multiple participants
- **📱 Responsive Design** - Optimized for desktop and mobile devices
- **🔐 User Authentication** - Secure login/signup with JWT tokens
- **📊 Analytics Dashboard** - Comprehensive quiz and user performance analytics
- **🎨 Quiz Editor** - Intuitive drag-and-drop quiz creation interface

### 📄 Advanced Features
- **📋 PDF Import** - Automatically extract quiz questions from PDF files
- **🏆 Leaderboards** - Real-time rankings and performance tracking
- **📈 Performance Reports** - Detailed analytics for participants and hosts
- **🎲 Quiz Templates** - Pre-made quiz templates for quick setup
- **🔗 Social Features** - Share quizzes and results with others

### 🛡️ Security & Performance
- **⚡ Rate Limiting** - API protection against abuse
- **🧹 Input Sanitization** - XSS and injection attack prevention
- **📱 Responsive UI** - TailwindCSS for modern, mobile-first design
- **🔄 Real-time Updates** - Socket.io for instant game state synchronization

---

## 🏗️ Architecture

QuizFun follows a modern full-stack architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │   Express API   │    │    MongoDB      │
│   (TypeScript)  │◄──►│   (TypeScript)  │◄──►│    Database     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.io     │    │      Redis      │    │   Cloudinary    │
│  (Real-time)    │    │    (Caching)    │    │ (File Storage)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v5 or higher)
- **Redis** (v6 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CPF-CADT/QuizFun.git
   cd QuizFun
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both `server` and `client` directories:
   
   **Server `.env`:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/quizfun
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   
   **Client `.env`:**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB and Redis services
   # MongoDB: mongod
   # Redis: redis-server
   
   # Optional: Seed the database
   cd server
   npm run seed
   ```

5. **Start the Development Servers**
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev
   
   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

6. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000/api
   - **API Documentation**: http://localhost:5000/api-docs

---

## 📁 Project Structure

```
QuizFun/
├── 📁 client/                    # React Frontend
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable UI components
│   │   ├── 📁 pages/           # Route components
│   │   ├── 📁 context/         # React context providers
│   │   ├── 📁 hooks/           # Custom React hooks
│   │   ├── 📁 service/         # API service functions
│   │   ├── 📁 types/           # TypeScript type definitions
│   │   └── 📁 assets/          # Images and static files
│   ├── 📄 package.json
│   └── 📄 vite.config.ts
│
├── 📁 server/                   # Express Backend
│   ├── 📁 config/              # Database and app configuration
│   ├── 📁 controller/          # Request handlers
│   ├── 📁 middleware/          # Express middleware
│   ├── 📁 model/               # Mongoose schemas
│   ├── 📁 routes/              # API route definitions
│   ├── 📁 service/             # Business logic services
│   ├── 📁 sockets/             # Socket.io event handlers
│   ├── 📁 test/                # Test files
│   ├── 📁 types/               # TypeScript type definitions
│   ├── 📁 validations/         # Input validation schemas
│   ├── 📄 app.ts               # Express app configuration
│   ├── 📄 server.ts            # Server entry point
│   └── 📄 package.json
│
├── 📄 README.md                # This file
├── 📄 PDF_IMPORT_DOCUMENTATION.md
└── 📄 sample-quiz-questions.txt
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.1.0 |
| **TypeScript** | Type Safety | 5.8.3 |
| **Vite** | Build Tool | 7.0.4 |
| **TailwindCSS** | Styling | 4.1.11 |
| **React Router** | Navigation | 7.7.1 |
| **Socket.io Client** | Real-time Communication | 4.8.1 |
| **Axios** | HTTP Client | 1.11.0 |
| **Recharts** | Data Visualization | 3.1.2 |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express** | Web Framework | 5.1.0 |
| **TypeScript** | Type Safety | 5.9.2 |
| **MongoDB** | Primary Database | 8.17.0 |
| **Mongoose** | ODM | 8.17.0 |
| **Redis** | Caching & Sessions | 5.8.1 |
| **Socket.io** | Real-time Communication | 4.8.1 |
| **JWT** | Authentication | 9.0.2 |
| **Multer** | File Upload | 2.0.2 |
| **PDF-Parse** | PDF Processing | 1.1.1 |

### DevOps & Testing
- **Jest** - Testing Framework
- **Supertest** - API Testing
- **ESLint** - Code Linting
- **Swagger** - API Documentation
- **Nodemon** - Development Server

---

## 📚 API Documentation

The API is fully documented using Swagger/OpenAPI. Once the server is running, visit:

**🔗 http://localhost:5000/api-docs**

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User authentication |
| `POST` | `/api/auth/signup` | User registration |
| `GET` | `/api/quizz` | Get all quizzes |
| `POST` | `/api/quizz` | Create new quiz |
| `POST` | `/api/quizz/import-pdf` | Import quiz from PDF |
| `POST` | `/api/game/create` | Create game session |
| `POST` | `/api/game/join` | Join game session |
| `GET` | `/api/report/performance/:sessionId` | Get session performance |

---

## 🎮 Game Features

### Real-time Multiplayer
- **Live Sessions**: Create and join quiz sessions in real-time
- **Socket Communication**: Instant updates for all participants
- **Lobby System**: Wait for players before starting
- **Live Leaderboard**: Real-time ranking updates

### Game Flow
1. **Host creates** a quiz session
2. **Players join** using a room code
3. **Game starts** when host is ready
4. **Questions appear** simultaneously for all players
5. **Answers are submitted** with time limits
6. **Results are shown** after each question
7. **Final leaderboard** displays at the end

### Customization Options
- **Time Limits**: Configurable per question
- **Point System**: Custom scoring mechanisms
- **Question Types**: Multiple choice, true/false
- **Difficulty Levels**: Easy, Medium, Hard
- **Privacy Settings**: Public or private sessions

---

## 📄 PDF Import

QuizFun supports automatic quiz generation from PDF files with multiple format recognition.

### Supported Formats

#### Format 1: Q1/Q2 Style
```
Q1: What is the capital of France?
A) London
B) Paris
C) Berlin
D) Madrid
Answer: B
```

#### Format 2: Numbered Style
```
1. What is the largest planet?
a) Earth
b) Jupiter
c) Mars
d) Venus
Correct Answer: b
```

#### Format 3: Simple Style
```
What is the speed of light?
A) 300,000 km/s
B) 150,000 km/s
C) 450,000 km/s
D) 600,000 km/s
Answer: A
```

### Usage
1. **Dashboard**: Import entire PDF as new quiz
2. **Quiz Editor**: Add questions from PDF to existing quiz
3. **File Requirements**: PDF format, max 10MB, text-based content

---

## 🔧 Configuration

### Environment Variables

#### Server Configuration
```env
# Server
NODE_ENV=development|production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/quizfun
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Client Configuration
```env
# API
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Settings
VITE_APP_NAME=QuizFun
VITE_APP_VERSION=1.0.0
```

---

## 🧪 Testing

### Running Tests

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test

# Test coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user journey testing
- **Socket Tests**: Real-time functionality testing

---

## 📈 Deployment

### Production Build

```bash
# Build client
cd client
npm run build

# Build server
cd server
npm run build
```

### Environment Setup
1. **MongoDB Atlas** - Cloud database
2. **Redis Cloud** - Managed Redis instance
3. **Cloudinary** - File storage service
4. **Vercel/Netlify** - Frontend hosting
5. **Heroku/Railway** - Backend hosting

### Docker Deployment (Optional)

```bash
# Build and run with Docker
docker-compose up --build
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow **TypeScript** best practices
- Write **comprehensive tests**
- Update **documentation** as needed
- Follow **conventional commits**
- Ensure **responsive design**

### Code Style
- Use **ESLint** and **Prettier**
- Follow **React** best practices
- Use **TypeScript** strictly
- Write **meaningful** commit messages

---

## 📞 Support

If you encounter any issues or have questions:

- 📧 **Email**: support@quizfun.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/CPF-CADT/QuizFun/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/CPF-CADT/QuizFun/discussions)
- 📚 **Documentation**: [Wiki](https://github.com/CPF-CADT/QuizFun/wiki)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Dr. Duch Dynil** - Our advisor for guidance and mentorship throughout the project
- **Cambodia Academy of Digital Technology (CADT)** for helping organize and support this project
- **Development Team**:
  - **Phy Vatthanak** - Team Collaborator
  - **Cheng Chan Panha** - Team Collaborator
  - **Chhorn Sothea** - Team Collaborator
  - **Sokhalida** - Team Collaborator
  - **Sry Kimsour** - Team Collaborator
  - **Long Chhun Hour** - Team Collaborator
- **Open Source Community** for amazing libraries and tools
- **Contributors** who make this project better every day

---

<div align="center">

**Made with ❤️ by the QuizFun Team**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/CPF-CADT/QuizFun)
[![Contributors](https://img.shields.io/github/contributors/CPF-CADT/QuizFun?style=for-the-badge)](https://github.com/CPF-CADT/QuizFun/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/CPF-CADT/QuizFun?style=for-the-badge)](https://github.com/CPF-CADT/QuizFun/stargazers)
[![Forks](https://img.shields.io/github/forks/CPF-CADT/QuizFun?style=for-the-badge)](https://github.com/CPF-CADT/QuizFun/network/members)

</div>
