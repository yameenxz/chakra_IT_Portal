"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response =
        await fetch(
          "/api/forgot-password",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Something went wrong."
        );
        return;
      }

      setMessage(
        "Password reset email sent. Please check your inbox."
      );
    } catch {
      setMessage(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">
          Forgot Password
        </h1>

        <p className="mb-6 text-slate-600">
          Enter your email address to
          reset your password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 p-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : "Reset Password"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-slate-700">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}