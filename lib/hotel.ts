/** Hotel endpoints: `{tenant}/hotel/...` (properties, availability, rooms/{id}, quote). */
import { cache } from "react";
import { sf } from "./storefront";
import { pick } from "./storefront-shared";
import type { HotelContent, Property, Quote, RatePlan, RoomType, SearchParams } from "./types";

const s = (v: unknown) => (v == null ? "" : String(v));
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const imgs = (v: unknown) => arr(v).map((x) => (typeof x === "string" ? x : s(pick(x, "url", "src", "image", "path")))).filter(Boolean);
const strs = (v: unknown) => arr(v).map((x) => (typeof x === "string" ? x : s(pick(x, "name", "title", "label")))).filter(Boolean);

function toPlan(p: unknown): RatePlan {
  return {
    id: s(pick(p, "id")) || "standard", name: s(pick(p, "name")) || "Standard rate",
    perks: strs(pick(p, "perks", "inclusions")), price: Number(pick(p, "pricePerNight", "price")) || 0,
    refundable: pick<boolean>(p, "refundable") !== false, checkIn: pick(p, "checkIn"), checkOut: pick(p, "checkOut"),
  };
}

/** Room detail (`hotel/rooms/{id}`) or an availability row (`roomsForStay`), read defensively. */
export function toRoom(r: unknown, hotelId = ""): RoomType {
  const base = Number(pick(r, "basePrice", "base_price_per_night", "price", "rate", "pricePerNight")) || 0;
  const plans = arr(pick(r, "ratePlans", "rate_plans")).map(toPlan);
  const bed = s(pick(r, "bedType", "bed_type"));
  const size = s(pick(r, "sizeSqm", "size_sqm", "size", "roomSize", "room_size"));
  const view = s(pick(r, "view", "viewType", "view_type"));
  const maxGuests = Number(pick(r, "maxGuests", "max_occupancy", "maxOccupancy")) || 0;
  const avail = pick(r, "available", "availableRooms", "available_rooms", "availability");
  return {
    id: s(pick(r, "id", "roomTypeId", "room_type_id")), hotelId: s(pick(r, "hotelId", "hotel_id")) || hotelId,
    name: s(pick(r, "name", "title")), category: s(pick(r, "category")), bed, maxGuests,
    images: imgs(pick(r, "images", "gallery", "photos")),
    summary: [size && `${size} m²`, view && `${view} view`, bed && `${bed} bed`, maxGuests && `Up to ${maxGuests} guests`].filter(Boolean).join(" · "),
    description: s(pick(r, "description")), amenities: strs(pick(r, "amenities", "facilities")),
    basePrice: base, ratePlans: plans.length ? plans : [{ id: "standard", name: "Standard rate", perks: [], price: base, refundable: true }],
    available: avail == null ? null : Number(avail), sizeSqm: Number(size) || null, view,
  };
}

export const getProperties = cache(async (): Promise<Property[]> =>
  (await sf<unknown[]>("hotel/properties", { revalidate: 300 })).map((h) => ({
    id: s(pick(h, "id")), name: s(pick(h, "name")), description: s(pick(h, "description", "about")),
    address: s(pick(h, "address", "location")), images: imgs(pick(h, "images", "gallery", "photos")),
    facilities: strs(pick(h, "facilities", "amenities")), checkIn: pick(h, "checkInTime", "check_in_time"), checkOut: pick(h, "checkOutTime", "check_out_time"),
    starRating: Number(pick(h, "starRating", "star_rating", "stars")) || undefined,
    rating: Number(pick(h, "aggregateRating", "rating")) || undefined, reviewCount: Number(pick(h, "reviewCount", "review_count")) || undefined,
    locationHighlights: strs(pick(h, "locationHighlights")),
  })));

/** GET hotel/availability?check_in&check_out&adults&children → rooms for the stay (all properties). */
export async function searchRooms(q: SearchParams): Promise<RoomType[]> {
  const qs = new URLSearchParams({ check_in: q.checkIn, check_out: q.checkOut, adults: String(q.adults), children: String(q.children), rooms: String(q.rooms) });
  const rows = await sf<{ hotelId: string; rooms: unknown }[]>(`hotel/availability?${qs}`, { revalidate: 60 });
  return rows.flatMap((h) => arr(h.rooms ?? []).map((r) => toRoom(r, s(h.hotelId)))).filter((r) => r.id);
}

export const getRoom = cache(async (id: string): Promise<RoomType> => toRoom(await sf<unknown>(`hotel/rooms/${encodeURIComponent(id)}`, { revalidate: 300 })));

/** POST hotel/quote — the single pricing source (service charge, VAT, promo, gateway charge line). */
export async function getQuote(roomTypeId: string, q: SearchParams, ratePlanId?: string): Promise<Quote> {
  return sf<Quote>("hotel/quote", {
    method: "POST",
    body: { roomTypeId, checkIn: q.checkIn, checkOut: q.checkOut, adults: q.adults, children: q.children, rooms: q.rooms, ratePlanId: ratePlanId || undefined, promoCode: q.promo },
  });
}

/** `home.featuredRooms` (id, name, basePrice, maxGuests). */
export const featuredRooms = (home: Record<string, unknown>): RoomType[] => arr(home.featuredRooms).map((r) => toRoom(r)).filter((r) => r.id);

const EMPTY: HotelContent = { reviews: [], reviewStats: { count: 0, average: null }, locationHighlights: [], stats: { properties: 0, guests: 0, rating: null, reviews: 0 } };

/** GET {tenant}/content → `hotel` section (guest reviews, review stats, location highlights). Empty when unavailable. */
export async function getContent(): Promise<HotelContent> {
  const c = await sf<Record<string, Partial<HotelContent>>>("content", { revalidate: 300 }).catch(() => ({} as Record<string, Partial<HotelContent>>));
  const h = c.hotel ?? {};
  return { ...EMPTY, ...h, reviewStats: { ...EMPTY.reviewStats, ...(h.reviewStats ?? {}) }, stats: { ...EMPTY.stats, ...(h.stats ?? {}) } } as HotelContent;
}
