import type { SearchParams } from "./types";

type Raw = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseStay(sp: Raw): SearchParams {
  const n = (k: string, d: number) => Math.max(0, Number(one(sp[k]) ?? d) || d);
  return {
    checkIn: one(sp.checkIn) ?? "2026-10-24",
    checkOut: one(sp.checkOut) ?? "2026-10-27",
    adults: Math.max(1, n("adults", 2)),
    children: n("children", 0),
    rooms: Math.max(1, n("rooms", 1)),
    promo: one(sp.promo) || undefined,
  };
}

export function stayQuery(s: SearchParams, extra: Record<string, string> = {}) {
  const q = new URLSearchParams({ checkIn: s.checkIn, checkOut: s.checkOut, adults: String(s.adults), children: String(s.children), rooms: String(s.rooms), ...extra });
  if (s.promo) q.set("promo", s.promo);
  return q.toString();
}

export const fmtStay = (s: SearchParams) =>
  `${new Date(s.checkIn).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${new Date(s.checkOut).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${s.adults + s.children} guest${s.adults + s.children > 1 ? "s" : ""} · ${s.rooms} room${s.rooms > 1 ? "s" : ""}`;
