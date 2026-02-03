import { useState } from "react";
import { X, CreditCard, Lock, ExternalLink, Tag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { invokeFunction } from "@/lib/supabaseApi";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  address: string;
  coordinates?: { lat: number; lng: number };
  queryType?: string;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  address, 
  coordinates,
  queryType = "address"
}: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const data = await invokeFunction("create-checkout", {
        address,
        coordinates,
        queryType,
      });

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Payment setup failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const handlePromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsCheckingPromo(true);
    setError(null);
    setPromoMessage("");

    try {
      const data = await invokeFunction("redeem-promo", {
        promoCode: promoCode.trim(),
        address,
        coordinates,
        queryType,
      });

      if (data?.success && data?.orderRef) {
        setPromoApplied(true);
        setPromoMessage(data.message || "Promo code applied!");
        
        // Redirect to success page with order ref (same flow as Stripe)
        const origin = window.location.origin;
        window.location.href = `${origin}/?payment=success&order=${data.orderRef}`;
      } else {
        setError(data?.error || "Invalid promo code");
      }
    } catch (err) {
      console.error("Promo error:", err);
      setError(err instanceof Error ? err.message : "Failed to apply promo code");
    } finally {
      setIsCheckingPromo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-elevated animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">Rio Grande Due Diligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            disabled={isProcessing || isCheckingPromo}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order summary */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-muted-foreground">Environmental Report</span>
              <span className="font-semibold text-foreground">$499.00</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{address}</p>
          </div>

          {/* Promo code section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Have a promo code?
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={isCheckingPromo || promoApplied}
                className="flex-1 uppercase"
              />
              <Button
                variant="outline"
                onClick={handlePromoCode}
                disabled={!promoCode.trim() || isCheckingPromo || promoApplied}
              >
                {isCheckingPromo ? (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : promoApplied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  "Apply"
                )}
              </Button>
            </div>
            {promoMessage && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {promoMessage}
              </p>
            )}
          </div>

          {/* What's included */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Your report includes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Water rights & well data analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                FEMA flood zone assessment
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Environmental hazard screening
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Cultural resources review
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Downloadable PDF report
              </li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Checkout button */}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleCheckout}
            disabled={isProcessing || isCheckingPromo}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Preparing checkout...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Continue to Payment
                <ExternalLink className="w-3 h-3 ml-2 opacity-60" />
              </>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Secured by Stripe • 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
