import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * getAuthUser(request?)
 * - Tries NextAuth session first, then falls back to verifying admin_jwt cookie.
 * - Accepts either a standard Request or NextRequest (with cookies API).
 * - Returns { id, email, role, source } or null.
 */
export async function getAuthUser(request?: Request | any) {
  try {
    // 1) Try NextAuth session
    try {
      const session = await getServerSession(authOptions);
      if (session && (session as any).user) {
        return {
          id: (session as any).user?.id ?? null,
          email: (session as any).user?.email ?? null,
          role: ((session as any).user?.role ?? "customer")
            .toString()
            .toLowerCase(),
          source: "nextauth",
        };
      }
    } catch (e) {
      // ignore NextAuth errors, fallback to cookie
    }

    // 2) Fallback: need a request to inspect cookies
    if (!request) return null;

    // Prefer NextRequest.cookies API when available (safer in App Router)
    let token: string | undefined | null = null;
    try {
      // NextRequest (server) exposes cookies.get(name)
      if (typeof request.cookies?.get === "function") {
        const c = request.cookies.get("admin_jwt");
        token = c ? c.value : null;
      }
    } catch (e) {
      // ignore and fallback to header parsing
    }

    // Fallback to parsing cookie header (works for Request)
    if (!token) {
      const cookieHeader =
        request.headers && typeof request.headers.get === "function"
          ? request.headers.get("cookie")
          : request.headers
          ? request.headers.cookie
          : undefined;
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader
            .split(";")
            .map((c: string) => c.trim())
            .filter(Boolean)
            .map((part: string) => {
              const [k, ...v] = part.split("=");
              return [k, decodeURIComponent(v.join("="))];
            })
        );
        token = (cookies as any)["admin_jwt"];
      }
    }

    if (!token) {
      // helpful debug: no cookie present
      console.debug("getAuthUser: no admin_jwt cookie found on request");
      return null;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.warn("getAuthUser: JWT_SECRET not configured");
      return null;
    }

    try {
      const payload: any = jwt.verify(token, secret);
      return {
        id: payload.sub ?? null,
        email: payload.email ?? null,
        role: (payload.role ?? "customer").toString().toLowerCase(),
        source: "admin_jwt",
      };
    } catch (err) {
      console.warn("getAuthUser: admin_jwt verification failed:", String(err));
      return null;
    }
  } catch (err) {
    console.error("getAuthUser unexpected error:", err);
    return null;
  }
}

export default getAuthUser;
