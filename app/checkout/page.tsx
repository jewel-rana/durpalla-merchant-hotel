import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { parseStay } from "@/lib/stay";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const stay = parseStay(sp);
  const room = await api.getRoom(String(sp.room ?? "deluxe-sea-view"));
  if (!room) notFound();
  return <CheckoutForm room={room} stay={stay} planId={String(sp.plan ?? "bb")} />;
}
