"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import SearchSection from "./searchsection";
import Image from "next/image";

const FlightMap = dynamic(() => import("./FlightMap"), {
  ssr: false,
});

interface Airport {
  name: string;
  municipality: string;
  iata_code: string;
  icao_code: string;
  latitude: number;
  longitude: number;
}

interface FlightRoute {
  callsign: string;
  airline: {
    name: string;
    country: string;
  };
  origin: Airport;
  destination: Airport;
}

export default function Mainpage() {
  const [callsign, setCallsign] = useState("");
  const [route, setRoute] = useState<FlightRoute | null>(null);
  const [aircraft, setAircraft] = useState<{ lat: number; lon: number; track: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // bottom sheet ht mobile
  const [sheetHeight, setSheetHeight] = useState(75);
  const startY = useRef<number | null>(null);


  useEffect(() => {
    const saved = localStorage.getItem("flightHistory");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;

    const diff = startY.current - e.touches[0].clientY;
    const newHeight = Math.min(100, Math.max(30, sheetHeight + diff / 5));

    setSheetHeight(newHeight);
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (sheetHeight > 85) setSheetHeight(100);
    else if (sheetHeight > 50) setSheetHeight(75);
    else setSheetHeight(30);

    startY.current = null;
  };

  async function fetchFlight() {
    if (!callsign.trim()) return;

    setLoading(true);
    setRoute(null);

    const upper = callsign.toUpperCase();

    const res = await fetch(
      `https://api.adsbdb.com/v0/callsign/${upper}`
    );

    const data = await res.json();

    if (data?.response?.flightroute) {
      setRoute(data.response.flightroute);

      const updated = [
        upper,
        ...history.filter((c) => c !== upper),
      ].slice(0, 5);

      setHistory(updated);
      localStorage.setItem("flightHistory", JSON.stringify(updated));
    }

    setLoading(false);
  }

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("flightHistory");
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">


      <div className="absolute inset-0 z-0">
        <FlightMap
          aircraft={aircraft}
          origin={route?.origin}
          destination={route?.destination}
        />
      </div>


      <div className="hidden lg:block absolute right-0 top-0 h-full w-[420px] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">
          <Image 
            src="/logo.png"
            alt="Plane Icon"
            width={32}
          /> Flight Tracker
        </h1>

 
        {history.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm text-zinc-400 mb-2">
              Recent Searches
            </h3>

            <div className="flex flex-wrap gap-2 mb-2">
              {history.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setCallsign(item);
                    fetchFlight();
                  }}
                  className="px-3 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700"
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              onClick={clearHistory}
              className="text-xs text-red-400"
            >
              Clear history
            </button>
          </div>
        )}

        <SearchSection
          callsign={callsign}
          setCallsign={setCallsign}
          fetchFlight={fetchFlight}
          loading={loading}
          route={route}
          setAircraft={setAircraft}
        />
      </div>

      {/* mobile sheet */}
      <div
        className="lg:hidden absolute bottom-0 left-0 w-full bg-zinc-950/95 backdrop-blur-xl rounded-t-3xl border-t border-zinc-800 hide-scrollbar overflow-y-auto"
        style={{ height: `${sheetHeight}%` }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-14 h-1.5 bg-zinc-600 rounded-full" />
        </div>

        <div className="px-6 pb-10">
          <h1 className="text-2xl font-bold mb-6 text-white">
            <Image 
              src="/logo.png"
              alt="Plane Icon"
              width={32}
            /> Flight Tracker
          </h1>

          {history.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm text-zinc-400 mb-2">
                Recent Searches
              </h3>

              <div className="flex flex-wrap gap-2 mb-2">
                {history.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setCallsign(item);
                      fetchFlight();
                    }}
                    className="px-3 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded-lg"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <button
                onClick={clearHistory}
                className="text-xs text-red-400"
              >
                Clear history
              </button>
            </div>
          )}

          <SearchSection
            callsign={callsign}
            setCallsign={setCallsign}
            fetchFlight={fetchFlight}
            loading={loading}
            route={route}
            setAircraft={setAircraft}
          />
        </div>
      </div>
    </div>
  );
}
