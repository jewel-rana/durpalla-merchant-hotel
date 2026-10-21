"use client";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { Quote, RoomType, SearchParams } from "@/lib/types";
import { taka } from "@/lib/merchant";
import { QuoteLines } from "./QuoteLines";
import { stayQuery } from "@/lib/stay";

/** Rate plans from GET hotel/rooms/{id}; totals from POST hotel/quote (null when the room cannot be quoted for these dates). */
export function RoomBooking({ room, stay, nights, stayLabel, quote, before, after }: { room: RoomType; stay: SearchParams; nights: number; stayLabel: string; quote: Quote | null; before: ReactNode; after: ReactNode }) {
  const router = useRouter();
  const [planId, setPlanId] = useState(room.ratePlans[0].id);
  const plan = room.ratePlans.find((p) => p.id === planId) ?? room.ratePlans[0];
  const book = () => router.push(`/checkout?${stayQuery(stay, { room: room.id, plan: plan.id })}`);

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-8">
        {before}
        <section aria-labelledby="rp" id="rates" className="scroll-mt-20">
          <h2 id="rp" className="mb-3 text-lg font-bold">Choose your rate <span className="block text-sm font-normal text-slate-500 sm:inline">· {stayLabel}</span></h2>
          <div role="radiogroup" aria-label="Rate plans" className="space-y-3">
            {room.ratePlans.map((p) => (
              <label key={p.id} className={`card flex cursor-pointer items-start gap-3 p-4 ${planId === p.id ? "ring-2 ring-accent" : ""}`}>
                <input type="radio" name="plan" value={p.id} checked={planId === p.id} onChange={() => setPlanId(p.id)} className="mt-1 accent-[var(--accent)]" />
                <span className="flex-1">
                  <span className="block font-semibold">{p.name}</span>
                  <span className="mt-1 block space-y-0.5 text-sm text-slate-600">{p.perks.map((x) => <span key={x} className="block">• {x}</span>)}{p.checkIn && <span className="block">• Check-in from {p.checkIn}{p.checkOut ? `, check-out until ${p.checkOut}` : ""}</span>}</span>
                  {!p.refundable && <span className="mt-1 inline-block rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">Non-refundable</span>}
                </span>
                <span className="text-right"><span className="block text-lg font-extrabold text-accent-dark">{taka(p.price)}</span><span className="text-xs text-slate-500">/ night</span></span>
              </label>
            ))}
          </div>
        </section>
        {after}
      </div>

      <aside className="hidden lg:block">
        <div className="card sticky top-20 p-5">
          <p className="text-sm text-slate-500">{plan.name}</p>
          <p className="text-2xl font-extrabold text-accent-dark">{taka(plan.price)} <span className="text-sm font-semibold text-slate-500">/ night</span></p>
          <p className="mt-2 text-sm text-slate-600">{stayLabel}</p>
          <div className="mt-4 border-t pt-3">{quote ? <QuoteLines q={quote} stay={stay} /> : <p className="text-sm text-amber-700">Not available for these dates.</p>}</div>
          <button type="button" className="btn-accent mt-4 w-full" disabled={!quote} onClick={book}>Book now</button>
          <p className="mt-2 text-center text-xs text-slate-500">Best rate when you book direct</p>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white p-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div><p className="text-xs text-slate-500">{plan.name} · {nights} night{nights > 1 ? "s" : ""}</p><p className="text-lg font-extrabold text-accent-dark">{quote ? taka(quote.breakdown.total) : "—"}</p></div>
          <button type="button" className="btn-accent" disabled={!quote} onClick={book}>Book now</button>
        </div>
      </div>
    </div>
  );
}
