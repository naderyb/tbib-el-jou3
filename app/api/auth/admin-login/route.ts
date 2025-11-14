import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
		}

		const res = await pool.query(
			"SELECT id, name, email, password, role FROM users WHERE email = $1 AND role = 'admin' LIMIT 1",
			[email]
		);

		if (res.rows.length === 0) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		const user = res.rows[0];
		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			console.error("JWT_SECRET is not set");
			return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
		}

		const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, secret, { expiresIn: "2h" });

		const response = NextResponse.json(
			{ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
			{ status: 200 }
		);

		// Set HttpOnly cookie
		response.cookies.set({
			name: "admin_jwt",
			value: token,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 2, // 2 hours
		});

		return response;
	} catch (err) {
		console.error("Admin login error:", err);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE() {
	try {
		const res = NextResponse.json({ ok: true });
		// Clear cookie
		res.cookies.set({
			name: "admin_jwt",
			value: "",
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 0,
		});
		return res;
	} catch (err) {
		console.error("Admin logout error:", err);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// DEBUG GET: return whether admin_jwt cookie is present and its decoded payload (if valid).
// This endpoint purposefully does not expose secret or sensitive data; remove in production.
export async function GET(request: NextRequest) {
	try {
		const cookieHeader = request.headers.get("cookie") || "";
		const cookies = Object.fromEntries(
			cookieHeader
				.split(";")
				.map((c) => c.trim())
				.filter(Boolean)
				.map((part) => {
					const [k, ...v] = part.split("=");
					return [k, decodeURIComponent(v.join("="))];
				})
		);

		const token = cookies["admin_jwt"];
		if (!token) {
			return NextResponse.json({ ok: false, message: "no admin_jwt cookie" });
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			return NextResponse.json({ ok: false, message: "JWT_SECRET not configured on server" }, { status: 500 });
		}

		try {
			const payload = jwt.verify(token, secret);
			// return only safe payload (avoid returning full token)
			return NextResponse.json({ ok: true, payload });
		} catch (err) {
			return NextResponse.json({ ok: false, message: "invalid token", error: String(err) }, { status: 401 });
		}
	} catch (err) {
		console.error("admin-login GET debug error:", err);
		return NextResponse.json({ ok: false, message: "internal error" }, { status: 500 });
	}
}
