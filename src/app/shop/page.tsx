"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Star, 
  ShoppingCart, 
  Eye, 
  SlidersHorizontal, 
  Search, 
  ChevronDown,
  LayoutGrid,
  List,
  Heart,
  PenTool,
  Crop,
  Pipette,
  Type,
  Scissors,
  Component,
  Layers,
  MousePointer2
} from "lucide-react";
import Link from "next/link";

// Shared Mock Data
const PRODUCTS = [
  { id: 1, title: "Black Board Frame Engraving", price: 1000.0, oldPrice: null, category: "Laser Engraving", rating: 5, reviews: 12, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM (1).jpeg", badge: "Exclusive" },
  { id: 2, title: "MDF PM 86 Sublimation Clock", price: 1200.0, oldPrice: 1500.0, category: "Sublimation", rating: 5, reviews: 8, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.47 PM.jpeg", badge: "Sale" },
  { id: 3, title: "Custom Wood Slice Engraving", price: 800.0, oldPrice: null, category: "Laser Engraving", rating: 4, reviews: 24, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM.jpeg", badge: "" },
  { id: 4, title: "Magnet Pine Wood Frame", price: 650.0, oldPrice: null, category: "Photo Frames", rating: 5, reviews: 104, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.48 PM (1).jpeg", badge: "New" },
  { id: 5, title: "Custom Love Wooden Frame", price: 1450.0, oldPrice: null, category: "Laser Cutting", rating: 5, reviews: 45, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.52 PM (1).jpeg", badge: "Popular" },
  { id: 6, title: "Photo Frame With Light", price: 2000.0, oldPrice: null, category: "Photo Frames", rating: 5, reviews: 67, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.49 PM.jpeg", badge: "" },
  { id: 7, title: "Hexagon Glass Photo Frame", price: 1150.0, oldPrice: null, category: "Sublimation", rating: 4, reviews: 33, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.43 PM (1).jpeg", badge: "" },
  { id: 8, title: "Anniversary Glass Clock", price: 1450.0, oldPrice: null, category: "Sublimation", rating: 5, reviews: 89, image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.45 PM.jpeg", badge: "Elite" },
  { id: 9, title: "Industrial Digital Print", price: 500.0, category: "Digital Printing", rating: 5, reviews: 15, image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=400&auto=format&fit=crop" },
  { id: 10, title: "Crystal Award Premium", price: 2500.0, category: "Crystal Printing", rating: 5, reviews: 5, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop" },
  { id: 11, title: "Custom Cotton T-Shirt", price: 1500.0, category: "T-Shirt Printing", rating: 4, reviews: 20, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop" },
  { id: 12, title: "Edible Icing Sheet", price: 800.0, category: "Edible Print", rating: 5, reviews: 10, image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=400&auto=format&fit=crop" },
];

const CATEGORIES = [
  "All Products",
  "Digital Printing",
  "Photo Framing",
  "Mug Printing",
  "Crystal Printing",
  "Laser Cutting",
  "Wood Engraving",
  "T-Shirt Printing",
  "Others"
];

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState("Newest");
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = selectedCategory === "All Products" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => (p.category === selectedCategory));

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Minimalism Shop Header - With Floating Designer Icons - Enhanced Visibility */}
      <section className="bg-slate-50 py-16 md:py-24 border-b border-slate-100 relative overflow-hidden">
        
        {/* Decorative Floating Tool Icons (Like Home Hero) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[5%] text-slate-400/40 animate-float-0">
            <PenTool className="w-20 h-20" />
          </div>
          <div className="absolute top-[35%] right-[12%] text-slate-400/50 animate-float-1" style={{ animationDelay: '1s' }}>
            <Crop className="w-12 h-12" />
          </div>
          <div className="absolute bottom-[20%] left-[10%] text-sky-400/40 animate-float-2" style={{ animationDelay: '2s' }}>
            <Pipette className="w-14 h-14" />
          </div>
          <div className="absolute top-[5%] left-[45%] text-slate-400/40 animate-float-0" style={{ animationDelay: '3s' }}>
            <Type className="w-16 h-16" />
          </div>
          <div className="absolute bottom-[35%] right-[35%] text-indigo-400/40 animate-float-1" style={{ animationDelay: '4s' }}>
            <Scissors className="w-10 h-10" />
          </div>
          <div className="absolute top-[55%] right-[5%] text-slate-400/40 animate-float-2" style={{ animationDelay: '0.5s' }}>
            <Component className="w-12 h-12" />
          </div>
          <div className="absolute bottom-[5%] left-[30%] text-slate-400/30 animate-float-0" style={{ animationDelay: '2.5s' }}>
            <Layers className="w-20 h-20" />
          </div>
          <div className="absolute top-[20%] left-[30%] text-slate-400/40 animate-float-1" style={{ animationDelay: '1.5s' }}>
            <MousePointer2 className="w-10 h-10" />
          </div>
          
          {/* Subtle color blobs */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-sky-300/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[120px] animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-500 mb-6">
              <Link href="/" className="hover:opacity-70 transition-opacity">Home</Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">Online Shop</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.15]">
              Discover Our <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Premium Printing.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
              Explore our curated collection of high-end customized printing and engraving services.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Refined Minimalist Sidebar */}
          <aside className={`lg:w-1/4 space-y-12 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Minimalist Search */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Search</h4>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Items or keywords..."
                  className="w-full bg-slate-50 border-2 border-transparent py-4 pl-4 pr-12 rounded-2xl focus:bg-white focus:border-sky-500 transition-all outline-none font-bold text-sm"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
            </div>

            {/* Flat Category List */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Categories</h4>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`group flex items-center justify-between py-2 text-left transition-all
                      ${selectedCategory === cat 
                        ? 'text-sky-600 font-bold scale-105' 
                        : 'text-slate-400 hover:text-slate-900 font-bold'}`}
                  >
                    <span className="text-sm">{cat}</span>
                    <div className={`w-8 h-[2px] rounded-full transition-all duration-300
                      ${selectedCategory === cat ? 'bg-sky-500' : 'bg-transparent group-hover:bg-slate-200'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Price Filter */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Price Range</h4>
              <div className="px-1">
                <input type="range" className="w-full accent-slate-900 mb-4 h-1 bg-slate-100 rounded-full appearance-none cursor-pointer" min="0" max="10000" />
                <div className="flex items-center justify-between text-[13px] font-bold text-slate-900">
                  <span className="bg-slate-50 px-3 py-1 rounded-lg">Rs. 0</span>
                  <span className="bg-slate-50 px-3 py-1 rounded-lg">Rs. 10k+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Clean Main Content */}
          <div className="flex-1">
            {/* Toolbar - Ultra Clean */}
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-100">
               <div className="flex items-center gap-6">
                 <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 text-sm font-bold text-slate-900"
                  >
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>
                  <p className="hidden sm:block text-[13px] font-bold text-slate-400">
                    Showing <span className="text-slate-900 font-bold">{filteredProducts.length}</span> Results
                  </p>
               </div>

               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Sort by:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent border-none text-sm font-bold text-slate-900 outline-none cursor-pointer hover:text-sky-600 transition-colors"
                    >
                      <option>Newest</option>
                      <option>Price: Low-High</option>
                      <option>Price: High-Low</option>
                    </select>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <button className="p-2 text-slate-900"><LayoutGrid className="w-4 h-4" /></button>
                    <button className="p-2 text-slate-300 hover:text-slate-500"><List className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>

            {/* Product Grid - Minimalist Cards with Home Style Fonts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative">
                  {/* Image Container */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-slate-50 mb-6 border border-slate-100">
                    {/* Badge */}
                    {(product as any).badge && (
                      <div className="absolute top-6 left-6 z-20">
                         <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-sm">
                           {(product as any).badge}
                         </span>
                      </div>
                    )}

                    <img 
                      src={product.image} 
                      alt={(product as any).title || (product as any).name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Minimalist Hover Actions */}
                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-6 inset-x-6 z-20 flex items-center justify-center gap-2 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                       <Link 
                          href={`/product/${product.id}`}
                          className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl flex items-center justify-center gap-2"
                        >
                         <Eye className="w-5 h-5" /> Details
                       </Link>
                       <button className="w-14 h-14 bg-white text-slate-900 rounded-2xl flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all shadow-xl">
                         <ShoppingCart className="w-5 h-5" />
                       </button>
                    </div>

                    <button className="absolute top-6 right-6 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white group/heart shadow-sm">
                       <Heart className="w-4 h-4 transition-transform group-hover/heart:scale-110" />
                    </button>
                  </div>

                  {/* Product Info - Minimalist */}
                  <div className="space-y-2 px-2">
                    <div className="flex items-center justify-between uppercase tracking-widest text-[10px] font-bold text-slate-400">
                      <span>{product.category}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-slate-900">{product.rating}.0</span>
                      </div>
                    </div>
                    
                    <Link href={`/product/${product.id}`} className="block group/title">
                      <h3 className="text-lg font-black text-slate-900 leading-tight tracking-tight group-hover/title:text-sky-600 transition-colors line-clamp-2">
                        {(product as any).title || (product as any).name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xl font-black text-slate-900">
                        Rs. {product.price.toFixed(2)}
                      </span>
                      {(product as any).oldPrice && (
                        <span className="text-sm text-slate-300 line-through font-bold">
                          Rs. {(product as any).oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Refined Pagination */}
            <div className="mt-24 pt-12 border-t border-slate-50 flex items-center justify-center gap-4 text-sm font-bold">
               <button className="uppercase tracking-widest text-slate-300 hover:text-slate-900 transition-colors">Prev</button>
               <div className="flex items-center gap-2">
                 <button className="w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-xl">1</button>
                 <button className="w-12 h-12 rounded-2xl bg-white text-slate-400 hover:bg-slate-50 transition-all">2</button>
                 <button className="w-12 h-12 rounded-2xl bg-white text-slate-400 hover:bg-slate-50 transition-all">3</button>
               </div>
               <button className="uppercase tracking-widest text-slate-900 hover:text-sky-600 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
