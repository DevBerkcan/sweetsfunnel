import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { FunnelTracker } from '../../lib/funnel';
import { trackEvent } from '../../lib/tracking'; 

export default function ProductCard({ product }) {
  const [isLiked, setIsLiked] = useState(false);
  const funnel = new FunnelTracker();

  const handleInterest = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      funnel.trackInterest(product.name);
      trackEvent('add_to_wishlist', {
        currency: 'EUR',
        value: product.price,
        items: [{ item_name: product.name, price: product.price }]
      });
    }
  };

  const handleAddToCart = () => {
    trackEvent('add_to_cart', {
      currency: 'EUR',
      value: product.price,
      items: [{ item_name: product.name, price: product.price }]
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden group"
    >
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleInterest}
            className={`p-2 rounded-full ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} shadow-lg`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
        {product.isNew && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            🆕 NEU
          </div>
        )}
        {product.discount && (
          <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
            -{product.discount}%
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
          ))}
          <span className="text-sm text-gray-600 ml-1">({product.reviews})</span>
        </div>
        
        <h3 className="font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {product.oldPrice && (
              <span className="text-gray-400 line-through text-sm">€{product.oldPrice}</span>
            )}
            <span className="text-xl font-bold text-pink-600">€{product.price}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Kaufen
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}