# CareerVerse AI 🎓🤖
## AI-Powered Career & Scholarship Guidance System

---

# 📌 Overview

CareerVerse AI is an intelligent career guidance platform designed to help students make informed career decisions after 10th and 12th grade.
The system uses Artificial Intelligence (powered by Groq + Llama 3.3 70B) to analyze user interests, skills, education background, budget, and career goals — providing personalized recommendations for career paths, colleges, scholarships, and skill development.

---

# ❗ Problem Statement

Many students feel confused after completing 10th or 12th grade while choosing the right course, college, or career path. Students often lack proper guidance related to budget, eligibility, scholarships, and future opportunities.
CareerVerse AI solves this problem by providing a smart AI-powered platform for career guidance, college recommendations, and scholarship assistance.

---

# 🚀 Features

## 👨‍🎓 User Modules

- Student Portal  
- After 10th Guidance  
- After 12th Guidance  
- Scholarship Finder  
- AI Career Assistant  

---

## 🤖 AI Features

- AI Career Recommendation  
- Interest & Skill Analysis  
- Personalized Career Roadmap  
- AI Chatbot Counseling  
- College Recommendation System  
- Eligibility Analysis  
- Skill Suggestions  

---

## 🎓 Scholarship Intelligence

- Government Scholarships  
- Private Scholarships  
- State Scholarships  
- Merit Scholarships  
- Minority Scholarships  

---

## 💰 Financial Planning

- Course Fee Estimation  
- Budget-Based College Filtering  
- Career Investment Guidance  

---

## 📍 Location-Based Features

- Nearby College Search  
- Real-Time College Recommendations  
- Location-Based Filtering  

---

## 🔔 Alerts & Notifications

- Scholarship Alerts  
- Career Notifications  
- Push Notifications  

---

# 🛠 Technology Stack

## 🎨 Frontend

- HTML  
- Tailwind CSS  
- CSS3  
- JavaScript  
- React.js  

### Why We Used React.js?

- Fast and dynamic UI updates  
- Reusable components  
- Better chatbot integration  
- Smooth user experience  

### Why We Used Tailwind CSS?

- Faster UI development  
- Responsive modern design  
- Easy customization  
- Utility-first styling approach  

---

## ⚙️ Backend

- Python  
- REST API / FastAPI  

### Why We Used FastAPI Instead of Node.js + Express?

- Better AI integration with Python  
- Lightweight and high performance  
- Faster API handling  
- Supports asynchronous programming  
- Easy integration with AI libraries  

---

## 🤖 AI / ML

- Groq AI  
- Llama 3.3 70B Versatile Model  

### Why We Used Groq AI?

- Fast AI responses  
- Low latency chatbot interaction  
- Free/affordable API access  
- Suitable for real-time AI systems  

---

## 🗄 Database

- MongoDB  

### Why We Used MongoDB Instead of PostgreSQL?

- Flexible JSON-based storage  
- Better for dynamic AI-generated data  
- Easier handling of chatbot and user preference data  
- Faster development for AI applications  

---

# 🌍 APIs

- Groq API  
- OpenStreetMap API  
- Overpass API  
- Fast2SMS API  

### Why We Used These APIs?

#### 🤖 Groq API
- Used for AI chatbot and career recommendations  
- Provides fast AI responses  

#### 🗺 OpenStreetMap API
- Used for location-based search  
- Helps identify nearby colleges  

#### 📍 Overpass API
- Fetches nearby colleges dynamically  
- Provides real-time college data  

#### 📱 Fast2SMS API
- Used for OTP verification  
- Secure user authentication  

---

# 🔐 Authentication

- JWT Authentication  
- OTP Verification  

### Why We Used JWT?

- Secure login system  
- Stateless authentication  
- Protected API access  
- Better scalability  

---

# 🧰 Tools Used

- GitHub  
- VS Code  
- MongoDB Compass  
- Postman  

---

# 🔄 Workflow

- User Signup / Login  
- OTP Verification  
- AI Profile Analysis  
- Career Recommendation Engine  
- College Recommendation System  
- Scholarship Matching  
- Personalized Results  
- Notifications & Alerts  

---

# 🏗 Project Architecture

CareerVerse AI follows a modular architecture:

- Frontend for user interaction  
- Backend API for processing requests  
- AI engine for recommendation generation  
- MongoDB database for user data storage  
- External APIs for real-time educational and location-based data  

---

# 🌟 Future Enhancements

The following enhancements are planned for upcoming versions of CareerVerse AI, organized by priority and category:

---

## 📱 Phase 1 — Core Feature Completion (Short-Term)

### 🔔 Real SMS OTP Delivery
- Complete Fast2SMS API integration for live OTP delivery  
- Add fallback SMS gateway (e.g., Twilio) if Fast2SMS fails  
- WhatsApp OTP support as an alternative channel  

### 🤖 AI Career Recommendation Engine
- Connect Groq + Llama 3.3 70B to the `/career/recommend` route  
- Build a student interest & skill profiling questionnaire  
- Generate personalized career roadmaps with step-by-step guidance  
- Recommend relevant entrance exams (JEE, NEET, CLAT, etc.) based on profile  

### 🎓 Scholarship Finder
- Integrate a curated scholarship database (Government + Private + State + Minority)  
- Filter scholarships by eligibility: marks, income, caste, state, and course  
- Deadline alerts via email/SMS notifications  
- Direct application links for each scholarship  

### 🏫 College Recommendation System
- Recommend colleges based on student marks, budget, and location  
- Filter by course type: Engineering, Medical, Arts, Commerce, Law  
- Display cutoff ranks, fee structure, and placement stats  
- Budget-based filtering (fee range slider)  

---

## 🗺️ Phase 2 — Location & Intelligence Features (Mid-Term)

### 📍 Location-Based College Search
- Use OpenStreetMap + Overpass API to find nearby colleges on an interactive map  
- Filter by distance radius (5 km, 10 km, 25 km, 50 km)  
- Show college details: address, ratings, courses offered, contact info  
- "Get Directions" integration via Google Maps / OpenStreetMap  

### 📊 Real-Time Admission Prediction
- Train an ML model on historical cutoff data to predict admission chances  
- Input: student marks, category, preferred college → Output: probability score  
- Powered by scikit-learn or a Groq-assisted prediction prompt  

### 🧠 AI Chatbot Counseling (Enhanced)
- Multi-turn conversational AI counselor using Groq API  
- Context-aware: remembers student profile within session  
- Answers questions about courses, colleges, scholarships, and career scope  
- Fallback to human counselor escalation  

---

## 🚀 Phase 3 — Advanced Features (Long-Term)

### 🎙️ Voice-Based AI Assistant
- Speech-to-text input using Web Speech API or Whisper  
- AI responds in audio using text-to-speech (gTTS / ElevenLabs)  
- Useful for students with limited typing ability  

### 🌐 Regional Language Support
- Support for Telugu, Hindi, Tamil, Kannada, and Bengali  
- AI responses translated using Google Translate API or IndicTrans  
- UI language toggle in settings  

### 📄 AI Resume Builder
- Auto-generate student resumes from their CareerVerse profile  
- Templates for freshers, internship seekers, and college applicants  
- Export as PDF with one click  

### 💼 Internship Recommendation System
- Recommend internships based on career path and skills  
- Integrate with Internshala / LinkedIn APIs  
- Track application status within the platform  

### 📱 Mobile Application
- Cross-platform app using React Native  
- Push notifications for scholarship deadlines and OTP  
- Offline support for saved career roadmaps  

### 🏆 Gamification & Progress Tracking
- Career readiness score based on completed profile and skill gaps  
- Badges and milestones for course completions  
- Weekly career tips and challenge tasks  

### 🔒 Enhanced Security
- OTP brute-force lockout (max 5 attempts)  
- Cryptographically secure OTP using Python `secrets` module  
- API rate limiting using `slowapi`  
- Refresh token support for JWT  


# ⚡ Installation

## Clone Repository

```bash
git clone https://github.com/pragnyayelisetti/careerverse-ai.git
cd careerverse-ai
```

## Backend Setup

```bash
cd backend
pip install fastapi uvicorn motor python-jose passlib[bcrypt] httpx python-dotenv
```

Create a `.env` file in `backend/`:

```env
SECRET_KEY=your-strong-secret-key-here
MONGO_URI=mongodb://localhost:27017
DB_NAME=careerverse
FAST2SMS_API_KEY=your-fast2sms-key
GROQ_API_KEY=your-groq-key
```

Run the backend:

```bash
uvicorn main:app --reload
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
