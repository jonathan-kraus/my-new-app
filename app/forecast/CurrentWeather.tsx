import React, { useMemo } from "react";
import { Snowman } from "@/components/Snowman";
import useCountUp from "@/lib/useCountUp";

type Unit = "imperial" | "metric";

type CurrentWeatherProps = {
  temperature?: number | null; // degrees (F if imperial, C if metric)
  windspeed?: number | null; // mph if imperial, km/h if metric
  unit?: Unit;
  // configurable thresholds for easier testing/customization
  windyThreshold?: number;
  snowmanThreshold?: number;
};

const DEFAULTS = {
  unit: "imperial" as Unit,
  windyThreshold: 10, // mph
  snowmanThreshold: 15, // degrees Fahrenheit
};

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(
    Math.round(value),
  );
}

export const CurrentWeather = React.memo(function CurrentWeather({
  temperature = null,
  windspeed = null,
  unit = DEFAULTS.unit,
  windyThreshold = DEFAULTS.windyThreshold,
  snowmanThreshold = DEFAULTS.snowmanThreshold,
}: CurrentWeatherProps) {
  // Guard against invalid inputs
  const tempValue = Number.isFinite(temperature as number)
    ? (temperature as number)
    : null;
  const windValue = Number.isFinite(windspeed as number)
    ? (windspeed as number)
    : null;

  const isWindy = useMemo(
    () => windValue !== null && windValue > windyThreshold,
    [windValue, windyThreshold],
  );
  const isSnowmanMode = useMemo(
    () => tempValue !== null && tempValue < snowmanThreshold,
    [tempValue, snowmanThreshold],
  );

  // Keep using your count-up hook for the visual animation
  const animatedTemp = useCountUp(tempValue ?? 0);

  // localized unit label
  const tempUnit = unit === "metric" ? "°C" : "°F";
  const windUnit = unit === "metric" ? "km/h" : "mph";

  // Friendly fallback / loading UI when data missing
  if (tempValue === null && windValue === null) {
    return (
      <section
        aria-label="Current conditions"
        className="mb-8 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/60"
      >
        <p className="text-sm text-gray-600 mb-1">Current Conditions</p>
        <div className="text-sm text-gray-700">
          No current observations available.
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Current conditions"
      className="mb-8 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/60"
    >
      <p className="text-sm text-gray-600 mb-1">Current Conditions</p>

      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-sky-900/60 border border-sky-700/60 p-4 flex items-center gap-6">
          <div>
            <div className="text-sm text-sky-200/80">Current temperature</div>

            {/* announce changes to assistive tech */}
            <div
              className="text-4xl font-semibold text-sky-50"
              aria-live="polite"
              aria-atomic="true"
            >
              {tempValue !== null
                ? `${formatNumber(animatedTemp)}${tempUnit}`
                : `— ${tempUnit}`}
            </div>

            {isSnowmanMode && (
              <div className="mt-1 text-xs text-sky-200/80">
                Too cold for humans. Perfect for snowmen.
              </div>
            )}
          </div>

          {/* decorative: hide from screen readers */}
          {isSnowmanMode && <Snowman aria-hidden={true} />}
        </div>

        <div>
          <div className="flex items-center gap-2 mt-1">
            {/* decorative emoji: hidden from screen readers; provide text next to it */}
            <span
              className={`text-sm ${isWindy ? "wind-breeze" : ""}`}
              aria-hidden="true"
            >
              🌬️
            </span>
            <p className="text-sm text-gray-700">
              Wind{" "}
              {windValue !== null
                ? `${formatNumber(windValue)} ${windUnit}`
                : "—"}
            </p>
          </div>
        </div>

        {/* main sky icon: not purely decorative – give a label for screen readers */}
        <div
          role="img"
          aria-label="Partly sunny"
          className="text-6xl select-none"
        >
          🌤️
        </div>
      </div>
    </section>
  );
});

export default CurrentWeather;
