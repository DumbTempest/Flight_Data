import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callsign = searchParams.get("callsign");

    if (!callsign) {
        return NextResponse.json(
            { error: "Missing callsign" },
            { status: 400 }
        );
    }

    try {
        const upperCallsign = callsign.toUpperCase();

        const [airplanesRes, adsbRes] = await Promise.allSettled([
            fetch(`https://api.airplanes.live/v2/callsign/${upperCallsign}`),
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

        if (airplanes) {
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
