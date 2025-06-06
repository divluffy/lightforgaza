// app/loading.tsx
"use client";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-base-200">
      <div className="flex flex-col items-center space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-lg font-medium">جاري التحميل...</p>
      </div>
    </div>
  );
}
