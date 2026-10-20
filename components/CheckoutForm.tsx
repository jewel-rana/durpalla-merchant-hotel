"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Guest, PaymentMethod, RoomType, SearchParams } from "@/lib/types";
import { api } from "@/lib/api";
import { taka } from "@/lib/merchant";
import { nightsBetween, price } from "@/lib/mock";
import { fmtStay } from "@/lib/stay";

const methods: { k: PaymentMethod; l: string; c: string }[] = [
  { k: "bkash", l: "bKash", c: "text-[#E2136E]" }, { k: "nagad", l: "Nagad", c: "text-[#EC1C24]" },
  { k: "rocket", l: "Rocket", c: "text-[#8C3494]" }, { k: "card", l: "Card (VISA / Mastercard / AMEX)", c: "text-[#1A1F71]" },
];
const requests = ["High floor", "Sea-facing", "Twin beds", "Late check-in", "Honeymoon setup", "Airport pickup"];

export function CheckoutForm({ room, stay, planId }: { room: RoomType; stay: SearchParams; planId: string }) {
  const router = useRouter();
  const plan = room.ratePlans.find((p) => p.id === planId) ?? room.ratePlans[0];
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const pb = price(plan.price, nights, stay.rooms, stay.promo);
  const [g, setG] = useState<Guest>({ firstName: "", lastName: "", phone: "", email: "", nationality: "Bangladeshi" });
  const [arrival, setArrival] = useState("14:00");
  const [chips, setChips] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const upd = (p: Partial<Guest>) => setG({ ...g, ...p });

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!/^01\d{9}$/.test(g.phone)) return setErr("Enter a valid 11-digit mobile number (01XXXXXXXXX).");
    if (!agree) return setErr("Please accept the hotel policies to continue.");
    setErr(""); setBusy(true);
    try {
      const b = await api.createBooking({ roomId: room.id, ratePlanId: plan.id, checkIn: stay.checkIn, checkOut: stay.checkOut, adults: stay.adults, children: stay.children, rooms: stay.rooms, guest: g, arrivalTime: arrival, specialRequests: [...chips, notes].filter(Boolean).join(", "), paymentMethod: method, promo: stay.promo });
      const p = await api.initiatePayment(b.id, method);
      if (p.redirectUrl.startsWith("http")) window.location.href = p.redirectUrl; else router.push(p.redirectUrl);
    } catch { setErr("Payment could not be started. Please try again."); setBusy(false); }
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
              <label key={m.k} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${method === m.k ? "border-accent bg-amber-50" : "border-slate-200"}`}>
                <input type="radio" name="method" value={m.k} checked={method === m.k} onChange={() => setMethod(m.k)} className="accent-[var(--accent)]" />
                <span className={`font-extrabold ${m.c}`}>{m.l}</span>
              </label>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">🔒 Secure payment powered by <b>Durpalla Limited</b></p>
        </fieldset>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[var(--brand)]" /> I agree to the hotel policies, cancellation and refund terms.</label>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      </div>

      <aside className="h-fit lg:sticky lg:top-20">
        <div className="card p-5">
          <div className="flex gap-3">
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg"><Image src={room.images[0]} alt={room.name} fill sizes="96px" className="object-cover" /></div>
            <div><p className="font-bold">{room.name}</p><p className="text-sm text-slate-500">{plan.name}</p><p className="text-xs text-slate-500">{plan.refundable ? "Free cancellation until 48h before" : "Non-refundable"}</p></div>
          </div>
          <p className="mt-3 rounded-lg bg-brand-light p-2.5 text-sm text-brand">{fmtStay(stay)}</p>
          <h2 className="mb-2 mt-4 font-bold">Price breakdown</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2"><dt>{taka(plan.price)} × {nights} night{nights > 1 ? "s" : ""} × {stay.rooms} room{stay.rooms > 1 ? "s" : ""}</dt><dd>{taka(pb.roomTotal)}</dd></div>
            {pb.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Promo {stay.promo}</dt><dd>-{taka(pb.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Service charge (10%)</dt><dd>{taka(pb.serviceCharge)}</dd></div>
            <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{taka(pb.vat)}</dd></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total payable</dt><dd className="text-accent-dark">{taka(pb.total)}</dd></div>
          </dl>
          <button type="submit" className="btn-accent mt-4 hidden w-full lg:flex" disabled={busy}>{busy ? "Redirecting to gateway…" : `Pay ${taka(pb.total)}`}</button>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div><p className="text-xs text-slate-500">Total · {nights} night{nights > 1 ? "s" : ""}, incl. VAT</p><p className="text-lg font-extrabold text-accent-dark">{taka(pb.total)}</p></div>
          <button type="submit" className="btn-accent" disabled={busy}>{busy ? "Redirecting…" : "Pay now"}</button>
        </div>
      </div>
    </form>
  );
}
