type CurrentWeatherProps = {
  temperature: number;
  windspeed: number;
};

export function CurrentWeather({
  temperature,
  windspeed,
}: CurrentWeatherProps) {
  const isWindy = windspeed > 10;

  return (
    <div className="mb-8 bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/60">
      <p className="text-sm text-gray-600 mb-1">Current Conditions</p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-5xl font-black text-gray-900">
            {Math.round(temperature)}°
          </p>

          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-sm text-gray-700 ${
                isWindy ? "wind-breeze" : ""
              }`}
            >
              🌬️
            </span>

            <p className="text-sm text-gray-700">
              Wind {Math.round(windspeed)} mph
            </p>
          </div>
        </div>

        <div className="text-6xl">🌤️</div>
      </div>
    </div>
  );
}
