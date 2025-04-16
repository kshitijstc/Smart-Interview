"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AuthForm({ type }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
        const url = type === "login" ? "http://localhost:5000/api/login" : "http://localhost:5000/api/signup";
        const res = await axios.post(url, data);
        console.log(res.data);
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        router.push("/dashboard");
      } catch (error) {
        setError(error.response?.data?.message || "Something went wrong");
      }
  };

  return (
    <div key={type}>
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 w-full py-8"
    >
      <h2 className="text-2xl font-semibold text-center capitalize">
        {type} Form
      </h2>

      {type === "signup" && (
        <>
          <input
            type="text"
            placeholder="Name"
            className="p-3 rounded border border-gray-300"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </>
      )}
      <input
        type="email"
        placeholder="Email"
        className="p-3 rounded border border-gray-300"
        {...register("email", { required: "Email is required" })}
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      <input
        type="password"
        placeholder="Password"
        className="p-3 rounded border border-gray-300"
        {...register("password", { required: "Password is required" })}
      />
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password.message}</p>
      )}

      {/* Role dropdown (optional now, but we’ll need it soon) */}
      {type === "signup" && (
        <div>
          <select
            className="p-3 rounded border border-gray-300 w-full"
            {...register("role", { required: "Role is required" })}
          >
            <option value="">Select Role</option>
            <option value="CANDIDATE">Candidate</option>
            <option value="INTERVIEWER">Interviewer</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition"
      >
        {type === "login" ? "Login" : "Signup"}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}
    </form>
    </div>
  );
}

