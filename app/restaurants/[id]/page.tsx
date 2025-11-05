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
  ShoppingCart,
  Info,
  Award,
  Truck,
  Shield,
  Users
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCart } from "../../context/CartContext";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  nameArabic?: string;
  description: string;
  price: number;
  image?: string;
  isSpicy: boolean;
  isVegetarian: boolean;
  isHalal: boolean;
  calories?: number;
  prepTime?: number;
  allergens?: string[];
  ingredients?: string[];
  category: {
    name: string;
  };
  popular?: boolean;
  discount?: number;
}

interface Restaurant {
  id: string;
  name: string;
  nameArabic?: string;
  description: string;
  image: string;
  coverImage?: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  address: string;
  phone: string;
  cuisine: string[];
  menuItems: MenuItem[];
  openingHours: {
    [key: string]: string;
  };
  features: string[];
  awards?: string[];
  gallery?: string[];
}

export default function RestaurantDetail() {
  const params = useParams();
  const { addItem } = useCart();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [showGallery, setShowGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");

  useEffect(() => {
    if (params?.id) {
      fetchRestaurant();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const fetchRestaurant = async () => {
    try {
      // Enhanced mock data
      const mockRestaurant: Restaurant = {
        id: (params?.id as string) || "unknown",
        name: "Dar El Bahdja",
        nameArabic: "دار البهجة",
        description: "Experience the authentic flavors of Algeria in our traditional restaurant. We serve classic dishes prepared with the finest ingredients and time-honored recipes passed down through generations.",
        image: "/restaurants/dar-el-bahdja-cover.jpg",
        coverImage: "/restaurants/dar-el-bahdja-interior.jpg",
        rating: 4.8,
        reviewCount: 324,
        deliveryTime: "25-35 min",
        deliveryFee: 0,
        minOrder: 1500,
        address: "15 Rue Didouche Mourad, Algiers",
        phone: "+213 21 123 456",
        cuisine: ["Algerian", "Traditional", "Halal"],
        openingHours: {
          monday: "10:00-22:00",
          tuesday: "10:00-22:00",
          wednesday: "10:00-22:00",
          thursday: "10:00-22:00",
          friday: "10:00-23:00",
          saturday: "10:00-23:00",
          sunday: "12:00-22:00"
        },
        features: ["Halal Certified", "Fast Delivery", "Fresh Ingredients", "Traditional Recipes"],
        awards: ["Best Algerian Restaurant 2023", "Customer Choice Award"],
        gallery: [
          "/restaurants/dar-el-bahdja-1.jpg",
          "/restaurants/dar-el-bahdja-2.jpg",
          "/restaurants/dar-el-bahdja-3.jpg",
          "/restaurants/dar-el-bahdja-4.jpg"
        ],
        menuItems: [
          {
            id: "1",
            name: "Couscous Royal",
            nameArabic: "كسكس ملكي",
            description: "Traditional couscous with tender lamb, chicken, and seasonal vegetables. Served with rich broth and harissa on the side.",
            price: 1800,
            image: "/dishes/couscous-royal.jpg",
            isSpicy: false,
            isVegetarian: false,
            isHalal: true,
            calories: 650,
            prepTime: 30,
            allergens: ["gluten"],
            ingredients: ["couscous", "lamb", "chicken", "vegetables", "spices"],
            category: { name: "Main Dishes" },
            popular: true
          },
          {
            id: "2",
            name: "Chorba Frik",
            nameArabic: "شوربة فريك",
            description: "Hearty traditional soup with green wheat, tender meat, and aromatic herbs. Perfect comfort food.",
            price: 800,
            image: "/dishes/chorba-frik.jpg",
            isSpicy: true,
            isVegetarian: false,
            isHalal: true,
            calories: 320,
            prepTime: 20,
            category: { name: "Soups" }
          },
          {
            id: "3",
            name: "Tajine Zitoune",
            nameArabic: "طاجين زيتون",
            description: "Slow-cooked chicken with green olives, preserved lemons, and traditional spices in a clay tajine.",
            price: 1600,
            image: "/dishes/tajine-zitoune.jpg",
            isSpicy: false,
            isVegetarian: false,
            isHalal: true,
            calories: 520,
            prepTime: 45,
            category: { name: "Main Dishes" }
          },
          {
            id: "4",
            name: "Bourek",
            nameArabic: "بوراك",
            description: "Crispy phyllo pastry filled with seasoned meat and herbs. Served with fresh salad.",
            price: 600,
            image: "/dishes/bourek.jpg",
            isSpicy: false,
            isVegetarian: false,
            isHalal: true,
            calories: 280,
            prepTime: 15,
            category: { name: "Appetizers" },
            popular: true
          },
          {
            id: "5",
            name: "Makroud",
            nameArabic: "مقروض",
            description: "Traditional semolina pastries filled with dates and nuts, delicately flavored with orange blossom water.",
            price: 400,
            image: "/dishes/makroud.jpg",
            isSpicy: false,
            isVegetarian: true,
            isHalal: true,
            calories: 180,
            prepTime: 10,
            category: { name: "Desserts" }
          },
          {
            id: "6",
            name: "Mechoui",
            nameArabic: "مشوي",
            description: "Slow-roasted lamb shoulder with traditional Algerian spices. Served with roasted vegetables.",
            price: 2200,
            image: "/dishes/mechoui.jpg",
            isSpicy: true,
            isVegetarian: false,
            isHalal: true,
            calories: 780,
            prepTime: 40,
            category: { name: "Grilled" },
            popular: true,
            discount: 10
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

  const increment = (id: string) => {
    setQuantities(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id: string) => {
    setQuantities(prev => {
      const next = { ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) };
      return next;
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    const qty = quantities[item.id] || 1;
    addItem({ ...item, quantity: qty } as any);
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!restaurant) {
    return <div>Restaurant not found.</div>;
  }

  const categories = Array.from(new Set(restaurant.menuItems.map(mi => mi.category.name)));
  const filtered = restaurant.menuItems.filter(mi => {
    const matchesCategory = selectedCategory === "All" || mi.category.name === selectedCategory;
    const matchesSearch = mi.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <header>
        <h1>{restaurant.name}</h1>
        <p>{restaurant.description}</p>
        <div>
          <Star /> {restaurant.rating} ({restaurant.reviewCount})
        </div>
      </header>

      <section>
        <div>
          <input
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="All">All</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          {filtered.map(item => (
            <div key={item.id} style={{ border: "1px solid #ddd", padding: 8, margin: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {item.image && (
                  <div style={{ width: 120, height: 80, position: "relative" }}>
                    <Image src={item.image} alt={item.name} fill style={{ objectFit: "cover" }} />
                  </div>
                )}
                <div>
                  <h3>{item.name} {item.discount ? `(${item.discount}% off)` : ""}</h3>
                  <p>{item.description}</p>
                  <div>{item.price} DZD</div>
                  <div>
                    <button onClick={() => decrement(item.id)}><Minus size={14} /></button>
                    <span style={{ margin: "0 8px" }}>{quantities[item.id] || 0}</span>
                    <button onClick={() => increment(item.id)}><Plus size={14} /></button>
                    <button onClick={() => handleAddToCart(item)} style={{ marginLeft: 12 }}>
                      <ShoppingCart /> Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}