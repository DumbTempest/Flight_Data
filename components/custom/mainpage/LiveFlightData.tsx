"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const FlightMap = dynamic(
    () => import("./FlightMap"),
    { ssr: false }
);


interface LiveAircraft {
    hex: string;
    flight: string;
    r: string;
    t: string;
    desc: string;
    alt_baro: number;
    gs: number;
    track: number;
    baro_rate: number;
    squawk: string;
    lat: number;
    lon: number;
}

interface LiveProps {
    callsign: string;
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

export default function LiveFlightData({
    callsign,
    origin,
    destination,
}: LiveProps) {
    const [aircraft, setAircraft] = useState<LiveAircraft | null>(null);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(15);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        if (!callsign) return;

        const fetchLive = async () => {
            try {
                const res = await fetch(
                    `https://api.airplanes.live/v2/callsign/${callsign.toUpperCase()}`
                );

                const data = await res.json();

                if (!data?.ac || data.ac.length === 0) {
                    setAircraft(null);
                } else {
                    setAircraft(data.ac[0]);
                }

                setLastUpdated(new Date());
                setCountdown(15);
                setError("");
            } catch {
                setError("Unable to fetch live data");
            }
        };

        fetchLive();

        const refreshInterval: NodeJS.Timeout = setInterval(fetchLive, 15000);

        const countdownInterval: NodeJS.Timeout = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(refreshInterval);
            clearInterval(countdownInterval);
        };
    }, [callsign]);

    if (!callsign) return null;

    return (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-yellow-400">
                    Live Aircraft Data
                </h2>

                <div className="text-xs text-zinc-400 text-right">
                    <p>Refreshing in: {countdown}s</p>
                    {lastUpdated && (
                        <p>
                            Last updated:{" "}
                            {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
            </div>

            {error && <p className="text-red-400">{error}</p>}

            {!aircraft && !error && (
                <p className="text-zinc-400">Aircraft not airborne</p>
            )}

            {aircraft && (
                <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
                    <p><strong>Registration:</strong> {aircraft.r}</p>
                    <p><strong>Aircraft:</strong> {aircraft.desc}</p>
                    <p><strong>Altitude:</strong> {aircraft.alt_baro} ft</p>
                    <p><strong>Speed:</strong> {aircraft.gs} knots</p>
                    <p><strong>Heading:</strong> {aircraft.track}°</p>
                    <p><strong>Climb Rate:</strong> {aircraft.baro_rate} ft/min</p>
                    <p><strong>Squawk:</strong> {aircraft.squawk}</p>
                    <p><strong>Latitude:</strong> {aircraft.lat}</p>
                    <p><strong>Longitude:</strong> {aircraft.lon}</p>
                </div>
            )}
            {aircraft && (
                <FlightMap
                    aircraft={aircraft}
                    origin={origin}
                    destination={destination}
                />
            )}
        </div>
    );
}
