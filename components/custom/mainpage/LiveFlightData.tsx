
import { useEffect, useState } from "react";


interface LiveProps {
  callsign: string;
  icao: string;
  onAircraftUpdate: (aircraft: {
    lat: number;
    lon: number;
    track: number;
  } | null) => void;
}

interface AircraftData {
  hex: string;
  altitude: number;
  speed: number;
  verticalRate: number;
  track: number;
  lat: number;
  lon: number;
}

export default function LiveFlightData({
  callsign,
  icao,
  onAircraftUpdate,
}: LiveProps) {

  const [airplanes, setAirplanes] = useState<AircraftData | null>(null);
  const [openSky, setOpenSky] = useState<AircraftData | null>(null);
  const [adsbFi, setAdsbFi] = useState<AircraftData | null>(null);
  const [best, setBest] = useState<AircraftData | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!callsign) return;

    const fetchLive = async () => {
      try {
        const res = await fetch(
          `/api/liveFlight?callsign=${callsign}&icao=${icao}`
        );

        const data = await res.json();

        if (data.airplanes) setAirplanes(data.airplanes);
        if (data.openSky) setOpenSky(data.openSky);
        if (data.adsb) setAdsbFi(data.adsb);

        if (data.best) {
          setBest(data.best);
          onAircraftUpdate(data.best); // keeps map updating
        }

        setCountdown(5);
      } catch (err) {
        console.error("Live fetch error");
      }
    };

    fetchLive();

    const refresh = setInterval(fetchLive, 5000);
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(refresh);
      clearInterval(timer);
    };
  }, [callsign, icao]);

  if (!callsign) return null;

  return (
    <div className="bg-zinc-900/90 backdrop-blur-md p-5 rounded-xl border border-zinc-800 space-y-5">

      <h3 className="text-yellow-400 font-semibold text-lg">
        Live Data
        <span className="text-sm text-zinc-400 ml-2">
          (refresh {countdown}s)
        </span>
      </h3>

      <div className="grid gap-5">

        {/* Airplanes.live */}
        <div className="bg-zinc-800/80 border border-zinc-700 p-4 rounded-lg space-y-2">
          <h4 className="text-red-400 font-semibold">
            Airplanes.live
          </h4>

          {airplanes ? (
            <div className="text-sm text-zinc-200 space-y-1">
              <p><span className="text-zinc-400">Altitude:</span> {airplanes.altitude} ft</p>
              <p><span className="text-zinc-400">Speed:</span> {airplanes.speed} knots</p>
              <p><span className="text-zinc-400">Heading:</span> {airplanes.track}°</p>
              <p><span className="text-zinc-400">Lat:</span> {airplanes.lat}</p>
              <p><span className="text-zinc-400">Lon:</span> {airplanes.lon}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No match</p>
          )}
        </div>

        {/* OpenSky */}
        <div className="bg-zinc-800/80 border border-zinc-700 p-4 rounded-lg space-y-2">
          <h4 className="text-green-400 font-semibold">
            OpenSky
          </h4>

          {openSky ? (
            <div className="text-sm text-zinc-200 space-y-1">
              <p><span className="text-zinc-400">Altitude:</span> {openSky.altitude?.toFixed(0)} ft</p>
              <p><span className="text-zinc-400">Speed:</span> {openSky.speed?.toFixed(0)} knots</p>
              <p><span className="text-zinc-400">Heading:</span> {openSky.track}°</p>
              <p><span className="text-zinc-400">Lat:</span> {openSky.lat}</p>
              <p><span className="text-zinc-400">Lon:</span> {openSky.lon}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No match</p>
          )}
        </div>

        {/* ADSB.fi */}
        <div className="bg-zinc-800/80 border border-zinc-700 p-4 rounded-lg space-y-2">
          <h4 className="text-blue-400 font-semibold">
            ADSB.fi
          </h4>

          {adsbFi ? (
            <div className="text-sm text-zinc-200 space-y-1">
              <p><span className="text-zinc-400">Altitude:</span> {adsbFi.altitude} ft</p>
              <p><span className="text-zinc-400">Speed:</span> {adsbFi.speed} knots</p>
              <p><span className="text-zinc-400">Heading:</span> {adsbFi.track}°</p>
              <p><span className="text-zinc-400">Lat:</span> {adsbFi.lat}</p>
              <p><span className="text-zinc-400">Lon:</span> {adsbFi.lon}</p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No match</p>
          )}
        </div>

      </div>
    </div>
  );
}
