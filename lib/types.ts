export type BedType = "King" | "Twin" | "Queen" | "2 Bedrooms";
export type ViewType = "Sea view" | "Garden view" | "Pool view";
export type BookingStatus = "upcoming" | "completed" | "cancelled";
export type PaymentMethod = "bkash" | "nagad" | "rocket" | "card";

export interface SearchParams { checkIn: string; checkOut: string; adults: number; children: number; rooms: number; promo?: string }
export interface RatePlan { id: string; name: string; perks: string[]; price: number; refundable: boolean }
export interface RoomType {
  id: string; name: string; size: number; bed: BedType; view: ViewType; maxGuests: number;
  images: string[]; summary: string; description: string; amenities: string[]; tags: string[];
  basePrice: number; ratePlans: RatePlan[]; available: number; rating: number;
}
export interface Review { name: string; city: string; rating: number; title: string; text: string; avatar: string }
export interface Amenity { title: string; desc: string; icon: string; image: string }
export interface Guest { firstName: string; lastName: string; phone: string; email: string; nationality: string }
export interface PriceBreakdown { nights: number; rooms: number; roomTotal: number; discount: number; serviceCharge: number; vat: number; total: number }
export interface Booking {
  id: string; code: string; room: RoomType; ratePlan: RatePlan; checkIn: string; checkOut: string;
  adults: number; children: number; rooms: number; guest: Guest; arrivalTime: string; specialRequests: string;
  price: PriceBreakdown; paymentMethod: PaymentMethod; status: BookingStatus; createdAt: string;
}
export interface CreateBookingInput {
  roomId: string; ratePlanId: string; checkIn: string; checkOut: string; adults: number; children: number; rooms: number;
  guest: Guest; arrivalTime: string; specialRequests: string; paymentMethod: PaymentMethod; promo?: string;
}
export interface PaymentInit { bookingId: string; gateway: PaymentMethod; redirectUrl: string }
export interface Customer { id: string; name: string; phone: string; email: string; gender: string; dob: string; address: string; nid?: string }
