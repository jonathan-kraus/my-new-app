export function parseLocalSolar(dateTimeStr: string): Date {
  if (!dateTimeStr) return new Date(NaN);

  const [datePart, timePart] = dateTimeStr.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second);
}
