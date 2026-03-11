import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import PromoBanners from "@/components/home/PromoBanners";
import HotProducts from "@/components/home/HotProducts";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col pt-0">
      <Header />
      
      <div className="flex-1">
        <Hero />
        <CategorySection />
        <PromoBanners />
        <HotProducts />

        {/* Newsletter Section */}
        <section className="py-20 bg-sky-50 relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-80 h-full bg-cover opacity-20" style={{backgroundImage: "url('/images/hero_print_items_1773252985885.png')"}} />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                It's Good To Be On The List.
              </h2>
              <p className="text-slate-600 mb-8">
                Receive exclusive offers, inspiring design ideas, and early access to new personalized products.
              </p>
              
              <form className="flex flex-col sm:flex-row items-center gap-2 max-w-lg mx-auto bg-white p-2 rounded-full shadow-lg">
                <input 
                  type="email" 
                  placeholder="Enter your email address..." 
                  className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-800 outline-none w-full"
                  required
                />
                <button 
                  type="submit" 
                  className="w-full sm:w-auto px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-full transition-colors shadow-md shadow-sky-500/20"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
