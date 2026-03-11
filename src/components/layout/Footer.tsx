import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & About */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <img src="/images/upload/logo.jpeg" alt="Nirmanee Print House Logo" className="w-12 h-12 rounded object-cover shadow-sm bg-white" />
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-white leading-none">
                  Nirmanee
                </span>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] leading-none mt-1">
                  Print House
                </span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your trusted partner for all printing and personalization needs since 2005. High quality, reliable, and perfectly designed.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-sky-500 hover:text-white transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">About Us</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Shop All Products</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Returns & Exchanges</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Track Order</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg mb-6">Categories</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Mugs & Cups</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">T-Shirts & Apparel</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Posters & Banners</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Stationery Items</Link></li>
              <li><Link href="/" className="text-slate-400 hover:text-sky-400 transition-colors text-sm">Photo Frames</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col">
            <h4 className="text-white font-bold text-lg mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="flex flex-col text-slate-400 text-sm">
                  <span>WhatsApp: 077 92 33 822</span>
                  <span>Tel: 034 20 400 29</span>
                </div>
              </li>
              <li className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0" />
                <span className="text-slate-400 text-sm">Open Hours:<br/>MON - SUN 8.30 AM - 5.30 PM</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-sky-400 shrink-0" />
                <span className="text-slate-400 text-sm">www.nirmanee.lk</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs font-bold rounded-md">
                  Islandwide Delivery Available
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Nirmanee Digital Print House. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
             {/* Mocking payment methods with simple colored boxes/icons */}
             <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-[10px] font-bold text-blue-800">VISA</div>
             <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-[10px] font-bold text-red-600">CARD</div>
             <div className="h-8 w-12 bg-white rounded flex items-center justify-center text-[10px] font-bold text-slate-800">CASH</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
