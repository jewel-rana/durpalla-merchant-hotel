import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import { Gallery } from "@/components/Gallery";
import { Stars } from "@/components/Stars";
import { merchant, taka } from "@/lib/merchant";
import { api } from "@/lib/api";

const facilities = ["🏖️ Private beach access", "📶 Free Wi-Fi", "🅿️ Free parking", "👶 Kids club", "🏋️ Fitness centre", "🛎️ 24h room service"];

export default async function Home() {
  const [rooms, amenities, gallery, reviews] = await Promise.all([api.listRooms(), api.getAmenities(), api.getGallery(), api.getReviews()]);
  return (
    <>
      <section className="relative isolate">
        <Image src={merchant.heroImage} alt={`${merchant.name} beachfront resort`} fill priority sizes="100vw" className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-dark/95 via-brand/75 to-brand/20" />
        <div className="mx-auto max-w-7xl px-4 pb-36 pt-12 md:px-8 md:pb-40 md:pt-20">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-300">🌴 Beachfront resort · Cox&apos;s Bazar</p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">{merchant.tagline}</h1>
          <p className="mt-4 max-w-xl text-white/85">Ocean-view rooms, infinity pool and spa. Best rate guaranteed when you book direct.</p>
        </div>
      </section>
      <div className="relative z-10 mx-auto -mt-28 max-w-7xl px-4 md:px-8"><BookingForm /></div>

      <section id="rooms" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 md:px-8">
        <div className="mb-6 flex items-end justify-between"><h2 className="text-2xl font-bold">Room types</h2><Link href="/rooms" className="text-sm font-semibold text-brand">View all rooms →</Link></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.slice(0, 3).map((r) => (
            <Link key={r.id} href={`/rooms/${r.id}`} className="card group overflow-hidden p-3 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="relative h-48 overflow-hidden rounded-xl"><Image src={r.images[0]} alt={r.name} fill sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition group-hover:scale-105" /></div>
              <div className="px-1 pt-3">
                <h3 className="font-bold">{r.name}</h3>
                <p className="text-xs text-slate-500">{r.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{r.tags.map((t) => <span key={t} className="rounded-md bg-brand-light px-2 py-0.5 text-xs font-medium text-brand">{t}</span>)}</div>
                <p className="mt-3 text-lg font-extrabold text-accent-dark">{taka(r.basePrice)} <span className="text-sm font-semibold">/ night</span></p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="amenities" className="scroll-mt-16 bg-gradient-to-br from-brand-dark to-brand py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Resort facilities</p>
          <h2 className="mt-1 text-2xl font-bold md:text-3xl">Amenities</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {amenities.map((a) => (
              <div key={a.title} className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/15">
                <div className="relative h-28 overflow-hidden rounded-xl md:h-36"><Image src={a.image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /></div>
                <p className="mt-3 font-semibold">{a.icon} {a.title}</p><p className="text-xs text-white/70">{a.desc}</p>
              </div>
            ))}
          </div>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm">{facilities.map((f) => <li key={f} className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">{f}</li>)}</ul>
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 md:px-8">
        <h2 className="mb-6 text-2xl font-bold">Gallery</h2>
        <Gallery images={gallery} alt={`${merchant.name} photo`} />
      </section>

      <section id="reviews" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-14 md:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-bold">Guest reviews</h2>
          <span className="rounded-lg bg-brand px-2.5 py-1 text-lg font-extrabold text-white">{reviews.average}/5</span>
          <span className="text-sm text-slate-500">Excellent · {reviews.count.toLocaleString()} verified reviews</span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.items.map((r) => (
            <figure key={r.name} className="card p-5">
              <div className="flex items-center gap-3">
                <Image src={r.avatar} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                <div><figcaption className="font-semibold">{r.name}</figcaption><p className="text-xs text-slate-500">{r.city}</p></div>
              </div>
              <Stars value={r.rating} className="mt-3 block" />
              <p className="mt-1 font-semibold">&ldquo;{r.title}&rdquo;</p>
              <blockquote className="mt-1 text-sm text-slate-600">{r.text}</blockquote>
            </figure>
          ))}
        </div>
      </section>

      <section id="location" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-14 md:px-8">
        <div className="card grid overflow-hidden md:grid-cols-[1fr_1.4fr]">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold">Location</h2>
            <p className="mt-2 text-slate-600">{merchant.contact.address}</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>✈️ 15 min from Cox&apos;s Bazar Airport</li><li>🏖️ 2 min walk to Kolatoli beach</li><li>🚌 10 min from the bus terminal</li>
            </ul>
            <p className="mt-4 text-sm"><b>Reservations:</b> {merchant.contact.hotline}<br />{merchant.contact.email}</p>
          </div>
          <div className="relative min-h-64 bg-[linear-gradient(135deg,#cfe8e3_25%,#dff1ee_25%,#dff1ee_50%,#cfe8e3_50%,#cfe8e3_75%,#dff1ee_75%)] bg-[length:40px_40px]" role="img" aria-label="Map placeholder">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-sky-300/60" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-4xl" aria-hidden>📍</span>
              <p className="rounded-lg bg-white px-3 py-1 text-sm font-semibold shadow">{merchant.name}</p>
            </div>
            <span className="absolute bottom-3 right-3 rounded bg-white/90 px-2 py-0.5 text-[10px] text-slate-500">Map placeholder · embed Google Maps here</span>
          </div>
        </div>
      </section>

      <section id="app" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-16 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark to-brand p-8 text-white md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Get the app</p>
              <h2 className="mt-2 text-2xl font-bold md:text-4xl">Book faster with the {merchant.name} app</h2>
              <ul className="mt-5 space-y-2 text-white/85"><li>🔑 Mobile check-in &amp; digital room voucher</li><li>🍹 Order room service &amp; book spa slots</li><li>💸 App-only rates, pay with bKash/Nagad/card</li></ul>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a href={merchant.apps.appStore} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/20" aria-label="Download on the App Store"><span className="text-2xl" aria-hidden></span><span className="leading-tight"><span className="block text-[10px]">Download on the</span><span className="font-semibold">App Store</span></span></a>
                <a href={merchant.apps.googlePlay} className="flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 ring-1 ring-white/20" aria-label="Get it on Google Play"><span className="text-xl" aria-hidden>▶</span><span className="leading-tight"><span className="block text-[10px]">GET IT ON</span><span className="font-semibold">Google Play</span></span></a>
                <figure className="text-center">
                  <div className="grid h-20 w-20 grid-cols-5 gap-0.5 rounded-lg bg-white p-1.5" role="img" aria-label="QR code placeholder">
                    {Array.from({ length: 25 }, (_, i) => <span key={i} className={[0, 1, 3, 4, 5, 7, 9, 12, 14, 15, 19, 20, 21, 22, 24].includes(i) ? "bg-slate-900" : ""} />)}
                  </div>
                  <figcaption className="mt-1 text-[10px] text-white/70">Scan to download</figcaption>
                </figure>
              </div>
            </div>
            <div className="mx-auto hidden w-56 rounded-[2.2rem] border-[7px] border-slate-900 bg-white p-2 text-slate-900 shadow-2xl md:block">
              <div className="rounded-[1.6rem] bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-brand"><span className="rounded bg-brand px-1 text-[9px] text-white">{merchant.logo.text}</span>{merchant.shortName}</div>
                <div className="relative h-24 overflow-hidden rounded-xl"><Image src="/img/pool.jpg" alt="" fill sizes="200px" className="object-cover" /></div>
                <div className="mt-2 space-y-1.5 text-[10px]">
                  <div className="rounded-lg bg-white p-2 shadow-sm"><span className="text-slate-400">CHECK-IN</span><br /><b>24 Oct 2026</b></div>
                  <div className="rounded-lg bg-white p-2 shadow-sm"><span className="text-slate-400">GUESTS</span><br /><b>2 Adults · 1 Room</b></div>
                  <div className="rounded-lg bg-accent p-2 text-center font-bold text-white">Search</div>
                  <div className="rounded-lg bg-white p-2 shadow-sm">Deluxe Sea View · ৳8,500</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
