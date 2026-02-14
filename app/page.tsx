"use client";

import { useState } from "react";

interface Airport {
  name: string;
  municipality: string;
  iata_code: string;
  icao_code: string;
  latitude: number;
  longitude: number;
  elevation: number;
}

interface FlightRoute {
  callsign: string;
  airline: {
    name: string;
    icao: string;
    iata: string;
    country: string;
  };
  origin: Airport;
  destination: Airport;
}

export default function Home() {
  const [callsign, setCallsign] = useState("");
  const [route, setRoute] = useState<FlightRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchFlight() {
    if (!callsign.trim()) return;

    try {
      setLoading(true);
      setError("");
      setRoute(null);

      const res = await fetch(
        `https://api.adsbdb.com/v0/callsign/${callsign.toUpperCase()}`
      );

      if (!res.ok) {
        throw new Error("Flight not found");
      }

      const data = await res.json();

      if (!data?.response?.flightroute) {
        throw new Error("No route data available");
      }

      setRoute(data.response.flightroute);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">
        ✈ Flight Route Tracker
      </h1>

      {/* Search Bar */}
      <div className="flex gap-4 mb-10">
        <input
          type="text"
          placeholder="Enter Callsign (e.g. AIC2609)"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none w-72"
        />
        <button
          onClick={fetchFlight}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-zinc-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {route && (
        <div className="space-y-8">

          {/* Airline Card */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-semibold mb-4">Airline</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-300">
              <p><strong>Name:</strong> {route.airline.name}</p>
              <p><strong>ICAO:</strong> {route.airline.icao}</p>
              <p><strong>IATA:</strong> {route.airline.iata}</p>
              <p><strong>Country:</strong> {route.airline.country}</p>
            </div>
          </div>

          {/* Route */}
          <div className="grid md:grid-cols-2 gap-8">

            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h2 className="text-lg font-semibold mb-4 text-green-400">
                Origin
              </h2>
              <p>{route.origin.name}</p>
              <p>{route.origin.municipality}</p>
              <p>IATA: {route.origin.iata_code}</p>
              <p>ICAO: {route.origin.icao_code}</p>
              <p>Lat: {route.origin.latitude}</p>
              <p>Lon: {route.origin.longitude}</p>
            </div>

            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h2 className="text-lg font-semibold mb-4 text-blue-400">
                Destination
              </h2>
              <p>{route.destination.name}</p>
              <p>{route.destination.municipality}</p>
              <p>IATA: {route.destination.iata_code}</p>
              <p>ICAO: {route.destination.icao_code}</p>
              <p>Lat: {route.destination.latitude}</p>
              <p>Lon: {route.destination.longitude}</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
