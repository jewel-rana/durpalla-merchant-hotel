# Merchant Website – Hotel / Resort (white-label) · Powered by Durpalla Limited

Next.js 16 (App Router, TypeScript, Tailwind CSS v4) storefront for hotels and resorts on the Durpalla OTA platform. The sample merchant is **Sea Pearl Resort, Cox's Bazar** (teal + gold).

## Run
```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
npm run build && npm start
```

## Configure a merchant
* `lib/merchant.ts`: add an entry to `merchants` (name, logo, colors, contact, domain, app links, hero image) and set `NEXT_PUBLIC_MERCHANT_ID`.
* Colors become CSS variables (`--brand`, `--brand-dark`, `--brand-light`, `--accent`, `--accent-dark`) on `<html>` and are mapped to Tailwind (`bg-brand`, `text-accent`…) in `app/globals.css`.
* `proxy.ts` is a stub that resolves hostname → merchant id and sets an `x-merchant-id` header.
* Room types, amenities, gallery and reviews come from the API (mock: `lib/mock.ts`).

## Data / API
* `lib/types.ts`: RoomType, RatePlan, Booking, Guest, PriceBreakdown, PaymentInit…
* `lib/api.ts`: `HotelApi` interface, `httpApi` (REST on `NEXT_PUBLIC_API_BASE_URL` with `X-Merchant-Id`), and `mockApi` (default). Set `NEXT_PUBLIC_USE_MOCK=false` to use the real API. Endpoint paths are proposals, so align them with Durpalla's backend.
* Pricing: room total − promo, +10% service charge, +15% VAT on (net + service). This lives in `price()` in `lib/mock.ts`; the real backend should return the breakdown. Demo promo code: `PEARL10`.
* Payment: `initiatePayment()` returns a gateway redirect URL. The mock goes straight to the confirmation page.

## Routes
`/` · `/rooms` · `/rooms/[id]` · `/checkout` · `/booking/[id]/confirmation` · `/login` · `/account` · `/account/bookings` · `/account/bookings/[id]` · `/account/invoices/[id]` (printable A4) · `/account/profile`
