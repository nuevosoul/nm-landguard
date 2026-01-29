import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import SystemStatusTicker from "@/components/SystemStatusTicker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppState = "landing" | "payment" | "loading" | "results" | "sample";
type QueryType = "address" | "legal" | "coordinates";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appState, setAppState] = useState<AppState>("landing");
  const [searchAddress, setSearchAddress] = useState("");
  const [queryType, setQueryType] = useState<QueryType>("address");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const { toast } = useToast();

  // Handle payment return from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    const orderRef = searchParams.get("order");

    if (paymentStatus === "success" && (sessionId || orderRef)) {
      verifyPayment(sessionId, orderRef);
    } else if (paymentStatus === "cancelled") {
      toast({
        title: "Payment cancelled",
        description: "Your payment was cancelled. You can try again anytime.",
        variant: "default",
      });
      // Clear params
      searchParams.delete("payment");
      setSearchParams(searchParams);
    }
  }, []);

  const verifyPayment = async (sessionId: string | null, orderRef: string | null) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { sessionId, orderRef },
      });

      if (error || !data?.verified) {
        console.error("Payment verification failed:", error || data?.error);
        toast({
          title: "Verification failed",
          description: "We couldn't verify your payment. Please contact support if you were charged.",
          variant: "destructive",
        });
        // Clear params
        searchParams.delete("payment");
        searchParams.delete("session_id");
        searchParams.delete("order");
        setSearchParams(searchParams);
        return;
      }

      // Payment verified — load the report
      setSearchAddress(data.order.address);
      if (data.order.coordinates) {
        setCoordinates(data.order.coordinates);
      }
      if (data.order.queryType) {
        setQueryType(data.order.queryType as QueryType);
      }
      setAppState("loading");

      // Clear URL params
      searchParams.delete("payment");
      searchParams.delete("session_id");
      searchParams.delete("order");
      setSearchParams(searchParams);

      toast({
        title: "Payment confirmed",
        description: "Generating your environmental report...",
      });
    } catch (err) {
      console.error("Verification error:", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollToSearch = () => {
    const searchSection = document.getElementById("search");
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSearch = (query: string, type: QueryType | "map") => {
    setSearchAddress(query);
    // Normalize "map" to "coordinates" for the query type
    const normalizedType = type === "map" ? "coordinates" : type;
    setQueryType(normalizedType);
    
    // Parse coordinates if query type is coordinates
    if (type === "coordinates" || type === "map") {
      const parts = query.split(",").map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        setCoordinates({ lat: parts[0], lng: parts[1] });
      }
    } else {
      setCoordinates(undefined);
    }
    
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
    setCoordinates(undefined);
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
      <SystemStatusTicker />
      <Navbar onRunReport={scrollToSearch} />
      
      <main className="pt-[88px]">
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
        coordinates={coordinates}
        queryType={queryType}
      />
    </div>
  );
};

export default Index;
