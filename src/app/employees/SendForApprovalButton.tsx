"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SendForApprovalButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);

    await fetch(
      "/api/employees/send-for-approval",
      {
        method: "POST",
      }
    );

    router.refresh();

    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-2xl bg-violet-500 px-6 py-4 text-white shadow-sm hover:bg-violet-600 disabled:opacity-50"
    >
      {loading
        ? "Sending..."
        : "Send For Approval"}
    </button>
  );
}