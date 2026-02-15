"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const FlightMap = dynamic(
    () => import("./FlightMap"),
    { ssr: false }
);

// https://opendata.adsb.fi/api/v2/callsign/IGO733M


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
    icao: string;
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

interface OpenSkyAircraft {
    icao24: string;
    callsign: string;
    lat: number;
    lon: number;
    altitude: number; // feet
    velocity: number; // knots
    track: number;
    verticalRate: number; // ft/min
}

interface ADSBFiAircraft {
    hex: string;
    flight: string;
    alt_baro: number;
    gs: number;
    track: number;
    baro_rate: number;
    lat: number;
    lon: number;
}


export default function LiveFlightData({
    callsign,
    icao,
    origin,
    destination,
}: LiveProps) {
    const [aircraft, setAircraft] = useState<LiveAircraft | null>(null);
    const [error, setError] = useState("");
    const [countdown, setCountdown] = useState(15);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [openSky, setOpenSky] = useState<OpenSkyAircraft | null>(null);
    const [adsbFi, setAdsbFi] = useState<ADSBFiAircraft | null>(null);

    useEffect(() => {
        if (!callsign) return;

        const fetchAirplanes = async () => {
            try {
                const res = await fetch(
                    `https://api.airplanes.live/v2/callsign/${callsign.toUpperCase()}`
                );
                const data = await res.json();

                if (!data?.ac || data.ac.length === 0) {
                    setAircraft(null);
                    return;
                }

                setAircraft(data.ac[0]);
            } catch {
                setAircraft(null);
            }
        };

        const fetchOpenSky = async () => {
            try {
                if (!icao) return;

                const res = await fetch(
                    `https://opensky-network.org/api/states/all?icao24=${icao.toLowerCase()}`
                );

                const data = await res.json();

                if (!data?.states || data.states.length === 0) {
                    setOpenSky(null);
                    return;
                }

                const state = data.states[0];

                setOpenSky({
                    icao24: state[0],
                    callsign: state[1]?.trim(),
                    lon: state[5],
                    lat: state[6],
                    altitude: state[7] ? state[7] * 3.28084 : 0,
                    velocity: state[9] ? state[9] * 1.94384 : 0,
                    track: state[10],
                    verticalRate: state[11] ? state[11] * 196.85 : 0,
                });
            } catch {
                setOpenSky(null);
            }
        };

        const fetchADSBFi = async () => {
            try {
                const res = await fetch(`/api/adsdbfi?callsign=${callsign}`);

                const data = await res.json();
                console.log(data)

                if (!data?.ac || data.ac.length === 0) {
                    setAdsbFi(null);
                    return;
                }

                const ac = data.ac[0];

                setAdsbFi({
                    hex: ac.hex,
                    flight: ac.flight,
                    alt_baro: ac.alt_baro,
                    gs: ac.gs,
                    track: ac.track,
                    baro_rate: ac.baro_rate,
                    lat: ac.lat,
                    lon: ac.lon,
                });
            } catch {
                setAdsbFi(null);
            }
        };

        const fetchAll = async () => {
            await Promise.allSettled([
                fetchAirplanes(),
                fetchOpenSky(),
                fetchADSBFi(),
            ]);

            setLastUpdated(new Date());
            setCountdown(15);
            setError("");
        };

        fetchAll();

        const refreshInterval = setInterval(fetchAll, 15000);
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(refreshInterval);
            clearInterval(countdownInterval);
        };
    }, [callsign, icao]);

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

            <div className="grid md:grid-cols-3 gap-8 mt-6">

                {/* Airplanes.live */}
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-red-400 font-semibold mb-3">
                        Airplanes.live
                    </h3>

                    {aircraft ? (
                        <>
                            <p><strong>Hex:</strong> {aircraft.hex}</p>
                            <p><strong>Altitude:</strong> {aircraft.alt_baro} ft</p>
                            <p><strong>Speed:</strong> {aircraft.gs} knots</p>
                            <p><strong>Heading:</strong> {aircraft.track}°</p>
                            <p><strong>Vertical Rate:</strong> {aircraft.baro_rate} ft/min</p>
                            <p><strong>Lat:</strong> {aircraft.lat}</p>
                            <p><strong>Lon:</strong> {aircraft.lon}</p>
                        </>
                    ) : (
                        <p className="text-zinc-400">No airplanes.live match</p>
                    )}
                </div>

                {/* OpenSky */}
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-green-400 font-semibold mb-3">
                        OpenSky
                    </h3>

                    {openSky ? (
                        <>
                            <p><strong>Hex:</strong> {openSky.icao24}</p>
                            <p><strong>Altitude:</strong> {openSky.altitude.toFixed(0)} ft</p>
                            <p><strong>Speed:</strong> {openSky.velocity.toFixed(0)} knots</p>
                            <p><strong>Heading:</strong> {openSky.track}°</p>
                            <p><strong>Vertical Rate:</strong> {openSky.verticalRate.toFixed(0)} ft/min</p>
                            <p><strong>Lat:</strong> {openSky.lat}</p>
                            <p><strong>Lon:</strong> {openSky.lon}</p>
                        </>
                    ) : (
                        <p className="text-zinc-400">No OpenSky match</p>
                    )}
                </div>

                {/* ADSB.lol */}
                <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-blue-400 font-semibold mb-3">
                        ADSB.lol
                    </h3>

                    {adsbFi ? (
                        <>
                            <p><strong>Hex:</strong> {adsbFi.hex}</p>
                            <p><strong>Altitude:</strong> {adsbFi.alt_baro} ft</p>
                            <p><strong>Speed:</strong> {adsbFi.gs} knots</p>
                            <p><strong>Heading:</strong> {adsbFi.track}°</p>
                            <p><strong>Vertical Rate:</strong> {adsbFi.baro_rate} ft/min</p>
                            <p><strong>Lat:</strong> {adsbFi.lat}</p>
                            <p><strong>Lon:</strong> {adsbFi.lon}</p>
                        </>
                    ) : (
                        <p className="text-zinc-400">No ADSB.lol match</p>
                    )}
                </div>
            </div>
            {adsbFi && (
                <FlightMap
                    aircraft={adsbFi}
                    origin={origin}
                    destination={destination}
                />
            )}
        </div>
    );
}
