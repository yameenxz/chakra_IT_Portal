"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type License = {
  id: string;
  productName: string;
  assignedLicenses: string;
  availableLicenses: string;
  nextInvoiceDate: string | null;
  purchaseDate: string | null;
  purchasedQuantity: number | null;
  renewalDate: string | null;
  subscriptionStatus: string;
};

export default function LicensesPage() {
  const router = useRouter();

  const { data: session } =
    useSession();

  const role =
    ((session?.user as {
      role?: string;
    })?.role ?? "");

  const canRenew =
    role === "IT" ||
    role === "ADMIN";

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

    if (daysLeft <= 60) {
      return "Warning";
    }

    return "Active";
  };

  const getSubscriptionStatus = (
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

    return daysLeft < 0
      ? "Disabled"
      : "Active";
  };

  const loadLicenses =
    async () => {
      try {
        const response =
          await fetch(
            "/api/licenses"
          );

        const data =
          await response.json();

        setLicenses(data);
      } catch (error) {
        console.error(error);
      }
    };

  useEffect(() => {
    loadLicenses();
  }, []);

  const totalLicenses =
    licenses.length;

  const activeLicenses =
    licenses.filter(
      (license) =>
        getTrackingStatus(
          license.renewalDate
        ) === "Active"
    ).length;

  const expiringLicenses =
    licenses.filter(
      (license) =>
        getTrackingStatus(
          license.renewalDate
        ) ===
        "Expiring Soon"
    ).length;

  const expiredLicenses =
    licenses.filter(
      (license) =>
        getTrackingStatus(
          license.renewalDate
        ) === "Expired"
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8">
      <div className="mx-auto max-w-[1900px]">
        <h1 className="mb-2 text-5xl font-bold text-white">
          License Renewal Tracking
        </h1>

        <p className="mb-8 text-lg text-slate-400">
          Track software licenses,
          utilization, renewals,
          subscriptions and invoice
          schedules.
        </p>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Total Licenses
            </p>

            <h2 className="mt-2 text-4xl font-bold text-slate-900">
              {totalLicenses}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Active
            </p>

            <h2 className="mt-2 text-4xl font-bold text-green-600">
              {activeLicenses}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Expiring Soon
            </p>

            <h2 className="mt-2 text-4xl font-bold text-yellow-600">
              {expiringLicenses}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-500">
              Expired
            </p>

            <h2 className="mt-2 text-4xl font-bold text-red-600">
              {expiredLicenses}
            </h2>
          </div>
        </div>
          <div className="mb-6 flex justify-end">
  <button
    onClick={() =>
      window.open(
        "/api/licenses/export",
        "_blank"
      )
    }
    className="rounded-lg bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700"
  >
    Export Licenses
  </button>
</div>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-xl">
          <table className="min-w-[2400px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="whitespace-nowrap p-4 text-left">
                  Product Name
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Assigned Licenses
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Available Licenses
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Next Invoice Date
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Purchase Date
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Purchased Quantity
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Renewal / Expiration Date
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Days Remaining
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Tracking Status
                </th>

                <th className="whitespace-nowrap p-4 text-left">
                  Subscription Status
                </th>

                {canRenew && (
                  <th className="whitespace-nowrap p-4 text-left">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {licenses.map(
                (license) => {
                  const daysLeft =
                    getDaysRemaining(
                      license.renewalDate
                    );

                  const trackingStatus =
                    getTrackingStatus(
                      license.renewalDate
                    );

                  const subscriptionStatus =
                    getSubscriptionStatus(
                      license.renewalDate
                    );

                  return (
                    <tr
                      key={license.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="min-w-[450px] p-4 font-medium">
                        {license.productName}
                      </td>

                      <td className="p-4">
                        {license.assignedLicenses}
                      </td>

                      <td className="p-4">
                        {license.availableLicenses}
                      </td>

                      <td className="p-4">
                        {license.nextInvoiceDate
                          ? new Date(
                              license.nextInvoiceDate
                            ).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </td>

                      <td className="p-4">
                        {license.purchaseDate
                          ? new Date(
                              license.purchaseDate
                            ).toLocaleDateString(
                              "en-GB"
                            )
                          : "-"}
                      </td>

                      <td className="p-4">
                        {license.purchasedQuantity}
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

                      <td className="p-4 font-medium">
                        {daysLeft ?? "-"}
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            trackingStatus ===
                            "Active"
                              ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                              : trackingStatus ===
                                  "Warning"
                                ? "rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700"
                                : trackingStatus ===
                                    "Expiring Soon"
                                  ? "rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
                                  : "rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700"
                          }
                        >
                          {trackingStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            subscriptionStatus ===
                            "Active"
                              ? "rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700"
                              : "rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700"
                          }
                        >
                          {subscriptionStatus}
                        </span>
                      </td>

                      {canRenew && (
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/licenses/renew/${license.id}`
                                )
                              }
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              Manage
                            </button>

                            <button
                              onClick={() =>
                                router.push(
                                  `/licenses/history/${license.id}`
                                )
                              }
                              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                            >
                              History
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                }
              )}

              {licenses.length ===
                0 && (
                <tr>
                  <td
                    colSpan={
                      canRenew
                        ? 11
                        : 10
                    }
                    className="p-8 text-center text-slate-500"
                  >
                    No licenses found.
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