export default function fmt(dt: Date | null) {
  return dt
    ? dt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      })
    : "—";
}
