"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  TrendingUp,
  Truck,
  CheckCircle,
  AlertCircle,
  ChefHat,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useRealtime from "../../hooks/useRealtime";

type Order = {
  id: string | number;
  order_number?: string;
  restaurant_name?: string;
  status: string;
  total?: number;
  subtotal?: number;
  delivery_fee?: number;
  delivery_address?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  estimated_delivery_time?: string;
  items?: any[];
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // fetch user's orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }
    fetchOrders();
  }, [status, router, fetchOrders]);

  // Listen to realtime order updates
  const handleRealtimeMessage = useCallback(
    (msg: any) => {
      if (!msg) return;
      const type = msg.type || msg.event;
      const payload = msg.data || msg.payload || msg;

      if (
        (type === "order:update" || type === "order:updated") &&
        payload?.order
      ) {
        setOrders((prev) =>
          prev.map((o) =>
            String(o.id) === String(payload.order.id)
              ? { ...o, ...payload.order }
              : o
          )
        );
        // also update selected order if it's the one being tracked
        if (
          selectedOrder &&
          String(selectedOrder.id) === String(payload.order.id)
        ) {
          setSelectedOrder({ ...selectedOrder, ...payload.order });
        }
      }
    },
    [selectedOrder]
  );

  useRealtime("client", handleRealtimeMessage);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      accepted: "bg-sky-100 text-sky-800 border-sky-200",
      preparing: "bg-orange-100 text-orange-800 border-orange-200",
      ready_for_pickup: "bg-purple-100 text-purple-800 border-purple-200",
      out_for_delivery: "bg-indigo-100 text-indigo-800 border-indigo-200",
      delivered: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4" />,
      confirmed: <CheckCircle className="w-4 h-4" />,
      accepted: <TrendingUp className="w-4 h-4" />,
      preparing: <ChefHat className="w-4 h-4" />,
      ready_for_pickup: <AlertCircle className="w-4 h-4" />,
      out_for_delivery: <Truck className="w-4 h-4" />,
      delivered: <CheckCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const formatCurrency = (amount?: number) =>
    new Intl.NumberFormat("ar-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleString() : "—";

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-8 w-48"></div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-poppins">
            My <span className="text-orange-500">Orders</span>
          </h1>
          <p className="text-lg text-gray-600 font-poppins">
            Track your deliveries and view order details
          </p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-sm"
          >
            <Truck className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3 font-poppins">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6 font-poppins">
              Start browsing restaurants to place your first order
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-100"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Order Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 font-poppins">
                          Order {order.order_number && `#${order.order_number}`}
                        </h3>
                        <p className="text-sm text-gray-500 font-poppins">
                          {order.restaurant_name || "Unknown Restaurant"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span>
                          {order.status.toString().replace(/_/g, " ")}
                        </span>
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {formatDate(order.created_at)}
                      </div>
                      <div className="flex items-start text-gray-700">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                        <span>{order.delivery_address || "—"}</span>
                      </div>
                      {order.estimated_delivery_time && (
                        <div className="flex items-center text-gray-700">
                          <Truck className="w-4 h-4 mr-2 text-gray-400" />
                          Estimated: {order.estimated_delivery_time}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="lg:col-span-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">
                          {formatCurrency(order.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-semibold">
                          {formatCurrency(order.delivery_fee)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base border-t pt-1 mt-1">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-orange-600">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setDetailsOpen(true);
                      }}
                      className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold font-poppins"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {detailsOpen && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 font-poppins">
                    Order Details
                  </h3>
                  <p className="text-sm text-gray-500 font-poppins">
                    Order ID: {selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => setDetailsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 font-poppins uppercase tracking-wide">
                    Restaurant
                  </h4>
                  <p className="text-lg font-semibold text-gray-900 font-poppins">
                    {selectedOrder.restaurant_name || "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 font-poppins uppercase tracking-wide">
                    Status
                  </h4>
                  <span
                    className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    <span>
                      {selectedOrder.status.toString().replace(/_/g, " ")}
                    </span>
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 font-poppins uppercase tracking-wide">
                    Delivery Address
                  </h4>
                  <p className="text-gray-700">
                    {selectedOrder.delivery_address || "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 font-poppins uppercase tracking-wide">
                    Phone
                  </h4>
                  <p className="text-gray-700">{selectedOrder.phone || "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 font-poppins uppercase tracking-wide">
                    Ordered At
                  </h4>
                  <p className="text-gray-700">
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 font-poppins uppercase tracking-wide">
                    Last Update
                  </h4>
                  <p className="text-gray-700">
                    {formatDate(selectedOrder.updated_at)}
                  </p>
                </div>
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mb-6 border-t pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 font-poppins">
                    Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div
                        key={item.id ?? idx}
                        className="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.name ||
                              item.menu_item_name ||
                              `Item ${idx + 1}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity ?? item.qty ?? 1}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(
                            Number(item.price || 0) *
                              (item.quantity ?? item.qty ?? 1)
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t pt-6 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedOrder.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedOrder.delivery_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-orange-600">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setDetailsOpen(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700 font-poppins"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
