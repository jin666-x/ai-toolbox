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
    if (isAdminApi) {
      return Response.json(
        { error: "服务器未配置 ADMIN_SECRET。" },
        { status: 500 }
      );
    }

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

  if (isAdminApi) {
    return Response.json(
      { error: "后台登录已失效，请重新通过 admin_key 进入后台。" },
      { status: 401 }
    );
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};