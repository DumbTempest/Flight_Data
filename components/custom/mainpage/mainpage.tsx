"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import SearchSection from "./searchsection";
import Image from "next/image";
import MapButton from "./mapbutton";

export const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://flight-tracker-api.uni-cc.site";

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
  const [aircraft, setAircraft] = useState<{
    lat: number;
    lon: number;
    track: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const [user, setUser] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [LoginData, setLoginData] = useState({ email: "", password: "" });
  const [RegisterData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [mapStyle, setMapStyle] = useState("streets");

  // bottom sheet ht mobile
  const [sheetHeight, setSheetHeight] = useState(75);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("flightHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }

    verifyUser();
  }, []);

  async function verifyUser() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.data);
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    }
  }

  async function handleLogin() {
    try {
      setAuthLoading(true);
      setAuthError("");

      const res = await fetch(`${API_BASE}/api/auth/loginUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(LoginData),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (data.data?.accessToken) {
        localStorage.setItem("token", data.data.accessToken);
      }

      if (data.data?.user) {
        setUser(data.data.user);
      }

      setShowLogin(false);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRegister() {
    try {
      setAuthLoading(true);
      setAuthError("");

      const res = await fetch(`${API_BASE}/api/auth/registerUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(RegisterData),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Registration successful!");
      setShowRegister(false);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
  }

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

      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-[350px] space-y-4">
            <h2 className="text-xl font-bold text-white">Login</h2>

            <input
              type="email"
              placeholder="Email"
              value={LoginData.email}
              onChange={(e) =>
                setLoginData({ ...LoginData, email: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 rounded-lg"
            />

            <input
              type="password"
              placeholder="Password"
              value={LoginData.password}
              onChange={(e) =>
                setLoginData({ ...LoginData, password: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 rounded-lg"
            />

            {authError && (
              <p className="text-red-400 text-sm">{authError}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={authLoading}
              className="w-full py-2 bg-white text-black rounded-lg"
            >
              {authLoading ? "Loading..." : "Login"}
            </button>

            <button
              onClick={() => setShowLogin(false)}
              className="text-xs text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-[350px] space-y-4">
            <h2 className="text-xl font-bold text-white">Register</h2>

            <input
              type="text"
              placeholder="Name"
              value={RegisterData.name}
              onChange={(e) =>
                setRegisterData({ ...RegisterData, name: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 rounded-lg"
            />

            <input
              type="email"
              placeholder="Email"
              value={RegisterData.email}
              onChange={(e) =>
                setRegisterData({ ...RegisterData, email: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 rounded-lg"
            />

            <input
              type="password"
              placeholder="Password"
              value={RegisterData.password}
              onChange={(e) =>
                setRegisterData({ ...RegisterData, password: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 rounded-lg"
            />

            {authError && (
              <p className="text-red-400 text-sm">{authError}</p>
            )}

            <button
              onClick={handleRegister}
              disabled={authLoading}
              className="w-full py-2 bg-white text-black rounded-lg"
            >
              {authLoading ? "Loading..." : "Register"}
            </button>

            <button
              onClick={() => setShowRegister(false)}
              className="text-xs text-zinc-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-0">
        <FlightMap
          aircraft={aircraft}
          origin={route?.origin}
          destination={route?.destination}
          mapStyle={mapStyle}
        />
      </div>




      <div className="hidden lg:block absolute right-0 top-0 h-full w-[420px] bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-white text-2xl font-bold">
            <Image
              src="/logo.png"
              alt="Plane Icon"
              width={32}
              height={32}
            />
            Flight Tracker
          </div>

          <div className="flex gap-3 items-center ml-auto">

            {user ? (
              <>
                <span className="text-sm text-zinc-300">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-1 text-sm border border-zinc-700 rounded-lg hover:bg-zinc-800"
                >
                  Login
                </button>

                <button
                  onClick={() => setShowRegister(true)}
                  className="px-4 py-1 text-sm bg-white text-black rounded-lg hover:bg-zinc-200"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>

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

        <div className="mt-4 mb-6 flex justify-start">
          <MapButton mapStyle={mapStyle} setMapStyle={setMapStyle} />
        </div>

        <SearchSection
          callsign={callsign}
          setCallsign={setCallsign}
          fetchFlight={fetchFlight}
          loading={loading}
          route={route}
          setAircraft={setAircraft}
        />
      </div>



      {/* mobile sheet  */}
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-white text-2xl font-bold">
              <Image
                src="/logo.png"
                alt="Plane Icon"
                width={32}
                height={32}
              />
              Flight Tracker
            </div>

            <div className="flex gap-2 items-center">

              {user ? (
                <>
                  <span className="text-xs text-zinc-300 max-w-[80px] truncate">
                    Hi, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-2 py-1 text-xs border border-zinc-700 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-2 py-1 text-xs border border-zinc-700 rounded-lg"
                  >
                    Login
                  </button>

                  <button
                    onClick={() => setShowRegister(true)}
                    className="px-2 py-1 text-xs bg-white text-black rounded-lg"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>

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
          <div className="mt-4 mb-6 flex justify-end">
            <MapButton mapStyle={mapStyle} setMapStyle={setMapStyle} />
          </div>
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
