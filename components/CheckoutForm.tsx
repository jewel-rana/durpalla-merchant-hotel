"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Guest, Quote, RoomType, SearchParams } from "@/lib/types";
import { taka } from "@/lib/merchant";
import { useSite } from "@/lib/site-context";
import { fmtStay } from "@/lib/stay";
import { createHotelBooking } from "@/lib/hotel-actions";
import { initiatePayment } from "@/lib/auth-actions";
import { QuoteLines } from "./QuoteLines";

const brand: Record<string, string> = { bkash: "text-[#E2136E]", nagad: "text-[#EC1C24]", rocket: "text-[#8C3494]", sslcommerz: "text-[#1A1F71]", card: "text-[#1A1F71]" };
const requests = ["High floor", "Twin beds", "Late check-in", "Airport pickup", "Quiet room"];

/** 🔒 POST hotel/holds → POST bookings {vertical:"hotel", holdId} → POST payments/initiate. Prices are the API quote. */
export function CheckoutForm({ room, stay, planId, quote, phone }: { room: RoomType; stay: SearchParams; planId: string; quote: Quote; phone?: string }) {
  const site = useSite();
  const router = useRouter();
  const methods = site.payments.methods;
  const plan = room.ratePlans.find((p) => p.id === planId) ?? room.ratePlans[0];
  const [g, setG] = useState<Guest>({ firstName: "", lastName: "", phone: (phone ?? "").replace(/^\+?88/, ""), email: "", nationality: "Bangladeshi" });
  const [arrival, setArrival] = useState("14:00");
  const [chips, setChips] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState(methods[0]?.code ?? "");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  const upd = (p: Partial<Guest>) => setG({ ...g, ...p });
  const total = quote.breakdown.total;

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!/^01\d{9}$/.test(g.phone)) return setErr("Enter a valid 11-digit mobile number (01XXXXXXXXX).");
    if (!method) return setErr("Online payment is not available for this property yet.");
    if (!agree) return setErr("Please accept the hotel policies to continue.");
    setErr(""); setBusy(true);
    const b = await createHotelBooking({
      roomTypeId: room.id, checkIn: stay.checkIn, checkOut: stay.checkOut, adults: stay.adults, children: stay.children, rooms: stay.rooms,
      promoCode: stay.promo, idempotencyKey: key,
      guest: { name: `${g.firstName} ${g.lastName}`.trim(), mobile: g.phone, email: g.email || undefined, nationality: g.nationality, arrivalTime: arrival, specialRequests: [...chips, notes].filter(Boolean).join(", ") || undefined },
    });
    if (!b.ok) { setBusy(false); return setErr(b.code === "ROOM_UNAVAILABLE" ? "This room just sold out for your dates. Please choose another." : b.message); }
    const p = await initiatePayment(b.data.id, method);
    if (p.ok && p.data.redirectUrl) { window.location.href = p.data.redirectUrl; return; }
    setBusy(false);
    if (!p.ok) setErr(`Booking ${b.data.pnr ?? b.data.id} was created but payment could not start: ${p.message}`);
    router.push(`/account/bookings/${b.data.id}`);
  }

  return (
    <form onSubmit={pay} className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 pb-32 md:px-8 lg:grid-cols-[1fr_380px] lg:pb-10">
      <div className="min-w-0 space-y-5">
        <h1 className="text-2xl font-bold">Guest details</h1>
        <fieldset className="card grid gap-3 p-5 sm:grid-cols-2">
          <legend className="sr-only">Lead guest</legend>
          <div><label className="label" htmlFor="fn">First name</label><input id="fn" className="field" required autoComplete="given-name" value={g.firstName} onChange={(e) => upd({ firstName: e.target.value })} /></div>
          <div><label className="label" htmlFor="ln">Last name</label><input id="ln" className="field" required autoComplete="family-name" value={g.lastName} onChange={(e) => upd({ lastName: e.target.value })} /></div>
          <div><label className="label" htmlFor="phone">Mobile number</label><input id="phone" inputMode="numeric" autoComplete="tel" className="field" required placeholder="01XXXXXXXXX" value={g.phone} onChange={(e) => upd({ phone: e.target.value.replace(/\D/g, "").slice(0, 11) })} /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" className="field" placeholder="Voucher will be sent here" value={g.email} onChange={(e) => upd({ email: e.target.value })} /></div>
          <div><label className="label" htmlFor="nat">Nationality</label><input id="nat" className="field" value={g.nationality} onChange={(e) => upd({ nationality: e.target.value })} /></div>
          <div><label className="label" htmlFor="arr">Estimated arrival time</label>
            <select id="arr" className="field" value={arrival} onChange={(e) => setArrival(e.target.value)}>
              {["10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "After midnight"].map((t) => <option key={t}>{t}</option>)}
            </select></div>
        </fieldset>
        <fieldset className="card p-5">
          <legend className="float-left mb-3 w-full font-semibold">Special requests <span className="text-xs font-normal text-slate-500">(subject to availability)</span></legend>
          <div className="clear-both mb-3 flex flex-wrap gap-2">
            {requests.map((r) => (
              <button key={r} type="button" aria-pressed={chips.includes(r)} onClick={() => setChips(chips.includes(r) ? chips.filter((x) => x !== r) : [...chips, r])}
                className={`rounded-full border px-3 py-1.5 text-sm ${chips.includes(r) ? "border-brand bg-brand text-white" : "border-slate-200 text-slate-700"}`}>{r}</button>
            ))}
          </div>
          <label htmlFor="notes" className="sr-only">Other requests</label>
          <textarea id="notes" rows={3} className="field" placeholder="Anything else we should know?" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </fieldset>
        <fieldset className="card p-5">
          <legend className="float-left mb-3 w-full font-semibold">Payment method</legend>
          <div className="clear-both grid gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <label key={m.code} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${method === m.code ? "border-accent bg-amber-50" : "border-slate-200"}`}>
                <input type="radio" name="method" value={m.code} checked={method === m.code} onChange={() => setMethod(m.code)} className="accent-[var(--accent)]" />
                <span className={`font-extrabold ${brand[m.code] ?? "text-slate-800"}`}>{m.name}</span>
              </label>
            ))}
            {!methods.length && <p className="text-sm text-slate-500">Online payment: coming soon for this property.</p>}
          </div>
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">🔒 Secure payment{site.payments.mode === "durpalla" ? <> powered by <b>Durpalla Limited</b></> : null}</p>
        </fieldset>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[var(--brand)]" /> I agree to the hotel policies, cancellation and refund terms.</label>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      </div>

      <aside className="h-fit lg:sticky lg:top-20">
        <div className="card p-5">
          <div className="flex gap-3">
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg"><Image src={room.images[0] ?? "/img/room1.jpg"} alt={room.name} fill sizes="96px" className="object-cover" /></div>
            <div><p className="font-bold">{room.name}</p><p className="text-sm text-slate-500">{plan.name}</p><p className="text-xs text-slate-500">{plan.refundable ? "Refundable (merchant cancellation policy)" : "Non-refundable"}</p></div>
          </div>
          <p className="mt-3 rounded-lg bg-brand-light p-2.5 text-sm text-brand">{fmtStay(stay)}</p>
          <h2 className="mb-2 mt-4 font-bold">Price breakdown</h2>
          <QuoteLines q={quote} stay={stay} />
          <button type="submit" className="btn-accent mt-4 hidden w-full lg:flex" disabled={busy}>{busy ? "Redirecting to gateway…" : `Pay ${taka(total)}`}</button>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div><p className="text-xs text-slate-500">Total · {quote.breakdown.nights} night{quote.breakdown.nights > 1 ? "s" : ""}, incl. VAT</p><p className="text-lg font-extrabold text-accent-dark">{taka(total)}</p></div>
          <button type="submit" className="btn-accent" disabled={busy}>{busy ? "Redirecting…" : "Pay now"}</button>
        </div>
      </div>
    </form>
  );
}
