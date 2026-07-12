"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface Pin {
  id: string;
  latitude: number;
  longitude: number;
  price: number;
  title: string;
  city: string;
  property_type: string;
}

function PricePin({ pin, currency }: { pin: Pin; currency: string }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div class="map-pin">${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
          notation: "compact",
        }).format(pin.price)}</div>`,
        iconSize: [60, 28],
        iconAnchor: [30, 14],
      }),
    [pin, currency],
  );

  return (
    <Marker position={[pin.latitude, pin.longitude]} icon={icon}>
      <Popup>
        <strong>{pin.title}</strong>
        <br />
        {pin.city} · {pin.property_type}
      </Popup>
    </Marker>
  );
}

/** Recenters map when the bounding box (filters) change. */
function MapBounds({
  bounds,
}: {
  bounds?: { n: number; s: number; e: number; w: number };
}) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds([
      [bounds.s, bounds.w],
      [bounds.n, bounds.e],
    ]);
  }, [bounds, map]);
  return null;
}

export default function ListingsMap({
  pins,
  currency = "USD",
  center = [39.5, -98.35],
  zoom = 4,
}: {
  pins: Pin[];
  currency?: string;
  center?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin) => (
        <PricePin key={pin.id} pin={pin} currency={currency} />
      ))}
    </MapContainer>
  );
}
