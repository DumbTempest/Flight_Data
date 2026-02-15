import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const callsign = searchParams.get("callsign");

    if (!callsign) {
        return NextResponse.json({ error: "Missing callsign" }, { status: 400 });
    }

    try {
        const res = await fetch(
            `https://api.adsb.lol/v2/callsign/${callsign.toUpperCase()}`
        );

        const data = await res.json();

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to fetch ADSB.fi" }, { status: 500 });
    }
}
