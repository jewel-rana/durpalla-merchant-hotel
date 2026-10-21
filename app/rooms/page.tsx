import type { Metadata } from "next";
import { searchRooms } from "@/lib/hotel";
import { parseStay, fmtStay, nightsBetween } from "@/lib/stay";
import { BookingForm } from "@/components/BookingForm";
import { RoomResults } from "@/components/RoomResults";
import { StateMessage } from "@/components/StateMessage";

export const metadata: Metadata = { title: "Rooms & rates" };

/** GET hotel/availability (cached 60 s per tenant on the API, revalidated here every 60 s). */
export default async function RoomsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const stay = parseStay(await searchParams);
  const rooms = await searchRooms(stay);
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <details className="card mb-5 p-4 md:p-5" open>
        <summary className="cursor-pointer list-none font-semibold text-brand">{fmtStay(stay)} <span className="text-sm text-accent-dark">(modify)</span></summary>
        <div className="mt-4"><BookingForm compact initial={stay} /></div>
      </details>
      {rooms.length ? <RoomResults rooms={rooms} stay={stay} nights={nightsBetween(stay.checkIn, stay.checkOut)} />
        : <StateMessage title="No rooms available" body="Nothing is available for these dates and guests. Try different dates." />}
    </div>
  );
}
