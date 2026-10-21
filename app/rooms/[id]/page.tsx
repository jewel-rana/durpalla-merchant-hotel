import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/storefront";
import { getQuote, getRoom } from "@/lib/hotel";
import { getSite } from "@/lib/site";
import { parseStay, fmtStay, nightsBetween } from "@/lib/stay";
import { Gallery } from "@/components/Gallery";
import { RoomBooking } from "@/components/RoomBooking";

type P = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const room = await getRoom((await params).id).catch(() => null);
  return { title: room?.name || "Room", description: room?.description || undefined };
}

export default async function RoomPage({ params, searchParams }: P) {
  const { id } = await params;
  const stay = parseStay(await searchParams);
  const room = await getRoom(id).catch((e) => { if (e instanceof ApiError && e.status === 404) notFound(); throw e; });
  const [merchant, quote] = await Promise.all([getSite(), getQuote(id, stay).catch(() => null)]);
  const policies = Object.entries(merchant.policies);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 pb-32 md:px-8 lg:pb-12">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500"><Link href="/rooms" className="hover:text-brand">Rooms</Link> › <span className="text-slate-900">{room.name}</span></nav>
      {room.images.length > 0 && <Gallery images={room.images} alt={room.name} variant="hero" />}
      <RoomBooking room={room} stay={stay} nights={nightsBetween(stay.checkIn, stay.checkOut)} stayLabel={fmtStay(stay)} quote={quote}
        before={<>
          <header>
            <h1 className="text-2xl font-bold md:text-3xl">{room.name}</h1>
            {room.summary && <p className="mt-1 text-slate-500">{room.summary}</p>}
            {room.description && <p className="mt-3 text-slate-700">{room.description}</p>}
          </header>
          {room.amenities.length > 0 && <section aria-labelledby="am">
            <h2 id="am" className="mb-3 text-lg font-bold">Room amenities</h2>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">{room.amenities.map((a) => <li key={a} className="flex items-center gap-2 text-sm"><span className="text-brand" aria-hidden>✓</span>{a}</li>)}</ul>
          </section>}
        </>}
        after={policies.length > 0 &&
          <section aria-labelledby="pol">
            <h2 id="pol" className="mb-3 text-lg font-bold">Policies</h2>
            <dl className="card divide-y">{policies.map(([k, v]) => <div key={k} className="grid gap-1 p-4 sm:grid-cols-[180px_1fr]"><dt className="font-semibold capitalize">{k.replace(/[-_]/g, " ")}</dt><dd className="line-clamp-4 whitespace-pre-line text-sm text-slate-600">{v.replace(/<[^>]+>/g, "")}</dd></div>)}</dl>
          </section>
        }
      />
    </div>
  );
}
