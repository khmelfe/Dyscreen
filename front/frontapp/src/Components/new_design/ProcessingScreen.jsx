import { useEffect, useState } from "react";
import { Brain, CheckCircle } from "lucide-react";





const steps = [
{ label: "Detecting text regions", duration: 1200 },
{ label: "Extracting handwriting features", duration: 1400 },
{ label: "Running AI classification model", duration: 1600 },
{ label: "Computing visual explanations", duration: 1200 },
{ label: "Generating detailed report", duration: 800 }];


export function ProcessingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let stepIdx = 0;
    let totalElapsed = 0;
    const totalDuration = steps.reduce((s, st) => s + st.duration, 0);

    const runStep = () => {
      if (stepIdx >= steps.length) {
        setDone(true);
        setTimeout(onComplete, 800);
        return;
      }
      setCurrentStep(stepIdx);
      const stepDuration = steps[stepIdx].duration;
      const startElapsed = totalElapsed;

      const interval = setInterval(() => {
        totalElapsed += 50;
        setProgress(Math.min(totalElapsed / totalDuration * 100, 100));
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        setCompletedSteps((prev) => [...prev, stepIdx]);
        totalElapsed = startElapsed + stepDuration;
        stepIdx++;
        runStep();
      }, stepDuration);
    };

    const timer = setTimeout(runStep, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Brain animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0284C7, #0D9488)",
                animation: done ? "none" : "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              }}>

              <Brain className="w-10 h-10 text-white" />
            </div>
            {!done &&
            <>
                <div
                className="absolute inset-0 rounded-full border-4 border-primary"
                style={{ animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite", opacity: 0.3 }} />

                <div
                className="absolute -inset-3 rounded-full border-2 border-primary/20"
                style={{ animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s", opacity: 0.2 }} />

              </>
            }
            {done &&
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-background">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            }
          </div>
        </div>

        <h2 className="text-center text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22 }}>
          {done ? "Analysis Complete!" : "Analyzing Handwriting"}
        </h2>
        <p className="text-center text-muted-foreground mb-8" style={{ fontSize: 14 }}>
          {done ? "Your results are ready." : "Our AI model is processing your sample. This usually takes under 30 seconds."}
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground" style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
              {Math.round(progress)}%
            </span>
            <span className="text-muted-foreground" style={{ fontSize: 12 }}>
              {completedSteps.length}/{steps.length} steps
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #0284C7, #0D9488)"
              }} />

          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => {
            const isCompleted = completedSteps.includes(i);
            const isActive = currentStep === i && !isCompleted;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isActive ? "bg-primary/10 border border-primary/20" : isCompleted ? "bg-muted" : "opacity-40"}`
                }>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted ? "bg-green-500" : isActive ? "bg-primary" : "bg-border"}`
                  }>

                  {isCompleted ?
                  <CheckCircle className="w-3.5 h-3.5 text-white" /> :
                  isActive ?
                  <div
                    className="w-2.5 h-2.5 rounded-full bg-white"
                    style={{ animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} /> :


                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  }
                </div>
                <span
                  className={isCompleted ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"}
                  style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>

                  {step.label}
                </span>
                {isActive &&
                <div className="ml-auto flex gap-0.5">
                    {[0, 1, 2].map((dot) =>
                  <div
                    key={dot}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    style={{ animation: `bounce 1s infinite ${dot * 0.2}s` }} />

                  )}
                  </div>
                }
              </div>);

          })}
        </div>

        {/* Handwriting preview placeholder */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <p className="text-muted-foreground mb-3" style={{ fontSize: 12, fontWeight: 600 }}>SAMPLE PREVIEW</p>
          <div className="relative rounded-xl overflow-hidden bg-muted" style={{ height: 100 }}>
            <svg width="100%" height="100" viewBox="0 0 400 100" className="w-full">
              {[25, 50, 75].map((y) =>
              <line key={y} x1="10" y1={y} x2="390" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
              )}
              <path d="M20 50 Q40 25 60 50 Q80 75 100 50 Q115 30 130 50 L135 65" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" fill="none" strokeDasharray="400" strokeDashoffset="0" />
              <path d="M145 50 Q155 35 165 50 L165 70 Q175 80 185 70 L185 50" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M200 50 Q210 30 220 50 Q225 60 215 65" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M235 40 L235 70 Q242 78 252 68 Q260 58 252 48 Q244 38 235 40Z" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {/* Scanning line */}
              {!done &&
              <line
                x1="0"
                y1="50"
                x2="400"
                y2="50"
                stroke="#0284C7"
                strokeWidth="1.5"
                strokeOpacity="0.6"
                style={{ animation: "scanLine 2s linear infinite" }} />

              }
            </svg>
          </div>
        </div>

        <p className="text-center text-muted-foreground mt-4" style={{ fontSize: 11 }}>
          ⚠️ DyScreen provides screening assistance and does not replace professional evaluation.
        </p>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { transform: translateY(-45px); }
          100% { transform: translateY(45px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>);

}
