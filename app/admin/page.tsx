"use server";

import AdminClient from "./AdminClient";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export default async function AdminPage() {
	// 1) Check admin_jwt cookie first (admin-login flow)
	const cookieStore = cookies();
	const tokenCookie = (await cookieStore).get("admin_jwt")?.value;
	const jwtSecret = process.env.JWT_SECRET;
	if (tokenCookie && jwtSecret) {
		try {
			const payload = jwt.verify(tokenCookie, jwtSecret) as any;
			if (payload?.role === "admin") {
				// authorized via admin_jwt
				return <AdminClient />;
			}
		} catch (err) {
			// invalid token -> fall through to NextAuth check
			console.warn("Invalid admin_jwt:", err);
		}
	}

	// 2) Fallback to NextAuth session
	const session = await getServerSession(authOptions);
	if (session && (session as any).user?.role === "admin") {
		return <AdminClient />;
	}

	// 3) Not authorized -> redirect to admin login
	redirect(`/admin/login?callbackUrl=/admin`);
}