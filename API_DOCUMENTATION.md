# LearnX API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.learnx.com/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true|false,
  "data": { ... },
  "message": "Optional message"
}
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Google Login
```http
POST /api/auth/google
Content-Type: application/json

{
  "token": "google-oauth-token"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## User Endpoints

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
```

### Get Learning DNA
```http
GET /api/users/learning-dna
Authorization: Bearer <token>
```

---

## Course Endpoints

### Get All Courses
```http
GET /api/courses
```

### Get Single Course
```http
GET /api/courses/:id
```

### Enroll in Course
```http
POST /api/courses/:id/enroll
Authorization: Bearer <token>
```

---

## Lesson Endpoints

### Get Lesson
```http
GET /api/lessons/:id
Authorization: Bearer <token>
```

### Mark Lesson as Complete
```http
POST /api/lessons/:id/complete
Authorization: Bearer <token>
```

---

## Quiz Endpoints

### Get Quiz
```http
GET /api/quizzes/:id
Authorization: Bearer <token>
```

### Submit Quiz
```http
POST /api/quizzes/:id/submit
Authorization: Bearer <token>
```

---

## AI Endpoints

### Chat with AI Tutor
```http
POST /api/ai/chat
Authorization: Bearer <token>
```

### Get AI Explanation
```http
POST /api/ai/explain
Authorization: Bearer <token>
```

---

## Teacher Endpoints

### Create Course
```http
POST /api/teacher/courses
Authorization: Bearer <token>
```

---

## Admin Endpoints

### Get Platform Statistics
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

---

## Leaderboard Endpoints

### Get Global Leaderboard
```http
GET /api/leaderboard/global
```

---

## Recommendation Endpoints

### Get Learning Path
```http
GET /api/recommendations/learning-path
Authorization: Bearer <token>
```

### Get Daily Goals
```http
GET /api/recommendations/daily-goals
Authorization: Bearer <token>
```
