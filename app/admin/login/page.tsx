"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ensure cookie from server is saved
        body: JSON.stringify({ email, password }),
      });

      // consume body so browser processes Set-Cookie headers
      const data = await res.json().catch(() => ({}));

      setLoading(false);

      if (!res.ok) {
        toast.error(data?.error || "Invalid credentials");
        return;
      }

      // Do a full navigation so the server receives the admin_jwt cookie on first request
      // (router.push is a client transition and may run before the cookie is stored)
      window.location.href = "/admin";
    } catch (err) {
      setLoading(false);
      console.error("Admin login error:", err);
      toast.error("Network error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12">
      <div className="w-full max-w-md p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in as Admin"}
            </button>
            <Link href="/" className="text-sm text-gray-600">Back</Link>
          </div>
        </form>
      </div>
    </div>
  );
}