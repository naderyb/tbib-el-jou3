"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChefHat, Clock, Star, Users, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  restaurantCount: number;
  avgDeliveryTime: string;
  popularDishes: string[];
}

interface Restaurant {
  id: number;
  name: string;
  cuisine_type: string;
  average_rating: number;
  delivery_time: string;
  image: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        if (mounted) setCategories(data);
      } catch (err) {
        console.error("Error loading categories:", err);
        toast.error("Failed to load categories");
      }
    };
    loadCategories();
    return () => { mounted = false; };
  }, []);

  const fetchRestaurantsByCategory = async (categoryName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/restaurants?category=${encodeURIComponent(categoryName)}`);
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      } else {
        toast.error("Failed to load restaurants");
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category.id);
    fetchRestaurantsByCategory(category.name);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Categories</h1>
              <p className="text-gray-600 text-sm">
                Discover our categories and find the best restaurants near you.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex flex-col md:flex-row md:items-center md:justify-end">
              <div className="relative w-full md:w-1/3 mr-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pr-10 pl-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <Link
                href="/restaurants"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary-dark"
              >
                <Users className="w-5 h-5" />
                <span>View All Restaurants</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="glass-card p-6 flex flex-col justify-between h-full"
              >
                <div>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{category.avgDeliveryTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">
                      {category.restaurantCount}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="mt-4 w-full bg-gradient-to-r from-primary to-terracotta text-white py-2 px-4 rounded-lg font-semibold transition-all hover:shadow-lg"
                >
                  Explore Restaurants
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600">Try adjusting your search term.</p>
            </div>
          )}
        </motion.div>

        {/* Popular Restaurants */}
        {restaurants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 font-poppins">
              Popular Restaurants
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="glass-card p-6 card-hover">
                  <img
                    src={restaurant.image || "/placeholder-restaurant.jpg"}
                    alt={restaurant.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {restaurant.name}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {restaurant.cuisine_type}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">
                        {restaurant.average_rating.toFixed(1)}
                      </span>
                    </div>
                    
                    <span className="text-sm text-gray-500">
                      {restaurant.delivery_time} min
                    </span>
                  </div>
                  
                  <Link
                    href={`/restaurants/${restaurant.id}`}
                    className="block w-full text-center bg-gradient-to-r from-primary to-terracotta text-white py-2 px-4 rounded-lg font-semibold transition-all hover:shadow-lg"
                  >
                    View Restaurant
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}