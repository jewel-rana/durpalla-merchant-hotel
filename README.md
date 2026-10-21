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

## Storefront API (real data)

All data comes from the Durpalla storefront API (`durpalla-apigw`, `docs/STOREFRONT_API.md`):
`{API_BASE_URL}/api/v1/merchant/storefront/{tenant}/...`. There is no mock data.

- **Tenant** = merchant username, resolved in `proxy.ts` from the host:
  `{tenant}.durpalla.site` → subdomain; any other host (custom CNAME domain) → `GET /resolve?domain=`
  (308 to the primary domain when the API says so); localhost → `NEXT_PUBLIC_TENANT`.
- All API calls run server-side (`lib/storefront.ts`, server components and server actions), so there is no CORS setup and
  the customer token lives in an httpOnly cookie (`dp_token`, per host = per tenant). Guests get a `dp_guest` id for seat holds.
- Caching: config/home 300 s, search/availability 60 s, seats, quotes, holds and anything authenticated are never cached.
- Payments: methods, mode (`own`/`durpalla`) and the customer-borne gateway charge come from `GET config`;
  amounts shown after booking/quote are the API's (`price.lines` / `lines`). The gateway returns to `/payment/result`.

Copy `.env.example` to `.env.local` and set `API_BASE_URL` and `NEXT_PUBLIC_TENANT`.
