"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = async () => {
    setError("");

    const result = await signIn(
      "credentials",
      {
        email,
        password,
        redirect: false,
      }
    );

    if (result?.error) {
      setError(
        "Invalid email or password"
      );
      return;
    }

    router.push("/home");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F2EC]">
      <div className="w-full max-w-md rounded-3xl border border-[#DFDACB] bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold text-[#1B2A41]">
          Login
        </h1>

        <p className="mb-6 text-slate-600">
          Sign in to continue
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="mb-4 w-full rounded-xl border border-[#DFDACB] p-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#F1E6BE]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="mb-2 w-full rounded-xl border border-[#DFDACB] p-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#F1E6BE]"
        />

        <button
          type="button"
          onClick={() =>
            router.push(
              "/forgot-password"
            )
          }
          className="mb-4 text-sm text-[#1B2A41] hover:opacity-80"
        >
          Forgot Password?
        </button>

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-[#1B2A41] py-3 text-white transition hover:opacity-90"
        >
          Login
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/signup")
          }
          className="mt-4 w-full text-[#1B2A41] hover:opacity-80"
        >
          Create an Account
        </button>

        {error && (
          <p className="mt-4 text-center text-red-600">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}