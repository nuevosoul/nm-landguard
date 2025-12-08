import { useState, useEffect } from "react";
import { Database, Radio, Search } from "lucide-react";

interface LoadingStateProps {
  onComplete: () => void;
}

const LoadingState = ({ onComplete }: LoadingStateProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { icon: Database, text: "Querying OSE Database...", subtext: "Checking water rights and well restrictions" },
    { icon: Search, text: "Checking USFWS Habitat...", subtext: "Scanning critical habitat overlays" },
    { icon: Radio, text: "Analyzing Historic Zones...", subtext: "Cross-referencing NMCRIS records" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 1000);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="max-w-md mx-auto text-center p-8">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
              <CurrentIcon className="w-8 h-8 text-primary animate-pulse-glow" />
            </div>
          </div>
        </div>

        {/* Step text */}
        <h2 className="text-2xl font-bold text-foreground mb-2 animate-fade-in" key={currentStep}>
          {steps[currentStep].text}
        </h2>
        <p className="text-muted-foreground mb-8 animate-fade-in" key={`sub-${currentStep}`}>
          {steps[currentStep].subtext}
        </p>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-3">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? "bg-primary scale-100" 
                  : "bg-muted scale-75"
              }`}
            />
          ))}
        </div>

        {/* Estimated time */}
        <p className="mt-8 text-sm text-muted-foreground">
          Estimated time: {Math.max(1, 3 - currentStep)} seconds remaining
        </p>
      </div>
    </div>
  );
};

export default LoadingState;
