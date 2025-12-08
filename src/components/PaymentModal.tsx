import { useState } from "react";
import { X, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  address: string;
}

const PaymentModal = ({ isOpen, onClose, onPaymentComplete, address }: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete();
    }, 1500);
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
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order summary */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-muted-foreground">Environmental Report</span>
              <span className="font-semibold text-foreground">$499.00</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{address}</p>
          </div>

          {/* Card details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Card Number
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="pl-10 bg-muted border-border"
                  defaultValue="4242 4242 4242 4242"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Expiry
                </label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  className="bg-muted border-border"
                  defaultValue="12/25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CVC
                </label>
                <Input
                  type="text"
                  placeholder="123"
                  className="bg-muted border-border"
                  defaultValue="123"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay $499.00</>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Secured by 256-bit SSL encryption</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
