import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import TrustSignalsSection from "@/components/TrustSignalsSection";
import Footer from "@/components/Footer";
import ParticleBackground from "@/components/ParticleBackground";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TrustSignalsSection />
      <Footer />
    </div>
  );
};

export default Index;
