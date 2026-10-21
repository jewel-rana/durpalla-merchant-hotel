/** UI shapes for the hotel site, mapped from the storefront API in lib/hotel.ts. */
export interface SearchParams { checkIn: string; checkOut: string; adults: number; children: number; rooms: number; promo?: string }
export interface RatePlan { id: string; name: string; perks: string[]; price: number; refundable: boolean; checkIn?: string | null; checkOut?: string | null }
export interface RoomType {
  id: string; hotelId: string; name: string; category: string; bed: string; maxGuests: number;
  images: string[]; summary: string; description: string; amenities: string[];
  basePrice: number; ratePlans: RatePlan[]; available: number | null;
}
export interface Property { id: string; name: string; description: string; address: string; images: string[]; facilities: string[]; checkIn?: string; checkOut?: string; starRating?: number }
export interface FeeLine { code: string; label: string; percent?: number; amount: number }
export interface Quote {
  breakdown: { nights: number; rooms: number; roomTotal: number; discount: number; serviceChargePercent: number; serviceCharge: number; vatPercent: number; vat: number; subtotal: number; gatewayFee: number; total: number };
  lines: FeeLine[];
  payment: { mode: string; gatewayFeeBearer: string; gatewayFeePercent: number; baseAmount: number; gatewayFee: number; payable: number };
  promo?: { code: string; valid: boolean; discount: number; message?: string } | null;
}
export interface Guest { firstName: string; lastName: string; phone: string; email: string; nationality: string }
