import Link from "next/link";
import { Search, User, ShoppingCart, Menu, Heart, Phone } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md sticky top-0 border-b border-slate-100 z-50 transition-all duration-300">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="bg-sky-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Special Offer
          </span>
          <span className="hidden sm:inline">Get 20% off your first web order! Use code: NIRMANEE20</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <a href="tel:+94779233822" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone className="w-3 h-3" />
            <span className="hidden sm:inline">+94 77 923 3822</span>
          </a>
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-700 pl-4">
            <Link href="/admin" className="hover:text-sky-400 transition-colors mr-2">Admin Panel</Link>
            <button className="hover:text-white transition-colors">English</button>
            <span>/</span>
            <button className="hover:text-white transition-colors">LKR</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-5 flex items-center justify-between">
        {/* Mobile Menu */}
        <button className="lg:hidden p-2 text-slate-600 hover:text-sky-500 transition-colors">
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-sky-400 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            <img
              src="/images/upload/logo.jpeg"
              alt="Nirmanee Print House Logo"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full shadow-md border-2 border-white object-cover bg-white relative z-10 transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 leading-none group-hover:text-sky-600 transition-colors">
              Nirmanee
            </span>
            <span className="text-[10px] md:text-xs font-bold text-sky-500 uppercase tracking-[0.2em] leading-none mt-1">
              Digital Print House
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-sky-500 font-bold text-sm hover:text-sky-600 transition-colors relative group">
            Home
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-sky-500 rounded-full" />
          </Link>
          <Link href="/shop" className="text-slate-600 font-medium text-sm hover:text-sky-500 transition-colors relative group">
            Shop
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 rounded-full transition-all group-hover:w-full" />
          </Link>
          <Link href="/services" className="text-slate-600 font-medium text-sm hover:text-sky-500 transition-colors relative group">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 rounded-full transition-all group-hover:w-full" />
          </Link>
          <Link href="/about" className="text-slate-600 font-medium text-sm hover:text-sky-500 transition-colors relative group">
            About Us
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 rounded-full transition-all group-hover:w-full" />
          </Link>
          <Link href="/contact" className="text-slate-600 font-medium text-sm hover:text-sky-500 transition-colors relative group">
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 rounded-full transition-all group-hover:w-full" />
          </Link>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button className="p-2 text-slate-500 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all hidden sm:block">
            <User className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-sky-500 hover:bg-sky-50 rounded-full transition-all hidden sm:block">
            <Heart className="w-5 h-5" />
          </button>
          <Link href="/shop" className="flex items-center gap-3 group ml-2">
            <div className="relative p-2 bg-sky-50 group-hover:bg-sky-100 rounded-full transition-colors text-sky-600">
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                0
              </span>
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-[10px] text-slate-500 font-medium leading-none mb-1">Your Cart</span>
              <span className="text-sm font-extrabold text-slate-900 leading-none">Rs. 0.00</span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
