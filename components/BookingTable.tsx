import Link from "next/link";
import type { Booking } from "@/lib/types";
import { taka } from "@/lib/merchant";
import { StatusBadge, fmtDate } from "./ui";

/** Table on desktop, stacked cards on mobile. */
export function BookingTable({ items }: { items: Booking[] }) {
  if (!items.length) return <p className="card p-8 text-center text-slate-500">No bookings here yet.</p>;
  return (
    <>
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Room</th><th className="px-4 py-3">Stay</th><th className="px-4 py-3">Guests</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{b.code}</td>
                <td className="px-4 py-3">{b.room.name}<span className="block text-xs text-slate-500">{b.ratePlan.name}</span></td>
                <td className="px-4 py-3">{fmtDate(b.checkIn)} – {fmtDate(b.checkOut)}<span className="block text-xs text-slate-500">{b.price.nights} night{b.price.nights > 1 ? "s" : ""}</span></td>
                <td className="px-4 py-3">{b.adults + b.children}</td>
                <td className="px-4 py-3 font-semibold">{taka(b.price.total)}</td>
                <td className="px-4 py-3"><StatusBadge s={b.status} /></td>
                <td className="px-4 py-3 text-right"><Link href={`/account/bookings/${b.id}`} className="font-semibold text-brand hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {items.map((b) => (
          <li key={b.id}>
            <Link href={`/account/bookings/${b.id}`} className="card block p-4">
              <div className="flex items-center justify-between"><span className="text-xs text-slate-500">#{b.code}</span><StatusBadge s={b.status} /></div>
              <p className="mt-1 font-bold">{b.room.name}</p>
              <p className="text-sm text-slate-500">{fmtDate(b.checkIn)} – {fmtDate(b.checkOut)} · {b.price.nights} night{b.price.nights > 1 ? "s" : ""}</p>
              <p className="mt-2 font-bold text-accent-dark">{taka(b.price.total)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
