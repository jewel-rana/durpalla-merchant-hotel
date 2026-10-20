import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { merchant, taka } from "@/lib/merchant";
import { PrintButton } from "@/components/PrintButton";
import { fmtDate, methodLabel } from "@/components/ui";

export const metadata: Metadata = { title: "Invoice" };

export default async function Invoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await api.getBooking(id);
  if (!b) notFound();
  const p = b.price;
  return (
    <div>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/account/bookings/${b.id}`} className="text-sm text-slate-500 hover:text-brand">‹ Back to booking</Link>
        <PrintButton />
      </div>
      <article className="mx-auto max-w-[794px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-10 print:shadow-none print:ring-0">
        <header className="flex flex-col justify-between gap-4 border-b-4 border-brand pb-5 sm:flex-row">
          <div>
            <p className="text-2xl font-extrabold text-brand">{merchant.name}</p>
            <p className="text-xs text-slate-500">{merchant.contact.address}<br />{merchant.contact.phone} · {merchant.contact.email}<br />BIN: 000000000-0000 (sample)</p>
          </div>
          <div className="sm:text-right">
            <h1 className="text-3xl font-extrabold tracking-wide text-slate-800">INVOICE</h1>
            <p className="text-sm">No. <b>INV-{b.id.slice(2)}</b></p>
            <p className="text-sm">Date: {fmtDate(b.createdAt)}</p>
            <span className="mt-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">PAID</span>
          </div>
        </header>
        <section className="grid gap-4 py-5 text-sm sm:grid-cols-2">
          <div><p className="text-xs font-bold uppercase text-slate-500">Billed to</p><p className="font-semibold">{b.guest.firstName} {b.guest.lastName}</p><p>{b.guest.phone}</p><p>{b.guest.email}</p></div>
          <div className="sm:text-right"><p className="text-xs font-bold uppercase text-slate-500">Stay</p><p className="font-semibold">{fmtDate(b.checkIn)} – {fmtDate(b.checkOut)}</p><p>{p.nights} night(s) · {b.rooms} room(s) · {b.adults + b.children} guest(s)</p><p>Confirmation {b.code}</p></div>
        </section>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead><tr className="bg-brand text-white"><th className="px-3 py-2">Description</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2 text-right">Amount</th></tr></thead>
            <tbody>
              <tr className="border-b"><td className="px-3 py-2">{b.room.name} – {b.ratePlan.name} @ {taka(b.ratePlan.price)}/night</td><td className="px-3 py-2">{p.nights} × {b.rooms}</td><td className="px-3 py-2 text-right">{taka(p.roomTotal)}</td></tr>
              {p.discount > 0 && <tr className="border-b"><td className="px-3 py-2" colSpan={2}>Promo discount</td><td className="px-3 py-2 text-right">-{taka(p.discount)}</td></tr>}
              <tr className="border-b"><td className="px-3 py-2" colSpan={2}>Service charge (10%)</td><td className="px-3 py-2 text-right">{taka(p.serviceCharge)}</td></tr>
              <tr className="border-b"><td className="px-3 py-2" colSpan={2}>VAT (15%)</td><td className="px-3 py-2 text-right">{taka(p.vat)}</td></tr>
            </tbody>
            <tfoot><tr><td className="px-3 py-3 text-right font-bold" colSpan={2}>Total paid</td><td className="px-3 py-3 text-right text-lg font-extrabold text-accent-dark">{taka(p.total)}</td></tr></tfoot>
          </table>
        </div>
        <p className="mt-4 text-sm">Payment method: <b>{methodLabel[b.paymentMethod]}</b> · Transaction ref: TXN{b.id.slice(2)}</p>
        <footer className="mt-10 border-t pt-4 text-center text-xs text-slate-500">
          This is a computer-generated invoice and needs no signature.<br />© 2026 {merchant.name}. All rights reserved. · Powered by Durpalla Limited
        </footer>
      </article>
    </div>
  );
}
