"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type License = {
  id: string;
  productName: string;
  assignedLicenses: string;
  availableLicenses: string;
  purchasedQuantity: number | null;
  purchaseDate: string | null;
  nextInvoiceDate: string | null;
  renewalDate: string | null;
  notes: string | null;
};

export default function ManageLicensePage() {
  const params = useParams();
  const router = useRouter();

  const [license, setLicense] =
    useState<License | null>(null);

  const [productName, setProductName] =
    useState("");

  const [
    assignedLicenses,
    setAssignedLicenses,
  ] = useState("");

  const [
    availableLicenses,
    setAvailableLicenses,
  ] = useState("");

  const [
    purchasedQuantity,
    setPurchasedQuantity,
  ] = useState("");

  const [purchaseDate, setPurchaseDate] =
    useState("");

  const [
    nextInvoiceDate,
    setNextInvoiceDate,
  ] = useState("");

  const [renewalDate, setRenewalDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadLicense();
  }, []);

  const loadLicense =
    async () => {
      try {
        const response =
          await fetch(
            "/api/licenses"
          );

        const data =
          await response.json();

        const foundLicense =
          data.find(
            (l: License) =>
              l.id === params.id
          );

        if (!foundLicense) {
          return;
        }

        setLicense(foundLicense);

        setProductName(
          foundLicense.productName || ""
        );

        setAssignedLicenses(
          foundLicense.assignedLicenses ||
            ""
        );

        setAvailableLicenses(
          foundLicense.availableLicenses ||
            ""
        );

        setPurchasedQuantity(
          foundLicense.purchasedQuantity
            ? String(
                foundLicense.purchasedQuantity
              )
            : ""
        );

        setPurchaseDate(
          foundLicense.purchaseDate
            ? new Date(
                foundLicense.purchaseDate
              )
                .toISOString()
                .split("T")[0]
            : ""
        );

        setNextInvoiceDate(
          foundLicense.nextInvoiceDate
            ? new Date(
                foundLicense.nextInvoiceDate
              )
                .toISOString()
                .split("T")[0]
            : ""
        );

        setRenewalDate(
          foundLicense.renewalDate
            ? new Date(
                foundLicense.renewalDate
              )
                .toISOString()
                .split("T")[0]
            : ""
        );

        setNotes(
          foundLicense.notes || ""
        );
      } catch (error) {
        console.error(error);
      }
    };

  const handleSave =
    async () => {
      if (!renewalDate) {
        alert(
          "Renewal Date is required."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            `/api/licenses/${params.id}/renew`,
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
                purchasedQuantity:
                  purchasedQuantity
                    ? Number(
                        purchasedQuantity
                      )
                    : null,
                purchaseDate,
                nextInvoiceDate,
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
              "Save failed"
          );
        }

        router.replace(
          "/licenses/list"
        );
        router.refresh();
      } catch (error) {
        console.error(error);

        alert(
          "Failed to save license."
        );
      } finally {
        setLoading(false);
      }
    };

  if (!license) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-white">
          Manage License
        </h1>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Name
              </label>

              <input
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Assigned Licenses
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
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Available Licenses
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Purchased Quantity
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

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Purchase Date
                </label>

                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) =>
                    setPurchaseDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Next Invoice Date
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Renewal Date
              </label>

              <input
                type="date"
                value={renewalDate}
                onChange={(e) =>
                  setRenewalDate(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={4}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  router.push(
                    "/licenses"
                  )
                }
                className="rounded-lg border px-5 py-3"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleSave
                }
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:bg-slate-400"
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}