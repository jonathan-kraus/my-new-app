// components/ProgressBar.tsx
"use client";

type ProgressBarProps = {
  value: number; // 0–100
  className?: string; // optional wrapper styling
  barClassName?: string; // optional inner bar styling
};

export default function ProgressBar({
  value,
  className = "",
  barClassName = "",
}: ProgressBarProps) {
  return (
    <div
      className={`w-full h-3 rounded-full overflow-hidden bg-white/20 ${className}`}
    >
      <div
        className={`h-full transition-all duration-500 ease-out ${barClassName}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
