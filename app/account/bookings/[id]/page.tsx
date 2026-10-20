import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { merchant, taka } from "@/lib/merchant";
import { QrPlaceholder, StatusBadge, fmtDate, methodLabel } from "@/components/ui";

export const metadata: Metadata = { title: "Booking details" };

export default async function BookingDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await api.getBooking(id);
  if (!b) notFound();
  return (
    <div className="space-y-5">
      <nav className="text-sm text-slate-500" aria-label="Breadcrumb"><Link href="/account/bookings" className="hover:text-brand">My bookings</Link> › {b.code}</nav>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{b.room.name}</h1><StatusBadge s={b.status} /></div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
        <section className="card min-w-0 p-5">
          <h2 className="mb-4 font-bold">Stay</h2>
          <div className="flex items-center justify-between gap-3 text-center">
            <div><p className="text-xs text-slate-500">Check-in</p><p className="text-lg font-extrabold">{fmtDate(b.checkIn)}</p><p className="text-sm text-slate-500">from 2:00 PM</p></div>
            <div className="flex-1 text-xs text-slate-500">{b.price.nights} night{b.price.nights > 1 ? "s" : ""}<div className="my-1 h-px bg-slate-300" />{b.rooms} room{b.rooms > 1 ? "s" : ""}</div>
            <div><p className="text-xs text-slate-500">Check-out</p><p className="text-lg font-extrabold">{fmtDate(b.checkOut)}</p><p className="text-sm text-slate-500">until 12:00 PM</p></div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">Confirmation</dt><dd className="font-semibold">{b.code}</dd></div>
            <div><dt className="text-slate-500">Booking ID</dt><dd className="font-semibold">{b.id}</dd></div>
            <div><dt className="text-slate-500">Rate plan</dt><dd className="font-semibold">{b.ratePlan.name}</dd></div>
            <div><dt className="text-slate-500">Guests</dt><dd className="font-semibold">{b.adults} adults{b.children ? `, ${b.children} child` : ""}</dd></div>
            <div><dt className="text-slate-500">Arrival</dt><dd className="font-semibold">{b.arrivalTime}</dd></div>
            <div><dt className="text-slate-500">Cancellation</dt><dd className="font-semibold">{b.ratePlan.refundable ? "Free until 48h before" : "Non-refundable"}</dd></div>
          </dl>
          <h2 className="mb-2 mt-6 font-bold">Lead guest</h2>
          <p className="text-sm">{b.guest.firstName} {b.guest.lastName} · {b.guest.phone} · {b.guest.email}</p>
          {b.specialRequests && <><h2 className="mb-2 mt-6 font-bold">Special requests</h2><p className="text-sm text-slate-600">{b.specialRequests}</p></>}
        </section>
        <aside className="space-y-5">
          <div className="card p-5 text-center"><QrPlaceholder value={b.code} size={150} /><p className="mt-2 text-xs text-slate-500">Show this at {merchant.shortName} reception</p></div>
          <div className="card p-5">
            <h2 className="mb-3 font-bold">Payment</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt>Room charges</dt><dd>{taka(b.price.roomTotal)}</dd></div>
              {b.price.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount</dt><dd>-{taka(b.price.discount)}</dd></div>}
              <div className="flex justify-between"><dt>Service charge</dt><dd>{taka(b.price.serviceCharge)}</dd></div>
              <div className="flex justify-between"><dt>VAT</dt><dd>{taka(b.price.vat)}</dd></div>
              <div className="flex justify-between border-t pt-2 font-bold"><dt>Paid ({methodLabel[b.paymentMethod]})</dt><dd className="text-accent-dark">{taka(b.price.total)}</dd></div>
            </dl>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/account/invoices/${b.id}`} className="btn-outline">View invoice</Link>
            {b.status === "upcoming" && <a href={`tel:${merchant.contact.hotline}`} className="btn-outline !border-red-300 !text-red-600 hover:!bg-red-50">Cancel booking (call reservations)</a>}
            <a href={`mailto:${merchant.contact.email}?subject=Booking ${b.code}`} className="text-center text-sm font-semibold text-brand">Contact reservations</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
