// components/DonationSidebar.tsx
"use client";

import React from "react";
import { FaBitcoin } from "react-icons/fa";

type Props = {
  campaignId: string;
  currentAmount: number;
  goalAmount: number;
};

export default function DonationSidebar({
  campaignId,
  currentAmount,
  goalAmount,
}: Props) {
  const remaining = goalAmount - currentAmount;
  const percent = Math.min(Math.round((currentAmount / goalAmount) * 100), 100);

  return (
    <div className="border rounded-lg p-6 bg-base-100 dark:bg-base-200 shadow">
      <h3 className="text-2xl font-semibold mb-4 text-center">الدعم المالي</h3>

      <div className="mb-4 text-center space-y-1">
        <p className="text-lg">
          هدف الحملة:{" "}
          <span className="font-medium">{goalAmount.toLocaleString()} USD</span>
        </p>
        <p className="text-lg">
          تم جمع:{" "}
          <span className="font-bold">
            {currentAmount.toLocaleString()} USD
          </span>
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>المتبقي:</span>
          <span className="font-semibold text-danger">
            {remaining.toLocaleString()} USD
          </span>
        </div>
        <div className="flex justify-between">
          <span>النسبة المكتملة:</span>
          <span className="font-semibold">{percent}%</span>
        </div>
        <progress
          className="progress progress-primary w-full"
          value={currentAmount}
          max={goalAmount}
        ></progress>
      </div>

      {/* زر واحد لمحفظة Phantom */}
      <div className="mt-6 text-center">
        <button className="btn btn-primary flex items-center justify-center gap-2 py-2">
          <FaBitcoin size={24} />
          تبرع عبر Phantom
        </button>
      </div>
    </div>
  );
}
