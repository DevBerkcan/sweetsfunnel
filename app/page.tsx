"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import HeroSection from "./components/HeroSection";
import ProductCard from "./components/ProductCard";
import NewsletterSignup from "./components/NewsletterSignup";

const sampleProducts = [
  {
    id: 1,
    name: "Japanische Kit-Kat Matcha",
    description: "Exklusive Matcha-Geschmack aus Japan",
    price: 8.99,
    oldPrice: 12.99,
    discount: 31,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300",
    rating: 5,
    reviews: 247,
    isNew: true,
  },
  {
    id: 2,
    name: "Amerikanische Sour Patch Kids",
    description: "Original US-Import, super sauer!",
    price: 5.49,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=300",
    rating: 4,
    reviews: 156,
  },
  {
    id: 3,
    name: "Koreanische Honey Butter Chips",
    description: "Viral auf TikTok - süß & salzig",
    price: 6.99,
    oldPrice: 8.99,
    discount: 22,
    image: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=300",
    rating: 5,
    reviews: 189,
    isNew: true,
  },
  {
    id: 4,
    name: "Brasilianische Brigadeiro",
    description: "Traditionelle Schokoladenkugeln",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300",
    rating: 4,
    reviews: 98,
  },
];

function trackEvent(eventName: string) {
  // Placeholder for analytics event tracking
  // e.g., window.gtag?.('event', eventName);
  console.log(`Event tracked: ${eventName}`);
}

export default function Home() {
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    // Newsletter Popup nach 30 Sekunden oder bei Mausverlassen anzeigen
    const timer = setTimeout(() => {
      setShowNewsletter(true);
    }, 30000);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowNewsletter(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>Sweets aus aller Welt - Süßigkeiten & Snacks Online kaufen</title>
        <meta
          name="description"
          content="Entdecke einzigartige Süßigkeiten aus über 30 Ländern. Von japanischen Kit-Kats bis amerikanischen Sour Patch Kids. 50.000+ zufriedene Kunden!"
        />
        <meta
          name="keywords"
          content="süßigkeiten, snacks, international, japan, usa, korea, süßes, online shop"
        />
        <meta
          property="og:title"
          content="Sweets aus aller Welt - Deine süße Reise beginnt hier"
        />
        <meta
          property="og:description"
          content="Über 50.000 zufriedene Kunden! Entdecke einzigartige Süßigkeiten aus aller Welt."
        />
        <meta property="og:image" content="/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <HeroSection onCTAClick={scrollToProducts} />

  
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Sweets Welt
              </h3>
              <p className="text-gray-400 mb-4">
                Deine Quelle für einzigartige Süßigkeiten aus aller Welt. Über
                50.000 zufriedene Kunden vertrauen uns!
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-pink-400 hover:text-pink-300"
                >
                  📱 TikTok
                </a>
                <a
                  href="#"
                  className="text-pink-400 hover:text-pink-300"
                >
                  📷 Instagram
                </a>
                <a
                  href="#"
                  className="text-pink-400 hover:text-pink-300"
                >
                  📘 Facebook
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Shop</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Alle Produkte
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Bestseller
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Neue Produkte
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Sale
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Kontakt
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Versand
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Rückgabe
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Impressum
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Datenschutz
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    AGB
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Widerruf
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Sweets aus aller Welt. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </>
  );
}