export function computeGoldenBlueHours(day: {
  date: Date;
  sunrise: Date;
  sunset: Date;
  moonrise: Date | null;
  moonset: Date | null;
  moonPhase: number;
}) {
  const { sunrise, sunset } = day;

  const goldenMorningStart = new Date(sunrise.getTime() - 10 * 60 * 1000);
  const goldenMorningEnd = new Date(sunrise.getTime() + 30 * 60 * 1000);

  const goldenEveningStart = new Date(sunset.getTime() - 30 * 60 * 1000);
  const goldenEveningEnd = new Date(sunset.getTime() + 10 * 60 * 1000);

  return {
    ...day,
    goldenMorningStart,
    goldenMorningEnd,
    goldenEveningStart,
    goldenEveningEnd,
  };
}
