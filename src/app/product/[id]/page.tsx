"use client";

import { useState, use } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { 
  Star, 
  ShoppingCart, 
  Upload, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Sparkles,
  Heart,
  Plus,
  Minus,
  Palette,
  Maximize2,
  Box,
  Send
} from "lucide-react";
import Link from "next/link";

// Mock Database of Products
const ALL_PRODUCTS: Record<string, any> = {
  "1": {
    id: 1,
    title: "Black Board Frame Engraving",
    price: 1000.0,
    oldPrice: 1500.0,
    description: "Create a lasting memory with our premium Black Board Frame Engraving. Ideal for wedding portraits, anniversary gifts, or corporate awards. Our high-precision laser technology ensures every detail of your photograph is captured on the matte black surface.",
    category: "Laser Engraving",
    rating: 5,
    reviewsCount: 12,
    images: [
      "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM (1).jpeg",
      "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM.jpeg",
      "/images/upload/WhatsApp Image 2026-03-11 at 11.48.52 PM (1).jpeg"
    ],
    variants: {
      sizes: ["8x10 Inch", "10x12 Inch", "12x18 Inch"],
      colors: ["Matte Black", "Oak Wood", "Dark Walnut"],
      materials: ["MDF Wood", "Natural Pine", "Premium Acrylic"]
    },
    specs: [
      { label: "Technique", value: "High-Precision Laser" },
      { label: "Origin", value: "Nirmanee Workshop" },
      { label: "Finish", value: "Anti-Scratch Matte" }
    ],
    reviews: [
      { id: 1, user: "Amila Perera", rating: 5, date: "2 days ago", comment: "The detail on the engraving is unbelievable! High quality work." },
      { id: 2, user: "Samanthi Silva", rating: 4, date: "1 week ago", comment: "Very beautiful gift. Fast delivery too." }
    ]
  },
  "2": {
    id: 2,
    title: "MDF PM 86 Sublimation Clock",
    price: 1200.0,
    oldPrice: 1500.0,
    category: "Sublimation",
    rating: 5,
    reviewsCount: 8,
    images: ["/images/upload/WhatsApp Image 2026-03-11 at 11.48.47 PM.jpeg"],
    variants: {
      sizes: ["Standard Round", "Large Square"],
      colors: ["White High Gloss", "Natural Wood"],
      materials: ["MDF Wood", "Glass Finish"]
    },
    description: "High-quality sublimation clock that can be customized with your favorite photos. Perfect for living rooms and offices.",
    specs: [{ label: "Battery", value: "1x AA Required" }],
    reviews: []
  },
  // Add other products as needed...
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = ALL_PRODUCTS[id] || ALL_PRODUCTS["1"]; // Fallback to 1

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.variants.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.variants.colors[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(product.variants.materials[0]);
  
  const [customText, setCustomText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setUploadedFiles(Array.from(e.target.files));
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-slate-50 border-b border-slate-100 py-4">
        <div className="container mx-auto px-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <Link href="/" className="hover:text-sky-500">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-sky-500">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900">{product.title}</span>
        </div>
      </div>

      <section className="py-12 md:py-20 lg:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Left: Product Gallery */}
            <div className="lg:w-1/2 space-y-6">
              <div className="relative aspect-square rounded-[3.5rem] overflow-hidden bg-slate-50 border border-slate-100 group shadow-sm">
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <button className="absolute top-8 right-8 w-14 h-14 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-xl">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative flex-shrink-0 w-24 h-24 rounded-[2rem] overflow-hidden border-2 transition-all
                      ${selectedImage === idx ? 'border-sky-500 scale-105 shadow-xl' : 'border-slate-50 hover:border-slate-200'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="lg:w-1/2">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < product.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">({product.reviewsCount} reviews)</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-slate-100">
                  <span className="text-4xl font-black text-slate-900 tracking-tight">Rs. {product.price.toFixed(2)}</span>
                  {product.oldPrice && (
                    <span className="text-lg text-slate-300 line-through font-bold">Rs. {product.oldPrice.toFixed(2)}</span>
                  )}
                </div>

                {/* VARIANT SELECTORS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {/* Size Select */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                       <Maximize2 className="w-3.5 h-3.5" /> Dimensions
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.sizes.map((size: string) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border-2
                            ${selectedSize === size ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Select */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                       <Palette className="w-3.5 h-3.5" /> Color & Finish
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.colors.map((color: string) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border-2
                            ${selectedColor === color ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Material Select */}
                <div className="space-y-4 mb-12">
                  <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                     <Box className="w-3.5 h-3.5" /> Premium Materials
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.materials.map((mat: string) => (
                      <button
                        key={mat}
                        onClick={() => setSelectedMaterial(mat)}
                        className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border-2
                          ${selectedMaterial === mat ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CUSTOMIZATION CENTER */}
                <div className="bg-slate-50 rounded-[3rem] p-10 space-y-10 border border-slate-100 shadow-sm mb-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-sky-500" /> Customization Studio
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <label className="group relative w-full h-40 border-2 border-dashed border-slate-200 hover:border-sky-500 bg-white hover:bg-sky-50/20 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all">
                      <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                      <Upload className="w-8 h-8 text-slate-300 group-hover:text-sky-500 group-hover:scale-110 transition-all mb-3" />
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-600">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} files attached` : 'Upload Reference Photos'}
                      </span>
                    </label>
                    <textarea 
                      placeholder="Share your ideas... (Text to engrave, special requests, font styles)"
                      className="w-full h-32 bg-white border-2 border-slate-100 p-6 rounded-3xl text-sm font-bold text-slate-900 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Add to Cart Area */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1.5">
                    <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="w-10 text-center font-black text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-sky-600 transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button className="flex-1 h-16 bg-slate-900 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95">
                    <ShoppingCart className="w-5 h-5 text-sky-400" /> Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS & REVIEWS FORM */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* Review List */}
            <div className="space-y-12">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest text-sm">Customer Stories</h2>
              <div className="space-y-8">
                {product.reviews.length > 0 ? product.reviews.map((rev: any) => (
                  <div key={rev.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center text-sky-600 font-black text-xs">
                           {rev.user.charAt(0)}
                         </div>
                         <div>
                           <h4 className="text-sm font-black text-slate-900 tracking-tight">{rev.user}</h4>
                           <span className="text-[10px] text-slate-400 font-bold uppercase">{rev.date}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic">"{rev.comment}"</p>
                  </div>
                )) : (
                  <p className="text-slate-400 font-bold text-sm italic">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>
            </div>

            {/* Post a Review Form */}
            <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest text-[12px]">Drop a Review</h3>
              <div className="space-y-6">
                 <div>
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 block">Your Rating</label>
                   <div className="flex items-center gap-2">
                     {[...Array(5)].map((_, i) => (
                       <button 
                         key={i} 
                         onClick={() => setNewReview({...newReview, rating: i+1})}
                         className="group"
                       >
                         <Star className={`w-8 h-8 transition-all ${i < newReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100 group-hover:text-amber-200'}`} />
                       </button>
                     ))}
                   </div>
                 </div>
                 <textarea 
                   placeholder="How was the quality? Did you love the customization?"
                   className="w-full h-40 bg-slate-50 border-none p-6 rounded-3xl text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-sky-500/5 transition-all resize-none"
                 />
                 <button className="w-full h-16 bg-sky-500 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3">
                   <Send className="w-4 h-4" /> Share My Review
                 </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
