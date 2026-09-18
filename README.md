# LearnX – AI-Powered Personalized Learning & Skill Development Platform

An intelligent learning platform that understands a student's learning level, identifies weak areas, and creates personalized learning paths.

## 🎯 Features

- **Student Dashboard**: Track progress, courses, streaks, and weak topics
- **AI Learning Assistant**: Natural language Q&A, concept explanations, practice questions
- **Personalized Learning Path**: AI-driven recommendations based on performance
- **Smart Quiz**: MCQs, True/False, coding questions with instant evaluation
- **AI Weakness Detection**: Automatic identification of weak topics
- **Notes & Documents**: Upload PDFs/PPTs for AI-generated summaries and flashcards
- **Gamification**: XP points, badges, streaks, leaderboards
- **Teacher/Admin Panel**: Course creation, student performance tracking

## 🏗️ Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: Python/FastAPI + LLM API
- **Authentication**: JWT + Google Login

## 📁 Project Structure

```
learnx/
├── frontend/          # React application
├── backend/           # Node.js/Express API
├── ai-service/        # Python/FastAPI AI services
└── shared/            # Shared types and utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Python (v3.9+)

### Installation

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

### Environment Variables

Create `.env` files in both `frontend` and `backend` directories with required configuration.

## 📱 Main Screens

1. Splash / Login
2. Student Dashboard
3. Course Explorer
4. Course Details
5. Video/Lesson Player
6. AI Tutor
7. Quiz
8. Quiz Result
9. AI Weakness Analysis
10. Personalized Learning Path
11. Notes & PDF Analyzer
12. Progress Analytics
13. Leaderboard
14. Profile
15. Teacher Dashboard
16. Admin Panel

## ⭐ Unique Feature: AI Learning DNA

Every student gets a dynamic learning profile that continuously updates based on activity:
- Learning Style
- Strong/Weak Areas
- Quiz Performance
- Consistency Metrics
- Recommended Difficulty
