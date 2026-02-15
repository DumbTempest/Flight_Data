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
    };
    origin: {
        latitude: number;
        longitude: number;
        name: string;
    };
    destination: {
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
    const aircraftIcon = useMemo(
        () =>
            L.divIcon({
                html: `<div style="transform: rotate(${aircraft.track}deg); font-size: 26px;">✈</div>`,
                className: "",
                iconSize: [30, 30],
            }),
        [aircraft.track]
    );

    const airportIcon = new L.Icon({
        iconUrl:
            "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    const routeLine: [number, number][] = [
        [origin.latitude, origin.longitude],
        [destination.latitude, destination.longitude],
    ];

    const center: [number, number] = [
        aircraft.lat,
        aircraft.lon,
    ];

    return (
        <div className="mt-8 rounded-xl overflow-hidden border border-zinc-800">
            <MapContainer
                center={center}
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: "500px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <FeatureGroup>
                    {/* Aircraft */}
                    <Marker position={center} icon={aircraftIcon}>
                        <Popup>Live Aircraft</Popup>
                    </Marker>

                    {/* Origin */}
                    <Marker
                        position={[origin.latitude, origin.longitude]}
                        icon={airportIcon}
                    >
                        <Popup>{origin.name}</Popup>
                    </Marker>

                    {/* Destination */}
                    <Marker
                        position={[destination.latitude, destination.longitude]}
                        icon={airportIcon}
                    >
                        <Popup>{destination.name}</Popup>
                    </Marker>

                    {/* Route */}
                    <Polyline
                        positions={routeLine}
                        pathOptions={{
                            color: "red",
                            weight: 3,
                            opacity: 0.9,
                        }}
                    />

                </FeatureGroup>
            </MapContainer>
        </div>
    );
}
