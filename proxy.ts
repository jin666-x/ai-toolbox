import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "aibotpro_admin_access";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const queryKey = searchParams.get("admin_key");

  if (cookieValue === adminSecret) {
    return NextResponse.next();
  }

  if (queryKey === adminSecret) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("admin_key");

    const response = NextResponse.redirect(cleanUrl);

    response.cookies.set(ADMIN_COOKIE_NAME, adminSecret, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 6,
    });

    return response;
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};