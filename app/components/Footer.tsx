"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Star,
  Heart,
  Quote,
} from "lucide-react";

const QUOTES = [
  {
    text: "Food is our common ground, a universal experience.",
    author: "James Beard",
  },
  {
    text: "Good food is the foundation of genuine happiness.",
    author: "Auguste Escoffier",
  },
  {
    text: "Algerian cuisine is a journey through history on a plate.",
    author: "Tbib El Jou3",
  },
  {
    text: "People who love to eat are always the best people.",
    author: "Julia Child",
  },
];

export default function Footer() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quickLinks = [
    { href: "/restaurants", label: "Restaurants" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Youtube className="w-5 h-5" />, href: "#", label: "YouTube" },
  ];

  useEffect(() => {
    if (QUOTES.length <= 1) return;

    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Zelij Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: "url('/zelij.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "100px 100px",
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-terracotta rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="text-2xl font-bold font-poppins">
                  Tbib El Jou3
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Bringing authentic Algerian cuisine to your doorstep. Experience
                the rich flavors and traditions of Algeria with every bite.
              </p>
              <div className="flex items-center space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 bg-gray-700 hover:bg-primary rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all duration-200 mr-0 group-hover:mr-2"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-6">Contact Info</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-300">123 Didouche Mourad Street</p>
                    <p className="text-gray-300">Algiers, Algeria</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <p className="text-gray-300">+213 21 123 456</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <p className="text-gray-300">tbibeljou3@gmail.dz</p>
                </div>
              </div>
            </motion.div>

            {/* Rotating Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-end justify-between text-right h-full pr-4"
            >
              <h3 className="text-xl font-bold mb-6">Today&apos;s Thought</h3>
              <div className="max-w-xs bg-gray-900/60 border border-gray-700 rounded-xl p-5 shadow-lg">
                <Quote className="w-5 h-5 text-primary mb-3" />
                <p className="text-gray-200 italic mb-3">
                  &ldquo;{QUOTES[quoteIndex].text}&rdquo;
                </p>
                <p className="text-sm text-gray-400 text-right">
                  - {QUOTES[quoteIndex].author}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400"
            >
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Made with love in Algeria</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>© 2025 Tbib El Jou3. All rights reserved.</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>4.9 Rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
}
