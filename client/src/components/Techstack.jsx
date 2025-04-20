"use client"

export default function TechStack() {
    const techs = [
        { name: "JavaScript", icon: "https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black" },
        { name: "Next.js", icon: "https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white" },
        { name: "Node.js", icon: "https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" },
        { name: "Express", icon: "https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" },
        { name: "PostgreSQL", icon: "https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" },
        { name: "Prisma", icon: "https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white" },
        { name: "Jitsi Meet", icon: "https://img.shields.io/badge/Jitsi-118BF4?logo=meetup&logoColor=white" },
        { name: "JWT", icon: "https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white" },
        { name: "Redis", icon: "https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white" },
        { name: "BullMQ", icon: "https://img.shields.io/badge/BullMQ-EA1E1E?logo=nodedotjs&logoColor=white" },
        { name: "TailwindCSS", icon: "https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white" },
        { name: "Monaco Editor", icon: "https://img.shields.io/badge/Monaco-1f1f1f?logo=visualstudiocode&logoColor=blue" },
        { name: "Cloudinary", icon: "https://img.shields.io/badge/Cloudinary-3448C5?logo=cloudinary&logoColor=white" },
        { name: "Lucide React", icon: "https://img.shields.io/badge/Lucide_React-000000?logo=react&logoColor=white" },
        { name: "HuggingFace", icon: "https://img.shields.io/badge/HuggingFace-FFDA6B?logo=huggingface&logoColor=black" },
        { name: "OpenRouter", icon: "https://img.shields.io/badge/OpenRouter-000000?logo=api&logoColor=white" },
        { name: "Docker", icon: "https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" },
        { name: "RecordRTC", icon: "https://img.shields.io/badge/RecordRTC-4B0082?logo=webrtc&logoColor=white" },
    ];
  
    return (
      <section className="bg-gray-100 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Tech Used 🔧</h2>
        <div className="flex flex-wrap justify-center gap-5 max-w-5xl mx-auto">
          {techs.map((tech, index) => (
            <div key={index} className="transition transform hover:scale-105">
              <img
                src={tech.icon}
                alt={tech.name}
                title={tech.name}
                className="h-7"
              />
            </div>
          ))}
        </div>
      </section>
    );
}