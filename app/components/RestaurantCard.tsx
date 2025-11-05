"use client";

import Link from "next/link";
import { Star, MapPin, Clock, Truck, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface RestaurantCardProps {
  id: string;
  name: string;
  logo?: string;
  type: string;
  location: string;
  rating: number;
  deliveryTime?: string;
  deliveryFee?: string;
  isOpen?: boolean;
  featured?: boolean;
}

export default function RestaurantCard({
  id,
  name,
  logo,
  type,
  location,
  rating,
  deliveryTime = "25-35 min",
  deliveryFee = "Free",
  isOpen = true,
  featured = false,
}: RestaurantCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group relative"
    >
      <Link href={`/restaurant/${id}`}>
        <div className="glass-card overflow-hidden relative">
          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Featured
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "text-red-500 fill-current" : "text-gray-400"
              }`}
            />
          </button>

          {/* Image Container */}
          <div className="relative h-56 overflow-hidden">
            {logo ? (
              <div className="relative w-full h-full">
                <img
                  src={logo}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary via-terracotta to-deepblue relative overflow-hidden">
                <span className="text-white text-5xl font-bold z-10">
                  {name[0]}
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="absolute bottom-4 left-4">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                  isOpen
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isOpen ? "bg-white" : "bg-white"
                  }`}
                ></div>
                <span>{isOpen ? "Open" : "Closed"}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">
                {name}
              </h3>
              <p className="text-gray-600 font-medium">{type}</p>
            </div>

            {/* Info Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-semibold text-gray-900">
                    {rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span>{deliveryTime}</span>
                </div>
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-gray-400" />
                  <span
                    className={
                      deliveryFee === "Free"
                        ? "text-green-600 font-medium"
                        : ""
                    }
                  >
                    {deliveryFee === "Free" ? "Free delivery" : deliveryFee}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6">
              <button className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                View Menu
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
