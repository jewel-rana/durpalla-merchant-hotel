import { taka } from "@/lib/merchant";
import type { Quote, SearchParams } from "@/lib/types";

/** Breakdown from POST hotel/quote; `lines` carries the payment gateway charge when the customer bears it. */
export function QuoteLines({ q, stay }: { q: Quote; stay: SearchParams }) {
  const b = q.breakdown;
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between gap-2"><dt>{b.nights} night{b.nights > 1 ? "s" : ""} × {b.rooms} room{b.rooms > 1 ? "s" : ""}</dt><dd>{taka(b.roomTotal)}</dd></div>
      {b.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Promo {q.promo?.code ?? stay.promo}</dt><dd>-{taka(b.discount)}</dd></div>}
      {q.promo && !q.promo.valid && <p className="text-xs text-amber-700">{q.promo.message || "Promo code not valid."}</p>}
      {b.serviceCharge > 0 && <div className="flex justify-between"><dt>Service charge ({b.serviceChargePercent}%)</dt><dd>{taka(b.serviceCharge)}</dd></div>}
      {b.vat > 0 && <div className="flex justify-between"><dt>VAT ({b.vatPercent}%)</dt><dd>{taka(b.vat)}</dd></div>}
      {(q.lines ?? []).map((l) => <div key={l.code} className="flex justify-between"><dt>{l.label}{l.percent ? ` (${l.percent}%)` : ""}</dt><dd>{taka(l.amount)}</dd></div>)}
      <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total payable</dt><dd className="text-accent-dark">{taka(b.total)}</dd></div>
    </dl>
  );
}
