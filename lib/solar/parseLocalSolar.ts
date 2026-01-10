export function parseLocalSolar(dateTimeStr: string | null | undefined): Date | null {
  if (!dateTimeStr || typeof dateTimeStr !== "string") return null;

  const parts = dateTimeStr.trim().split(" ");
  if (parts.length !== 2) return null;

  const [datePart, timePart] = parts;
  if (!datePart || !timePart) return null;

  const dateBits = datePart.split("-");
  const timeBits = timePart.split(":");

  if (dateBits.length !== 3 || timeBits.length < 2) return null;

  const [year, month, day] = dateBits.map(Number);
  const [hour, minute, second = 0] = timeBits.map(Number);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, second);
}
