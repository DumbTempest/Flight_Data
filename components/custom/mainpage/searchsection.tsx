

import LiveFlightData from "./LiveFlightData"

export default function SearchSection({
  callsign,
  setCallsign,
  fetchFlight,
  loading,
  route,
  setAircraft,
}: any) {
  return (
    <>
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Enter Callsign"
          value={callsign}
          onChange={(e) => setCallsign(e.target.value)}
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 flex-1 text-white"
        />
        <button
          onClick={fetchFlight}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-zinc-400 mb-4">Loading...</p>}

      {route && (
        <>
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-6">
            <h2 className="text-yellow-400 font-semibold mb-2">
              Airline
            </h2>
            <p className="text-white">{route.airline.name}</p>
            <p className="text-sm text-zinc-400">
              {route.airline.country}
            </p>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-6">
            <h2 className="text-green-400 font-semibold mb-2">
              Route
            </h2>
            <p className="text-white">
              {route.origin.iata_code} → {route.destination.iata_code}
            </p>
            <p className="text-sm text-zinc-400">
              {route.origin.municipality} → {route.destination.municipality}
            </p>
          </div>

          <LiveFlightData
            callsign={callsign}
            icao={route.callsign}
            onAircraftUpdate={setAircraft}
          />
        </>
      )}
    </>
  );
}
