export function parseLocalSolar(timeStr: string): Date {
  const [hour, minute, second = "0"] = timeStr.split(":").map(Number);

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
  const [hour, minute, second = "0"] = timeStr.split(":").map(Number);

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
