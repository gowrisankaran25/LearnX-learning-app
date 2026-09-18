# LearnX Setup Guide

## Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas connection string)
- Python (v3.9+) - for AI service
- OpenAI API Key - for AI features

## Environment Setup

### 1. Backend Environment
Create `backend/.env`:
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/learnx
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Service
AI_SERVICE_URL=http://localhost:8000
LLM_API_KEY=your-llm-api-key
LLM_MODEL=gpt-4
```

### 2. Frontend Environment
Create `frontend/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. AI Service Environment
Create `ai-service/.env`:
```bash
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

## Running the Application

### Option 1: Run All Services (Recommended)
```bash
npm run dev
```
This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

### Option 2: Run Services Individually

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

**AI Service (Optional):**
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

## Database Setup

### Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. No additional setup needed - the app will create the database automatically

### MongoDB Atlas (Cloud)
1. Create a free MongoDB Atlas account
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in backend/.env

## Testing the Application

1. Open http://localhost:3000
2. Register a new account
3. Explore the dashboard and features

## Features to Test

- **Authentication**: Login, Register, Profile management
- **Courses**: Browse, enroll, view details
- **Lessons**: Watch videos, mark complete
- **Quizzes**: Take quizzes, view results
- **AI Tutor**: Chat with AI (requires AI service running)
- **Notes Analyzer**: Upload PDFs for analysis (requires AI service running)
- **Leaderboard**: View rankings
- **Dashboard**: Track progress and stats

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in backend/.env
- For Atlas, whitelist your IP address

### Frontend API Errors
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend/.env
- Check CORS settings in backend

### AI Service Not Working
- Ensure AI service is running on port 8000
- Check OPENAI_API_KEY in ai-service/.env
- Verify Python dependencies are installed

## Development Notes

- The frontend uses mock data when APIs are not available
- AI features will show fallback responses if AI service is not running
- All data is stored in MongoDB
- JWT tokens are used for authentication

## Production Deployment

For production deployment:
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure proper CORS origins
4. Use MongoDB Atlas instead of local MongoDB
5. Deploy AI service separately
6. Enable HTTPS
7. Set up proper logging and monitoring
