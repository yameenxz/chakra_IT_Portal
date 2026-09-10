"use client";

import { useEffect, useState } from "react";

type LaptopChangeRequest = {
  id: string;
  currentAssetTag: string;
  currentUser: string;
  team: string;
  reasonForChange: string;
  newAssetTag: string;
  assignedToUser: string;
  status: string;
};

export default function ApprovalsPage() {
  const [requests, setRequests] =
    useState<LaptopChangeRequest[]>([]);

  const [comments, setComments] =
    useState<Record<string, string>>({});

  const loadRequests = async () => {
    try {
      const res = await fetch(
        "/api/laptop-change-request/pending"
      );

      const data = await res.json();

      setRequests(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveRequest = async (
  requestId: string
) => {
  setRequests((prev) =>
    prev.filter(
      (request) =>
        request.id !== requestId
    )
  );

  try {
    const res = await fetch(
        "/api/laptop-change-request/approve",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            requestId,
            comment:
              comments[requestId] || "",
          }),
        }
      );

      const result =
        await res.json();

      if (!res.ok) {
  await loadRequests();

  alert(
    result.error ||
      "Failed to approve request"
  );

  return;
}

      setRequests((prev) =>
        prev.filter(
          (request) =>
            request.id !== requestId
        )
      );

      alert(
        result.message ||
          "Request approved successfully"
      );
    } catch (error) {
  console.error(error);

  await loadRequests();

  alert(
    "Something went wrong while approving the request."
  );
}
};

  const rejectRequest = async (
    requestId: string
  ) => {
    try {
      const res = await fetch(
        "/api/laptop-change-request/reject",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            requestId,
            comment:
              comments[requestId] || "",
          }),
        }
      );

      const result =
        await res.json();

      if (!res.ok) {
        alert(
          result.error ||
            "Failed to reject request"
        );
        return;
      }

      setRequests((prev) =>
        prev.filter(
          (request) =>
            request.id !== requestId
        )
      );

      alert(
        result.message ||
          "Request rejected successfully"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while rejecting the request."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1B2A41]">
            IT Head Approval Queue
          </h1>

          <p className="mt-2 text-slate-600">
            Review, comment and approve
            laptop replacement requests.
          </p>
        </div>

        <div className="space-y-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-3xl border border-[#DFDACB] bg-white p-6 shadow-md"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#1B2A41]">
                  Laptop Change Request
                </h2>

                <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700">
                  Pending IT Head
                </span>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-[#F8F7F3] p-4">
                  <h3 className="mb-4 text-lg font-bold text-[#1B2A41]">
                    Existing Laptop
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">
                        Asset Name
                      </p>

                      <p className="font-medium">
                        {
                          request.currentAssetTag
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Current User
                      </p>

                      <p className="font-medium">
                        {
                          request.currentUser
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Team
                      </p>

                      <p className="font-medium">
                        {request.team}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Reason For Change
                      </p>

                      <p className="font-medium">
                        {
                          request.reasonForChange
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#F8F7F3] p-4">
                  <h3 className="mb-4 text-lg font-bold text-[#1B2A41]">
                    Replacement Laptop
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">
                        Asset Name
                      </p>

                      <p className="font-medium">
                        {
                          request.newAssetTag
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Assigned To User
                      </p>

                      <p className="font-medium">
                        {
                          request.assignedToUser
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block font-medium text-[#1B2A41]">
                  IT Head Comment
                </label>

                <textarea
                  rows={3}
                  placeholder="Enter approval or rejection comments..."
                  value={
                    comments[
                      request.id
                    ] || ""
                  }
                  onChange={(e) =>
                    setComments({
                      ...comments,
                      [request.id]:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#DFDACB] px-4 py-3"
                />
              </div>

              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() =>
                    approveRequest(
                      request.id
                    )
                  }
                  className="rounded-xl bg-green-600 px-8 py-3 font-medium text-white transition hover:bg-green-700"
                >
                  Approve Request
                </button>

                <button
                  onClick={() =>
                    rejectRequest(
                      request.id
                    )
                  }
                  className="rounded-xl bg-red-600 px-8 py-3 font-medium text-white transition hover:bg-red-700"
                >
                  Reject Request
                </button>
              </div>
            </div>
          ))}

          {requests.length ===
            0 && (
            <div className="rounded-3xl border border-[#DFDACB] bg-white p-12 text-center shadow-md">
              <h3 className="text-xl font-semibold text-[#1B2A41]">
                No Pending Requests
              </h3>

              <p className="mt-2 text-slate-500">
                All laptop change
                requests have been
                processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
