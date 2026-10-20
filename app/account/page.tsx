import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { taka } from "@/lib/merchant";
import { BookingTable } from "@/components/BookingTable";
import { fmtDate } from "@/components/ui";

export const metadata: Metadata = { title: "My account" };

export default async function Dashboard() {
  const [me, list] = await Promise.all([api.getProfile(), api.listBookings()]);
  const next = list.find((b) => b.status === "upcoming");
  const done = list.filter((b) => b.status === "completed");
  const stats = [
    { l: "Upcoming stays", v: list.filter((b) => b.status === "upcoming").length },
    { l: "Nights stayed", v: done.reduce((s, b) => s + b.price.nights, 0) },
    { l: "Total spent", v: taka(list.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.price.total, 0)) },
    { l: "Pearl points", v: 1250 },
  ];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Hello, {me.name.split(" ")[0]} 👋</h1><p className="text-slate-500">Here&apos;s an overview of your stays.</p></div>
      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => <div key={s.l} className="card p-4"><dt className="text-xs text-slate-500">{s.l}</dt><dd className="mt-1 text-2xl font-extrabold text-brand">{s.v}</dd></div>)}
      </dl>
      {next && (
        <section className="card grid overflow-hidden sm:grid-cols-[220px_1fr]" aria-label="Next stay">
          <div className="relative h-40 sm:h-full"><Image src={next.room.images[0]} alt={next.room.name} fill sizes="220px" className="object-cover" /></div>
          <div className="bg-gradient-to-br from-brand-dark to-brand p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Next stay</p>
            <p className="mt-1 text-2xl font-bold">{next.room.name}</p>
            <p className="text-white/80">{fmtDate(next.checkIn)} – {fmtDate(next.checkOut)} · {next.price.nights} nights · {next.ratePlan.name}</p>
            <p className="text-sm text-white/70">Confirmation {next.code} · Arrival {next.arrivalTime}</p>
            <Link href={`/account/bookings/${next.id}`} className="btn-accent mt-4 !py-2 text-sm">View voucher</Link>
          </div>
        </section>
      )}
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Recent bookings</h2><Link href="/account/bookings" className="text-sm font-semibold text-brand">See all</Link></div>
        <BookingTable items={list.slice(0, 3)} />
      </section>
    </div>
  );
}
