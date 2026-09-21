"use client";

import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { OrderModal } from "@/components/order/OrderModal";
import { About } from "@/components/sections/About";
import { Applications } from "@/components/sections/Applications";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Production } from "@/components/sections/Production";
import { Products } from "@/components/sections/Products";
import { ThreeDSection } from "@/components/sections/ThreeDSection";
import { WhyPenaplast } from "@/components/sections/WhyPenaplast";
import { SearchProvider } from "@/lib/search-context";

export default function HomePage() {
  return (
    <SearchProvider>
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Products />
        <ThreeDSection />
        <Production />
        <WhyPenaplast />
        <Applications />
        <About />
        <Contact />
      </main>
      <Footer />
      <MobileActionBar />
      <BackToTop />
      <OrderModal />
    </SearchProvider>
  );
}
