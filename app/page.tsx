"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import HeroSection from "./components/HeroSection";
import StepByStepGuide from "./components/StepByStepGuide";
import NewsletterSignup from "./components/NewsletterSignup";

function trackEvent(eventName: any) {
  // Placeholder for analytics event tracking
  console.log(`Event tracked: ${eventName}`);
}

export default function Home() {
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    // Newsletter Popup nach 30 Sekunden oder bei Mausverlassen anzeigen
    const timer = setTimeout(() => {
      setShowNewsletter(true);
    }, 30000);

    const handleMouseLeave = (e: { clientY: number; }) => {
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

  const scrollToHero = () => {
    document.getElementById("hero-section")?.scrollIntoView({ behavior: "smooth" });
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
      <div id="hero-section">
        <HeroSection onCTAClick={scrollToHero} />
      </div>

      {/* Step by Step Guide - NEU HINZUGEFÜGT */}
      <StepByStepGuide />

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="text-4xl">🚚</div>
              <h3 className="font-bold text-gray-800">Kostenloser Versand</h3>
              <p className="text-gray-600 text-sm">ab 29€ Bestellwert</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <div className="text-4xl">⭐</div>
              <h3 className="font-bold text-gray-800">4.9/5 Sterne</h3>
              <p className="text-gray-600 text-sm">über 5.000 Bewertungen</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="text-4xl">🔒</div>
              <h3 className="font-bold text-gray-800">Sicher bezahlen</h3>
              <p className="text-gray-600 text-sm">PayPal, Klarna & mehr</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="text-4xl">📱</div>
              <h3 className="font-bold text-gray-800">TikTok Viral</h3>
              <p className="text-gray-600 text-sm">Millionen Views</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">
            Was unsere Kunden sagen 💕
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah, 24",
                text: "Die japanischen Kit-Kats sind einfach unglaublich! Schmecken genau wie im TikTok Video 😍",
                rating: 5,
                platform: "TikTok",
              },
              {
                name: "Mike, 19",
                text: "Mega schnelle Lieferung und die Sour Patch Kids sind original aus den USA. Top!",
                rating: 5,
                platform: "Instagram",
              },
              {
                name: "Lisa, 22",
                text: "Endlich kann ich alle Süßigkeiten probieren, die ich auf Social Media sehe. Danke!",
                rating: 5,
                platform: "TikTok",
              },
            ].map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg"
              >
                <div className="flex justify-center mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{review.text}"</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-gray-800">{review.name}</span>
                  <span className="text-sm text-gray-500">
                    via {review.platform}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                <a href="#" className="text-pink-400 hover:text-pink-300">
                  📱 TikTok
                </a>
                <a href="#" className="text-pink-400 hover:text-pink-300">
                  📷 Instagram
                </a>
                <a href="#" className="text-pink-400 hover:text-pink-300">
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