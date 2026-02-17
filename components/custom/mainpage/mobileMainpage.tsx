"use client";

import Image from "next/image";
import SearchSection from "./searchsection";
import MapButton from "./mapbutton";


interface Props {
    user: any;
    handleLogout: () => void;
    setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
    setShowRegister: React.Dispatch<React.SetStateAction<boolean>>;

    history: string[];
    setCallsign: React.Dispatch<React.SetStateAction<string>>;
    fetchFlight: () => void;
    clearHistory: () => void;

    mapStyle: string;
    setMapStyle: React.Dispatch<React.SetStateAction<string>>;

    callsign: string;
    loading: boolean;
    route: any;
    setAircraft: React.Dispatch<any>;
}

export default function MobileMainpage({
    user,
    handleLogout,
    setShowLogin,
    setShowRegister,
    history,
    setCallsign,
    fetchFlight,
    clearHistory,
    mapStyle,
    setMapStyle,
    callsign,
    loading,
    route,
    setAircraft,
}: Props) {
    return (
        <div
            className="overflow-y-auto overscroll-contain h-[calc(100%-44px)] scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
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
                                    className="px-2 py-1 text-xs text-white border border-zinc-700 rounded-lg"
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
                        <h3 className="text-sm text-zinc-400 mb-2 text-white">
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
                                    className="px-3 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white"
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
                    <p className="text-md text-zinc-400 mt-2 mr-2">
                        Map Style:
                    </p>
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
    );
}
