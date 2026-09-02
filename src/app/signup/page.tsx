"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(
        data.error || "Failed to create account"
      );
      return;
    }

    router.push("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F2EC]">
      <div className="w-full max-w-md rounded-3xl border border-[#DFDACB] bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold text-[#1B2A41]">
          Create Account
        </h1>

        <p className="mb-6 text-slate-600">
          Register using your Gurujana email.
        </p>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="mb-4 w-full rounded-xl border border-[#DFDACB] p-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#F1E6BE]"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="mb-4 w-full rounded-xl border border-[#DFDACB] p-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#F1E6BE]"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="mb-4 w-full rounded-xl border border-[#DFDACB] p-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#F1E6BE]"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
          className="mb-6 w-full rounded-xl border border-[#DFDACB] p-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#F1E6BE]"
        />

        <button
          onClick={handleSignup}
          className="w-full rounded-xl bg-[#1B2A41] py-3 text-white transition hover:opacity-90"
        >
          Create Account
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/login")
          }
          className="mt-4 w-full text-[#1B2A41] hover:opacity-80"
        >
          Back to Login
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