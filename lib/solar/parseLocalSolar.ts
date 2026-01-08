function parseLocalSolar(iso: string, timeZone = "America/New_York") {
  return new Date(new Date(iso).toLocaleString("en-US", { timeZone }));
}
export { parseLocalSolar };
