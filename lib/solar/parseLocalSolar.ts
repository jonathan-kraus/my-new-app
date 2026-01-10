export function parseLocalSolar(value: string | null): Date | null {
  console.group("🕒 parseLocalSolar");

  console.log("Raw input:", value);

  if (!value || value.trim() === "") {
    console.warn("Empty or null → returning null");
    console.groupEnd();
    return null;
  }

  // Convert "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DDTHH:mm:ss"
  // This forces LOCAL interpretation instead of UTC.
  const normalized = value.replace(" ", "T");
  console.log("Normalized:", normalized);

  const dt = new Date(normalized);

  if (isNaN(dt.getTime())) {
    console.error("Invalid Date after parsing → returning null");
    console.groupEnd();
    return null;
  }

  console.log("Parsed Date:", dt);
  console.log("Local components:", {
    year: dt.getFullYear(),
    month: dt.getMonth() + 1,
    day: dt.getDate(),
    hour: dt.getHours(),
    minute: dt.getMinutes(),
    second: dt.getSeconds(),
  });

  console.groupEnd();
  return dt;
}
