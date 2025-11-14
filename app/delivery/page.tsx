"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import useRealtime from "../../hooks/useRealtime";
import toast from "react-hot-toast";
import Link from "next/link";

export default function DeliveryDashboard() {
  const { data: session, status } = useSession();
  const [online, setOnline] = useState<boolean>(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [todayDeliveries, setTodayDeliveries] = useState<number>(0);

  // confirmation modal state
  const [confirm, setConfirm] = useState<{ open: boolean; orderId?: number; action?: "accept" | "delivered" | "picked_up" }>(
    { open: false }
  );

  const getCurrentPosition = () =>
    new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // attempt to get geolocation for radius filtering
      let url = "/api/orders";
      try {
        const pos = await getCurrentPosition();
        const radiusKm = 10; // default radius (can be configurable)
        url += `?lat=${pos.lat}&lng=${pos.lng}&radius=${radiusKm}`;
      } catch (_err) {
        // geolocation failed/denied -> fetch without location
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data || []);
    } catch (err) {
      console.error("Failed to load delivery orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Recalculate today's stats whenever orders change
  useEffect(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    let earnings = 0;
    let deliveries = 0;
    orders.forEach((o) => {
      const t = new Date(o.created_at).getTime();
      if (t >= start && (o.status === "delivered" || o.status === "out_for_delivery")) {
        earnings += Number(o.total || 0);
        deliveries += 1;
      }
    });
    setTodayEarnings(earnings);
    setTodayDeliveries(deliveries);
  }, [orders]);

  // Realtime updates
  useRealtime("delivery", (msg: any) => {
    if (!msg) return;
    if (msg.type === "order:assigned" && msg.payload?.order) {
      setOrders((prev) => [msg.payload.order, ...prev.filter((o) => o.id !== msg.payload.order.id)]);
      toast.success("New assigned order received");
      return;
    }

    if (msg.type === "order:update" && msg.payload?.order) {
      const updated = msg.payload.order;
      setOrders((prev) => {
        const found = prev.find((o) => o.id === updated.id);
        if (found) {
          return prev.map((o) => (o.id === updated.id ? updated : o));
        }
        if (updated.delivery_user_id && String(updated.delivery_user_id) === String((session as any)?.user?.id)) {
          return [updated, ...prev];
        }
        return prev;
      });
    }
  });

  // Accept flow now requires confirmation modal
  const onAcceptClicked = (orderId: number) => {
    setConfirm({ open: true, orderId, action: "accept" });
  };
  const onDeliveredClicked = (orderId: number) => {
    setConfirm({ open: true, orderId, action: "delivered" });
  };
  const onPickedUpClicked = (orderId: number) => {
    setConfirm({ open: true, orderId, action: "picked_up" });
  };

  const performConfirmedAction = async () => {
    if (!confirm.orderId || !confirm.action) return setConfirm({ open: false });
    const orderId = confirm.orderId;
    if (confirm.action === "accept") {
      await acceptOrder(orderId);
    } else if (confirm.action === "picked_up") {
      await updateOrderStatus(orderId, "out_for_delivery");
    } else if (confirm.action === "delivered") {
      await updateOrderStatus(orderId, "delivered");
    }
    setConfirm({ open: false });
  };

  // Accept an order: assign to current delivery user and update status to 'accepted'
  const acceptOrder = async (orderId: number) => {
    if (!(session as any)?.user?.id) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignDeliveryUserId: Number((session as any).user.id),
          status: "accepted",
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        toast.success("Order accepted");
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to accept order");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  // Update status flow
  const updateOrderStatus = async (orderId: number, statusValue: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusValue }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        toast.success("Status updated");
      } else {
        const err = await res.json();
        toast.error(err?.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
            <p className="text-sm text-gray-600">Status: {online ? "Online" : "Offline"}</p>
          </div>
          <div className="flex items-center space-x-6">
            <div>
              <div className="text-sm text-gray-500">Today's earnings</div>
              <div className="text-xl font-semibold">{todayEarnings} DA</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Deliveries</div>
              <div className="text-xl font-semibold">{todayDeliveries}</div>
            </div>
            <button onClick={() => setOnline((s) => !s)} className="px-4 py-2 bg-gray-100 rounded">
              {online ? "Go Offline" : "Go Online"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Available / Assigned Orders</h2>
          {loading ? (
            <div>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div>No orders available right now.</div>
          ) : (
            <div className="grid gap-4">
              {orders.map((o) => (
                <div key={o.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                  <div>
                    <div className="font-semibold">Order #{o.id} — {o.restaurant_name}</div>
                    <div className="text-sm text-gray-600">{o.delivery_address}</div>
                    <div className="text-sm text-gray-600">Customer: {o.user_name ?? o.user_email} — {o.phone}</div>
                    <div className="text-sm text-gray-600">Total: {o.total} DA</div>
                    <div className="text-sm text-gray-600">Status: {o.status}</div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {!o.delivery_user_id && (
                      <button onClick={() => onAcceptClicked(o.id)} className="px-3 py-2 bg-green-500 text-white rounded">Accept</button>
                    )}
                    {o.delivery_user_id && String(o.delivery_user_id) === String((session as any)?.user?.id) && (
                      <>
                        <button onClick={() => onPickedUpClicked(o.id)} className="px-3 py-2 bg-blue-500 text-white rounded">Picked up</button>
                        <button onClick={() => onDeliveredClicked(o.id)} className="px-3 py-2 bg-gray-800 text-white rounded">Delivered</button>
                      </>
                    )}
                    <Link href={`/orders/${o.id}`} className="text-sm text-gray-600">Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">{confirm.action === "accept" ? "Confirm Accept" : confirm.action === "picked_up" ? "Confirm Picked Up" : "Confirm Delivered"}</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to {confirm.action === "accept" ? "accept" : confirm.action === "picked_up" ? "mark as picked up" : "mark as delivered"} order #{confirm.orderId}?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setConfirm({ open: false })} className="px-3 py-2 border rounded">Cancel</button>
              <button onClick={performConfirmedAction} className="px-3 py-2 bg-green-500 text-white rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}