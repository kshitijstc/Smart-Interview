"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router=useRouter();
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <button
        onClick={() => {
          router.push("/login");
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Login
      </button>
      <button
        onClick={() => {
          router.push("/signup");
        }}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Go to Signup
      </button>
    </div>
  );
}
