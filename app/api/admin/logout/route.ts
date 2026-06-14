import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "aibotpro_admin_access";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "已退出后台。",
  });

  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
