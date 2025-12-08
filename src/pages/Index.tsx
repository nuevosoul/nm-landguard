import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesGrid from "@/components/FeaturesGrid";
import SocialProof from "@/components/SocialProof";
import SearchCard from "@/components/SearchCard";
import PaymentModal from "@/components/PaymentModal";
import LoadingState from "@/components/LoadingState";
import ResultsDashboard from "@/components/ResultsDashboard";
import Footer from "@/components/Footer";

type AppState = "landing" | "payment" | "loading" | "results";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [searchAddress, setSearchAddress] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const scrollToSearch = () => {
    const searchSection = document.getElementById("search");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = (address: string) => {
    setSearchAddress(address);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setAppState("loading");
  };

  const handleLoadingComplete = () => {
    setAppState("results");
  };

  const handleReset = () => {
    setAppState("landing");
    setSearchAddress("");
  };

  const handleViewSample = () => {
    setSearchAddress("123 Main Street, Santa Fe, NM 87501");
    setAppState("results");
  };

  // Show results dashboard
  if (appState === "results") {
    return <ResultsDashboard address={searchAddress} onReset={handleReset} />;
  }

  // Show loading state
  if (appState === "loading") {
    return <LoadingState onComplete={handleLoadingComplete} />;
  }

  // Landing page
  return (
    <div className="min-h-screen bg-background">
      <Navbar onRunReport={scrollToSearch} />
      
      <main className="pt-16">
        <HeroSection onRunReport={scrollToSearch} onViewSample={handleViewSample} />
        
        <section id="features">
          <FeaturesGrid />
        </section>
        
        <SocialProof />
        
        <SearchCard onSearch={handleSearch} />
      </main>

      <Footer />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        address={searchAddress}
      />
    </div>
  );
};

export default Index;
