"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, Star, ChefHat, Utensils, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import RestaurantCard from "./components/RestaurantCard";

type Restaurant = {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  image: string;
  featured: boolean;
};

type Category = {
  id: string;
  name: string;
  emoji: string;
  count: number;
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [location, setLocation] = useState<string>("Algiers");
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch data from database
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockRestaurants = [
        {
          id: "1",
          name: "Dar El Bahdja",
          type: "Traditional Algerian",
          location: "Algiers Center",
          rating: 4.8,
          deliveryTime: "25-35 min",
          deliveryFee: "Free",
          image: "/restaurants/dar-el-bahdja.jpg",
          featured: true,
        },
        {
          id: "2", 
          name: "Kasbah Delights",
          type: "Couscous & Tagines",
          location: "Casbah",
          rating: 4.9,
          deliveryTime: "30-40 min",
          deliveryFee: "150 DA",
          image: "/restaurants/kasbah-delights.jpg",
          featured: true,
        },
        {
          id: "3",
          name: "Atlas Kitchen",
          type: "Modern Maghreb",
          location: "Hydra",
          rating: 4.7,
          deliveryTime: "20-30 min",
          deliveryFee: "Free",
          image: "/restaurants/atlas-kitchen.jpg",
          featured: true,
        }
      ];

      const mockCategories = [
        { id: "1", name: "Couscous", emoji: "🍚", count: 28 },
        { id: "2", name: "Tagines", emoji: "🍲", count: 34 },
        { id: "3", name: "Chorba", emoji: "🍜", count: 15 },
        { id: "4", name: "Grilled Meats", emoji: "🍖", count: 42 },
        { id: "5", name: "Pastries", emoji: "🥐", count: 23 },
        { id: "6", name: "Traditional Sweets", emoji: "🍯", count: 18 },
      ];

      setFeaturedRestaurants(mockRestaurants);
      setCategories(mockCategories);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Zelij Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="zelij-pattern w-full h-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 font-poppins">
              Welcome to <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Tbib El Jou3</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Authentic Algerian cuisine delivered fresh to your doorstep
            </p>
            <p className="text-lg text-gray-500 mb-12 font-arabic">
              طبيب الجوع - دواء الجوع على بابك
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-poppins"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 pr-8 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-poppins"
                  >
                    <option value="Algiers">Algiers</option>
                    <option value="Oran">Oran</option>
                    <option value="Constantine">Constantine</option>
                  </select>
                </div>
                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 font-poppins">
                  Search
                </button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-center space-x-8 mt-12"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 font-poppins">50K+</div>
                <div className="text-gray-600 font-poppins">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 font-poppins">100+</div>
                <div className="text-gray-600 font-poppins">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 font-poppins">25min</div>
                <div className="text-gray-600 font-poppins">Avg Delivery</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Explore Our <span className="text-orange-500">Categories</span>
            </h2>
            <p className="text-xl text-gray-600 font-poppins">
              Discover authentic Algerian flavors
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                className="group cursor-pointer"
              >
                <Link href={`/categories/${category.id}`}>
                  <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {category.emoji}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 font-poppins">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-poppins">
                      {category.count} dishes
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
                Featured <span className="text-green-500">Restaurants</span>
              </h2>
              <p className="text-xl text-gray-600 font-poppins">
                Top-rated places in your area
              </p>
            </div>
            <Link 
              href="/restaurants"
              className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors font-poppins font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-2xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredRestaurants.map((restaurant, index) => (
                <motion.div
                  key={restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <RestaurantCard {...restaurant} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-orange-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Why Choose <span className="text-red-500">Tbib El Jou3?</span>
            </h2>
            <p className="text-xl text-gray-600 font-poppins">
              We're more than just food delivery
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ChefHat className="w-12 h-12" />,
                title: "Authentic Recipes",
                description: "Traditional Algerian dishes prepared by expert chefs",
                color: "text-orange-500"
              },
              {
                icon: <Clock className="w-12 h-12" />,
                title: "Fast Delivery",
                description: "Fresh food delivered to your door in 30 minutes or less",
                color: "text-green-500"
              },
              {
                icon: <Heart className="w-12 h-12" />,
                title: "Made with Love",
                description: "Every dish prepared with care and authentic ingredients",
                color: "text-red-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all"
              >
                <div className={`${feature.color} mb-6 flex justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-poppins">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">
              Hungry? Let's Order!
            </h2>
            <p className="text-xl mb-8 opacity-90 font-poppins">
              Join thousands of satisfied customers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/restaurants">
                <button className="bg-white text-orange-500 px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all transform hover:scale-105 font-poppins">
                  Order Now
                </button>
              </Link>
              <Link href="/signup">
                <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-orange-500 transition-all font-poppins">
                  Join Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
