import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callsign = searchParams.get("callsign");
    const icao = searchParams.get("icao");

    if (!callsign) {
        return NextResponse.json(
            { error: "Missing callsign" },
            { status: 400 }
        );
    }

    try {
        const upperCallsign = callsign.toUpperCase();

        const [airplanesRes, openSkyRes, adsbRes] = await Promise.allSettled([
            fetch(`https://api.airplanes.live/v2/callsign/${upperCallsign}`),
            icao
                ? fetch(
                      `https://opensky-network.org/api/states/all?icao24=${icao.toLowerCase()}`
                  )
                : Promise.resolve(null),
            fetch(
                `https://opendata.adsb.fi/api/v2/callsign/${upperCallsign}`
            ),
        ]);

        let airplanes = null;
        if (
            airplanesRes.status === "fulfilled" &&
            airplanesRes.value &&
            airplanesRes.value.status === 200
        ) {
            const data = await airplanesRes.value.json();
            if (data?.ac?.length > 0) {
                const ac = data.ac[0];
                airplanes = {
                    lat: ac.lat,
                    lon: ac.lon,
                    track: ac.track,
                    altitude: ac.alt_baro,
                    speed: ac.gs,
                    verticalRate: ac.baro_rate,
                    hex: ac.hex,
                };
            }
        }

        let openSky = null;
        if (
            openSkyRes.status === "fulfilled" &&
            openSkyRes.value &&
            openSkyRes.value.status === 200
        ) {
            const data = await openSkyRes.value.json();
            if (data?.states?.length > 0) {
                const s = data.states[0];
                openSky = {
                    lat: s[6],
                    lon: s[5],
                    track: s[10],
                    altitude: s[7] ? s[7] * 3.28084 : 0,
                    speed: s[9] ? s[9] * 1.94384 : 0,
                    verticalRate: s[11] ? s[11] * 196.85 : 0,
                    hex: s[0],
                };
            }
        }

        let adsb = null;
        if (adsbRes.status === "fulfilled" && adsbRes.value && adsbRes.value.status === 200) {
            const data = await adsbRes.value.json();
            if (data?.ac?.length > 0) {
                const ac = data.ac[0];
                adsb = {
                    lat: ac.lat,
                    lon: ac.lon,
                    track: ac.track,
                    altitude: ac.alt_baro,
                    speed: ac.gs,
                    verticalRate: ac.baro_rate,
                    hex: ac.hex,
                };
            }
        }

        let best = null;
        let source = null;

        if (openSky) {
            best = openSky;
            source = "OpenSky";
        } else if (airplanes) {
            best = airplanes;
            source = "Airplanes.live";
        } else if (adsb) {
            best = adsb;
            source = "ADSB.fi";
        }

        if(!best) {
            return NextResponse.json(
                { error: "No live data available for this flight" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            best,
            source,
            openSky,
            airplanes,
            adsb
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to fetch live data" },
            { status: 500 }
        );
    }
}
