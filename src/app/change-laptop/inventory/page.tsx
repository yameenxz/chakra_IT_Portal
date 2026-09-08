"use client";

import { useEffect, useState } from "react";

type Laptop = {
  id: string;
  assetTag: string;
  model: string;
  condition: string;
  location: string;
  status: string;
};

export default function InventoryPage() {
  const [laptops, setLaptops] =
    useState<Laptop[]>([]);

  const [assetTag, setAssetTag] =
    useState("");

  const [model, setModel] =
    useState("");

  const [condition, setCondition] =
    useState("Working");

  const [location, setLocation] =
    useState("Bangalore");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

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

  const uploadExcel =
    async () => {
      if (!selectedFile) {
        alert(
          "Please select an Excel file"
        );
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const res = await fetch(
        "/api/laptop-inventory/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result =
        await res.json();

      if (result.success) {
        alert(
          `${result.imported} laptops imported successfully`
        );

        loadLaptops();
      } else {
        alert(
          result.error ??
            "Import failed"
        );
      }
    };

  const addLaptop =
    async () => {
      if (
        !assetTag ||
        !model
      ) {
        return;
      }

      await fetch(
        "/api/laptop-inventory",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            assetTag,
            model,
            condition,
            location,
          }),
        }
      );

      setAssetTag("");
      setModel("");

      loadLaptops();
    };

  const deleteLaptop =
    async (id: string) => {
      await fetch(
        `/api/laptop-inventory/${id}`,
        {
          method: "DELETE",
        }
      );

      loadLaptops();
    };

  const returnLaptop =
    async (id: string) => {
      const confirmed =
        window.confirm(
          "Mark this laptop as returned and available?"
        );

      if (!confirmed) {
        return;
      }

      await fetch(
        `/api/laptop-inventory/${id}/return`,
        {
          method: "PATCH",
        }
      );

      loadLaptops();
    };

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1B2A41]">
            Laptop Inventory
          </h1>

          <p className="mt-2 text-slate-600">
            Manage laptop inventory for
            replacement requests.
          </p>
        </div>

        <div className="mb-8 rounded-3xl border border-[#DFDACB] bg-white p-6 shadow-md">
          <h2 className="text-2xl font-bold text-[#1B2A41]">
            Upload Laptop Inventory
          </h2>

          <p className="mb-6 mt-2 text-slate-600">
            Upload laptop records
            through Excel or add
            inventory manually.
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) =>
                  setSelectedFile(
                    e.target
                      .files?.[0] ??
                      null
                  )
                }
                className="w-[280px] rounded-xl border border-[#DFDACB] px-4 py-3"
              />

              <button
                onClick={
                  uploadExcel
                }
                className="rounded-xl bg-[#1B2A41] px-6 py-3 text-white"
              >
                Upload
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Asset Tag"
                value={assetTag}
                onChange={(e) =>
                  setAssetTag(
                    e.target.value
                  )
                }
                className="w-[160px] rounded-xl border border-[#DFDACB] px-4 py-3"
              />

              <input
                type="text"
                placeholder="Model"
                value={model}
                onChange={(e) =>
                  setModel(
                    e.target.value
                  )
                }
                className="w-[160px] rounded-xl border border-[#DFDACB] px-4 py-3"
              />

              <select
                value={condition}
                onChange={(e) =>
                  setCondition(
                    e.target.value
                  )
                }
                className="w-[130px] rounded-xl border border-[#DFDACB] px-4 py-3"
              >
                <option>
                  Working
                </option>
                <option>
                  Damaged
                </option>
                <option>
                  Repair
                </option>
              </select>

              <select
                value={location}
                onChange={(e) =>
                  setLocation(
                    e.target.value
                  )
                }
                className="w-[130px] rounded-xl border border-[#DFDACB] px-4 py-3"
              >
                <option>
                  Bangalore
                </option>
                <option>
                  Mumbai
                </option>
                <option>
                  Chennai
                </option>
                <option>Pune</option>
              </select>

              <button
                onClick={addLaptop}
                className="rounded-xl bg-[#1B2A41] px-7 py-3 text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#DFDACB] bg-white shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#F6F2E8]">
                <th className="px-4 py-4 text-left">
                  Asset Tag
                </th>
                <th className="px-4 py-4 text-left">
                  Model
                </th>
                <th className="px-4 py-4 text-left">
                  Condition
                </th>
                <th className="px-4 py-4 text-left">
                  Location
                </th>
                <th className="px-4 py-4 text-left">
                  Status
                </th>
                <th className="px-4 py-4 text-left">
                  Action
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
                      {
                        laptop.assetTag
                      }
                    </td>

                    <td className="px-4 py-4">
                      {laptop.model}
                    </td>

                    <td className="px-4 py-4">
                      {
                        laptop.condition
                      }
                    </td>

                    <td className="px-4 py-4">
                      {
                        laptop.location
                      }
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          laptop.status ===
                          "AVAILABLE"
                            ? "bg-green-100 text-green-700"
                            : laptop.status ===
                              "RESERVED"
                            ? "bg-yellow-100 text-yellow-700"
                            : laptop.status ===
                              "ASSIGNED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {
                          laptop.status
                        }
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {laptop.status ===
                          "ASSIGNED" && (
                          <button
                            onClick={() =>
                              returnLaptop(
                                laptop.id
                              )
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                          >
                            Return
                          </button>
                        )}

                        <button
                          onClick={() =>
                            deleteLaptop(
                              laptop.id
                            )
                          }
                          className="rounded-lg bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {laptops.length ===
                0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-slate-500"
                  >
                    No laptops
                    found.
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