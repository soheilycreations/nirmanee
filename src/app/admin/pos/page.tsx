"use client";

import React, { useState } from "react";
import { Search, Plus, Minus, Trash2, Printer, CreditCard, ShoppingCart } from "lucide-react";

// Mock Data
const PRODUCTS = [
  { id: 1, title: "Black Board Frame Engraving", price: 1000.0, category: "Laser Engraving", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM (1).jpeg" },
  { id: 2, title: "MDF PM 86 Sublimation Clock", price: 1200.0, category: "Sublimation", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.47 PM.jpeg" },
  { id: 3, title: "Custom Wood Slice Engraving", price: 800.0, category: "Laser Engraving", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM.jpeg" },
  { id: 4, title: "Magnet Pine Wood Frame", price: 650.0, category: "Photo Frames", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.48 PM (1).jpeg" },
  { id: 5, title: "Custom Love Wooden Frame", price: 1450.0, category: "Laser Cutting", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.52 PM (1).jpeg" },
  { id: 6, title: "Photo Frame With Light", price: 2000.0, category: "Photo Frames", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.49 PM.jpeg" },
  { id: 7, title: "Hexagon Glass Photo Frame", price: 1150.0, category: "Sublimation", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.43 PM (1).jpeg" },
  { id: 8, title: "Anniversary Glass Clock", price: 1450.0, category: "Sublimation", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.45 PM.jpeg" },
  { id: 9, title: "Industrial Digital Print", price: 500.0, category: "Digital Printing", type: "standard", image: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=400&auto=format&fit=crop" },
  { id: 10, title: "Crystal Award Premium", price: 2500.0, category: "Crystal Printing", type: "standard", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop" },
  { id: 11, title: "Custom Cotton T-Shirt", price: 1500.0, category: "T-Shirt Printing", type: "standard", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=400&auto=format&fit=crop" },
  { id: 12, title: "Edible Icing Sheet", price: 800.0, category: "Edible Print", type: "standard", image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=400&auto=format&fit=crop" },
];

const CATEGORIES = ["All", "Digital Printing", "Photo Frames", "Sublimation", "Laser Engraving", "Laser Cutting", "Crystal Printing", "T-Shirt Printing"];

type CartItem = {
  cartId: string;
  product: typeof PRODUCTS[0];
  quantity: number;
  width?: number;
  height?: number;
  sqft?: number;
  calculatedPrice: number;
};

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: typeof PRODUCTS[0]) => {
    let finalPrice = product.price;
    let width = 0;
    let height = 0;

    if (product.type === "sqft") {
      width = 3;
      height = 2;
      finalPrice = product.price * (width * height);
    }

    const newItem: CartItem = {
      cartId: Math.random().toString(36).substr(2, 9),
      product,
      quantity: 1,
      width: product.type === "sqft" ? width : undefined,
      height: product.type === "sqft" ? height : undefined,
      sqft: product.type === "sqft" ? width * height : undefined,
      calculatedPrice: finalPrice,
    };

    setCart([...cart, newItem]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.cartId === cartId) {
          const newQ = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQ };
        }
        return item;
      })
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + item.calculatedPrice * item.quantity, 0);
  const tax = subtotal * 0.05; // 5% mock tax
  const total = subtotal + tax;

  return (
    <div className="flex h-full w-full">
      {/* Left Area - Products (65%) */}
      <div className="w-[65%] flex flex-col h-full bg-slate-50 border-r border-slate-200">
        {/* Header & Search */}
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all text-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-slate-800 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-sky-300 transition-all group flex flex-col"
              >
                <div className="h-32 w-full bg-slate-100 overflow-hidden relative border-b border-slate-50">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {p.type === "sqft" && (
                     <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                       SQ FT
                     </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 leading-tight mb-1 line-clamp-2">
                      {p.title}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category}</p>
                  </div>
                  <div className="mt-2 font-bold text-sky-600">
                    Rs. {p.price.toFixed(2)}
                    {p.type === "sqft" && <span className="text-[10px] text-slate-400 font-normal"> /sqft</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area - Cart (35%) */}
      <div className="w-[35%] flex flex-col bg-white h-full relative shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
        {/* Customer Info (Mock) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">Walk-in Customer</span>
            <span className="text-xs text-slate-500 font-medium">Order #10042</span>
          </div>
          <button className="text-sky-600 text-sm font-bold hover:underline">
            Add Customer
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-bold text-sm">Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartId}
                className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-50">
                  <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate pr-2 leading-none">
                      {item.product.title}
                    </h4>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-rose-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {item.product.type === "sqft" && (
                    <div className="text-[10px] text-sky-600 font-bold mb-1">
                      {item.width}ft x {item.height}ft = {item.sqft} sqft
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="font-bold text-slate-900 text-sm">
                      Rs. {(item.calculatedPrice * item.quantity).toFixed(2)}
                    </div>
                    {/* Quantity Control */}
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-0.5 border border-slate-100">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-sky-600 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-black w-5 text-center text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-sky-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Actions */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-slate-900">Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
               <span>Tax (5%)</span>
               <span className="text-slate-900">Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
              <span className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Total</span>
              <span className="text-3xl font-black text-sky-500 tracking-tight">Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 h-14 rounded-2xl border-2 border-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:border-sky-500 hover:text-sky-600 transition-all">
              <Printer className="w-4 h-4" /> Save
            </button>
            <button className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl shadow-slate-200">
              <CreditCard className="w-4 h-4" /> Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
