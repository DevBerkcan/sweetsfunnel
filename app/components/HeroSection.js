// components/HeroSection.js
import { motion } from 'framer-motion';
import { ArrowRight, Play, Users, Award } from 'lucide-react';

export default function HeroSection({ onCTAClick }) {
  const handleCTAClick = () => {
    trackEvent('cta_click', { section: 'hero', action: 'scroll_to_products' });
    onCTAClick();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10 + i,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {['🍭', '🍬', '🧁', '🍪', '🍰', '🎂'][i % 6]}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-lg">
              <Users className="w-5 h-5 text-pink-500" />
              <span className="font-bold text-gray-700">50.000+ Kunden</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-lg">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-700">TikTok Viral</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              SWEETS
            </span>
            <br />
            <span className="text-gray-800">aus aller</span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
              WELT! 🌍
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Entdecke einzigartige Süßigkeiten und Snacks aus über 30 Ländern. 
            <strong> Deine süße Reise beginnt hier!</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCTAClick}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
            >
              🍬 Jetzt entdecken
              <ArrowRight className="w-6 h-6" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 backdrop-blur-sm text-gray-800 text-xl font-bold py-4 px-8 rounded-2xl shadow-xl border-2 border-gray-200 hover:border-pink-300 transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 text-pink-500" />
              TikTok Videos
            </motion.button>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            🍭
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}