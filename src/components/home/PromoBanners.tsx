import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function PromoBanners() {
  return (
    <section className="py-12 bg-white container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Promo 1: Sublimation/Gifts */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-sky-50 group min-h-[350px] flex items-center p-8 sm:p-12 border border-sky-100 shadow-sm transition-all hover:shadow-xl">
          {/* Background Image - User's Sublimation/Clock Flyer */}
          <div className="absolute right-0 bottom-0 w-1/2 h-full">
            <img 
              src="/images/upload/WhatsApp Image 2026-03-11 at 11.48.47 PM.jpeg" 
              alt="Sublimation Gifts" 
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
            />
          </div>
          
          <div className="relative z-10 max-w-[65%]">
            <span className="inline-block px-4 py-1.5 bg-sky-500 text-white text-xs font-black rounded-full mb-6 tracking-widest uppercase">
              Limited Offer
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tighter">
              Custom <br />
              <span className="text-sky-600">Sublimation</span> <br />
              Gift Printing
            </h3>
            <p className="text-slate-600 mb-8 text-sm font-medium">
              Create unique personalized mugs & clocks.
            </p>
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-sky-200 hover:bg-sky-600 transition-all w-fit"
            >
              Order Now <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Promo 2: Laser Engraving */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-amber-50 group min-h-[350px] flex items-center p-8 sm:p-12 border border-amber-100 shadow-sm transition-all hover:shadow-xl">
          {/* Background Image - User's Laser Wood Flyer */}
          <div className="absolute right-0 bottom-0 w-1/2 h-full">
            <img 
              src="/images/upload/WhatsApp Image 2026-03-11 at 11.48.52 PM (1).jpeg" 
              alt="Laser Engraving" 
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%)' }}
            />
          </div>
          
          <div className="relative z-10 max-w-[65%]">
             <span className="inline-block px-4 py-1.5 bg-amber-500 text-white text-xs font-black rounded-full mb-6 tracking-widest uppercase">
              Precision Work
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4 tracking-tighter">
              High-End <br />
              <span className="text-amber-600">Laser wood</span> <br />
              Engraving
            </h3>
            <p className="text-slate-600 mb-8 text-sm font-medium">
              Premium wooden plaques and carving art.
            </p>
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-amber-200 hover:bg-amber-600 transition-all w-fit"
            >
              Order Now <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
