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
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  itHeadComment?: string;
  status: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [requests, setRequests] =
    useState<LaptopChangeRequest[]>([]);

  const [selectedRequest, setSelectedRequest] =
    useState<LaptopChangeRequest | null>(
      null
    );

  useEffect(() => {
    const loadHistory = async () => {
      const res = await fetch(
        "/api/laptop-change-request/history"
      );

      const data = await res.json();

      setRequests(data);
    };

    loadHistory();
  }, []);

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "PENDING_IT_HEAD":
        return "bg-yellow-100 text-yellow-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (
    status: string
  ) => {
    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) =>
        c.toUpperCase()
      );
  };

  return (
    <main className="min-h-screen bg-[#F4F2EC] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1B2A41]">
            Laptop Request History
          </h1>

          <p className="mt-2 text-slate-600">
            Review laptop request activity and workflow history.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#DFDACB] bg-white shadow-md">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8F7F3]">
                <th className="px-6 py-4 text-left font-semibold">
                  Current Laptop
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  User
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  New Laptop
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Status
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Requested By
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Date
                </th>

                <th className="px-6 py-4 text-left font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="px-6 py-4">
                    {
                      request.currentAssetTag
                    }
                  </td>

                  <td className="px-6 py-4">
                    {
                      request.currentUser
                    }
                  </td>

                  <td className="px-6 py-4">
                    {
                      request.newAssetTag
                    }
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                        request.status
                      )}`}
                    >
                      {formatStatus(
                        request.status
                      )}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {
                      request.requestedBy
                    }
                  </td>

                  <td className="px-6 py-4">
                    {new Date(
                      request.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        setSelectedRequest(
                          request
                        )
                      }
                      className="rounded-lg bg-[#1B2A41] px-4 py-2 text-sm text-white"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1B2A41]">
                  Request Details
                </h2>

                <button
                  onClick={() =>
                    setSelectedRequest(
                      null
                    )
                  }
                  className="text-slate-500"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-semibold text-[#1B2A41]">
                    Existing Laptop
                  </h3>

                  <p>
                    <strong>
                      Asset:
                    </strong>{" "}
                    {
                      selectedRequest.currentAssetTag
                    }
                  </p>

                  <p>
                    <strong>
                      User:
                    </strong>{" "}
                    {
                      selectedRequest.currentUser
                    }
                  </p>

                  <p>
                    <strong>
                      Team:
                    </strong>{" "}
                    {
                      selectedRequest.team
                    }
                  </p>

                  <p>
                    <strong>
                      Reason:
                    </strong>{" "}
                    {
                      selectedRequest.reasonForChange
                    }
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-[#1B2A41]">
                    Replacement Laptop
                  </h3>

                  <p>
                    <strong>
                      Asset:
                    </strong>{" "}
                    {
                      selectedRequest.newAssetTag
                    }
                  </p>

                  <p>
                    <strong>
                      Assigned To:
                    </strong>{" "}
                    {
                      selectedRequest.assignedToUser
                    }
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-[#F8F7F3] p-4">
                <h3 className="mb-3 font-semibold text-[#1B2A41]">
                  Workflow Information
                </h3>

                <p>
                  <strong>
                    Requested By:
                  </strong>{" "}
                  {
                    selectedRequest.requestedBy
                  }
                </p>

                <p>
                  <strong>
                    Requested At:
                  </strong>{" "}
                  {new Date(
                    selectedRequest.createdAt
                  ).toLocaleString()}
                </p>

                {selectedRequest.approvedBy && (
                  <>
                    <p>
                      <strong>
                        Approved By:
                      </strong>{" "}
                      {
                        selectedRequest.approvedBy
                      }
                    </p>

                    <p>
                      <strong>
                        Approved At:
                      </strong>{" "}
                      {selectedRequest.approvedAt
                        ? new Date(
                            selectedRequest.approvedAt
                          ).toLocaleString()
                        : "-"}
                    </p>
                  </>
                )}

                {selectedRequest.rejectedBy && (
                  <>
                    <p>
                      <strong>
                        Rejected By:
                      </strong>{" "}
                      {
                        selectedRequest.rejectedBy
                      }
                    </p>

                    <p>
                      <strong>
                        Rejected At:
                      </strong>{" "}
                      {selectedRequest.rejectedAt
                        ? new Date(
                            selectedRequest.rejectedAt
                          ).toLocaleString()
                        : "-"}
                    </p>
                  </>
                )}
              </div>

              {selectedRequest.itHeadComment && (
                <div className="mt-6 rounded-2xl bg-blue-50 p-4">
                  <h3 className="mb-2 font-semibold text-[#1B2A41]">
                    IT Head Comment
                  </h3>

                  <p>
                    {
                      selectedRequest.itHeadComment
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}