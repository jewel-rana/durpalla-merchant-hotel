import type { Metadata } from "next";
import { requireMe } from "@/lib/account";
import { getQuote, getRoom } from "@/lib/hotel";
import { parseStay } from "@/lib/stay";
import { CheckoutForm } from "@/components/CheckoutForm";
import { StateMessage } from "@/components/StateMessage";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

/** Holds and bookings need a customer token, so log in first; the price shown is POST hotel/quote. */
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const stay = parseStay(sp);
  const roomId = String(sp.room ?? "");
  if (!roomId) return <StateMessage title="No room selected" body="Choose a room and rate first." action={{ href: "/rooms", label: "See rooms" }} />;
  const me = await requireMe(`/checkout?${new URLSearchParams(Object.entries(sp).map(([k, v]) => [k, String(Array.isArray(v) ? v[0] : v ?? "")]))}`);
  const planId = typeof sp.plan === "string" ? sp.plan : undefined;
  const [room, quote] = await Promise.all([getRoom(roomId), getQuote(roomId, stay, planId).catch(() => null)]);
  if (!quote) return <StateMessage tone="error" title="Room not available" body="This room cannot be booked for the selected dates." action={{ href: "/rooms", label: "See other rooms" }} />;
  return <CheckoutForm room={room} stay={stay} planId={quote?.ratePlanId ?? planId ?? room.ratePlans[0].id} quote={quote} phone={me.phone} />;
}
