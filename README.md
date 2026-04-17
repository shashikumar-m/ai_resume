# HireReady Resume AI — AI-Powered Interview Preparation Suite

A free, open-source interview preparation platform with AI resume building, mock interviews, coding challenges, and personalized learning paths.

## Features

- **AI Resume Builder** — 13 templates, ATS scoring, Groq AI generation, PDF export
- **Interview Q&A Generator** — Role-specific questions with AI feedback
- **Voice Mock Interview** — AI interviewer speaks questions, evaluates your answers
- **Study Concepts** — AI-generated study guides with curated resources
- **Code & Test** — Coding challenges with AI code review
- **AI Learning Path** — Personalized roadmap + daily study plan
- **Skill Gap Analysis** — Compare skills vs role requirements
- **Performance Analytics** — Track progress over time
- **History** — Save and revisit all sessions

## Tech Stack

- **Frontend**: React 19, Vite, React Router v7, CSS Modules
- **AI**: Groq API (llama-3.3-70b-versatile) — free tier
- **Voice**: Web Speech API (browser built-in)
- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/interview-prep-ai.git
cd interview-prep-ai
```

### 2. Setup the backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
node index.js
```

### 3. Setup the frontend

```bash
cd interview-prep-ai
npm install
cp .env.example .env
# Edit .env with your Groq API key
npm run dev
```

### 4. Open the app

Visit `http://localhost:5173`

## Environment Variables

### Backend (`server/.env`)
```
MONGO_URI=mongodb://localhost:27017/interviewai
JWT_SECRET=your_secret_key
PORT=5000
```

### Frontend (`interview-prep-ai/.env`)
```
VITE_GROQ_API_KEY=your_groq_api_key
```

## License

MIT
