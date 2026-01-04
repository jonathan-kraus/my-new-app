type ForecastDay = {
  day: string;
  icon: string;
  high: number;
  low: number;
  description: string;
};

export function ForecastCard({
  day,
  icon,
  high,
  low,
  description,
}: ForecastDay) {
  return (
    <div className="bg-sky-500 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/50 text-center">
      <p className="text-sm font-semibold text-gray-800">{day}</p>
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-xl font-bold text-gray-900">{high}°</p>
      <p className="text-sm text-gray-700">{low}°</p>
      <p className="text-xs text-gray-800 mt-1">{description}</p>
    </div>
  );
}
