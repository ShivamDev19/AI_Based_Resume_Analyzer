# 🤖 AI Based Resume Analyzer

A full-stack MERN application that analyzes resumes using AI and provides detailed feedback based on a given Job Description (JD). The platform helps users improve their resumes by identifying strengths, weaknesses, missing skills, and overall ATS compatibility.

---

## 🚀 Features

### 👤 User Features

- User Registration & Login
- JWT Authentication
- Resume Upload (PDF)
- Resume Parsing
- AI-Powered Resume Analysis
- Job Description Matching
- ATS Score Generation
- Skill Gap Analysis
- Resume History
- Responsive UI

### 🤖 AI Features

- Resume Content Extraction
- Resume vs Job Description Comparison
- Missing Skills Detection
- ATS Compatibility Analysis
- Resume Improvement Suggestions
- AI Generated Feedback

---

## 🛠️ Tech Stack

### Frontend

- React.js
- React Router DOM
- Axios
- Tailwind CSS
- Context API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- pdf-parse
- Groq AI API

---

## 📂 Project Structure

```text
AI_Based_Resume_Analyzer
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── config
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/ShivamDev19/AI_Based_Resume_Analyzer.git
```

### Install Dependencies

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

GROQ_API_KEY=your_groq_api_key
```

---

## 📸 Screenshots

<img width="1901" height="907" alt="Screenshot 2026-08-05 210507" src="https://github.com/user-attachments/assets/5e4c0cd2-b3d4-4521-a531-f17dd0f6003a" />
<img width="1891" height="907" alt="Screenshot 2026-08-05 210353" src="https://github.com/user-attachments/assets/0da7fa3f-9df2-4b7d-aad9-4b92fa5a65c1" />
<img width="1901" height="906" alt="Screenshot 2026-08-05 210419" src="https://github.com/user-attachments/assets/0d114539-fdc3-4770-98bd-d8e686cc33b7" />
<img width="1890" height="913" alt="Screenshot 2026-08-05 210435" src="https://github.com/user-attachments/assets/a5fdccd9-5794-434d-8802-428c1a66ca5b" />
<img width="1900" height="907" alt="Screenshot 2026-08-05 210450" src="https://github.com/user-attachments/assets/76dc76c8-0485-4531-85e1-6cfc086a1c8a" />

---

## 📌 Future Improvements

- AI Mock Interview Module
- Resume Builder
- Resume Templates
- Cover Letter Generator
- Multi-language Resume Support
- Docker Support
- Redis Caching
- Email Reports
- Export Analysis as PDF

---

## 👨‍💻 Author

**Shivam Sonawane**

GitHub: https://github.com/ShivamDev19

---

## 📄 License

This project is developed for learning and portfolio purposes.
