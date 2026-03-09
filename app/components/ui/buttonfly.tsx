/*
 * @FilePath: \my-new-app\app\components\ui\buttonfly.tsx
 * @LastEditTime: 2026-03-09 19:29:39
 */
"use client";

import React from "react";

export function Button({
  children,
  onClick,
  icon = "airplane",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: "airplane" | "none";
}) {
  const airplaneIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="white"
      style={{ marginRight: 8 }}
    >
      <path d="M2.5 19.5l8-3 5.5 5.5 2-2-4-7 7-8-2-2-8 7-7-4-2 2 5.5 5.5-3 8z" />
    </svg>
  );

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "#2563eb",
        color: "white",
        padding: "10px 18px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#1d4ed8";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#2563eb";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {icon === "airplane" && airplaneIcon}
      {children}
    </button>
  );
}
