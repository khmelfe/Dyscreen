import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, PenTool, ImageIcon, Camera, Undo2, Trash2, Send, ArrowLeft, CheckCircle } from "lucide-react";








export function NewAnalysis({ onSubmit, onBack }) {
  const [mode, setMode] = useState("choose");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreview, setUploadedPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) return;
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setUploadedPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (mode === "draw") {
    return <DrawingCanvas onSubmit={onSubmit} onBack={() => setMode("choose")} />;
  }

  if (mode === "upload") {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        <button onClick={() => {setMode("choose");setUploadedFile(null);setUploadedPreview(null);}} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6" style={{ fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24 }}>Upload Handwriting</h2>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>Upload a clear photo or scan of the handwriting sample.</p>

        {!uploadedPreview ?
        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
          onDragOver={(e) => {e.preventDefault();setIsDragging(true);}}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-input")?.click()}>

            <input id="file-input" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground mb-1" style={{ fontWeight: 600, fontSize: 16 }}>Drop your image here</p>
            <p className="text-muted-foreground mb-4" style={{ fontSize: 13 }}>or click to browse files</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <UploadOptionBtn icon={<ImageIcon className="w-4 h-4" />} label="From Gallery" />
              <UploadOptionBtn icon={<Camera className="w-4 h-4" />} label="Camera" />
            </div>
            <p className="text-muted-foreground mt-4" style={{ fontSize: 12 }}>Supports JPG, PNG, HEIC · Max 20MB</p>
          </div> :

        <div>
            <div className="rounded-2xl overflow-hidden border border-border mb-4 relative">
              <img src={uploadedPreview} alt="Uploaded handwriting" className="w-full object-contain max-h-80" />
              <button
              onClick={() => {setUploadedFile(null);setUploadedPreview(null);}}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">

                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center gap-2 mb-4">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-700 dark:text-green-400" style={{ fontSize: 13, fontWeight: 600 }}>{uploadedFile?.name}</p>
            </div>
            <AnalysisOptions onAnalyze={onSubmit} />
          </div>
        }
      </div>);

  }

  // Choose mode
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6" style={{ fontSize: 14, fontWeight: 500 }}>
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h2 className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 26 }}>New Analysis</h2>
      <p className="text-muted-foreground mb-8" style={{ fontSize: 15 }}>Choose how you want to provide the handwriting sample.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <ModeCard
          icon={<Upload className="w-8 h-8 text-primary" />}
          bg="bg-primary/10"
          title="Upload Image"
          description="Upload a photo or scan of handwriting from your gallery or camera."
          features={["From gallery", "Camera capture", "Drag & drop"]}
          onClick={() => setMode("upload")}
          primary />

        <ModeCard
          icon={<PenTool className="w-8 h-8 text-accent" />}
          bg="bg-accent/10"
          title="Write Directly"
          description="Use the digital canvas to write directly with your finger or stylus."
          features={["Stylus support", "Undo / clear", "Real-time preview"]}
          onClick={() => setMode("draw")} />

      </div>

      <div className="mt-6 bg-card rounded-2xl border border-border p-5">
        <h4 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>For best accuracy</h4>
        <ul className="space-y-1.5">
          {[
          "Write at least 3–5 complete sentences",
          "Use natural handwriting — don't alter your style",
          "Ensure good lighting and no shadows on photos",
          "Avoid blurry or rotated images"].
          map((tip) =>
          <li key={tip} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-muted-foreground" style={{ fontSize: 13 }}>{tip}</p>
            </li>
          )}
        </ul>
      </div>
    </div>);

}

function ModeCard({
  icon,
  bg,
  title,
  description,
  features,
  onClick,
  primary








}) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-6 rounded-2xl border transition-all hover:shadow-md active:scale-[0.98] ${primary ? "border-primary/30 bg-card" : "border-border bg-card"}`}>

      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4`}>{icon}</div>
      <h3 className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 18 }}>{title}</h3>
      <p className="text-muted-foreground mb-4" style={{ fontSize: 13, lineHeight: 1.5 }}>{description}</p>
      <ul className="space-y-1">
        {features.map((f) =>
        <li key={f} className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0" />
            <span className="text-muted-foreground" style={{ fontSize: 12 }}>{f}</span>
          </li>
        )}
      </ul>
    </button>);

}

function UploadOptionBtn({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground" style={{ fontSize: 13, fontWeight: 500 }}>
      {icon}
      {label}
    </div>);

}

function AnalysisOptions({ onAnalyze }) {
  return (
    <div>
      <label className="block text-foreground mb-1" style={{ fontSize: 13, fontWeight: 600 }}>Subject / Notes (optional)</label>
      <input
        type="text"
        placeholder="e.g. Morning writing exercise, age 9"
        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 mb-4"
        style={{ fontSize: 14 }} />

      <button
        onClick={onAnalyze}
        className="w-full bg-primary text-white py-3.5 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>

        <Send className="w-4 h-4" /> Analyze Handwriting
      </button>
    </div>);

}

function DrawingCanvas({ onSubmit, onBack }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const history = useRef([]);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [tool, setTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(3);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Ruling lines
    ctx.strokeStyle = "#E0F2FE";
    ctx.lineWidth = 1;
    for (let y = 60; y < canvas.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }
  }, []);

  const startDraw = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    history.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    drawing.current = true;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, []);

  const draw = useCallback((e) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    e.preventDefault();
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : "#1E293B";
    ctx.lineWidth = tool === "eraser" ? strokeWidth * 4 : strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasStrokes(true);
  }, [tool, strokeWidth]);

  const stopDraw = useCallback(() => {
    drawing.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const prev = history.current.pop();
    if (prev) ctx.putImageData(prev, 0, 0);
    if (history.current.length === 0) setHasStrokes(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    history.current = [];
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#E0F2FE";
    ctx.lineWidth = 1;
    for (let y = 60; y < canvas.height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(canvas.width - 20, y);
      ctx.stroke();
    }
    setHasStrokes(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <ToolBtn active={tool === "pen"} onClick={() => setTool("pen")} icon={<PenTool className="w-3.5 h-3.5" />} label="Pen" />
          <ToolBtn active={tool === "eraser"} onClick={() => setTool("eraser")} icon={<Trash2 className="w-3.5 h-3.5" />} label="Eraser" />
        </div>
        <div className="flex items-center gap-2">
          {[2, 3, 5].map((w) =>
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            className={`rounded-full transition-all ${strokeWidth === w ? "bg-primary" : "bg-border"}`}
            style={{ width: w * 3 + 6, height: w * 3 + 6 }} />

          )}
        </div>
        <div className="flex gap-2">
          <button onClick={undo} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 13 }}>
            <Undo2 className="w-3.5 h-3.5" /> Undo
          </button>
          <button onClick={clear} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 13 }}>
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
        <button
          onClick={onSubmit}
          disabled={!hasStrokes}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 13 }}>

          <Send className="w-3.5 h-3.5" /> Analyze
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center bg-muted p-4" style={{ minHeight: 400 }}>
        <div className="rounded-2xl shadow-lg overflow-hidden" style={{ maxWidth: 700, width: "100%" }}>
          <canvas
            ref={canvasRef}
            width={700}
            height={420}
            className="w-full touch-none"
            style={{ cursor: tool === "pen" ? "crosshair" : "cell", display: "block" }} />

        </div>
      </div>
      <p className="text-center text-muted-foreground py-2" style={{ fontSize: 12 }}>
        Write naturally — at least 3 sentences for best results
      </p>
    </div>);

}

function ToolBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all ${active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
      style={{ fontSize: 12, fontWeight: 600 }}>

      {icon} {label}
    </button>);

}
