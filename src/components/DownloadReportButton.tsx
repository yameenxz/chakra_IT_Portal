"use client";

export default function DownloadReportButton() {
  return (
    <button
      className="rounded-xl bg-[#1B2A41] px-6 py-3 font-medium text-white shadow-md transition hover:opacity-90"
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