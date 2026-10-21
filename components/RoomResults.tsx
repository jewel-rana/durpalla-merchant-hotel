"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { RoomType, SearchParams } from "@/lib/types";
import { taka } from "@/lib/merchant";
import { stayQuery } from "@/lib/stay";


export function RoomResults({ rooms, stay, nights }: { rooms: RoomType[]; stay: SearchParams; nights: number }) {
  const beds = useMemo(() => [...new Set(rooms.map((r) => r.bed).filter(Boolean))], [rooms]);
  const views = useMemo(() => [...new Set(rooms.map((r) => r.category).filter(Boolean))], [rooms]);
  const amenityList = useMemo(() => [...new Set(rooms.flatMap((r) => r.amenities))].slice(0, 8), [rooms]);
  const cap = useMemo(() => Math.max(1000, Math.ceil(Math.max(0, ...rooms.map((r) => r.ratePlans[0].price || r.basePrice)) / 500) * 500), [rooms]);
  const [bed, setBed] = useState<string[]>([]);
  const [view, setView] = useState<string[]>([]);
  const [am, setAm] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(Number.POSITIVE_INFINITY);
  const [sort, setSort] = useState("recommended");
  const [sheet, setSheet] = useState(false);
  const toggle = (a: string[], set: (v: string[]) => void, v: string) => set(a.includes(v) ? a.filter((x) => x !== v) : [...a, v]);

  const list = useMemo(() => {
    const r = rooms.filter((x) => (!bed.length || bed.includes(x.bed)) && (!view.length || view.includes(x.category)) && am.every((a) => x.amenities.includes(a)) && (x.ratePlans[0].price || x.basePrice) <= maxPrice);
    return [...r].sort((a, b) => (sort === "low" ? a.basePrice - b.basePrice : sort === "high" ? b.basePrice - a.basePrice : 0));
  }, [rooms, bed, view, am, maxPrice, sort]);

  const group = (title: string, opts: string[], sel: string[], set: (v: string[]) => void) => (
    <fieldset>
      <legend className="mb-2 text-sm font-bold">{title}</legend>
      {opts.map((o) => <label key={o} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" className="accent-[var(--brand)]" checked={sel.includes(o)} onChange={() => toggle(sel, set, o)} />{o}</label>)}
    </fieldset>
  );
  const filters = (
    <div className="space-y-6">
      <div>
        <label htmlFor="price" className="mb-2 block text-sm font-bold">Max price / night: {taka(Math.min(maxPrice, cap))}</label>
        <input id="price" type="range" min={0} max={cap} step={500} value={Math.min(maxPrice, cap)} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[var(--brand)]" />
      </div>
      {beds.length > 1 && group("Bed type", beds, bed, setBed)}
      {views.length > 1 && group("Category", views, view, setView)}
      {amenityList.length > 0 && group("Amenities", amenityList, am, setAm)}
      <button type="button" className="text-sm font-semibold text-brand underline" onClick={() => { setBed([]); setView([]); setAm([]); setMaxPrice(Number.POSITIVE_INFINITY); }}>Reset filters</button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="card hidden h-fit p-5 lg:block" aria-label="Filters"><h2 className="mb-4 font-bold">Filters</h2>{filters}</aside>
      <section aria-label="Available rooms" className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600"><b className="text-slate-900">{list.length}</b> room types available · {nights} night{nights > 1 ? "s" : ""}</p>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-outline !py-1.5 text-sm lg:hidden" onClick={() => setSheet(true)}>Filters</button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" className="field !w-auto !py-1.5" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
        <ul className="space-y-4">
          {list.map((r, i) => {
            const from = r.ratePlans[0].price || r.basePrice;
            return (
              <li key={r.id} className="card grid overflow-hidden md:grid-cols-[280px_1fr]">
                <div className="relative h-52 md:h-full"><Image src={r.images[0] ?? ["/img/room1.jpg", "/img/suite.jpg", "/img/room3.jpg"][i % 3]} alt={r.name} fill sizes="(min-width:768px) 280px, 100vw" className="object-cover" /></div>
                <div className="flex flex-col gap-3 p-4 md:flex-row md:p-5">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{r.name}</h3>
                    {r.summary && <p className="text-sm text-slate-500">{r.summary}</p>}
                    {r.available != null && <p className="mt-1 text-xs font-semibold text-brand">{r.available <= 3 ? <span className="text-red-600">Only {r.available} left</span> : `${r.available} available`}</p>}
                    <ul className="mt-3 flex flex-wrap gap-1.5">{r.amenities.slice(0, 5).map((a) => <li key={a} className="rounded-md bg-brand-light px-2 py-0.5 text-xs text-brand">{a}</li>)}</ul>
                  </div>
                  <div className="flex items-end justify-between gap-3 border-t pt-3 md:w-44 md:flex-col md:border-0 md:pt-0">
                    <div className="md:text-right">
                      <p className="text-xs text-slate-500">from</p>
                      <p className="text-xl font-extrabold text-accent-dark">{taka(from)}</p>
                      <p className="text-xs text-slate-500">/ night · {taka(from * nights * stay.rooms)} total</p>
                    </div>
                    <Link href={`/rooms/${r.id}?${stayQuery(stay)}`} className="btn-accent !py-2 text-sm">View rates</Link>
                  </div>
                </div>
              </li>
            );
          })}
          {!list.length && <li className="card p-10 text-center text-slate-500">No rooms match these filters.</li>}
        </ul>
      </section>
      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button className="absolute inset-0 bg-slate-900/50" aria-label="Close filters" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-4 flex justify-between"><h2 className="font-bold">Filters</h2><button onClick={() => setSheet(false)} aria-label="Close">✕</button></div>
            {filters}
            <button className="btn-accent mt-6 w-full" onClick={() => setSheet(false)}>Show {list.length} rooms</button>
          </div>
        </div>
      )}
    </div>
  );
}
