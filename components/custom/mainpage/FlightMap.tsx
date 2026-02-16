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
  mapStyle: string; 
}

export default function FlightMap({
  aircraft,
  origin,
  destination,
  mapStyle, 
}: Props) {

  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  const mapStyles: Record<string, string> = {
    streets: `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    dark: `https://api.maptiler.com/maps/darkmatter/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
    satellite: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    hybrid: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_KEY}`,
    topo: `https://api.maptiler.com/maps/topo/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`,
  };

  const aircraftIcon = useMemo(() => {
    if (!aircraft) return null;

    const rotation = (aircraft.track ?? 0);

    return L.divIcon({
      html: `
        <div style="
          font-size: 26px;
          transform: rotate(${rotation}deg);
          transform-origin: center;
          display:flex;
          align-items:center;
          justify-content:center;
          color:#ffffff;
        ">
          ✈
        </div>
      `,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [10, 15],
    });
  }, [aircraft]);

  const airportIcon = new L.Icon({
    iconUrl:
      "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const aircraftPosition =
    aircraft?.lat && aircraft?.lon
      ? ([aircraft.lat, aircraft.lon] as [number, number])
      : ([20.5937, 78.9629] as [number, number]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={aircraftPosition}
        zoom={6}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          key={mapStyle}
          attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; OpenStreetMap contributors'
          url={mapStyles[mapStyle]}
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
                  color: "#00ffff",
                  weight: 3,
                  dashArray: "4 6",
                }}
              />
              <Polyline
                positions={[
                  [aircraft.lat, aircraft.lon],
                  [destination.latitude, destination.longitude],
                ]}
                pathOptions={{
                  color: "#ff00ff",
                  weight: 3,
                  dashArray: "4 6",
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
