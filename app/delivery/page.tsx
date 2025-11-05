"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Navigation,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  DollarSign,
  Star,
  User,
  Car,
  Battery,
  Signal,
  Menu,
  X,
  Camera,
  MessageCircle,
  Route,
  Timer
} from "lucide-react";

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  totalAmount: number;
  estimatedTime: number;
  distance: string;
  pickupTime?: string;
  deliveryTime?: string;
  status: 'assigned' | 'picked_up' | 'en_route' | 'delivered' | 'cancelled';
  items: Array<{
    name: string;
    quantity: number;
    specialInstructions?: string;
  }>;
  paymentMethod: string;
  priority: 'normal' | 'high' | 'urgent';
}

export default function DriverOrders() {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);
  const [deliveryProof, setDeliveryProof] = useState<string | null>(null);
  const [customerNote, setCustomerNote] = useState("");

  useEffect(() => {
    fetchAvailableOrders();
    getCurrentLocation();
    
    const interval = setInterval(() => {
      if (isOnline) {
        fetchAvailableOrders();
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  const fetchAvailableOrders = async () => {
    try {
      // Mock data - replace with actual API call
      const mockOrders: DeliveryOrder[] = [
        {
          id: "1",
          orderNumber: "ORD-2024-001",
          customerName: "Ahmed Boumediene",
          customerPhone: "+213 555 123 456",
          customerAddress: "12 Rue Hassiba Ben Bouali, Algiers Centre",
          customerNotes: "Ring the bell twice, apartment 3B",
          restaurantName: "Dar El Bahdja",
          restaurantAddress: "15 Rue Didouche Mourad, Algiers",
          restaurantPhone: "+213 21 123 456",
          totalAmount: 2500,
          estimatedTime: 25,
          distance: "2.1 km",
          status: 'assigned',
          priority: 'normal',
          items: [
            { 
              name: "Couscous Royal", 
              quantity: 2,
              specialInstructions: "Extra vegetables"
            },
            { 
              name: "Chorba Frik", 
              quantity: 1 
            }
          ],
          paymentMethod: "cash_on_delivery"
        },
        {
          id: "2",
          orderNumber: "ORD-2024-002",
          customerName: "Fatima Zohra",
          customerPhone: "+213 555 789 012",
          customerAddress: "8 Boulevard Mohamed V, Bab El Oued",
          restaurantName: "Kasbah Delights",
          restaurantAddress: "22 Rue de la Kasbah, Algiers",
          restaurantPhone: "+213 21 789 012",
          totalAmount: 1800,
          estimatedTime: 30,
          distance: "3.5 km",
          status: 'assigned',
          priority: 'high',
          items: [
            { name: "Tajine Zitoune", quantity: 1 },
            { name: "Makroud", quantity: 3 }
          ],
          paymentMethod: "card"
        }
      ];

      setOrders(mockOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const acceptOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setActiveOrder(order);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const updateOrderStatus = async (newStatus: DeliveryOrder['status']) => {
    if (activeOrder) {
      const updatedOrder = { ...activeOrder, status: newStatus };
      
      if (newStatus === 'picked_up') {
        updatedOrder.pickupTime = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updatedOrder.deliveryTime = new Date().toISOString();
        setShowProofModal(true);
        return; // Don't clear active order yet
      }
      
      setActiveOrder(updatedOrder);
    }
  };

  const completeDelivery = async () => {
    if (activeOrder && deliveryProof) {
      // Upload proof and complete delivery
      setActiveOrder(null);
      setShowProofModal(false);
      setDeliveryProof(null);
      setCustomerNote("");
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      normal: "bg-gray-100 text-gray-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      assigned: "bg-blue-500",
      picked_up: "bg-orange-500",
      en_route: "bg-purple-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const openNavigation = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} DA`;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      {/* Status Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsOnline(!isOnline)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  isOnline 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-white' : 'bg-gray-500'}`}></div>
                <span className="font-poppins">{isOnline ? 'Online' : 'Offline'}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Battery className="w-4 h-4" />
                <span className="text-sm font-poppins">85%</span>
                <Signal className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600 font-poppins">Today's Earnings</div>
                <div className="font-bold text-green-600 font-poppins">4,500 DA</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 font-poppins">Deliveries</div>
                <div className="font-bold text-blue-600 font-poppins">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Orders */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-poppins">
                  Available Orders
                </h2>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium font-poppins">
                  {orders.length}
                </span>
              </div>

              {!isOnline ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-poppins">Go online to receive orders</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-poppins">No orders available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900 font-poppins">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-600 font-poppins">
                            {order.restaurantName}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)} font-poppins`}>
                            {order.priority}
                          </span>
                          <span className="text-lg font-bold text-orange-500 font-poppins">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="font-poppins">{order.distance}</span>
                          <Clock className="w-4 h-4 ml-2" />
                          <span className="font-poppins">{order.estimatedTime} min</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-poppins">{order.customerName}</span>
                        </div>
                        <div className="text-sm text-gray-600 font-poppins">
                          Payment: {order.paymentMethod.replace('_', ' ')}
                        </div>
                      </div>

                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all font-poppins"
                      >
                        Accept Order
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Active Order */}
          <div className="lg:col-span-2">
            {activeOrder ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 font-poppins">
                    Active Delivery
                  </h2>
                  <div className={`px-4 py-2 rounded-full text-white font-medium ${getStatusColor(activeOrder.status)} font-poppins`}>
                    {activeOrder.status.replace('_', ' ')}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900 font-poppins">
                      Order #{activeOrder.orderNumber}
                    </span>
                    <span className="text-2xl font-bold text-orange-500 font-poppins">
                      {formatCurrency(activeOrder.totalAmount)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 font-poppins">Items:</h4>
                      <div className="space-y-1">
                        {activeOrder.items.map((item, index) => (
                          <div key={index} className="text-sm text-gray-700 font-poppins">
                            {item.quantity}x {item.name}
                            {item.specialInstructions && (
                              <div className="text-xs text-orange-600 ml-4">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-poppins">ETA: {activeOrder.estimatedTime} min</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Route className="w-4 h-4" />
                        <span className="font-poppins">{activeOrder.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Restaurant Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 font-poppins">
                      🏪 Pickup Location
                    </h3>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900 font-poppins">
                        {activeOrder.restaurantName}
                      </div>
                      <div className="text-sm text-gray-600 font-poppins">
                        {activeOrder.restaurantAddress}
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => window.open(`tel:${activeOrder.restaurantPhone}`)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-poppins"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={() => openNavigation(activeOrder.restaurantAddress)}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-poppins"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Navigate</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 font-poppins">
                      🏠 Delivery Location
                    </h3>
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900 font-poppins">
                        {activeOrder.customerName}
                      </div>
                      <div className="text-sm text-gray-600 font-poppins">
                        {activeOrder.customerAddress}
                      </div>
                      {activeOrder.customerNotes && (
                        <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded font-poppins">
                          📝 {activeOrder.customerNotes}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => window.open(`tel:${activeOrder.customerPhone}`)}
                          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-poppins"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={() => openNavigation(activeOrder.customerAddress)}
                          className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-poppins"
                        >
                          <Navigation className="w-4 h-4" />
                          <span>Navigate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  {activeOrder.status === 'assigned' && (
                    <button
                      onClick={() => updateOrderStatus('picked_up')}
                      className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors font-poppins"
                    >
                      <Package className="w-5 h-5" />
                      <span>Mark as Picked Up</span>
                    </button>
                  )}
                  
                  {activeOrder.status === 'picked_up' && (
                    <button
                      onClick={() => updateOrderStatus('en_route')}
                      className="flex items-center space-x-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors font-poppins"
                    >
                      <Car className="w-5 h-5" />
                      <span>Start Delivery</span>
                    </button>
                  )}
                  
                  {activeOrder.status === 'en_route' && (
                    <button
                      onClick={() => updateOrderStatus('delivered')}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors font-poppins"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Mark as Delivered</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-12 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">
                  No Active Delivery
                </h2>
                <p className="text-gray-600 font-poppins">
                  {isOnline 
                    ? "Accept an order from the list to start delivering" 
                    : "Go online to receive delivery orders"
                  }
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Proof Modal */}
      <AnimatePresence>
        {showProofModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-poppins">
                Complete Delivery
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                    Delivery Proof (Photo)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {deliveryProof ? (
                      <div>
                        <img src={deliveryProof} alt="Delivery proof" className="max-w-full h-32 object-cover mx-auto rounded" />
                        <button
                          onClick={() => setDeliveryProof(null)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove photo
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm font-poppins">Take a photo as proof of delivery</p>
                        <button
                          onClick={() => {
                            // Simulate taking a photo
                            setDeliveryProof("/api/placeholder/200/150");
                          }}
                          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-poppins"
                        >
                          Take Photo
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-poppins">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Any additional notes about the delivery..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-poppins"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowProofModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-poppins"
                >
                  Cancel
                </button>
                <button
                  onClick={completeDelivery}
                  disabled={!deliveryProof}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
                >
                  Complete Delivery
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}