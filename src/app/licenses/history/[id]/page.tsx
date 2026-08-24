"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

type HistoryRecord = {
  id: string;
  oldRenewalDate: string | null;
  newRenewalDate: string;
  notes: string | null;
  updatedBy: string | null;
  updatedAt: string;
};

export default function LicenseHistoryPage() {
  const params = useParams();

  const router =
    useRouter();

  const [
    history,
    setHistory,
  ] = useState<
    HistoryRecord[]
  >([]);

  const [
    licenseName,
    setLicenseName,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory =
    async () => {
      try {
        const response =
          await fetch(
            `/api/licenses/${params.id}/history`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error
          );
        }

        setLicenseName(
          data.licenseName
        );

        setHistory(
          data.history
        );
      } catch (error) {
        console.error(error);

        alert(
          "Failed to load renewal history."
        );
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Renewal History
            </h1>

            <p className="mt-2 text-slate-400">
              {licenseName}
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                "/licenses/list"
              )
            }
            className="rounded-lg bg-slate-700 px-5 py-3 text-white hover:bg-slate-600"
          >
            Back
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-xl">
          <table className="min-w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">
                  Old Renewal Date
                </th>

                <th className="p-4 text-left">
                  New Renewal Date
                </th>

                <th className="p-4 text-left">
                  Updated By
                </th>

                <th className="p-4 text-left">
                  Updated At
                </th>

                <th className="p-4 text-left">
                  Notes
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-t"
                  >
                    <td className="p-4">
                      {item.oldRenewalDate
                        ? new Date(
                            item.oldRenewalDate
                          ).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </td>

                    <td className="p-4">
                      {new Date(
                        item.newRenewalDate
                      ).toLocaleDateString(
                        "en-GB"
                      )}
                    </td>

                    <td className="p-4">
                      {item.updatedBy ||
                        "-"}
                    </td>

                    <td className="p-4">
                      {new Date(
                        item.updatedAt
                      ).toLocaleString(
                        "en-GB"
                      )}
                    </td>

                    <td className="p-4">
                      {item.notes ||
                        "-"}
                    </td>
                  </tr>
                )
              )}

              {history.length ===
                0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-500"
                  >
                    No renewal history found.
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