/*
 * @FilePath: \my-new-app\lib\utils\global.ts
 * @LastEditTime: 2026-04-21 11:52:00
 */
export function formatEastern(date: Date | string | number) {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

export function formatEasternDate(date: Date | string | number) {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEasternTime(date: Date | string | number) {
  return new Date(date).toLocaleString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}
