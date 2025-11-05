"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Heart, 
  Share2, 
  Filter,
  Search,
  Plus,
  Minus,
  ShoppingCart
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

interface MenuItem {
  id: string;
  name: string;
  nameArabic?: string;
  description: string;
  price: number;
  image?: string;
  isSpicy: boolean;
  isVegetarian: boolean;
  category: {
    name: string;
  };
}

interface Restaurant {
  id: string;
  name: string;
  nameArabic?: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  phone: string;
  cuisine: string[];
  menuItems: MenuItem[];
}

export default function RestaurantPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchRestaurant();
  }, [params.id]);

  const fetchRestaurant = async () => {
    try {
      // Mock data - replace with actual API call
      const mockRestaurant: Restaurant = {
        id: params.id as string,
        name: "Dar El Bahdja",
        nameArabic: "دار البهجة",
        description: "Authentic Algerian cuisine in the heart of Algiers. Experience traditional flavors passed down through generations.",
        image: "/restaurants/dar-el-bahdja-cover.jpg",
        rating: 4.8,
        deliveryTime: "25-35 min",
        deliveryFee: 0,
        minOrder: 1500,
        address: "15 Rue Didouche Mourad, Algiers",
        phone: "+213 21 123 456",
        cuisine: ["Algerian", "Traditional", "Halal"],
        menuItems: [
          {
            id: "1",
            name: "Couscous Royal",
            nameArabic: "كسكس ملكي",
            description: "Traditional couscous with lamb, chicken, and vegetables",
            price: 1800,
            image: "/dishes/couscous-royal.jpg",
            isSpicy: false,
            isVegetarian: false,
            category: { name: "Main Dishes" }
          },
          {
            id: "2",
            name: "Chorba Frik",
            nameArabic: "شوربة فريك",
            description: "Traditional Algerian soup with green wheat and meat",
            price: 800,
            image: "/dishes/chorba-frik.jpg",
            isSpicy: true,
            isVegetarian: false,
            category: { name: "Soups" }
          },
          {
            id: "3",
            name: "Tajine Zitoune",
            nameArabic: "طاجين زيتون",
            description: "Slow-cooked chicken with olives and preserved lemons",
            price: 1600,
            image: "/dishes/tajine-zitoune.jpg",
            isSpicy: false,
            isVegetarian: false,
            category: { name: "Main Dishes" }
          },
          {
            id: "4",
            name: "Makroud",
            nameArabic: "مقروض",
            description: "Traditional semolina pastries filled with dates",
            price: 600,
            image: "/dishes/makroud.jpg",
            isSpicy: false,
            isVegetarian: true,
            category: { name: "Desserts" }
          }
        ]
      };

      setRestaurant(mockRestaurant);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      setLoading(false);
    }
  };

  const categories = restaurant ? 
    ["All", ...Array.from(new Set(restaurant.menuItems.map(item => item.category.name)))] 
    : [];

  const filteredItems = restaurant?.menuItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category.name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.nameArabic && item.nameArabic.includes(searchTerm));
    return matchesCategory && matchesSearch;
  }) || [];

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, newQuantity)
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      restaurantId: restaurant!.id,
      restaurantName: restaurant!.name,
      image: item.image,
      quantity
    });
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded-2xl"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">Restaurant not found</h1>
          <p className="text-gray-600 font-poppins">The restaurant you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Restaurant Header */}
      <section className="relative h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-red-500/90">
          <div className="zelij-pattern w-full h-full opacity-20"></div>
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold font-poppins">{restaurant.name}</h1>
              {restaurant.nameArabic && (
                <span className="text-2xl font-arabic opacity-80">{restaurant.nameArabic}</span>
              )}
            </div>
            <p className="text-xl mb-4 opacity-90 font-poppins max-w-2xl">{restaurant.description}</p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 fill-current text-yellow-400" />
                <span className="font-semibold font-poppins">{restaurant.rating}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="font-poppins">{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span className="font-poppins">{restaurant.address}</span>
              </div>
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-3 rounded-full backdrop-blur-md transition-all ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Restaurant Info Cards */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="glass-card p-4 text-center"
            >
              <div className="text-2xl font-bold text-green-500 font-poppins">
                {restaurant.deliveryFee === 0 ? 'Free' : `${restaurant.deliveryFee} DA`}
              </div>
              <div className="text-sm text-gray-600 font-poppins">Delivery</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="glass-card p-4 text-center"
            >
              <div className="text-2xl font-bold text-orange-500 font-poppins">{restaurant.minOrder} DA</div>
              <div className="text-sm text-gray-600 font-poppins">Minimum</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="glass-card p-4 text-center"
            >
              <div className="text-2xl font-bold text-blue-500 font-poppins">{restaurant.cuisine.join(', ')}</div>
              <div className="text-sm text-gray-600 font-poppins">Cuisine</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="glass-card p-4 text-center"
            >
              <div className="text-2xl font-bold text-red-500 font-poppins">
                <Phone className="w-6 h-6 mx-auto" />
              </div>
              <div className="text-sm text-gray-600 font-poppins">Call Now</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-6 sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 font-poppins">Categories</h3>
                
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-poppins"
                  />
                </div>

                {/* Category Filters */}
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-poppins ${
                        selectedCategory === category
                          ? 'bg-orange-500 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Menu Items */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 font-poppins">
                    {selectedCategory === "All" ? "All Dishes" : selectedCategory}
                  </h3>
                  <div className="text-sm text-gray-500 font-poppins">
                    {filteredItems.length} items
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="glass-card p-6 hover:shadow-xl transition-all"
                      >
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Item Image */}
                          <div className="w-full md:w-32 h-32 bg-gradient-to-br from-orange-200 to-red-200 rounded-xl flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : (
                              <span className="text-orange-500 font-bold text-2xl font-poppins">
                                {item.name[0]}
                              </span>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 font-poppins">{item.name}</h4>
                                {item.nameArabic && (
                                  <p className="text-gray-600 font-arabic">{item.nameArabic}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                {item.isSpicy && <span className="text-red-500">🌶️</span>}
                                {item.isVegetarian && <span className="text-green-500">🌱</span>}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4 font-poppins">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-orange-500 font-poppins">
                                {item.price} DA
                              </div>
                              
                              {/* Add to Cart Controls */}
                              <div className="flex items-center space-x-3">
                                {quantities[item.id] > 0 ? (
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={() => updateQuantity(item.id, quantities[item.id] - 1)}
                                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-semibold w-8 text-center font-poppins">
                                      {quantities[item.id]}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(item.id, quantities[item.id] + 1)}
                                      className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                )}
                                
                                {quantities[item.id] > 0 && (
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    className="btn-primary flex items-center space-x-2"
                                  >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span>Add</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2 font-poppins">No dishes found</h3>
                    <p className="text-gray-500 font-poppins">Try adjusting your search or category filter</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}