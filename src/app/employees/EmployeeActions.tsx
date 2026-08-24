"use client";

import { useSession } from "next-auth/react";
import SendForApprovalButton from "./SendForApprovalButton";

export default function EmployeeActions() {
  const { data: session } = useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role;

  if (!role) {
    return null;
  }

  if (role !== "IT" && role !== "ADMIN") {
    return null;
  }

  return <SendForApprovalButton />;
}