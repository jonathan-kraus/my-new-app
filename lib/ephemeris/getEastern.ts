// Always compute "today" in America/New_York
function getEasternDate() {
  const now = new Date();

  // Convert to Eastern time by formatting then re-parsing
  const easternString = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
  });

  return new Date(easternString);
}

function getEasternToday() {
  const d = getEasternDate();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEasternTomorrow() {
  const t = getEasternToday();
  t.setDate(t.getDate() + 1);
  return t;
}

export { getEasternDate, getEasternToday, getEasternTomorrow };
