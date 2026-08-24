"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();

  const token = params.token as string;

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "/api/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.error ||
            "Password reset failed."
        );
        return;
      }

      setMessage(
        "Password updated successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
          Reset Password
        </h1>

        <p className="mb-6 text-slate-600">
          Enter your new password.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 p-3"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={
              confirmPassword
            }
            onChange={(e) =>
              setConfirmPassword(
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
              ? "Updating..."
              : "Update Password"}
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