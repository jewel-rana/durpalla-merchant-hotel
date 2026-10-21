"use server";
import { sf } from "./storefront";
import { run } from "./auth-actions";

export interface HotelBookingInput {
  roomTypeId: string; checkIn: string; checkOut: string; adults: number; children: number; rooms: number; promoCode?: string;
  guest: { name: string; mobile: string; email?: string; nationality?: string; arrivalTime?: string; specialRequests?: string };
  idempotencyKey: string;
}

/**
 * 🔒 POST hotel/holds (Idempotency-Key) → 🔒 POST bookings {vertical:"hotel", holdId, guest}.
 * Holding first guarantees the inventory and the quoted price for the hold TTL.
 */
export async function createHotelBooking(i: HotelBookingInput) {
  return run(async () => {
    const hold = await sf<{ holdId: string; expiresAt?: string }>("hotel/holds", {
      method: "POST", auth: true, headers: { "Idempotency-Key": i.idempotencyKey },
      body: { checkIn: i.checkIn, checkOut: i.checkOut, adults: i.adults, children: i.children, lines: [{ roomTypeId: i.roomTypeId, quantity: i.rooms }] },
    });
    return sf<{ id: string; pnr?: string }>("bookings", {
      method: "POST", auth: true, headers: { "Idempotency-Key": `${i.idempotencyKey}:book` },
      body: { vertical: "hotel", platform: "web", holdId: hold.holdId, promoCode: i.promoCode, guest: i.guest },
    });
  });
}
