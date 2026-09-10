"use client";

import { useEffect, useState } from "react";

type Laptop = {
  id: string;
  name: string;
  assetTag: string;
  model: string;
  category: string;
  location: string;
  status: string;
  assignedTo: string;
};

export default function InventoryPage() {
  const [laptops, setLaptops] =
    useState<Laptop[]>([]);

  const loadLaptops =
    async () => {
      const res = await fetch(
        "/api/laptop-inventory"
      );

      const data =
        await res.json();

      setLaptops(data);
    };

  useEffect(() => {
    loadLaptops();
  }, []);

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1B2A41]">
            Asset Inventory
          </h1>

          <p className="mt-2 text-slate-600">
            View assets synchronized from
            Snipe-IT.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#DFDACB] bg-white shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#F6F2E8]">
                <th className="px-4 py-4 text-left">
                  Asset Name
                </th>

                <th className="px-4 py-4 text-left">
                  Asset Tag
                </th>

                <th className="px-4 py-4 text-left">
                  Model
                </th>

                <th className="px-4 py-4 text-left">
                  Category
                </th>

                <th className="px-4 py-4 text-left">
                  Location
                </th>

                <th className="px-4 py-4 text-left">
                  Status
                </th>

                <th className="px-4 py-4 text-left">
                  Assigned To
                </th>
              </tr>
            </thead>

            <tbody>
              {laptops.map(
                (laptop) => (
                  <tr
                    key={laptop.id}
                    className="border-b border-[#DFDACB]"
                  >
                    <td className="px-4 py-4">
                      {laptop.name}
                    </td>

                    <td className="px-4 py-4">
                      {laptop.assetTag}
                    </td>

                    <td className="px-4 py-4">
                      {laptop.model}
                    </td>

                    <td className="px-4 py-4">
                      {laptop.category}
                    </td>

                    <td className="px-4 py-4">
                      {laptop.location}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          laptop.status ===
                          "Available"
                            ? "bg-green-100 text-green-700"
                            : laptop.status ===
                              "Deployed"
                            ? "bg-blue-100 text-blue-700"
                            : laptop.status ===
                              "Pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {laptop.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {laptop.assignedTo}
                    </td>
                  </tr>
                )
              )}

              {laptops.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center text-slate-500"
                  >
                    No assets found.
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