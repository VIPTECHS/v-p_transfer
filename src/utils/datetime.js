const pad = (n) => String(n).padStart(2, "0");

export function defaultPickupDate() {
  const date = new Date();
  date.setHours(date.getHours() + 2, 0, 0, 0);
  return date;
}

export function dateToTimeValue(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function combineDateAndTime(date, timeValue) {
  const [hours, minutes] = timeValue.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours || 0, minutes || 0, 0, 0);
  return next;
}

export function toPickupISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromPickupISO(value) {
  if (!value) return defaultPickupDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? defaultPickupDate() : parsed;
}

import { resolveIntlLocale } from "../i18n/locale";

export function formatPickupDisplay(date, locale = "en") {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatPickupDateDisplay(date, locale = "en") {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatPickupTimeDisplay(date) {
  return dateToTimeValue(date);
}

export function hoursBetween(startTime, endTime) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? Math.ceil(diff / 60) : 1;
}

export function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function isBeforeDay(a, b) {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function getMonthMatrix(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}
