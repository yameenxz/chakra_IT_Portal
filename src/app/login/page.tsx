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
    <main className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Login
        </h1>

        <p className="mb-6 text-slate-500">
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
          className="mb-4 w-full rounded-xl border border-slate-300 p-3"
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
          className="mb-2 w-full rounded-xl border border-slate-300 p-3"
        />

        <button
          type="button"
          onClick={() =>
            router.push(
              "/forgot-password"
            )
          }
          className="mb-4 text-sm text-violet-600 hover:text-violet-800"
        >
          Forgot Password?
        </button>

        <button
          onClick={handleLogin}
          className="w-full rounded-xl bg-violet-600 py-3 text-white hover:bg-violet-700"
        >
          Login
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/signup")
          }
          className="mt-4 w-full text-violet-600 hover:text-violet-800"
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