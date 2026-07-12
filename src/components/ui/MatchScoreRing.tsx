"use client";

import { useState } from "react";
import { cn } from "@/src/utils/cn";
import { formatNumber } from "@/src/utils/format";

export interface MatchScoreRingProps {
  /** 0-100; null renders the no-match variant, undefined w/ loading renders indeterminate. */
  score: number | null;
  size?: number;
  loading?: boolean;
  className?: string;
}

function bandColor(score: number): string {
  if (score >= 80) return "var(--color-success)";
  if (score >= 50) return "var(--color-primary)";
  return "var(--color-pending)";
}

/**
 * Circular SVG progress ring with the percentage inside; tooltip «تطابق ٪N»
 * on hover/tap. Bands: green ≥80, teal 50–79, amber <50 (design spec §4.1).
 */
export function MatchScoreRing({ score, size = 56, loading, className }: MatchScoreRingProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const stroke = Math.max(3, size / 14);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  if (loading) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("animate-spin", className)} aria-label="جارٍ حساب نسبة التطابق">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-hairline)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.25} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (score === null) {
    return (
      <div
        className={cn("flex items-center justify-center rounded-full border-2 border-dashed border-hairline text-caption text-muted", className)}
        style={{ width: size, height: size }}
      >
        —
      </div>
    );
  }

  const clamped = Math.max(0, Math.min(100, score));
  const color = bandColor(clamped);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      onClick={() => setTooltipVisible((v) => !v)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`نسبة التطابق ${formatNumber(clamped)}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-hairline)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="font-bold"
          style={{ fill: color, fontSize: size / 3.5 }}
        >
          {formatNumber(clamped)}%
        </text>
      </svg>
      {tooltipVisible && (
        <span className="absolute -top-8 start-1/2 -translate-x-1/2 whitespace-nowrap rounded-control bg-ink px-2 py-1 text-caption text-white shadow-card rtl:translate-x-1/2">
          تطابق {formatNumber(clamped)}%
        </span>
      )}
    </div>
  );
}
