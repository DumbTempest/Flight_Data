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

    const aircraftIcon = useMemo(() => {
        const heading = aircraft.track ?? 0;
        const rotation = heading - 90;

        return L.divIcon({
            html: `
            <div style="
                font-size: 26px;
                transform: rotate(${rotation}deg);
                transform-origin: center;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                ✈
            </div>
        `,
            className: "",
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });
    }, [aircraft.track]);

    const airportIcon = new L.Icon({
        iconUrl:
            "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
    });

    const aircraftPosition: [number, number] = [
        aircraft.lat,
        aircraft.lon,
    ];

    const originPosition: [number, number] = [
        origin.latitude,
        origin.longitude,
    ];

    const destinationPosition: [number, number] = [
        destination.latitude,
        destination.longitude,
    ];

    return (
        <div className="mt-8 rounded-xl overflow-hidden border border-zinc-800">
            <MapContainer
                center={aircraftPosition}
                zoom={6}
                scrollWheelZoom={true}
                style={{ height: "500px", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <FeatureGroup>

                    {/* Origin → Aircraft */}
                    <Polyline
                        positions={[originPosition, aircraftPosition]}
                        pathOptions={{
                            color: "#00ffff",
                            weight: 6,
                            opacity: 0.25,
                        }}
                    />
                    <Polyline
                        positions={[originPosition, aircraftPosition]}
                        pathOptions={{
                            color: "#00ffff",
                            weight: 2,
                            opacity: 1,
                        }}
                    />

                    {/* Aircraft → Destination */}
                    <Polyline
                        positions={[aircraftPosition, destinationPosition]}
                        pathOptions={{
                            color: "#ff00ff",
                            weight: 6,
                            opacity: 0.25,
                        }}
                    />
                    <Polyline
                        positions={[aircraftPosition, destinationPosition]}
                        pathOptions={{
                            color: "#ff00ff",
                            weight: 2,
                            opacity: 1,
                        }}
                    />

                    {/* Aircraft Marker */}
                    <Marker position={aircraftPosition} icon={aircraftIcon}>
                        <Popup>Live Aircraft</Popup>
                    </Marker>

                    {/* Origin */}
                    <Marker position={originPosition} icon={airportIcon}>
                        <Popup>{origin.name}</Popup>
                    </Marker>

                    {/* Destination */}
                    <Marker position={destinationPosition} icon={airportIcon}>
                        <Popup>{destination.name}</Popup>
                    </Marker>

                </FeatureGroup>
            </MapContainer>
        </div>
    );
}
