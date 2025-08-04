# Smart Interview Scheduler

Ace Your Interviews with Smart AI Evaluation  
Schedule interviews, conduct live sessions, and evaluate candidates using AI-generated insights.

[Get Started](#installation-and-setup) | [Login](#installation-and-setup)

---

## Table of Contents
- [Motivation](#motivation)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Why Smart Interview?](#why-smart-interview)
- [Technologies Used](#technologies-used)
- [Demo](#demo)
- [Screenshots](#screenshots)
- [Installation](#installation-and-setup)

---

## Motivation
The Smart Interview Scheduler was built to streamline the interview process for both interviewers and candidates. By integrating AI-driven evaluation and real-time collaboration tools, it aims to save time, reduce bias, and provide actionable insights for better hiring decisions.

---

## Key Features

- **📅 Smart Scheduling:** Create and manage interviews effortlessly.
- **🎥 Live Video:** Conduct interviews with integrated video calls.
- **🤖 AI Evaluation:** Get automatic review on code and communication.
- **📊 Dashboard:** Track interviews, performance, and feedback.
- **📝 Built-in Code Editor:** Real-time collaborative coding with Monaco Editor.
- **🔗 Easy Room Sharing:** Share interview links for seamless joining.
- **🔒 Role-based Access:** Secure login for interviewers and candidates.

---

## How It Works
1. **Sign up and login** as Interviewer or Candidate
2. **Schedule a new interview** & share room link
3. **Conduct interview** with built-in video & code editor
4. **AI evaluates code + communication** instantly
5. **Interviewer adds final feedback** — ready for candidate!

---

## Why Smart Interview?
With AI evaluation, you save time, reduce bias, and get deeper insights into your candidates.

- ✅ Saves Interviewer's Time
- ✅ Transparent & Fair Reviews
- ✅ Built-in Code & Audio Evaluator
- ✅ Easy for Interviewers & Candidates

---

## Technologies Used 🔧
- **Front-End:** JavaScript, Next.js, TailwindCSS, Monaco Editor, Lucide React
- **Back-End:** Node.js, Express, JWT, Redis, BullMQ
- **Database:** PostgreSQL, Prisma
- **Video/Audio:** Jitsi Meet, RecordRTC
- **AI/ML:** HuggingFace, OpenRouter
- **Storage:** Cloudinary, Supabase
- **DevOps:** Docker

---

## Demo
[Live Demo](https://your-demo-link.com)

---

## Screenshots
> _Add screenshots here_

![Dashboard Screenshot](https://your-demo-link.com/screenshot1.png)
![Interview Room Screenshot](https://your-demo-link.com/screenshot2.png)

---

## Installation and Setup

### Prerequisites
- Node.js (v16+ recommended)
- Docker (optional, for containerized setup)

### Clone the Repository
```sh
git clone https://github.com/<your-github-username>/smart-interview-scheduler.git
cd smart-interview-scheduler
```

### Install Dependencies
#### Server-side
```sh
cd server
npm install
cd ..
```
#### Client-side
```sh
cd client
npm install
cd ..
```

### Environment Variables
Create a `.env` file in the `/server` directory and add the necessary environment variables:
```sh
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
REDIS_URL=redis://localhost:6379
BULLMQ_URL=redis://localhost:6379
HUGGINGFACE_API_KEY=your_huggingface_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Running the App
#### Start the Server
```sh
cd server
npm run dev
```
#### Start the Client
```sh
cd client
npm run dev
```

---

## License
[MIT](LICENSE)

---

> _For demo and screenshots, replace the dummy links with your actual resources._ 