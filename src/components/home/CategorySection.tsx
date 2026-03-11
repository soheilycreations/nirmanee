import Link from "next/link";
import { 
  Printer, 
  Image as ImageIcon, 
  Coffee, 
  Gem, 
  Scissors, 
  FileText, 
  PenTool, 
  Gift, 
  Maximize, 
  Shirt, 
  Cake,
  LayoutGrid
} from "lucide-react";

// The 12 core services/categories
const CATEGORIES = [
  { id: 1, name: "Digital Printing", icon: Printer, color: "bg-blue-100 text-blue-600 group-hover:bg-blue-500 group-hover:text-white" },
  { id: 2, name: "Photo Framing", icon: ImageIcon, color: "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" },
  { id: 3, name: "Mug Printing", icon: Coffee, color: "bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" },
  { id: 4, name: "Crystal Printing", icon: Gem, color: "bg-purple-100 text-purple-600 group-hover:bg-purple-500 group-hover:text-white" },
  { id: 5, name: "Laser Cutting", icon: Scissors, color: "bg-rose-100 text-rose-600 group-hover:bg-rose-500 group-hover:text-white" },
  { id: 6, name: "Plan Printing", icon: FileText, color: "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-500 group-hover:text-white" },
  { id: 7, name: "Wood Engraving", icon: PenTool, color: "bg-orange-100 text-orange-600 group-hover:bg-orange-500 group-hover:text-white" },
  { id: 8, name: "Custom Souvenirs", icon: Gift, color: "bg-pink-100 text-pink-600 group-hover:bg-pink-500 group-hover:text-white" },
  { id: 9, name: "Photo Enlargement", icon: Maximize, color: "bg-teal-100 text-teal-600 group-hover:bg-teal-500 group-hover:text-white" },
  { id: 10, name: "T-Shirt Printing", icon: Shirt, color: "bg-indigo-100 text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white" },
  { id: 11, name: "Edible Print", icon: Cake, color: "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white" },
  { id: 12, name: "Others", icon: LayoutGrid, color: "bg-slate-100 text-slate-600 group-hover:bg-slate-500 group-hover:text-white" },
];

export default function CategorySection() {
  return (
    <section id="categories" className="py-20 bg-slate-50 overflow-hidden relative border-t border-slate-100">
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-200/10 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/10 rounded-full blur-3xl opacity-60" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Our Services</h2>
          <div className="w-24 h-2 bg-gradient-to-r from-sky-500 to-indigo-600 mx-auto rounded-full mb-8 shadow-sm"></div>
          <p className="text-slate-600 max-w-2xl mx-auto text-xl font-medium">
            ඔබගේ සියළුම මුද්‍රණ කටයුතු එකම වහලක් යටින්...!
          </p>
        </div>

        {/* Balanced 6x2 Layout for 12 Items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/services#${cat.id}`}
                className="group flex flex-col items-center w-full"
              >
                {/* Icon Container with Glassmorphism */}
                <div className={`relative w-full aspect-square rounded-[2rem] flex items-center justify-center mb-4 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border-2 border-white shadow-lg ${cat.color.split(' ')[0]} bg-opacity-40 backdrop-blur-sm`}>
                  {/* Decorative focus ring */}
                  <div className="absolute -inset-1.5 rounded-[2.2rem] border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  
                  <Icon 
                    className={`w-10 h-10 md:w-12 md:h-12 transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] ${cat.color.split(' ')[1]}`} 
                    strokeWidth={1.2} 
                  />
                </div>

                <h3 className="font-extrabold text-slate-800 text-center text-[10px] sm:text-xs md:text-sm leading-tight group-hover:text-sky-600 transition-colors tracking-tight px-1">
                  {cat.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
