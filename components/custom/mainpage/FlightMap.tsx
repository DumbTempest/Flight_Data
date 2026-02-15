"use client";

import {
  FeatureGroup,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Popup,
} from "react-leaflet";
import { useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


interface Props {
  aircraft: {
    lat: number;
    lon: number;
    track: number;
  } | null;
  origin?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  destination?: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

export default function FlightMap({
  aircraft,
  origin,
  destination,
}: Props) {
  const aircraftIcon = useMemo(() => {
    if (!aircraft) return null;

    const rotation = (aircraft.track ?? 0) - 90;

    return L.divIcon({
      html: `
        <div style="
          font-size: 26px;
          transform: rotate(${rotation}deg);
          transform-origin: center;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#111;
        ">
          ✈
        </div>
      `,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  }, [aircraft]);

  const airportIcon = new L.Icon({
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const aircraftPosition =
    aircraft?.lat && aircraft?.lon
      ? ([aircraft.lat, aircraft.lon] as [number, number])
      : ([20.5937, 78.9629] as [number, number]); // India center

  return (
    <div className="h-full w-full">
      <MapContainer
        center={aircraftPosition}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        {/* 🔥 MapTiler Streets */}
        <TileLayer
          attribution='© MapTiler © OpenStreetMap contributors'
          url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
        />

        <FeatureGroup>
          {origin && destination && aircraft && (
            <>
              <Polyline
                positions={[
                  [origin.latitude, origin.longitude],
                  [aircraft.lat, aircraft.lon],
                ]}
                pathOptions={{
                  color: "#0077ff",
                  weight: 3,
                  dashArray: "4 6",
                  lineCap: "round",
                }}
              />

              <Polyline
                positions={[
                  [aircraft.lat, aircraft.lon],
                  [destination.latitude, destination.longitude],
                ]}
                pathOptions={{
                  color: "#ff0055",
                  weight: 3,
                  dashArray: "4 6",
                  lineCap: "round",
                }}
              />
            </>
          )}

          {aircraft && aircraftIcon && (
            <Marker position={aircraftPosition} icon={aircraftIcon}>
              <Popup>Live Aircraft</Popup>
            </Marker>
          )}

          {origin && (
            <Marker
              position={[origin.latitude, origin.longitude]}
              icon={airportIcon}
            >
              <Popup>{origin.name}</Popup>
            </Marker>
          )}

          {destination && (
            <Marker
              position={[destination.latitude, destination.longitude]}
              icon={airportIcon}
            >
              <Popup>{destination.name}</Popup>
            </Marker>
          )}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}
