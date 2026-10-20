"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export function Gallery({ images, alt = "Resort photo", variant = "grid" }: { images: string[]; alt?: string; variant?: "grid" | "hero" }) {
  const [i, setI] = useState<number | null>(null);
  const next = useCallback((d: number) => setI((v) => (v === null ? v : (v + d + images.length) % images.length)), [images.length]);
  useEffect(() => {
    if (i === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setI(null); if (e.key === "ArrowRight") next(1); if (e.key === "ArrowLeft") next(-1); };
    document.addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [i, next]);

  return (
    <>
      {variant === "grid" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.slice(0, 5).map((src, k) => (
            <button key={src + k} type="button" onClick={() => setI(k)} aria-label={`Open photo ${k + 1}`} className={`group relative overflow-hidden rounded-2xl ${k === 0 ? "col-span-2 h-56 md:row-span-2 md:h-auto" : "h-32 md:h-44"}`}>
              <Image src={src} alt={`${alt} ${k + 1}`} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover transition group-hover:scale-105" />
              {k === 4 && images.length > 5 && <span className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-bold text-white">+{images.length - 5} photos</span>}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid h-64 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:h-[420px]">
          {images.slice(0, 3).map((src, k) => (
            <button key={src + k} type="button" onClick={() => setI(k)} aria-label={`Open photo ${k + 1}`} className={`relative ${k === 0 ? "col-span-4 row-span-2 md:col-span-3" : "hidden md:block"}`}>
              <Image src={src} alt={`${alt} ${k + 1}`} fill priority={k === 0} sizes="(min-width:768px) 75vw, 100vw" className="object-cover" />
              {k === 0 && <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1 text-xs font-semibold text-white">📷 {images.length} photos</span>}
            </button>
          ))}
        </div>
      )}
      {i !== null && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <button className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white" aria-label="Close" onClick={() => setI(null)}>✕</button>
          <button className="absolute left-2 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl text-white md:left-6" aria-label="Previous photo" onClick={() => next(-1)}>‹</button>
          <div className="relative h-[70vh] w-full max-w-5xl">
            <Image src={images[i]} alt={`${alt} ${i + 1}`} fill sizes="100vw" className="object-contain" />
          </div>
          <button className="absolute right-2 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl text-white md:right-6" aria-label="Next photo" onClick={() => next(1)}>›</button>
          <p className="absolute bottom-4 text-sm text-white/80">{i + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
