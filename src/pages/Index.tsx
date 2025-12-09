import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DataStatusTable from "@/components/DataStatusTable";
import SampleReportPreview from "@/components/SampleReportPreview";
import ComprehensiveDeliverable from "@/components/ComprehensiveDeliverable";
import SocialProof from "@/components/SocialProof";
import SearchCard from "@/components/SearchCard";
import PaymentModal from "@/components/PaymentModal";
import LoadingState from "@/components/LoadingState";
import ResultsDashboard from "@/components/ResultsDashboard";
import Footer from "@/components/Footer";

type AppState = "landing" | "payment" | "loading" | "results" | "sample";
type QueryType = "address" | "legal" | "coordinates";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [searchAddress, setSearchAddress] = useState("");
  const [queryType, setQueryType] = useState<QueryType>("address");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const scrollToSearch = () => {
    const searchSection = document.getElementById("search");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = (query: string, type: QueryType) => {
    setSearchAddress(query);
    setQueryType(type);
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
    setSearchAddress("777 1st Street SW, Albuquerque, NM 87102");
    setAppState("sample");
  };

  // Show sample report
  if (appState === "sample") {
    return <ResultsDashboard address={searchAddress} onReset={handleReset} isSample />;
  }

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
        
        <DataStatusTable />
        
        <ComprehensiveDeliverable />
        
        <SampleReportPreview onViewSample={handleViewSample} />
        
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
