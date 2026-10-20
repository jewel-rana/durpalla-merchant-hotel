import type { Metadata } from "next";
import { Confirmation } from "@/components/Confirmation";

export const metadata: Metadata = { title: "Stay confirmed" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Confirmation id={id} />;
}
