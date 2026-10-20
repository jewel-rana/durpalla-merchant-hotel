"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface StayQuery { checkIn: string; checkOut: string; adults: number; children: number; rooms: number; promo?: string }

const addDays = (d: string, n: number) => {
  const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10);
};

export function BookingForm({ initial, compact = false }: { initial?: Partial<StayQuery>; compact?: boolean }) {
  const router = useRouter();
  const [checkIn, setIn] = useState(initial?.checkIn ?? "2026-10-24");
  const [checkOut, setOut] = useState(initial?.checkOut ?? "2026-10-27");
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [rooms, setRooms] = useState(initial?.rooms ?? 1);
  const [promo, setPromo] = useState(initial?.promo ?? "");
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const pop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => { if (pop.current && !pop.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checkOut <= checkIn) return setErr("Check-out must be after check-in.");
    setErr("");
    const q = new URLSearchParams({ checkIn, checkOut, adults: String(adults), children: String(children), rooms: String(rooms) });
    if (promo) q.set("promo", promo);
    router.push(`/rooms?${q}`);
  }

  const counter = (label: string, sub: string, v: number, set: (n: number) => void, min: number, max: number) => (
    <div className="flex items-center justify-between py-2">
      <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-slate-500">{sub}</p></div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${label}`} disabled={v <= min} onClick={() => set(v - 1)} className="grid h-8 w-8 place-items-center rounded-full border text-brand disabled:opacity-30">−</button>
        <span className="w-4 text-center font-semibold" aria-live="polite">{v}</span>
        <button type="button" aria-label={`More ${label}`} disabled={v >= max} onClick={() => set(v + 1)} className="grid h-8 w-8 place-items-center rounded-full border text-brand disabled:opacity-30">+</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className={compact ? "" : "card border-t-4 border-t-accent p-5 md:p-6"} aria-label="Check availability">
      {!compact && <h2 className="mb-3 text-lg font-bold text-brand">Check availability</h2>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1.2fr_1fr_auto] md:items-end">
        <div className="grid grid-cols-2 gap-3 md:contents">
          <div><label className="label" htmlFor="ci">Check-in</label>
            <input id="ci" type="date" className="field" value={checkIn} min="2026-10-20" required onChange={(e) => { setIn(e.target.value); if (checkOut <= e.target.value) setOut(addDays(e.target.value, 1)); }} /></div>
          <div><label className="label" htmlFor="co">Check-out</label>
            <input id="co" type="date" className="field" value={checkOut} min={addDays(checkIn, 1)} required onChange={(e) => setOut(e.target.value)} /></div>
        </div>
        <div className="relative" ref={pop}>
          <span className="label" id="guests-label">Guests / Rooms</span>
          <button type="button" aria-labelledby="guests-label" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)} className="field text-left font-semibold">
            {adults} Adult{adults > 1 ? "s" : ""}{children ? ` · ${children} Child${children > 1 ? "ren" : ""}` : ""} · {rooms} Room{rooms > 1 ? "s" : ""}
          </button>
          {open && (
            <div role="dialog" aria-label="Guests and rooms" className="absolute left-0 right-0 top-full z-30 mt-2 min-w-64 rounded-xl border bg-white p-4 shadow-xl">
              {counter("Adults", "Age 13+", adults, setAdults, 1, 12)}
              {counter("Children", "Age 0–12", children, setChildren, 0, 6)}
              {counter("Rooms", "Max 3 guests each", rooms, setRooms, 1, 5)}
              <button type="button" className="btn-accent mt-2 w-full !py-2" onClick={() => setOpen(false)}>Done</button>
            </div>
          )}
        </div>
        <div><label className="label" htmlFor="promo">Promo code</label>
          <input id="promo" className="field uppercase" placeholder="Optional" value={promo} onChange={(e) => setPromo(e.target.value.toUpperCase())} /></div>
        <button type="submit" className="btn-accent h-[42px] w-full md:w-auto md:px-8">Search</button>
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-red-600">{err}</p>}
    </form>
  );
}
