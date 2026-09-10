"use client";

import { useEffect, useState } from "react";

export default function CreateLaptopRequestPage() {
  const [currentAssetTag, setCurrentAssetTag] =
    useState("");

  const [currentUser, setCurrentUser] =
    useState("");

  const [team, setTeam] =
    useState("");

  const [reasonForChange, setReasonForChange] =
    useState("");

  const [assignedToUser, setAssignedToUser] =
    useState("");

  const [userSearch, setUserSearch] =
  useState("");

const [showUserDropdown, setShowUserDropdown] =
  useState(false);

  const [availableLaptops, setAvailableLaptops] =
    useState<any[]>([]);

  const [snipeUsers, setSnipeUsers] =
    useState<any[]>([]);

  const [selectedLaptop, setSelectedLaptop] =
    useState("");

  const [selectedLaptopName, setSelectedLaptopName] =
    useState("");

  useEffect(() => {
    const loadData = async () => {
      const laptopsRes = await fetch(
        "/api/laptop-inventory/available"
      );

      const laptopsData =
        await laptopsRes.json();

      setAvailableLaptops(
        laptopsData
      );

      const usersRes = await fetch(
        "/api/snipe-users"
      );

      const usersData =
        await usersRes.json();

      setSnipeUsers(usersData);
    };

    loadData();
  }, []);

  const submitRequest = async () => {
    if (
      !currentAssetTag.trim() ||
      !currentUser.trim() ||
      !team.trim() ||
      !reasonForChange.trim() ||
      !assignedToUser.trim() ||
      !selectedLaptop.trim()
    ) {
      alert(
        "Please complete all required fields before submitting."
      );

      return;
    }

    const res = await fetch(
      "/api/laptop-change-request",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          currentAssetTag,
          currentUser,
          team,
          reasonForChange,
          newAssetTag:
            selectedLaptop,
          assignedToUser,
          requestedBy:
            "IT Intern",
        }),
      }
    );

    const result =
      await res.json();

    if (result.success) {
      alert(
        "Request submitted successfully"
      );

      window.location.reload();
    } else {
      alert(
        result.error ||
          "Failed to submit request"
      );
    }
  };
  const filteredUsers =
  snipeUsers.filter((user) =>
    user.name
      ?.toLowerCase()
      .includes(
        userSearch.toLowerCase()
      )
  );

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-[#1B2A41]">
            Create Laptop Change Request
          </h1>

          <p className="mt-2 text-slate-600">
            Submit a laptop replacement
            request for IT Head approval.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-[#DFDACB] bg-white p-4 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-[#1B2A41]">
              Existing Laptop
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block font-medium">
                  Asset Name
                </label>

                <input
                  type="text"
                  value={
                    currentAssetTag
                  }
                  onChange={(e) =>
                    setCurrentAssetTag(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#DFDACB] px-4 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Current User
                </label>

                <input
                  type="text"
                  value={currentUser}
                  onChange={(e) =>
                    setCurrentUser(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#DFDACB] px-4 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Team
                </label>

                <input
                  type="text"
                  value={team}
                  onChange={(e) =>
                    setTeam(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#DFDACB] px-4 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Reason For Change
                </label>

                <input
                  type="text"
                  value={
                    reasonForChange
                  }
                  onChange={(e) =>
                    setReasonForChange(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#DFDACB] px-4 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium">
                  Laptops Available
                </label>

                <select
                  value={
                    selectedLaptop
                  }
                  onChange={(e) => {
                    const laptop =
                      availableLaptops.find(
                        (l) =>
                          l.assetTag ===
                          e.target.value
                      );

                    setSelectedLaptop(
                      e.target.value
                    );

                    setSelectedLaptopName(
                      laptop?.name ?? ""
                    );
                  }}
                  className="w-full rounded-xl border border-[#DFDACB] px-4 py-2.5"
                >
                  <option value="">
                    Select Available Laptop
                  </option>

                  {availableLaptops.map(
                    (laptop) => (
                      <option
                        key={
                          laptop.id
                        }
                        value={
                          laptop.assetTag
                        }
                      >
                        {laptop.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#DFDACB] bg-white p-4 shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-[#1B2A41]">
              Replacement Laptop
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block font-medium">
                  Asset Name
                </label>

                <input
                  type="text"
                  value={
                    selectedLaptopName
                  }
                  readOnly
                  className="w-full rounded-xl border border-[#DFDACB] bg-slate-100 px-4 py-2.5"
                />
              </div>

              <div>
  <label className="mb-1 block font-medium">
    Assigned To User
  </label>

  <div className="relative">
    <input
      type="text"
      placeholder="Search User..."
      value={userSearch}
      onChange={(e) => {
        setUserSearch(
          e.target.value
        );

        setShowUserDropdown(
          true
        );
      }}
      onFocus={() =>
        setShowUserDropdown(
          true
        )
      }
      className="w-full rounded-xl border border-[#DFDACB] px-4 py-2.5"
    />

    {showUserDropdown && (
      <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#DFDACB] bg-white shadow-lg">
        {filteredUsers
          .slice(0, 30)
          .map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => {
                setAssignedToUser(
                  user.name
                );

                setUserSearch(
                  user.name
                );

                setShowUserDropdown(
                  false
                );
              }}
              className="block w-full px-4 py-2 text-left hover:bg-slate-100"
            >
              {user.name}
            </button>
          ))}

        {filteredUsers.length === 0 && (
          <div className="px-4 py-2 text-slate-500">
            No users found
          </div>
        )}
      </div>
    )}
  </div>
</div>

              <div>
                <label className="mb-1 block font-medium">
                  Team
                </label>

                <input
                  type="text"
                  value={team}
                  onChange={(e) =>
                    setTeam(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-[#DFDACB] px-4 py-2.5"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={submitRequest}
            className="rounded-xl bg-[#1B2A41] px-10 py-3 text-white"
          >
            Submit For Approval
          </button>
        </div>
      </div>
    </main>
  );
}