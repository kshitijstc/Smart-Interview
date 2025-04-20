"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb] text-[#111827]">
      
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Ace Your Interviews with <span className="bg-gradient-to-br from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold">Smart AI</span> Evaluation
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-700">
          Schedule interviews, conduct live sessions, and evaluate candidates using AI-generated insights.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push("/signup")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push("/login")}
            className="border border-blue-500 text-blue-500 px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-50 transition"
          >
            Login
          </button>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Smart Scheduling",
              desc: "Create and manage interviews effortlessly.",
              icon: "📅",
            },
            {
              title: "Live Video",
              desc: "Conduct interviews with integrated video calls.",
              icon: "🎥",
            },
            {
              title: "AI Evaluation",
              desc: "Get automatic review on code + communication.",
              icon: "🤖",
            },
            {
              title: "Dashboard",
              desc: "Track interviews, performance, and feedback.",
              icon: "📊",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-100 p-6 rounded-2xl text-center shadow hover:shadow-md transform hover:scale-105 transition duration-300"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-[#f9fafb]">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <ol className="max-w-3xl mx-auto space-y-6 text-lg text-gray-800">
          <li>1️⃣ Sign up and login as Interviewer or Candidate</li>
          <li>2️⃣ Schedule a new interview & share room link</li>
          <li>3️⃣ Conduct interview with built-in video & code editor</li>
          <li>4️⃣ AI evaluates code + communication instantly</li>
          <li>5️⃣ Interviewer adds final feedback — ready for candidate!</li>
        </ol>
      </section>

      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Why Smart Interview?</h2>
        <p className="max-w-2xl mx-auto text-gray-700 mb-8">
          We're changing the way interviews happen. With AI evaluation, you save time,
          reduce bias, and get deeper insights into your candidates.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-gray-100 p-4 rounded-xl hover:shadow-md hover:scale-105 transform transition">✅ Saves Interviewer's Time</div>
          <div className="bg-gray-100 p-4 rounded-xl hover:shadow-md hover:scale-105 transform transition">✅ Transparent & Fair Reviews</div>
          <div className="bg-gray-100 p-4 rounded-xl hover:shadow-md hover:scale-105 transform transition">✅ Built-in Code & Audio Evaluator</div>
          <div className="bg-gray-100 p-4 rounded-xl hover:shadow-md hover:scale-105 transform transition">✅ Easy for Interviewers & Candidates</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-500 text-center py-6">
      </footer>
    </div>
  );
}
