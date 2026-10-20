/**
 * Typed client for the Durpalla hotel booking API.
 * Set NEXT_PUBLIC_API_BASE_URL (and NEXT_PUBLIC_USE_MOCK=false) to use the real
 * backend; by default a local mock implementation is used.
 */
import type { Amenity, Booking, CreateBookingInput, Customer, PaymentInit, PaymentMethod, Review, RoomType, SearchParams } from "./types";
import * as mock from "./mock";
import { DEFAULT_MERCHANT_ID } from "./merchant";

export interface HotelApi {
  searchRooms(q: SearchParams): Promise<RoomType[]>;
  listRooms(): Promise<RoomType[]>;
  getRoom(id: string): Promise<RoomType | undefined>;
  getAmenities(): Promise<Amenity[]>;
  getGallery(): Promise<string[]>;
  getReviews(): Promise<{ average: number; count: number; items: Review[] }>;
  createBooking(input: CreateBookingInput): Promise<Booking>;
  initiatePayment(bookingId: string, method: PaymentMethod): Promise<PaymentInit>;
  getBooking(id: string): Promise<Booking | undefined>;
  listBookings(): Promise<Booking[]>;
  cancelBooking(id: string): Promise<Booking | undefined>;
  getProfile(): Promise<Customer>;
  updateProfile(p: Partial<Customer>): Promise<Customer>;
  requestOtp(phone: string): Promise<{ ok: boolean }>;
  verifyOtp(phone: string, code: string): Promise<{ token: string }>;
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false" || !BASE;

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("dp_token") : null;
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Merchant-Id": DEFAULT_MERCHANT_ID, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const httpApi: HotelApi = {
  searchRooms: (q) => http(`/v1/hotel/availability?${new URLSearchParams(Object.entries(q).map(([k, v]) => [k, String(v ?? "")]))}`),
  listRooms: () => http("/v1/hotel/rooms"),
  getRoom: (id) => http(`/v1/hotel/rooms/${id}`),
  getAmenities: () => http("/v1/hotel/amenities"),
  getGallery: () => http("/v1/hotel/gallery"),
  getReviews: () => http("/v1/hotel/reviews"),
  createBooking: (input) => http("/v1/hotel/bookings", { method: "POST", body: JSON.stringify(input) }),
  initiatePayment: (id, method) => http(`/v1/hotel/bookings/${id}/payments`, { method: "POST", body: JSON.stringify({ method }) }),
  getBooking: (id) => http(`/v1/hotel/bookings/${id}`),
  listBookings: () => http("/v1/me/hotel-bookings"),
  cancelBooking: (id) => http(`/v1/hotel/bookings/${id}/cancel`, { method: "POST" }),
  getProfile: () => http("/v1/me"),
  updateProfile: (p) => http("/v1/me", { method: "PATCH", body: JSON.stringify(p) }),
  requestOtp: (phone) => http("/v1/auth/otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, code) => http("/v1/auth/otp/verify", { method: "POST", body: JSON.stringify({ phone, code }) }),
};

const delay = <T,>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(v), ms));
const created = new Map<string, Booking>();

export const mockApi: HotelApi = {
  searchRooms: (q) => delay(mock.rooms.filter((r) => r.maxGuests * q.rooms >= q.adults + q.children)),
  listRooms: () => delay(mock.rooms),
  getRoom: (id) => delay(mock.rooms.find((r) => r.id === id)),
  getAmenities: () => delay(mock.amenities),
  getGallery: () => delay(mock.gallery),
  getReviews: () => delay({ average: 4.8, count: 1264, items: mock.reviews }),
  async createBooking(i) {
    const room = mock.rooms.find((r) => r.id === i.roomId) ?? mock.rooms[0];
    const rp = room.ratePlans.find((p) => p.id === i.ratePlanId) ?? room.ratePlans[1];
    const b: Booking = {
      id: `HB${Math.floor(100000 + Math.random() * 899999)}`, code: `SPR${Math.floor(1000 + Math.random() * 8999)}`, room, ratePlan: rp,
      checkIn: i.checkIn, checkOut: i.checkOut, adults: i.adults, children: i.children, rooms: i.rooms, guest: i.guest,
      arrivalTime: i.arrivalTime, specialRequests: i.specialRequests,
      price: mock.price(rp.price, mock.nightsBetween(i.checkIn, i.checkOut), i.rooms, i.promo),
      paymentMethod: i.paymentMethod, status: "upcoming", createdAt: new Date().toISOString(),
    };
    created.set(b.id, b);
    if (typeof window !== "undefined") sessionStorage.setItem(`booking:${b.id}`, JSON.stringify(b));
    return delay(b);
  },
  // Stub: real API returns the bKash/Nagad/Rocket/card gateway URL.
  initiatePayment: (bookingId, method) => delay({ bookingId, gateway: method, redirectUrl: `/booking/${bookingId}/confirmation?paid=1&gw=${method}` }, 400),
  async getBooking(id) {
    if (created.has(id)) return created.get(id);
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem(`booking:${id}`);
      if (s) return JSON.parse(s) as Booking;
    }
    return delay(mock.bookings.find((b) => b.id === id) ?? { ...mock.bookings[0], id });
  },
  listBookings: () => delay(mock.bookings),
  cancelBooking: (id) => {
    const b = mock.bookings.find((x) => x.id === id);
    return delay(b ? { ...b, status: "cancelled" as const } : undefined);
  },
  getProfile: () => delay(mock.customer),
  updateProfile: (p) => delay({ ...mock.customer, ...p }),
  requestOtp: () => delay({ ok: true }),
  verifyOtp: (phone) => delay({ token: `mock-${phone}` }),
};

export const api: HotelApi = USE_MOCK ? mockApi : httpApi;
