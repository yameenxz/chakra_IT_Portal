"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

export default function LicenseUploadPage() {
  const router = useRouter();

  const {
    data: session,
    status,
  } = useSession();

  const role =
    (session?.user as {
      role?: string;
    })?.role;

  useEffect(() => {
  if (
    status !== "loading" &&
    role !== "IT" &&
    role !== "IT_HEAD" &&
    role !== "ADMIN"
  ) {
    router.push("/home");
  }
}, [role, status, router]);

  const [rows, setRows] = useState<
    Record<string, unknown>[]
  >([]);

  const [message, setMessage] =
    useState("");

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = (e) => {
      const data =
        e.target?.result;

      const workbook = XLSX.read(
        data,
        {
          type: "binary",
          cellDates: true,
        }
      );

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const jsonData =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
            raw: false,
          }
        );

      setRows(
        jsonData as Record<
          string,
          unknown
        >[]
      );
    };

    reader.readAsBinaryString(file);
  };

  const saveLicenses =
    async () => {
      const licenses =
        rows.map((row) => ({
          productName: String(
            row[
              "Product name (includes custom names)"
            ] ?? ""
          ).trim(),

          assignedLicenses: String(
            row[
              "Assigned licenses"
            ] ?? ""
          ).trim(),

          availableLicenses: String(
            row[
              "Available licenses"
            ] ?? ""
          ).trim(),

          nextInvoiceDate: String(
            row[
              "Next invoice date"
            ] ?? ""
          ).trim(),

          purchaseDate: String(
            row[
              "Purchase date"
            ] ?? ""
          ).trim(),

          purchasedQuantity:
            Number(
              row[
                "Purchased quantity"
              ]
            ) || null,

          renewalDate: String(
            row[
              "Renewal or expiration date"
            ] ?? ""
          ).trim(),

          subscriptionStatus:
            String(
              row[
                "Subscription status"
              ] ?? ""
            ).trim(),
        }));

      const response =
        await fetch(
          "/api/licenses",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              licenses
            ),
          }
        );

      if (response.ok) {
        setMessage(
          "Licenses imported successfully."
        );

        setTimeout(() => {
          router.push(
            "/licenses"
          );
        }, 1000);
      } else {
        setMessage(
          "Failed to import licenses."
        );
      }
    };

  if (status === "loading") {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-[1800px]">
        <h1 className="mb-2 text-4xl font-bold text-[#1B2A41]">
          Import Licenses
        </h1>

        <p className="mb-8 text-slate-600">
          Upload the Microsoft
          licensing export.
        </p>

        <div className="rounded-3xl border border-[#DFDACB] bg-white p-8 shadow-md">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={
              handleFileUpload
            }
            className="w-full"
          />
        </div>

        {rows.length > 0 && (
          <>
            <div className="mt-8 overflow-x-auto rounded-3xl border border-[#DFDACB] bg-white shadow-md">
              <table className="min-w-full">
                <thead className="bg-[#F6F2E8]">
                  <tr>
                    <th className="p-4 text-left">
                      Product Name
                    </th>

                    <th className="p-4 text-left">
                      Assigned Licenses
                    </th>

                    <th className="p-4 text-left">
                      Available Licenses
                    </th>

                    <th className="p-4 text-left">
                      Next Invoice Date
                    </th>

                    <th className="p-4 text-left">
                      Purchase Date
                    </th>

                    <th className="p-4 text-left">
                      Purchased Quantity
                    </th>

                    <th className="p-4 text-left">
                      Renewal /
                      Expiration Date
                    </th>

                    <th className="p-4 text-left">
                      Subscription
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#DFDACB]">
                  {rows.map(
                    (
                      row,
                      index
                    ) => (
                      <tr
                        key={index}
                        className="border-t"
                      >
                        <td className="p-4">
                          {String(
                            row[
                              "Product name (includes custom names)"
                            ] ?? ""
                          )}
                        </td>

                        <td className="p-4">
                          {String(
                            row[
                              "Assigned licenses"
                            ] ?? ""
                          )}
                        </td>

                        <td className="p-4">
                          {String(
                            row[
                              "Available licenses"
                            ] ?? ""
                          )}
                        </td>

                        <td className="p-4">
                          {String(
                            row[
                              "Next invoice date"
                            ] ?? ""
                          )}
                        </td>

                        <td className="p-4">
                          {String(
                            row[
                              "Purchase date"
                            ] ?? ""
                          )}
                        </td>

                        <td className="p-4">
                          {String(
                            row[
                              "Purchased quantity"
                            ] ?? ""
                          )}
                        </td>

                        <td className="p-4">
                          {String(
                            row[
                              "Renewal or expiration date"
                            ] ?? ""
                          )}
                        </td>

                        <td className="p-4">
                          {String(
                            row[
                              "Subscription status"
                            ] ?? ""
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={
                saveLicenses
              }
              className="mt-6 rounded-2xl bg-[#1B2A41] px-8 py-3 text-white hover:opacity-90"
            >
              Import Licenses
            </button>

            {message && (
              <p className="mt-4 text-[#1B2A41]">
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}