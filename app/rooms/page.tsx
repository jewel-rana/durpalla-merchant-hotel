import type { Metadata } from "next";
import { api } from "@/lib/api";
import { parseStay, fmtStay } from "@/lib/stay";
import { nightsBetween } from "@/lib/mock";
import { BookingForm } from "@/components/BookingForm";
import { RoomResults } from "@/components/RoomResults";

export const metadata: Metadata = { title: "Rooms & rates" };

export default async function RoomsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const stay = parseStay(await searchParams);
  const rooms = await api.searchRooms(stay);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <details className="card mb-5 p-4 md:p-5" open>
        <summary className="cursor-pointer list-none font-semibold text-brand">{fmtStay(stay)} <span className="text-sm text-accent-dark">(modify)</span></summary>
        <div className="mt-4"><BookingForm compact initial={stay} /></div>
      </details>
      <RoomResults rooms={rooms} stay={stay} nights={nightsBetween(stay.checkIn, stay.checkOut)} />
    </div>
  );
}
