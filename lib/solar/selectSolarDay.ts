export function selectSolarDay(
  days: {
    date: string;
    sunrise: string;
    sunset: string;
  }[],
) {
  if (!days || days.length === 0) return null;

  const now = new Date();

  // Sort by date
  const sorted = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Find today
  const today = sorted.find((d) => {
    const dt = new Date(d.date);
    return (
      dt.getFullYear() === now.getFullYear() &&
      dt.getMonth() === now.getMonth() &&
      dt.getDate() === now.getDate()
    );
  });

  if (!today) return null;

  // Find tomorrow
  const tomorrow = sorted.find((d) => {
    const dt = new Date(d.date);
    return (
      dt.getFullYear() === now.getFullYear() &&
      dt.getMonth() === now.getMonth() &&
      dt.getDate() === now.getDate() + 1
    );
  });

  return {
    date: today.date,
    sunrise: today.sunrise, // string
    sunset: today.sunset, // string
    nextSunrise: tomorrow ? tomorrow.sunrise : null, // string | null
  };
}
