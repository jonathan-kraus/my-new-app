/*
 * @FilePath: \my-new-app\app\components\RadarSkybox.tsx
 * @LastEditTime: 2026-03-10 14:57:04
 */
"use client";

import React, { useMemo } from "react";

type Plane = { x: number; y: number };

const WIDTH = 800; // 16:9
const HEIGHT = 450; // 16:9

// Real-world bounds around KPHL + King of Prussia
const minLat = 39.8;
const maxLat = 40.15;
const minLon = -75.5;
const maxLon = -75.1;

// Simple seeded random so positions are stable for a given count
function seededRandom(seed: number) {
  return (Math.sin(seed * 9999) + 1) / 2;
}

function latLonToXY(lat: number, lon: number) {
  const x = ((lon - minLon) / (maxLon - minLon)) * WIDTH;
  const y = ((maxLat - lat) / (maxLat - minLat)) * HEIGHT;
  return { x, y };
}

function generatePlanes(count: number): Plane[] {
  const planeCount = Math.max(1, Math.floor(count / 5)); // at least 1
  const planes: Plane[] = [];

  for (let i = 0; i < planeCount; i++) {
    const rLat = minLat + seededRandom(i) * (maxLat - minLat);
    const rLon = minLon + seededRandom(i + 1) * (maxLon - minLon);
    planes.push(latLonToXY(rLat, rLon));
  }

  return planes;
}

// Approx positions for landmarks
const kphlLat = 39.8729;
const kphlLon = -75.2437;
const kopLat = 40.0893;
const kopLon = -75.3836;

const kphlPos = latLonToXY(kphlLat, kphlLon);
const kopPos = latLonToXY(kopLat, kopLon);

export function RadarSkybox({ count }: { count: number }) {
  const planes = useMemo(() => generatePlanes(count), [count]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: WIDTH,
        aspectRatio: "16 / 9",
        background: "#050807",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
        position: "relative",
      }}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          {/* Sweep gradient */}
          <linearGradient
            id="sweepGradient"
            x1="0%"
            y1="50%"
            x2="100%"
            y2="50%"
          >
            <stop offset="0%" stopColor="#00ff99" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00ff99" stopOpacity="0" />
          </linearGradient>

          {/* Soft glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width={WIDTH} height={HEIGHT} fill="#050807" />

        {/* Grid */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = (WIDTH / 10) * i;
          const y = (HEIGHT / 10) * i;
          return (
            <g key={i}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={HEIGHT}
                stroke="#00ff99"
                strokeOpacity={0.15}
                strokeWidth={1}
              />
              <line
                x1={0}
                y1={y}
                x2={WIDTH}
                y2={y}
                stroke="#00ff99"
                strokeOpacity={0.15}
                strokeWidth={1}
              />
            </g>
          );
        })}

        {/* Concentric rings (static base) */}
        {[0.2, 0.4, 0.6, 0.8].map((r, i) => (
          <circle
            key={i}
            cx={WIDTH / 2}
            cy={HEIGHT / 2}
            r={(Math.min(WIDTH, HEIGHT) / 2) * r}
            stroke="#00ff99"
            strokeOpacity={0.2}
            strokeWidth={1}
            fill="none"
          />
        ))}

        {/* Pulsing ring */}
        <circle
          cx={WIDTH / 2}
          cy={HEIGHT / 2}
          r={(Math.min(WIDTH, HEIGHT) / 2) * 0.2}
          stroke="#00ff99"
          strokeWidth={2}
          fill="none"
          filter="url(#glow)"
          className="radar-pulse"
        />

        {/* Sweep (clockwise) */}
        <g
          style={{
            transformOrigin: "50% 50%",
          }}
          className="radar-sweep"
        >
          <path
            d={describeSweepPath(
              WIDTH / 2,
              HEIGHT / 2,
              Math.min(WIDTH, HEIGHT) / 2,
            )}
            fill="url(#sweepGradient)"
            filter="url(#glow)"
          />
        </g>

        {/* Landmarks */}
        <g>
          {/* KPHL */}
          <circle
            cx={kphlPos.x}
            cy={kphlPos.y}
            r={5}
            fill="#00ff99"
            filter="url(#glow)"
          />
          <text
            x={kphlPos.x + 8}
            y={kphlPos.y - 4}
            fill="#00ff99"
            fontSize={14}
          >
            KPHL
          </text>

          {/* King of Prussia */}
          <circle
            cx={kopPos.x}
            cy={kopPos.y}
            r={5}
            fill="#00ff99"
            filter="url(#glow)"
          />
          <text x={kopPos.x + 8} y={kopPos.y - 4} fill="#00ff99" fontSize={14}>
            King of Prussia
          </text>
        </g>

        {/* Planes */}
        {planes.map((p, i) => (
          <g
            key={i}
            transform={`translate(${p.x}, ${p.y})`}
            className="radar-plane"
          >
            <polygon
              points="0,-8 4,4 0,2 -4,4"
              fill="#00ff99"
              filter="url(#glow)"
            />
          </g>
        ))}
      </svg>

      {/* Inline styles for animations */}
      <style jsx>{`
        .radar-sweep {
          animation: radar-sweep-rotate 4s linear infinite;
        }

        .radar-pulse {
          animation: radar-pulse 3s ease-out infinite;
        }

        .radar-plane {
          animation: radar-plane-flicker 2.5s ease-in-out infinite;
        }

        @keyframes radar-sweep-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes radar-pulse {
          0% {
            r: ${Math.min(WIDTH, HEIGHT) * 0.1}px;
            opacity: 0.8;
          }
          100% {
            r: ${Math.min(WIDTH, HEIGHT) * 0.5}px;
            opacity: 0;
          }
        }

        @keyframes radar-plane-flicker {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

// Build a 60° wedge path for the sweep
function describeSweepPath(cx: number, cy: number, r: number) {
  const startAngle = -30 * (Math.PI / 180);
  const endAngle = 30 * (Math.PI / 180);

  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);

  return [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${r} ${r} 0 0 1 ${x2} ${y2}`,
    "Z",
  ].join(" ");
}
