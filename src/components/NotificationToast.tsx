"use client";

type Props = {
  title: string;
  message: string;
};

export default function NotificationToast({
  title,
  message,
}: Props) {
  return (
    <div className="fixed top-10 right-10 z-[9999] w-[420px] rounded-2xl border-2 border-blue-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-start gap-4">
        <div className="text-3xl">
          🔔
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1B2A41]">
            {title}
          </h3>

          <p className="mt-2 text-sm text-slate-700">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}