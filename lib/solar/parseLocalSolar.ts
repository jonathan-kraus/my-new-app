export function parseLocalSolar(timeStr: string): Date {
  const [hourStr, minuteStr, secondStr] = timeStr.split(":");

  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = secondStr ? Number(secondStr) : 0;

  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    second
  );
}

export function parseLocalSolarForTomorrow(timeStr: string): Date {
  const [hourStr, minuteStr, secondStr] = timeStr.split(":");

  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  const second = secondStr ? Number(secondStr) : 0;

  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    hour,
    minute,
    second
  );
}
