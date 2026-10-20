"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Booking } from "@/lib/types";
import { api } from "@/lib/api";
import { merchant, taka } from "@/lib/merchant";
import { QrPlaceholder, fmtDate, methodLabel } from "./ui";

export function Confirmation({ id }: { id: string }) {
  const [b, setB] = useState<Booking>();
  useEffect(() => { api.getBooking(id).then(setB); }, [id]);
  if (!b) return <p className="p-16 text-center text-slate-500" role="status">Loading your voucher…</p>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600" aria-hidden>✓</div>
        <h1 className="mt-4 text-2xl font-bold">Your stay is confirmed!</h1>
        <p className="text-slate-600">We&apos;ve sent the voucher by SMS{b.guest.email ? " and email" : ""}. See you in Cox&apos;s Bazar.</p>
      </div>
      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center justify-between bg-brand px-5 py-3 text-white"><span className="font-semibold">Hotel voucher</span><span className="text-sm">Confirmation <b>{b.code}</b></span></div>
        <div className="grid gap-6 p-5 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="text-xl font-bold">{merchant.name}</p>
            <p className="text-sm text-slate-500">{merchant.contact.address}</p>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Check-in</dt><dd className="font-semibold">{fmtDate(b.checkIn)} · 2 PM</dd></div>
              <div><dt className="text-slate-500">Check-out</dt><dd className="font-semibold">{fmtDate(b.checkOut)} · 12 PM</dd></div>
              <div><dt className="text-slate-500">Room</dt><dd className="font-semibold">{b.rooms} × {b.room.name}</dd></div>
              <div><dt className="text-slate-500">Rate</dt><dd className="font-semibold">{b.ratePlan.name}</dd></div>
              <div><dt className="text-slate-500">Guests</dt><dd className="font-semibold">{b.adults} adults{b.children ? `, ${b.children} child` : ""}</dd></div>
              <div><dt className="text-slate-500">Lead guest</dt><dd className="font-semibold">{b.guest.firstName} {b.guest.lastName}</dd></div>
              <div><dt className="text-slate-500">Paid via</dt><dd className="font-semibold">{methodLabel[b.paymentMethod]}</dd></div>
              <div><dt className="text-slate-500">Total paid</dt><dd className="font-semibold text-accent-dark">{taka(b.price.total)}</dd></div>
            </dl>
          </div>
          <div className="mx-auto text-center"><QrPlaceholder value={b.code} /><p className="mt-1 text-xs text-slate-500">Show at reception</p></div>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/account/invoices/${b.id}`} className="btn-outline">View invoice</Link>
        <Link href={`/account/bookings/${b.id}`} className="btn-outline">Booking details</Link>
        <Link href="/" className="btn-accent">Back to home</Link>
      </div>
    </div>
  );
}
