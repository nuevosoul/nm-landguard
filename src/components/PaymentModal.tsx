import { useState } from "react";
import { X, CreditCard, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

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

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
        body: {
          address,
          coordinates,
          queryType,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to create checkout session");
      }

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
            disabled={isProcessing}
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
            disabled={isProcessing}
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
