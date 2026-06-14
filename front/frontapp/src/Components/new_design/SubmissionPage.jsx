
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Brain, Sun, Moon, Upload, PenTool, CheckCircle, Trash2,
  Undo2, Send, ImageIcon, Camera, Zap, BarChart3, Eye,
  TrendingUp, Shield,AlertTriangle
} from "lucide-react";
import axios from "axios";

const processingSteps = [
  "Detecting text regions",
  "Extracting handwriting features",
  "Running AI classification model",
  "Computing visual explanations",
  "Generating report",
];

const durations = [900, 1000, 1100, 700, 500];
const BASE_URL_UPLOAD = "http://127.0.0.1:8000/upload_file";

export function SubmissionPage({ darkMode, onToggleDark, onAnalyze, onAnalysisComplete, onAnalysisFailed, processing }) {
  const [inputMode, setInputMode] = useState("none");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [model,setmodel] = useState("CNN_LSTM");
  const [file,setfile]= useState(null);
  
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (!processing) {
      setCurrentStep(0);
      setCompletedSteps([]);
      setProgress(0);
      return;
    }

    const total = durations.reduce((a, b) => a + b, 0);
    let elapsed = 0;
    let stepIdx = 0;

    const runStep = () => {
      if (stepIdx >= processingSteps.length) return;

      setCurrentStep(stepIdx);

      const dur = durations[stepIdx];
      const start = elapsed;

      const tick = setInterval(() => {
        elapsed += 40;
        setProgress(Math.min((elapsed / total) * 100, 100));
      }, 40);

      setTimeout(() => {
        clearInterval(tick);
        elapsed = start + dur;
        setCompletedSteps((prev) => [...prev, stepIdx]);
        stepIdx++;
        runStep();
      }, dur);
    };

    runStep();
  }, [processing]);
      const file_upload = (e)=>{
        console.log("well",e);
        //when we use onChange/onclick... the brower creates an event based on our type of input.(file in this case.)
        const fileupload = e;
        if(!fileupload){
            alert("Error in file uploading please try again");
            return;
        }
        console.log(fileupload);
        setUploadedPreview(URL.createObjectURL(fileupload));
        setfile(fileupload);
        setUploadedFile(fileupload)
    };

  const submit_file = async (e) =>{
        e.preventDefault();
        if(!uploadedFile){
            //safe guard for if user didn't added a file
            alert("Please Choose a file first");
            return ;
        }
        const selectedmodel = model 
        console.log("Model selected ",selectedmodel);
        setProgress(true);
        const dataForm = new FormData()
        dataForm.append(
            "myfile",
            uploadedFile,uploadedFile.name,
            
        )
        dataForm.append(
            "model",selectedmodel
        )
        console.log(dataForm);
        try{
          const [, res] = await Promise.all([
          onAnalyze(),
          axios.post(BASE_URL_UPLOAD, dataForm),
                  ]);
           
            console.log(res.data.prob)
            const formattedRes = {
              ...res,
              data: {
                ...res.data,
                prob: (res.data.prob * 100).toFixed(4),
                
              },
            };
            
            onAnalysisComplete(formattedRes);
            console.log(formattedRes.data.features.large_gap_count);
            //alert("Great sucess \n ", res.pred_class);
            
            
        }

        catch(err){
            onAnalysisFailed?.();
            setTimeout(() => {
                const errorMsg =err?.response?.data?.error || err.message || "Upload Failed";
                alert(errorMsg); 
            }, 3000);
        }
        finally{
            setProgress(false);
        }
    };

  const canSubmit =
    (inputMode === "upload" && uploadedFile) ;
   

  if (processing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <TopBar darkMode={darkMode} onToggleDark={onToggleDark} minimal />

        <div className="w-full max-w-md mt-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #0284C7, #0D9488)",
                }}
              >
                <Brain className="w-10 h-10 text-white" />
              </div>

              <div
                className="absolute inset-0 rounded-full border-4 border-primary/30"
                style={{ animation: "ping 1.5s ease-out infinite" }}
              />
            </div>
          </div>

          <h2
            className="text-center text-foreground mb-2"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            Analyzing Handwriting
          </h2>

          <p
            className="text-center text-muted-foreground mb-8"
            style={{ fontSize: 14 }}
          >
            Our AI model is processing your sample…
          </p>

          <div className="mb-6">
            <div className="flex justify-between mb-1.5">
              <span className="text-muted-foreground" style={{ fontSize: 12 }}>
                Progress
              </span>
              <span
                className="text-muted-foreground"
                style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}
              >
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg,#0284C7,#0D9488)",
                }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {processingSteps.map((step, i) => {
              const done = completedSteps.includes(i);
              const active = currentStep === i && !done;

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    active
                      ? "bg-primary/10 border border-primary/20"
                      : done
                      ? "bg-muted"
                      : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      done ? "bg-green-500" : active ? "bg-primary" : "bg-border"
                    }`}
                  >
                    {done ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : active ? (
                      <div
                        className="w-2 h-2 rounded-full bg-white"
                        style={{ animation: "pulse 1s infinite" }}
                      />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>

                  <span
                    className={
                      active
                        ? "text-primary"
                        : done
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                    style={{
                      fontSize: 14,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          <p
            className="text-center text-muted-foreground mt-6"
            style={{ fontSize: 11 }}
          >
            ⚠️ DyScreen is a screening tool and does not replace professional
            evaluation.
          </p>
        </div>

        <style>
          {`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}
        </style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar darkMode={darkMode} onToggleDark={onToggleDark} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(2,132,199,0.12) 0%, transparent 60%)",
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10 text-center">
          <div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full mb-5"
            style={{ fontSize: 12, fontWeight: 700 }}
          >
            <Shield className="w-3.5 h-3.5" />
            Screening Tool · Not a Medical Diagnosis
          </div>

          <h1
            className="text-foreground mb-4 mx-auto max-w-2xl"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px,5vw,52px)",
              lineHeight: 1.15,
            }}
          >
            AI-Powered{" "}
            <span
              style={{
                background: "linear-gradient(135deg,#0284C7,#0D9488)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Dysgraphia Screening
            </span>
          </h1>

          <p
            className="text-muted-foreground max-w-lg mx-auto mb-10"
            style={{ fontSize: 16, lineHeight: 1.65 }}
          >
            Upload a handwriting sample or write directly on canvas. Our AI
            analyzes patterns and identifies potential dysgraphia markers in
            under 30 seconds.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { icon: Zap, label: "AI Detection" },
              { icon: BarChart3, label: "8 Metrics" },
              { icon: Eye, label: "Heatmap Explanation" },
              { icon: TrendingUp, label: "Risk Score" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-full"
                style={{ fontSize: 13, fontWeight: 500 }}
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Submission area */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        {inputMode === "none" && (
          <div className=" sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <ModeCard
              icon={<Upload className="w-7 h-7 text-primary" />}
              bg="bg-primary/10"
              title="Upload Image"
              desc="Photo, scan, or drag & drop a handwriting sample"
              onClick={() => setInputMode("upload")}
            />

            
          </div>
        )}

        {inputMode === "upload" && (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => {
                  setInputMode("none");
                  setUploadedFile(null);
                  setUploadedPreview(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: 13 }}
              >
                ← Change method
              </button>
            </div>

            {!uploadedPreview ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const f = e.dataTransfer.files[0];
                  if (f) file_upload(f);
                }}
                onClick={() => document.getElementById("hw-upload")?.click()}
              >
                <input
                  id="hw-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && file_upload(e.target.files[0])
                  }
                />

                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-primary" />
                </div>

                <p
                  className="text-foreground mb-1"
                  style={{ fontWeight: 600, fontSize: 16 }}
                >
                  Drop your image here
                </p>

                <p
                  className="text-muted-foreground mb-5"
                  style={{ fontSize: 13 }}
                >
                  or click to browse · JPG, PNG · max 20 MB
                </p>

                <div className="flex justify-center gap-3">
                  <div
                    className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-muted-foreground"
                    style={{ fontSize: 13 }}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Gallery
                  </div>

                  {/* <div
                    className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-muted-foreground"
                    style={{ fontSize: 13 }}
                  >
                    <Camera className="w-4 h-4" />
                    Camera
                  </div> */}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="relative">
                  <img
                    src={uploadedPreview}
                    alt="Handwriting sample"
                    className="w-full object-contain max-h-72"
                  />

                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setUploadedPreview(null);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />

                  <p
                    className="text-foreground truncate flex-1"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    {uploadedFile?.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {inputMode === "draw" && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  setInputMode("none");
                  setHasStrokes(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: 13 }}
              >
                ← Change method
              </button>
            </div>

            <DrawingCanvas onHasStrokes={setHasStrokes} />
          </div>
        )}

        {inputMode !== "none" && (
          <div className="max-w-2xl mx-auto mt-5 space-y-3">
         

            <button
              onClick={submit_file}
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#0284C7,#0D9488)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              <Send className="w-4 h-4" />
              Analyze Handwriting
            </button>
          </div>
        )}
      </section>
      {/* Info section */}
      <section className="bg-card border-t border-border py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-primary uppercase tracking-widest mb-2" style={{ fontSize: 12, fontWeight: 700 }}>How it works</p>
            <h2 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(22px,4vw,34px)" }}>
              Four steps to a screening result
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: "01", title: "Submit Sample", desc: "Upload a photo or write directly on the digital canvas." },
              { step: "02", title: "Feature Extraction", desc: "The AI extracts 8 quantitative handwriting metrics." },
              { step: "03", title: "Classification", desc: "A fine-tuned ResNet model predicts dysgraphia risk level." },
              { step: "04", title: "Explainability", desc: "Grad-CAM heatmaps highlight the decision-making regions." },
            ].map((item) => (
              <div key={item.step} className="bg-background rounded-2xl p-5 border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13 }} className="text-primary">{item.step}</span>
                </div>
                <h4 className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{item.title}</h4>
                <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* About dysgraphia */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="text-accent uppercase tracking-widest mb-2" style={{ fontSize: 12, fontWeight: 700 }}>About</p>
            <h2 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(22px,4vw,32px)" }}>
              What is dysgraphia?
            </h2>
            <p className="text-muted-foreground mb-4" style={{ fontSize: 14, lineHeight: 1.7 }}>
              Dysgraphia is a learning disability that affects writing abilities. It can manifest as difficulties with spelling, poor handwriting, and putting thoughts on paper. It often co-occurs with dyslexia and ADHD.
            </p>
            <p className="text-muted-foreground mb-6" style={{ fontSize: 14, lineHeight: 1.7 }}>
              DyScreen analyzes quantitative features of handwriting — baseline consistency, letter sizing, word spacing, and more — to identify patterns associated with dysgraphia.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 13, lineHeight: 1.6 }} className="text-amber-800 dark:text-amber-400">
                <strong>Disclaimer:</strong> DyScreen provides screening assistance only. Results do not constitute a clinical diagnosis. Always consult a qualified educational specialist or occupational therapist.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Metrics analyzed</p>
            {[
              { label: "Baseline Consistency", desc: "How well writing stays on the line" },
              { label: "Word Spacing", desc: "Regularity of gaps between words" },
              { label: "Letter Size Variation", desc: "Consistency of character height" },
              { label: "Line Alignment", desc: "Horizontal drift across the page" },
              { label: "Slant Consistency", desc: "Uniformity of letter lean angle" },
              { label: "Pen Pressure", desc: "Stroke weight variation (future)" },
              { label: "Letter Reversals", desc: "b/d, p/q confusion patterns" },
              { label: "Spatial Planning", desc: "Overall page layout coherence" },
            ].map((m) => (
              <div key={m.label} className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border">
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</p>
                  <p className="text-muted-foreground" style={{ fontSize: 12 }}>{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-muted-foreground" style={{ fontSize: 12 }}>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span>DyScreen · AI Handwriting Screening · 2026</span>
          </div>
          <p>⚠️ Not a diagnostic tool · For screening purposes only</p>
        </div>
      </footer>
    </div>
  );
}

function TopBar({ darkMode, onToggleDark, minimal }) {
  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>

          <span
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 18,
            }}
            className="text-foreground"
          >
            Dy<span className="text-primary">Screen</span>
          </span>
        </div>

        {!minimal && (
          <p
            className="hidden sm:block text-muted-foreground"
            style={{ fontSize: 13 }}
          >
            AI Dysgraphia Screening Platform
          </p>
        )}

        <button
          onClick={onToggleDark}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </nav>
  );
}

function ModeCard({ icon, bg, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left p-6 rounded-2xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98] w-full"
    >
      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
        {icon}
      </div>

      <h3
        className="text-foreground mb-1"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 700,
          fontSize: 17,
        }}
      >
        {title}
      </h3>

      <p
        className="text-muted-foreground"
        style={{ fontSize: 13, lineHeight: 1.5 }}
      >
        {desc}
      </p>
    </button>
  );
}

function DrawingCanvas({ onHasStrokes }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const history = useRef([]);
  const [strokeWidth, setStrokeWidth] = useState(3);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;

    if ("touches" in e) {
      const t = e.touches[0];
      return {
        x: (t.clientX - rect.left) * sx,
        y: (t.clientY - rect.top) * sy,
      };
    }

    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  };

  const initCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.strokeStyle = "#E0F2FE";
    ctx.lineWidth = 1;

    for (let y = 60; y < c.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(c.width - 20, y);
      ctx.stroke();
    }
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const startDraw = useCallback((e) => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    history.current.push(ctx.getImageData(0, 0, c.width, c.height));

    drawing.current = true;

    const p = getPos(e, c);

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }, []);

  const draw = useCallback(
    (e) => {
      if (!drawing.current) return;

      const c = canvasRef.current;
      if (!c) return;

      const ctx = c.getContext("2d");
      if (!ctx) return;

      e.preventDefault();

      const p = getPos(e, c);

      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      onHasStrokes(true);
    },
    [strokeWidth, onHasStrokes]
  );

  const stopDraw = useCallback(() => {
    drawing.current = false;
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    c.addEventListener("mousedown", startDraw);
    c.addEventListener("mousemove", draw);
    c.addEventListener("mouseup", stopDraw);
    c.addEventListener("mouseleave", stopDraw);

    c.addEventListener("touchstart", startDraw, { passive: false });
    c.addEventListener("touchmove", draw, { passive: false });
    c.addEventListener("touchend", stopDraw);

    return () => {
      c.removeEventListener("mousedown", startDraw);
      c.removeEventListener("mousemove", draw);
      c.removeEventListener("mouseup", stopDraw);
      c.removeEventListener("mouseleave", stopDraw);

      c.removeEventListener("touchstart", startDraw);
      c.removeEventListener("touchmove", draw);
      c.removeEventListener("touchend", stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  const undo = () => {
    const c = canvasRef.current;
    if (!c) return;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    const prev = history.current.pop();

    if (prev) {
      ctx.putImageData(prev, 0, 0);
    }

    if (history.current.length === 0) {
      onHasStrokes(false);
    }
  };

  const clear = () => {
    history.current = [];
    initCanvas();
    onHasStrokes(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-muted-foreground" style={{ fontSize: 12 }}>
          Stroke size:
        </span>

        {[2, 3, 5].map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            className={`rounded-full border-2 transition-all ${
              strokeWidth === w ? "border-primary bg-primary" : "border-border"
            }`}
            style={{ width: w * 4 + 8, height: w * 4 + 8 }}
          />
        ))}

        <div className="ml-auto flex gap-2">
          <button
            onClick={undo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontSize: 13 }}
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>

          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontSize: 13 }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow border border-border">
        <canvas
          ref={canvasRef}
          width={700}
          height={380}
          className="w-full touch-none"
          style={{ cursor: "crosshair", display: "block" }}
        />
      </div>

      <p
        className="text-muted-foreground mt-2 text-center"
        style={{ fontSize: 12 }}
      >
        Write naturally — at least 3 complete sentences
      </p>
    </div>
  );
}
