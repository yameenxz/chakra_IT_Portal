"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AddLicensePage() {
  const router = useRouter();

  const { data: session } = useSession();

  const role = (
    session?.user as {
      role?: string;
    }
  )?.role;

  const [productName, setProductName] =
    useState("");

  const [assignedLicenses, setAssignedLicenses] =
    useState("");

  const [availableLicenses, setAvailableLicenses] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
    useState("");

  const [nextInvoiceDate, setNextInvoiceDate] =
    useState("");

  const [purchasedQuantity, setPurchasedQuantity] =
    useState("");

  const [renewalDate, setRenewalDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  if (
    role &&
    role !== "IT" &&
    role !== "ADMIN"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="rounded-xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-red-600">
            Access Denied
          </h1>

          <p className="mt-2 text-slate-600">
            Only IT and Admin users can add licenses.
          </p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response =
        await fetch(
          "/api/licenses",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              productName,
              assignedLicenses,
              availableLicenses,
              purchaseDate,
              nextInvoiceDate,
              purchasedQuantity:
                purchasedQuantity
                  ? Number(
                      purchasedQuantity
                    )
                  : null,
              renewalDate,
              notes,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save license"
        );
      }

      alert(
        "License added successfully."
      );

      router.push(
        "/licenses/list"
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save license"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-5xl font-bold text-white">
          Add License
        </h1>

        <p className="mb-8 text-lg text-slate-400">
          Create a new software
          license record manually.
        </p>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block font-medium">
                Product Name *
              </label>

              <input
                type="text"
                required
                value={
                  productName
                }
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  Assigned
                  Licenses
                </label>

                <input
                  type="text"
                  value={
                    assignedLicenses
                  }
                  onChange={(e) =>
                    setAssignedLicenses(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Available
                  Licenses
                </label>

                <input
                  type="text"
                  value={
                    availableLicenses
                  }
                  onChange={(e) =>
                    setAvailableLicenses(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  Purchase Date
                </label>

                <input
                  type="date"
                  value={
                    purchaseDate
                  }
                  onChange={(e) =>
                    setPurchaseDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Next Invoice
                  Date
                </label>

                <input
                  type="date"
                  value={
                    nextInvoiceDate
                  }
                  onChange={(e) =>
                    setNextInvoiceDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium">
                  Purchased
                  Quantity
                </label>

                <input
                  type="number"
                  value={
                    purchasedQuantity
                  }
                  onChange={(e) =>
                    setPurchasedQuantity(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">
                  Renewal Date *
                </label>

                <input
                  type="date"
                  required
                  value={
                    renewalDate
                  }
                  onChange={(e) =>
                    setRenewalDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium">
                Notes
              </label>

              <textarea
                rows={4}
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save License"}
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/licenses"
                  )
                }
                className="rounded-lg bg-slate-200 px-6 py-3 font-medium text-slate-900 hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}