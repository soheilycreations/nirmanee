import Link from "next/link";
import { Star, ShoppingCart, Eye } from "lucide-react";

// Mock Data
const PRODUCTS = [
  { id: 1, title: "Black Board Frame Engraving", price: 1000.0, oldPrice: null, category: "Laser Engraving", rating: 5, reviews: 12, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM (1).jpeg", badge: "Hot" },
  { id: 2, title: "MDF PM 86 Sublimation Clock", price: 1200.0, oldPrice: 1500.0, category: "Sublimation", rating: 5, reviews: 8, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.47 PM.jpeg", badge: "Sale" },
  { id: 3, title: "Custom Wood Slice Engraving", price: 800.0, oldPrice: null, category: "Laser Engraving", rating: 4, reviews: 24, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM.jpeg", badge: "" },
  { id: 4, title: "Magnet Pine Wood Frame", price: 650.0, oldPrice: null, category: "Photo Frames", rating: 5, reviews: 104, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.48 PM (1).jpeg", badge: "New" },
  { id: 5, title: "Custom Love Wooden Frame", price: 1450.0, oldPrice: null, category: "Laser Cutting", rating: 5, reviews: 45, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.52 PM (1).jpeg", badge: "Popular" },
  { id: 6, title: "Photo Frame With Light (8x10)", price: 2000.0, oldPrice: null, category: "Photo Frames", rating: 5, reviews: 67, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.49 PM.jpeg", badge: "" },
  { id: 7, title: "Hexagon Glass Photo Frame", price: 1150.0, oldPrice: null, category: "Sublimation", rating: 4, reviews: 33, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.43 PM (1).jpeg", badge: "" },
  { id: 8, title: "Anniversary Glass Clock Frame", price: 1450.0, oldPrice: null, category: "Sublimation", rating: 5, reviews: 89, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.45 PM.jpeg", badge: "Hot" },
];

export default function HotProducts() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Hot Sale Products</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Discover our most popular and trending customized printing products. High quality guaranteed.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="group flex flex-col items-center">
              {/* Image Box */}
              <div className="relative w-full aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-4 p-6 flex items-center justify-center">
                {product.badge && (
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold text-white
                    ${product.badge === 'Hot' ? 'bg-rose-500' : 
                      product.badge === 'New' ? 'bg-sky-500' : 'bg-green-500'}`}
                  >
                    {product.badge}
                  </div>
                )}
                
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-700 hover:text-sky-500 hover:scale-110 transition-all translate-y-4 group-hover:translate-y-0 duration-300">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-sky-500 shadow-lg flex items-center justify-center text-white hover:bg-sky-600 hover:scale-110 transition-all translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="text-center w-full">
                <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-1">
                  {product.category}
                </p>
                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="text-sm font-bold text-slate-800 mb-2 hover:text-sky-500 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                </Link>
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3.5 h-3.5 ${i < product.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} 
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-1">({product.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    Rs. {product.price.toFixed(2)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      Rs. {product.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 rounded-full border-2 border-slate-200 text-slate-700 font-bold hover:border-sky-500 hover:text-sky-500 transition-colors">
            Load More Products
          </button>
        </div>
      </div>
    </section>
  );
}
