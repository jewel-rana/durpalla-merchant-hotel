import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { parseStay, fmtStay } from "@/lib/stay";
import { nightsBetween } from "@/lib/mock";
import { Gallery } from "@/components/Gallery";
import { RoomBooking } from "@/components/RoomBooking";

type P = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const room = await api.getRoom((await params).id);
  return { title: room?.name ?? "Room", description: room?.description };
}

const policies = [
  ["Check-in / out", "Check-in from 2:00 PM · Check-out until 12:00 PM"],
  ["Cancellation", "Free cancellation up to 48 hours before arrival on refundable plans. Room-only rates are non-refundable."],
  ["Children & extra beds", "Children under 6 stay free using existing bedding. Extra bed ৳1,500/night."],
  ["ID", "A valid NID or passport is required at check-in. Couples may be asked for a marriage certificate per local regulation."],
  ["Pets & smoking", "Pets are not allowed. Non-smoking rooms; designated smoking areas available."],
];

export default async function RoomPage({ params, searchParams }: P) {
  const { id } = await params;
  const stay = parseStay(await searchParams);
  const room = await api.getRoom(id);
  if (!room) notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-32 md:px-8 lg:pb-12">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500"><Link href="/rooms" className="hover:text-brand">Rooms</Link> › <span className="text-slate-900">{room.name}</span></nav>
      <Gallery images={room.images} alt={room.name} variant="hero" />
      <RoomBooking room={room} stay={stay} nights={nightsBetween(stay.checkIn, stay.checkOut)} stayLabel={fmtStay(stay)}
        before={<>
          <header>
            <h1 className="text-2xl font-bold md:text-3xl">{room.name}</h1>
            <p className="mt-1 text-slate-500">{room.size} m² · {room.bed} bed · {room.view} · Up to {room.maxGuests} guests · ★ {room.rating}</p>
            <p className="mt-3 text-slate-700">{room.description}</p>
          </header>
          <section aria-labelledby="am">
            <h2 id="am" className="mb-3 text-lg font-bold">Room amenities</h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{room.amenities.map((a) => <li key={a} className="flex items-center gap-2 text-sm"><span className="text-brand" aria-hidden>✓</span>{a}</li>)}</ul>
          </section>
        </>}
        after={
          <section aria-labelledby="pol">
            <h2 id="pol" className="mb-3 text-lg font-bold">Policies</h2>
            <dl className="card divide-y">{policies.map(([k, v]) => <div key={k} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr]"><dt className="font-semibold">{k}</dt><dd className="text-sm text-slate-600">{v}</dd></div>)}</dl>
          </section>
        }
      />
    </div>
  );
}
