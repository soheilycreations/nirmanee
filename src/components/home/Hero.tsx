import Link from "next/link";
import { ArrowRight, Star, Sparkles, Wand2, PenTool, Crop, MousePointer2, Pipette, Type, Scissors, Layers, Component } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative bg-white overflow-hidden py-12 lg:py-20">

      {/* Premium Faint Background with Grid and Soft Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Elegant, slow-pulsing glowing orbs */}
        <div className="absolute top-[-5%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-sky-300/40 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[30%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-300/30 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-10%] right-[15%] w-[60vw] h-[60vw] rounded-full bg-amber-200/20 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />

        {/* Premium Architectural Square Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: 'linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />

        {/* Smooth fade out at the bottom of the section */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

        {/* Floating Photoshop/Design Tool Icons with Natural "Live" Drift */}
        <div className="absolute top-[15%] left-[5%] text-slate-400/40 animate-float-0" style={{ animationDelay: '0s' }}>
          <PenTool className="w-10 h-10" />
        </div>
        <div className="absolute top-[35%] right-[8%] text-slate-400/30 animate-float-1" style={{ animationDelay: '1s' }}>
          <Crop className="w-8 h-8" />
        </div>
        <div className="absolute bottom-[20%] left-[8%] text-slate-400/40 animate-float-2" style={{ animationDelay: '2s' }}>
          <Pipette className="w-12 h-12" />
        </div>
        <div className="absolute top-[10%] right-[35%] text-slate-400/20 animate-float-0" style={{ animationDelay: '3s' }}>
          <Type className="w-14 h-14" />
        </div>
        <div className="absolute bottom-[30%] right-[40%] text-slate-400/30 animate-float-1" style={{ animationDelay: '4s' }}>
          <Scissors className="w-8 h-8" />
        </div>
        <div className="absolute top-[60%] left-[45%] text-slate-400/20 animate-float-2" style={{ animationDelay: '0.5s' }}>
          <Component className="w-10 h-10" />
        </div>
        <div className="absolute bottom-[10%] right-[25%] text-slate-400/40 animate-float-0" style={{ animationDelay: '2.5s' }}>
          <Layers className="w-10 h-10" />
        </div>
        <div className="absolute top-[25%] left-[30%] text-sky-400/30 animate-float-1" style={{ animationDelay: '1.5s' }}>
          <MousePointer2 className="w-8 h-8" />
        </div>

      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left: Text & CTA */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-700 shadow-xl mb-6 transform hover:scale-105 transition-transform cursor-default">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">Custom Printing Services</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 leading-[1.15] tracking-tight mb-6">
              Turn Memories Into{" "}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 pb-2 mt-2">
                Nirmanee
                <div className="absolute -bottom-1 left-0 w-full h-3 bg-sky-400 rotate-1 opacity-20 -z-10"></div>
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-lg mb-10 font-medium leading-relaxed">
              Laser Engraving, Sublimation & Digital Printing.
              We bring your finest ideas to life with unmatched precision.

            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-[0_8px_30px_rgb(56,189,248,0.4)] transition-all hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
              >
                Start Ordering <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#categories"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl shadow-sm border border-slate-200 transition-all hover:border-sky-300 flex items-center justify-center gap-3 text-lg"
              >
                Explore Services <Wand2 className="w-5 h-5 text-sky-500" />
              </Link>
            </div>
          </div>

          {/* Right: Dynamic Image Collage */}
          <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[500px] perspective-[1000px] mt-10 lg:mt-0">
            {/* Main Center Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 sm:w-[400px] aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-20 hover:scale-105 transition-transform duration-500">
              <img
                src="/images/upload/WhatsApp Image 2026-03-11 at 11.48.47 PM.jpeg"
                alt="MDF PM 86 Clock"
                className="w-full h-full object-contain"
              />
              {/* Floating Tag */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-slate-900">Bestseller</span>
              </div>
            </div>

            {/* Left Wing Image */}
            <div className="absolute top-5 left-0 w-2/3 sm:w-[280px] aspect-square bg-white rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-10 -rotate-6 hover:rotate-0 hover:z-30 transition-all duration-500 origin-bottom-right">
              <div className="absolute inset-0 bg-sky-500/10 mix-blend-multiply z-10 hover:opacity-0 transition-opacity pointer-events-none"></div>
              <img
                src="/images/upload/WhatsApp Image 2026-03-11 at 11.48.52 PM (1).jpeg"
                alt="Custom Love Wooden Frame"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right Wing Image */}
            <div className="absolute bottom-5 right-0 w-2/3 sm:w-[280px] aspect-square bg-white rounded-[2rem] overflow-hidden shadow-xl border-4 border-white z-10 rotate-6 hover:rotate-0 hover:z-30 transition-all duration-500 origin-bottom-left">
              <div className="absolute inset-0 bg-indigo-500/10 mix-blend-multiply z-10 hover:opacity-0 transition-opacity pointer-events-none"></div>
              <img
                src="/images/upload/WhatsApp Image 2026-03-11 at 11.48.51 PM (1).jpeg"
                alt="Black Board Frame Engraving"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Decorative floating balls */}
            <div className="absolute left-0 top-1/4 w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 to-sky-300 shadow-xl blur-[2px] opacity-60 animate-bounce" style={{ animationDuration: '4s' }} />
            <div className="absolute right-10 bottom-1/4 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-300 shadow-xl blur-[1px] opacity-80 animate-pulse" />
          </div>

        </div>
      </div>
    </div>
  );
}
