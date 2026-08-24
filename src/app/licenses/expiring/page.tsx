"use client";

import {
  useEffect,
  useState,
} from "react";

type License = {
  id: string;

  productName: string;

  assignedLicenses: string;

  availableLicenses: string;

  renewalDate: string | null;

  subscriptionStatus: string;
};

export default function ExpiringLicensesPage() {
  const [licenses, setLicenses] =
    useState<License[]>([]);

  const getDaysRemaining = (
    renewalDate: string | null
  ) => {
    if (!renewalDate) {
      return null;
    }

    const renewal =
      new Date(renewalDate);

    const today =
      new Date();

    const diff =
      renewal.getTime() -
      today.getTime();

    return Math.ceil(
      diff /
        (1000 *
          60 *
          60 *
          24)
    );
  };

  const getTrackingStatus = (
    renewalDate: string | null
  ) => {
    const daysLeft =
      getDaysRemaining(
        renewalDate
      );

    if (
      daysLeft === null
    ) {
      return "N/A";
    }

    if (daysLeft < 0) {
      return "Expired";
    }

    if (daysLeft <= 30) {
      return "Expiring Soon";
    }

    return "Active";
  };

  useEffect(() => {
    const loadLicenses =
      async () => {
        const response =
          await fetch(
            "/api/licenses"
          );

        const data =
          await response.json();

        const filtered =
          data.filter(
            (
              license: License
            ) => {
              const daysLeft =
                getDaysRemaining(
                  license.renewalDate
                );

              return (
                daysLeft !==
                  null &&
                daysLeft <= 30
              );
            }
          );

        setLicenses(
          filtered
        );
      };

    loadLicenses();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-2 text-5xl font-bold text-white">
          Expiring Licenses
        </h1>

        <p className="mb-8 text-slate-400">
          Licenses requiring
          attention within the
          next 30 days.
        </p>

        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">
                  Product Name
                </th>

                <th className="p-4 text-left">
                  Renewal Date
                </th>

                <th className="p-4 text-left">
                  Days Remaining
                </th>

                <th className="p-4 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {licenses.map(
                (license) => {
                  const daysLeft =
                    getDaysRemaining(
                      license.renewalDate
                    );

                  const status =
                    getTrackingStatus(
                      license.renewalDate
                    );

                  return (
                    <tr
                      key={
                        license.id
                      }
                      className="border-t"
                    >
                      <td className="p-4">
                        {
                          license.productName
                        }
                      </td>

                      <td className="p-4">
                        {license.renewalDate
                          ? new Date(
                              license.renewalDate
                            ).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </td>

                      <td className="p-4">
                        {
                          daysLeft
                        }
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            status ===
                            "Expired"
                              ? "rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
                          }
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                }
              )}

              {licenses.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      4
                    }
                    className="p-8 text-center text-slate-500"
                  >
                    No expiring
                    licenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}