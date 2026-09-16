import type { Booking, Experience } from "@/types";
import { hashString } from "./utils";

export interface Session {
  date: string;
  time: string;
  capacity: number;
  left: number;
}

export function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parse "YYYY-MM-DD" as a local date (never UTC), so the weekday is always right. */
export function fromDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Places already taken: a stable baseline per session plus bookings made in this demo. */
export function seatsTaken(experience: Experience, dateKey: string, bookings: Booking[]) {
  const capacity = experience.consent.maxGroup;
  if (capacity <= 0) return 0;
  const baseline = hashString(`${experience.id}:${dateKey}`) % Math.max(1, Math.ceil(capacity * 0.5));
  const booked = bookings
    .filter((b) => b.experienceId === experience.id && b.date === dateKey && b.status !== "cancelled")
    .reduce((sum, b) => sum + b.guests, 0);
  return Math.min(capacity, baseline + booked);
}

export function upcomingSessions(experience: Experience, bookings: Booking[], from: Date, count = 6): Session[] {
  const sessions: Session[] = [];
  if (!experience.schedule.days.length || experience.consent.maxGroup <= 0) return sessions;
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  for (let i = 0; i < 90 && sessions.length < count; i++) {
    if (experience.schedule.days.includes(cursor.getDay())) {
      const date = toDateKey(cursor);
      const capacity = experience.consent.maxGroup;
      sessions.push({ date, time: experience.schedule.time, capacity, left: capacity - seatsTaken(experience, date, bookings) });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return sessions;
}
