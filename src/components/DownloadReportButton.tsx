"use client";

export default function DownloadReportButton() {
  return (
    <button
      className="rounded-xl bg-green-600 px-6 py-3 font-medium text-white hover:bg-green-700"
      onClick={() => {
        window.open(
          "/api/reports/export",
          "_blank"
        );
      }}
    >
      Download Excel Report
    </button>
  );
}