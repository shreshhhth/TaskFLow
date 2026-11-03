export function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}
export function endOfWeekExclusive(date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 7);
  return d;
}
export function weekKey(date) { return startOfWeek(date).toISOString().slice(0, 10); }
export function formatRange(start) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const a = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const b = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${a} – ${b}`;
}
export function toLocalInputValue(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 16);
}
export function dateInputToISO(value) { return new Date(value).toISOString(); }
