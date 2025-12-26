"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminSignIn() {
  return (
    <Suspense
      fallback={<div className="p-8 text-sm text-gray-500">Loading...</div>}
    >
      <AdminSignInInner />
    </Suspense>
  );
}

function AdminSignInInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const callback = params?.get("callbackUrl") || "/admin";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        toast.success("Signed in as admin");
        // server set cookie -> just navigate to callback
        router.push(callback);
      } else {
        const data = await res.json();
        toast.error(data?.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow"
      >
        <h2 className="text-2xl font-bold mb-4">Admin Sign in</h2>
        <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Password</label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}
