import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "aibotpro_admin_access";

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedAdminEmail(email: string | undefined, adminEmails: string[]) {
  if (adminEmails.length === 0) {
    return true;
  }

  if (!email) {
    return false;
  }

  return adminEmails.includes(email.trim().toLowerCase());
}

function getLoginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return loginUrl;
}

function nextWithAdminHeaders(request: NextRequest, adminEmail: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-aibotpro-admin", "1");
  requestHeaders.set("x-aibotpro-admin-email", adminEmail);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

async function getVerifiedUserEmail(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      email: undefined,
      error: "服务器未配置 Supabase 登录环境变量。",
    };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return {
      email: undefined,
      error: undefined,
    };
  }

  return {
    email: user.email.trim().toLowerCase(),
    error: undefined,
  };
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    if (isAdminApi) {
      return jsonError("服务器未配置后台访问密钥。", 500);
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  const adminEmails = getAdminEmails();
  const hasAdminEmailWhitelist = adminEmails.length > 0;

  const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const queryKey = searchParams.get("admin_key");

  const hasValidAdminCookie = cookieValue === adminSecret;
  const hasValidAdminQuery = queryKey === adminSecret;

  if (!hasValidAdminCookie && !hasValidAdminQuery) {
    if (isAdminApi) {
      return jsonError("后台登录已失效，请重新通过 admin_key 进入后台。", 401);
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  let adminEmail = "admin_key";

  if (hasAdminEmailWhitelist) {
    const verified = await getVerifiedUserEmail(request);

    if (verified.error) {
      if (isAdminApi) {
        return jsonError(verified.error, 500);
      }

      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!isAllowedAdminEmail(verified.email, adminEmails)) {
      if (isAdminApi) {
        return jsonError("当前登录账号不是管理员。", 401);
      }

      return NextResponse.redirect(getLoginRedirect(request));
    }

    adminEmail = verified.email || "unknown_admin";
  }

  if (hasValidAdminCookie) {
    return nextWithAdminHeaders(request, adminEmail);
  }

  const cleanUrl = request.nextUrl.clone();
  cleanUrl.searchParams.delete("admin_key");
  cleanUrl.searchParams.delete("admin_email");

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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
