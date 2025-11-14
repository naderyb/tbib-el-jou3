import { useEffect, useRef } from "react";

type MessageHandler = (msg: any) => void;

/**
 * useRealtime(role, onMessage)
 * - role: channel/role to subscribe to (e.g. "admin", "delivery")
 * - onMessage: callback called with parsed JSON messages from server
 *
 * Requires NEXT_PUBLIC_REALTIME_URL env var (ws://... or wss://...).
 * If not set or if role/onMessage is falsy, the hook is a no-op.
 */
export default function useRealtime(role: string | null, onMessage?: MessageHandler) {
	// refs to keep stable instances across renders
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimerRef = useRef<number | null>(null);
	const shouldReconnectRef = useRef(true);

	useEffect(() => {
		// no-op if not in browser or missing config/handler
		if (typeof window === "undefined") return;
		const url = process.env.NEXT_PUBLIC_REALTIME_URL;
		if (!url || !role || !onMessage) return;

		let backoff = 1000;

		const connect = () => {
			try {
				wsRef.current = new WebSocket(url);
			} catch (err) {
				console.error("Realtime: websocket construction failed", err);
				scheduleReconnect();
				return;
			}

			wsRef.current.onopen = () => {
				// reset backoff
				backoff = 1000;
				try {
					// attempt subscribe message; adjust to your server protocol if needed
					wsRef.current?.send(JSON.stringify({ action: "subscribe", role }));
				} catch (e) {
					console.warn("Realtime subscribe failed", e);
				}
			};

			wsRef.current.onmessage = (ev: MessageEvent) => {
				try {
					const payload = JSON.parse(ev.data);
					onMessage(payload);
				} catch (err) {
					// ignore non-json messages
					console.warn("Realtime: failed to parse message", err);
				}
			};

			wsRef.current.onclose = () => {
				wsRef.current = null;
				if (shouldReconnectRef.current) scheduleReconnect();
			};

			wsRef.current.onerror = (err) => {
				// errors typically lead to close event next
				console.error("Realtime socket error", err);
			};
		};

		const scheduleReconnect = () => {
			if (!shouldReconnectRef.current) return;
			reconnectTimerRef.current = window.setTimeout(() => {
				backoff = Math.min(backoff * 1.5, 30000);
				connect();
			}, backoff);
		};

		shouldReconnectRef.current = true;
		connect();

		return () => {
			shouldReconnectRef.current = false;
			if (reconnectTimerRef.current) {
				clearTimeout(reconnectTimerRef.current);
				reconnectTimerRef.current = null;
			}
			if (wsRef.current) {
				try {
					wsRef.current.close();
				} catch {}
				wsRef.current = null;
			}
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [role, onMessage]);
}