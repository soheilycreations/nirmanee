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
  { id: 6, title: "Photo Frame With Light (8x10)", price: 2000.0, category: "Photo Frames", type: "standard", image: "/images/upload/WhatsApp Image 2026-03-11 at 11.48.49 PM.jpeg" },
];

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

  const categories = ["All", "Laser Engraving", "Laser Cutting", "Sublimation", "Photo Frames", "Banners"];

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: typeof PRODUCTS[0]) => {
    // If it's a sqft product, prompt for dimensions in a real app, here we mock it
    let finalPrice = product.price;
    let width = 0;
    let height = 0;

    if (product.type === "sqft") {
      // Mocking a default 3x2 (6 sqft) for the initial click, 
      // User can edit later in a real production flow
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
      {/* Left Area - Products (70%) */}
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
            {categories.map((cat) => (
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
                <div className="h-32 w-full bg-slate-100 overflow-hidden relative">
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
                    <h3 className="text-sm font-semibold text-slate-800 leading-tight mb-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400">{p.category}</p>
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
            <span className="text-xs text-slate-500">Order #10042</span>
          </div>
          <button className="text-sky-600 text-sm font-medium hover:underline">
            Add Customer
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.cartId}
                className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img src={item.product.image} alt={item.product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-slate-800 truncate pr-2">
                      {item.product.title}
                    </h4>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-rose-400 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {item.product.type === "sqft" && (
                    <div className="text-xs text-sky-600 font-medium mb-1">
                      {item.width}ft x {item.height}ft = {item.sqft} sqft (Edit)
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="font-bold text-slate-800 text-sm">
                      Rs. {(item.calculatedPrice * item.quantity).toFixed(2)}
                    </div>
                    {/* Quantity Control */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-sky-600">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-slate-600 hover:text-sky-600">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Actions */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Tax (5%)</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between items-end">
              <span className="text-sm font-semibold text-slate-800">Total</span>
              <span className="text-2xl font-bold text-sky-500">Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-sky-400 hover:text-sky-600 transition-colors">
              <Printer className="w-5 h-5" />
              Save Draft
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/30">
              <CreditCard className="w-5 h-5" />
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
