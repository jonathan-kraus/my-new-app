import { Snowman } from "@/components/Snowman";
type CurrentWeatherProps = {
  temperature: number;
  windspeed: number;
};

export function CurrentWeather({
  temperature,
  windspeed,
}: CurrentWeatherProps) {
  const isWindy = windspeed > 10;
  const isSnowmanMode = temperature < 15;
  return (
    <div className="mb-8 bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-white/60">
      <p className="text-sm text-gray-600 mb-1">Current Conditions</p>

      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-sky-900/60 border border-sky-700/60 p-4 flex items-center justify-between"> <div> <div className="text-sm text-sky-200/80">Current temperature</div> <div className="text-4xl font-semibold text-sky-50"> {temperature}° </div> {isSnowmanMode && ( <div className="mt-1 text-xs text-sky-200/80"> Too cold for humans. Perfect for snowmen. </div> )} </div> {isSnowmanMode && <Snowman />} </div>
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
