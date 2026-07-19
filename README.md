# Online Judge Platform

A full-stack Online Judge platform built with the MERN stack, 
featuring Docker-based isolated code execution.

## 🚀 Live Demo
[Add link if deployed]

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Execution | Docker |
| Editor | Monaco Editor |

## ✨ Features

- 🔐 JWT Authentication (Signup/Login/Logout)
- 📝 71+ DSA Problems across 20 topics
- ⚡ Real-time code execution via Docker
- 🌐 Multi-language support (C, C++, Java, Python)
- 🏆 Global Leaderboard with difficulty-weighted scoring
- 📊 Submission History with verdict tracking
- 🔍 Problem search and filter (difficulty/topic)
- 👤 User Profile with stats

## 📁 Project Structure
Online-Judge/
├── server/                 # Backend
│   ├── config/            # Database connection
│   ├── controllers/       # Business logic
│   ├── middleware/        # JWT auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── seed/              # Database seed script
│   ├── temp/              # Temp files for execution
│   ├── Dockerfile         # Judge Docker image
│   └── index.js           # Entry point
│
└── client/                # Frontend
└── src/
├── api/           # Axios instance
├── components/    # Navbar, CodeEditor
└── pages/         # All pages

## ⚙️ Prerequisites

- Node.js v18+
- Docker Desktop
- MongoDB Atlas account

## 🔧 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/sharad-31/Online_Judge.git
cd Online-Judge
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
```

### 3. Build Docker Judge Image
```bash
cd server
docker build -t oj-judge .
```

### 4. Seed the Database
```bash
node seed/seedQuestion.js
```

### 5. Start Backend
```bash
npm run dev
```

### 6. Frontend Setup
```bash
cd ../client
npm install
```

Create `.env` file in `client/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 7. Start Frontend
```bash
npm run dev
```

### 8. Open Browser
http://localhost:5173

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/signup | Register user |
| POST | /api/v1/auth/login | Login user |
| GET | /api/v1/auth/me | Get current user |
| PUT | /api/v1/auth/change-password | Change password |

### Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/questions | List all questions |
| GET | /api/v1/questions/:id | Get question detail |
| GET | /api/v1/questions/:id/testcases/sample | Get sample testcases |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/submissions | Submit code |
| GET | /api/v1/submissions/:id | Get submission |
| GET | /api/v1/submissions/user/:id | User submissions |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/leaderboard/global | Global leaderboard |
| GET | /api/v1/leaderboard/users/:id/stats | User stats |

## 🔒 Security Features

- Password hashing with bcrypt
- JWT stateless authentication
- Docker container isolation per submission
- Network disabled inside containers
- Memory & CPU limits enforced
- Input validation on all endpoints

## 🐳 Docker Execution Flow
User submits code
↓
Server writes code to temp file
↓
Docker container starts (isolated)
--network none --memory 256m --cpus 1
↓
Code compiles + runs against test cases
↓
Container auto-deleted (--rm)
↓
Verdict: AC / WA / CE / TLE / RE


## 🗺️ Verdict Types

| Verdict | Meaning |
|---------|---------|
| AC | Accepted |
| WA | Wrong Answer |
| CE | Compilation Error |
| TLE | Time Limit Exceeded |
| RE | Runtime Error |
| MLE | Memory Limit Exceeded |

## 📈 Scoring System

| Difficulty | Points |
|------------|--------|
| Easy | 10 |
| Medium | 20 |
| Hard | 50 |

## 🚧 Version 2 Roadmap

- [ ] Contest Mode
- [ ] Redis Caching
- [ ] RabbitMQ Message Queue
- [ ] WebSocket real-time updates
- [ ] Admin Panel (CRUD for problems)
- [ ] Plagiarism Detection (MOSS)
- [ ] HttpOnly Cookies
- [ ] Rate Limiting

## 👨‍💻 Author

Sharad Gupta 


