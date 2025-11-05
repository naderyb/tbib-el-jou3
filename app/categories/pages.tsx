"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import Link from "next/link";

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const categories = [
    {
      id: "algerian-traditional",
      name: "Traditional Algerian",
      emoji: "🥘",
      description: "Authentic dishes from Algeria",
      count: 45,
      color: "from-emerald-500 to-teal-600",
      restaurants: ["Dar El Maghreb", "Atlas Kitchen", "Kasbah Delights"]
    },
    {
      id: "couscous",
      name: "Couscous",
      emoji: "🍚",
      description: "Traditional couscous varieties",
      count: 28,
      color: "from-amber-500 to-orange-600",
      restaurants: ["Couscous Palace", "Berber Kitchen"]
    },
    {
      id: "tagines",
      name: "Tagines",
      emoji: "🍲",
      description: "Slow-cooked Moroccan-style tagines",
      count: 32,
      color: "from-red-500 to-pink-600",
      restaurants: ["Marrakech Express", "Sahara Nights"]
    },
    {
      id: "grilled-meats",
      name: "Grilled Meats",
      emoji: "🍖",
      description: "Fresh grilled kebabs and meats",
      count: 38,
      color: "from-purple-500 to-indigo-600",
      restaurants: ["Fire Grill", "Meat Masters"]
    },
    {
      id: "pastries",
      name: "Pastries & Sweets",
      emoji: "🧁",
      description: "Traditional Algerian pastries",
      count: 22,
      color: "from-pink-500 to-rose-600",
      restaurants: ["Sweet Dreams", "Baklava House"]
    },
    {
      id: "pizza",
      name: "Pizza",
      emoji: "🍕",
      description: "Italian and fusion pizzas",
      count: 18,
      color: "from-yellow-500 to-amber-600",
      restaurants: ["Pizza Corner", "Italiano"]
    },
    {
      id: "burgers",
      name: "Burgers",
      emoji: "🍔",
      description: "American and local burgers",
      count: 15,
      color: "from-blue-500 to-cyan-600",
      restaurants: ["Burger Palace", "Grill House"]
    },
    {
      id: "healthy",
      name: "Healthy Options",
      emoji: "🥗",
      description: "Fresh salads and healthy meals",
      count: 25,
      color: "from-green-500 to-emerald-600",
      restaurants: ["Green Garden", "Fresh Bowl"]
    },
    {
      id: "beverages",
      name: "Beverages",
      emoji: "🧃",
      description: "Traditional and modern drinks",
      count: 35,
      color: "from-cyan-500 to-blue-600",
      restaurants: ["Juice Bar", "Tea House"]
    }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-arabic">
            Food Categories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of authentic Algerian and international cuisines
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                <option value="popular">Most Popular</option>
                <option value="new">Newest</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Link href={`/categories/${category.id}`}>
                <div className="glass-card p-6 text-center hover:shadow-2xl transition-all duration-300">
                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${category.color} rounded-full flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {category.emoji}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{category.description}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>{category.count} dishes</span>
                    <span>•</span>
                    <span>{category.restaurants.length} restaurants</span>
                  </div>

                  {/* Restaurants Preview */}
                  <div className="text-xs text-gray-400">
                    {category.restaurants.slice(0, 2).join(", ")}
                    {category.restaurants.length > 2 && ` +${category.restaurants.length - 2} more`}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <button className="btn-primary text-sm py-2">
                      Explore Category
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}