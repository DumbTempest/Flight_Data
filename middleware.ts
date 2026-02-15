import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get("accessToken");

    if (!accessToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const res = await fetch("http://localhost:3001/api/auth/verify", {
            headers: {
                Cookie: `accessToken=${accessToken.value}`,
            },
        });

        if (res.status !== 200) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*"],
};
