"use client";

import dynamic from "next/dynamic";

const ListingsMap = dynamic(() => import("@/components/listings-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      Loading map…
    </div>
  ),
});

export default function MapLoader({
  pins,
  center,
  zoom,
}: {
  pins: never[];
  center: [number, number];
  zoom: number;
}) {
  return <ListingsMap pins={pins} center={center} zoom={zoom} />;
}
