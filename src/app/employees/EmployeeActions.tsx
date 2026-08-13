"use client";

import { useEffect, useState } from "react";
import SendForApprovalButton from "./SendForApprovalButton";

export default function EmployeeActions() {
  const [role, setRole] =
    useState<string | null>(null);

  useEffect(() => {
    setRole(
      localStorage.getItem("role")
    );
  }, []);

  if (role === null) {
    return null;
  }

  if (role !== "IT") {
    return null;
  }

  return <SendForApprovalButton />;
}