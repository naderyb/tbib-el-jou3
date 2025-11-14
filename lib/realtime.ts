"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

/**
 * Connect to realtime WS server and call onMessage for incoming messages.
 * Auto-includes userId query param when session.user.id is present.
 */
export function useRealtime(role: "admin" | "delivery" | "client", onMessage: (msg: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const port = process.env.NEXT_PUBLIC_WS_PORT || (process.env.WS_PORT || 3030);
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const userId = (session as any)?.user?.id;
    const userParam = userId ? `&userId=${encodeURIComponent(String(userId))}` : "";
    const url = `${scheme}://${host}:${port}/?role=${encodeURIComponent(role)}${userParam}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // console.info("Realtime connected as", role, "userId", userId);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        onMessage(data);
      } catch (err) {
        // invalid JSON
      }
    };

    ws.onclose = () => {
      // console.info("Realtime disconnected");
    };

    return () => {
      try {
        ws.close();
      } catch (_) {}
      wsRef.current = null;
    };
    // include session?.user?.id so connection updates when user changes
  }, [role, (session as any)?.user?.id, onMessage]);
}

const REALTIME_REST_URL = process.env.REALTIME_REST_URL || "";

async function sendPayload(endpoint: string, body: any) {
	// server-side global fetch is available in Next.js runtime
	if (!REALTIME_REST_URL) {
		// no-op for dev if no realtime REST endpoint configured
		console.log("[realtime] no REST endpoint configured; would POST to", endpoint, "payload:", body);
		return;
	}
	try {
		await fetch(REALTIME_REST_URL + endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
	} catch (err) {
		console.error("[realtime] sendPayload error", err);
	}
}

export async function broadcastToRole(role: string, payload: any) {
	// Example: POST /broadcast/role with { role, payload }
	await sendPayload("/broadcast/role", { role, payload });
}

export async function broadcastToUser(userId: string | number, payload: any) {
	// Example: POST /broadcast/user with { userId, payload }
	await sendPayload("/broadcast/user", { userId, payload });
}

export async function broadcastToAll(payload: any) {
	await sendPayload("/broadcast/all", { payload });
}

// default export for callers using default import
export default {
	broadcastToRole,
	broadcastToUser,
	broadcastToAll,
};