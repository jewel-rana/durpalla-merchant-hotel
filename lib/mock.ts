import type { Amenity, Booking, Customer, PriceBreakdown, RatePlan, Review, RoomType } from "./types";

const plans = (base: number): RatePlan[] => [
  { id: "ro", name: "Room only", perks: ["Free Wi-Fi", "Pay now, non-refundable"], price: Math.round(base * 0.9), refundable: false },
  { id: "bb", name: "Room + Breakfast", perks: ["Buffet breakfast for all guests", "Free cancellation until 48h before"], price: base, refundable: true },
  { id: "hb", name: "Half board", perks: ["Breakfast + dinner", "Free cancellation until 48h before", "Late checkout 2 PM"], price: Math.round(base * 1.25), refundable: true },
];

export const rooms: RoomType[] = [
  { id: "deluxe-sea-view", name: "Deluxe Sea View", size: 32, bed: "King", view: "Sea view", maxGuests: 3, images: ["/img/room1.jpg", "/img/sea.jpg", "/img/beach.jpg"],
    summary: "32 m² · King bed · Balcony", description: "Bright room with a private balcony facing the Bay of Bengal, king bed, rain shower and work desk.",
    amenities: ["Balcony", "Air conditioning", "Smart TV", "Mini bar", "Rain shower", "Free Wi-Fi", "Safe"], tags: ["Breakfast", "Free cancel"], basePrice: 8500, ratePlans: plans(8500), available: 6, rating: 4.8 },
  { id: "premier-suite", name: "Premier Suite", size: 55, bed: "King", view: "Sea view", maxGuests: 3, images: ["/img/suite.jpg", "/img/pool.jpg", "/img/sea.jpg"],
    summary: "55 m² · Living area · Bathtub", description: "Spacious suite with separate living room, soaking bathtub, panoramic sea views and lounge access.",
    amenities: ["Living room", "Bathtub", "Lounge access", "Nespresso", "Smart TV", "Free Wi-Fi", "Bathrobe"], tags: ["Lounge", "Late checkout"], basePrice: 14000, ratePlans: plans(14000), available: 3, rating: 4.9 },
  { id: "family-villa", name: "Family Villa", size: 90, bed: "2 Bedrooms", view: "Garden view", maxGuests: 6, images: ["/img/room3.jpg", "/img/resort2.jpg", "/img/pool.jpg"],
    summary: "90 m² · 2 bedrooms · Garden", description: "Two-bedroom villa with a private plunge pool, garden terrace and kitchenette, ideal for families.",
    amenities: ["Private pool", "Kitchenette", "Garden terrace", "2 bathrooms", "Smart TV", "Free Wi-Fi"], tags: ["Private pool", "Up to 6"], basePrice: 22000, ratePlans: plans(22000), available: 2, rating: 4.7 },
  { id: "superior-twin", name: "Superior Twin", size: 28, bed: "Twin", view: "Pool view", maxGuests: 2, images: ["/img/pool.jpg", "/img/room1.jpg", "/img/rest.jpg"],
    summary: "28 m² · Twin beds · Pool view", description: "Comfortable twin room overlooking the infinity pool, perfect for friends travelling together.",
    amenities: ["Air conditioning", "Smart TV", "Tea & coffee", "Free Wi-Fi", "Safe"], tags: ["Breakfast"], basePrice: 6500, ratePlans: plans(6500), available: 8, rating: 4.5 },
];

export const amenities: Amenity[] = [
  { title: "Infinity pool", desc: "Open 7am–10pm", icon: "🏊", image: "/img/pool.jpg" },
  { title: "Spa & wellness", desc: "Massage, sauna", icon: "💆", image: "/img/resort2.jpg" },
  { title: "3 restaurants", desc: "Seafood & BBQ", icon: "🍽️", image: "/img/rest.jpg" },
  { title: "Airport shuttle", desc: "Cox's Bazar Airport", icon: "🚐", image: "/img/beach.jpg" },
];

export const gallery = ["/img/resort.jpg", "/img/pool.jpg", "/img/rest.jpg", "/img/beach.jpg", "/img/resort2.jpg", "/img/suite.jpg", "/img/sea.jpg", "/img/room3.jpg"];

export const reviews: Review[] = [
  { name: "Nusrat J.", city: "Dhaka", rating: 5, title: "Stunning views", text: "Woke up to the sea every morning. Staff were warm and the breakfast spread was great.", avatar: "/img/av1.jpg" },
  { name: "Arif H.", city: "Chattogram", rating: 5, title: "Spotless rooms & kind staff", text: "Very clean, quick check-in and the pool is beautiful at sunset.", avatar: "/img/av2.jpg" },
  { name: "Tania R.", city: "Sylhet", rating: 4.5, title: "Great family stay", text: "The villa was perfect for our kids. Shuttle from the airport was on time.", avatar: "/img/av3.jpg" },
];

export const nightsBetween = (a: string, b: string) => Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));

export function price(perNight: number, nights: number, roomsN: number, promo?: string): PriceBreakdown {
  const roomTotal = perNight * nights * roomsN;
  const discount = promo?.toUpperCase() === "PEARL10" ? Math.round(roomTotal * 0.1) : 0;
  const net = roomTotal - discount;
  const serviceCharge = Math.round(net * 0.1);
  const vat = Math.round((net + serviceCharge) * 0.15);
  return { nights, rooms: roomsN, roomTotal, discount, serviceCharge, vat, total: net + serviceCharge + vat };
}

export const customer: Customer = {
  id: "c1", name: "Nusrat Jahan", phone: "+8801711000000", email: "nusrat@example.com",
  gender: "Female", dob: "1993-06-02", address: "House 7, Road 11, Banani, Dhaka",
};

function mk(i: number, roomIdx: number, plan: number, ci: string, co: string, status: Booking["status"]): Booking {
  const room = rooms[roomIdx];
  const rp = room.ratePlans[plan];
  return {
    id: `HB${310000 + i * 211}`, code: `SPR${4820 + i * 37}`, room, ratePlan: rp, checkIn: ci, checkOut: co, adults: 2, children: i % 2, rooms: 1,
    guest: { firstName: "Nusrat", lastName: "Jahan", phone: customer.phone, email: customer.email, nationality: "Bangladeshi" },
    arrivalTime: "14:00", specialRequests: i === 0 ? "High floor, honeymoon setup" : "",
    price: price(rp.price, nightsBetween(ci, co), 1), paymentMethod: (["bkash", "card", "nagad", "rocket"] as const)[i % 4], status,
    createdAt: "2026-10-15T11:20:00+06:00",
  };
}

export const bookings: Booking[] = [
  mk(0, 0, 1, "2026-10-24", "2026-10-27", "upcoming"),
  mk(1, 1, 2, "2026-12-20", "2026-12-23", "upcoming"),
  mk(2, 2, 1, "2026-06-10", "2026-06-12", "completed"),
  mk(3, 3, 0, "2026-03-05", "2026-03-07", "completed"),
  mk(4, 0, 1, "2026-02-14", "2026-02-15", "cancelled"),
];
