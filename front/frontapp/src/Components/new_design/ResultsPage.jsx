import { useState } from "react";
import {
  Brain, Sun, Moon, Download, AlertTriangle, Eye, Layers,
  CheckCircle, Info, TrendingDown, ChevronDown, ChevronUp, ArrowLeft } from
"lucide-react";







const RISK_SCORE = 42;
const CONFIDENCE = 87.3;
const BACKEND_ORIGIN = "http://localhost:8000";

const metrics = [
{ label: "Detected lines:", value: 52, status: "moderate" },
{ label: "Word Spacing", value: 41, status: "poor" },
{ label: "Letter Size Variation", value: 68, status: "moderate" },
{ label: "Line Alignment", value: 58, status: "moderate" },
{ label: "Slant Consistency", value: 74, status: "good" },
{ label: "Writing Pressure", value: 45, status: "moderate" },
{ label: "Letter Reversals", value: 88, status: "good" },
{ label: "Spatial Planning", value: 50, status: "moderate" }];


const trendData = [
{ label: "Apr 8", value: 73 },
{ label: "Apr 22", value: 65 },
{ label: "May 9", value: 61 },
{ label: "May 15", value: 55 },
{ label: "May 22", value: 48 },
{ label: "May 29", value: 42 }];


const radarMetrics = [
{ label: "Baseline", value: 52 },
{ label: "Spacing", value: 41 },
{ label: "Size", value: 68 },
{ label: "Alignment", value: 58 },
{ label: "Slant", value: 74 },
{ label: "Pressure", value: 45 }];



const Explanitions = {
  'Low Risk': {Headline: "No significant learning disabilities markers detected" ,bodytext : "The analysis indicates that the handwriting patterns closely align with typical development. Minimal to no indicators of LDs —such as severe baseline drift or highly irregular letter sizing—were found."},
  'Moderate Risk': {Headline: "Potential learning disabilities markers detected",bodytext :"The analysis identified moderate signs consistent with LDs —such as inconsistent word spacing, baseline drift, and variable letter sizing. These patterns suggest that writing may require significantly more effort than usual. "},
  'High Risk': {Headline: "Strong learning disabilities markers detected",bodytext:"The analysis identified pronounced, consistent indicators strongly associated with LDs. These include highly irregular letter formations, significant spacing inconsistencies, and severe baseline deviations across the analyzed text."}
}


const severityStyle = {
  high: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", iconCls: "text-red-500 bg-red-100", badge: "bg-red-100 text-red-600" },
  moderate: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", iconCls: "text-amber-500 bg-amber-100", badge: "bg-amber-100 text-amber-600" },
  low: { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", iconCls: "text-green-600 bg-green-100", badge: "bg-green-100 text-green-600" }
};

function statusBar(status,value,HighestValue) {
  
  let precantage = value /HighestValue
   if(precantage > 0.7){
       return "#0D9488" ;}
  else if(precantage > 0.3 && precantage <0.7)
    return "#F59E0B" ;
  return "#EF4444";
}

function getAnnotatedUrl(url) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getheatmapurl(url) {
   if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  return `${BACKEND_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function ResultsPage({ result, darkMode, onToggleDark, onNewAnalysis }) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [expanded, setExpanded] = useState(1);
  const annotatedUrl = getAnnotatedUrl(result?.data?.features?.annotated_url);
  const heatmapUrl = getheatmapurl(result?.data?.heatmap_url);
  const confidence = Number.parseFloat(result?.data?.prob ?? CONFIDENCE);
  const riskScore = Number.isFinite(confidence) ? Math.round(confidence) : RISK_SCORE;
  const riskLabel = riskScore < 35 ? "Low Risk" : riskScore < 65 ? "Moderate Risk" : "High Risk";
  const riskCls = riskScore < 35 ? "text-green-600 bg-green-100" : riskScore < 65 ? "text-amber-600 bg-amber-100" : "text-red-600 bg-red-100";
  const fixed_metrics = [
    { label: "Detected lines:", value: result.data.features.merged_lines.length, status: "moderate", HighestValue:5 },
    {label:  "Total Words:",value : result.data.features.total_words_found,status: "moderate", HighestValue:50 },
    // { label: "Words above baseline:", value: result.data.features.count_above_lines, status: "moderate",HighestValue:"none" },
    // { label: "Words below baseline:", value: result.data.features.count_under_lines, status: "moderate",HighestValue:"none" },
    // { label: "Word's gaps that above average user's gap:", value: result.data.features.large_gap_count, status: "moderate",HighestValue:"none" },
    // {label: "Average Spaces Between Words",value :result.data.features.avg_spaces,status:"moderate",HighestValue: " none"}
  ]
  const date = new Date();
  const formattedDate = date.toDateString(); 

  const numric_only_metrics = [

  ]
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onNewAnalysis} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 14 }}>
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16 }} className="text-foreground">
                Dy<span className="text-primary">Screen</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 13 }}>
              <Download className="w-3.5 h-3.5" /> PDF Report
            </button> */}
            <button onClick={onToggleDark} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border">
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Disclaimer */}
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p style={{ fontSize: 12 }} className="text-amber-800 dark:text-amber-400">
            <strong>Preliminary Screening only.</strong> DyScreen does not replace professional evaluation. Consult an educational specialist or occupational therapist.
          </p>
        </div>

        {/* Header card */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Gauge */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <GaugeChart score={riskScore} />
              <span className={`mt-2 px-3 py-1 rounded-full text-sm ${riskCls}`} style={{ fontWeight: 700, fontSize: 13 }}>{riskLabel}</span>
            </div>
             
            <div className="flex-1">
              
              <p className="text-muted-foreground mb-1" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Analysis 
                 · {formattedDate}</p>
              
              <h2 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22 }}>
              {Explanitions[riskLabel].Headline}
              </h2>
              <p className="text-muted-foreground mb-4" style={{ fontSize: 14, lineHeight: 1.65 }}>
               {Explanitions[riskLabel].bodytext}
              </p>
              <div className="flex flex-wrap gap-4">
                <Stat label="Likelihood" value={`${confidence}%`} color="text-primary" />
                <Stat label="Metrics Analyzed" value="6" color="text-accent" />
              </div>
            </div>
             
          </div>
        </div>

        <div className=" lg:grid-cols-2 gap-5">
          {/* Handwriting + heatmap toggle */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Visual Analysis</h3>
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <button onClick={() => setShowHeatmap(false)} className={`px-2.5 py-1 rounded-md transition-all ${!showHeatmap ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`} style={{ fontSize: 12, fontWeight: 600 }}>
                  Original
                </button>
                <button onClick={() => setShowHeatmap(true)} className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${showHeatmap ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`} style={{ fontSize: 12, fontWeight: 600 }}>
                  <Layers className="w-3 h-3" /> Heatmap
                </button>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden bg-white border border-border" style={{ height: "auto" }}>
              <HandwritingSVG heatmap={showHeatmap} annotatedUrl={annotatedUrl} heatmapurl={heatmapUrl}  />
            </div>
            <p className="text-muted-foreground mt-2" style={{ fontSize: 11 }}>
              {showHeatmap ? "Red = regions that most influenced the model prediction." : "Original submitted handwriting sample."}
            </p>
            
          </div>

          {/* Radar chart */}
          {/* <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Metric Radar</h3>
            <RadarChart data={radarMetrics} />
          </div> */}
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Handwriting Metrics</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {fixed_metrics.map((m) =>
            <div key={m.label} className="p-3 rounded-xl bg-muted">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</p>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: statusBar(m.status,m.value,m.HighestValue) }}>{m.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-border">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${m.value >= m.HighestValue ? 100 : ((m.value / m.HighestValue)*100)
                  
                  
                    
                  

                  }%`, background: statusBar(m.status,m.value,m.HighestValue) }} />
                </div>
              </div>
              
            )}
            
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 m-5">
            {[
              { title: "Words above baseline: ", desc: result.data.features.count_above_lines },
              {  title: "Words below baseline: ", desc: result.data.features.count_under_lines },
              {  title: "Average Word Spacing: ", desc: result.data.features.large_gap_count  },
              {  title: "Above-Avgrage Gaps: ", desc: result.data.features.avg_spaces },
            ].map((item) => (
              <div key={item.step} className="bg-background rounded-2xl p-5 border border-border">
                {/* <div className="w-5 h-5 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13 }} className="text-primary">{item.step}</span>
                </div> */}
                <h4 className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{item.title}</h4>
                <p className="text-muted-foreground " style={{ fontSize: 15, lineHeight: 1.6, textAlign:"center" }}>{item.desc} </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button onClick={onNewAnalysis} className="flex-1 py-3.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
            ← New Analysis
          </button>
          {/* <button className="flex-1 py-3.5 rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#0284C7,#0D9488)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
            <Download className="w-4 h-4" /> Download PDF Report
          </button> */}
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-muted-foreground" style={{ fontSize: 12 }}>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span>DyScreen · Deep Learning Handwriting Screening · 2026</span>
          </div>
          <p>⚠️ Not a diagnostic tool · For preliminary screening purposes only</p>
        </div>
      </footer>
    </div>);

}

function Stat({ label, value, color }) {
  return (
    <div>
      <p className={color} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22 }}>{value}</p>
      <p className="text-muted-foreground" style={{ fontSize: 12 }}>{label}</p>
    </div>);

}

function GaugeChart({ score }) {
  const cx = 80;
  const cy = 80;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const totalAngle = endAngle - startAngle;

  const arcPath = (from, to, innerR, outerR) => {
    const x1o = cx + outerR * Math.cos(from);
    const y1o = cy + outerR * Math.sin(from);
    const x2o = cx + outerR * Math.cos(to);
    const y2o = cy + outerR * Math.sin(to);
    const x1i = cx + innerR * Math.cos(to);
    const y1i = cy + innerR * Math.sin(to);
    const x2i = cx + innerR * Math.cos(from);
    const y2i = cy + innerR * Math.sin(from);
    const large = to - from > Math.PI ? 1 : 0;
    return `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${large} 0 ${x2i} ${y2i} Z`;
  };

  const segments = [
  { from: startAngle, to: startAngle + totalAngle * 0.35, color: "#0D9488" },
  { from: startAngle + totalAngle * 0.35, to: startAngle + totalAngle * 0.65, color: "#F59E0B" },
  { from: startAngle + totalAngle * 0.65, to: endAngle, color: "#EF4444" }];


  const needleAngle = startAngle + score / 100 * totalAngle;
  const needleX = cx + 50 * Math.cos(needleAngle);
  const needleY = cy + 50 * Math.sin(needleAngle);

  return (
    <svg width="160" height="90" viewBox="0 0 160 90">
      {segments.map((s, i) =>
      <path key={i} d={arcPath(s.from, s.to, 42, 62)} fill={s.color} />
      )}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill="var(--foreground)" />
      {/* <text x={cx} y={84} textAnchor="middle" fill="var(--foreground)" fontSize="15" fontFamily="'Plus Jakarta Sans', sans-serif" fontWeight="800">{score}</text> */}
    </svg>);

}

function RadarChart({ data }) {
  const cx = 110;
  const cy = 110;
  const r = 80;
  const n = data.length;

  const angle = (i) => i / n * 2 * Math.PI - Math.PI / 2;
  const pt = (i, radius) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i))
  });

  const gridLevels = [20, 40, 60, 80, 100];
  const dataPoints = data.map((d, i) => pt(i, d.value / 100 * r));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg width="100%" viewBox="0 0 220 220">
      {/* Grid */}
      {gridLevels.map((lvl) =>
      data.map((_, i) => {
        const p1 = pt(i, lvl / 100 * r);
        const p2 = pt((i + 1) % n, lvl / 100 * r);
        return <line key={`${lvl}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--border)" strokeWidth="1" />;
      })
      )}
      {/* Spokes */}
      {data.map((_, i) => {
        const outer = pt(i, r);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="var(--border)" strokeWidth="1" />;
      })}
      {/* Data polygon */}
      <path d={dataPath} fill="#0284C7" fillOpacity="0.25" stroke="#0284C7" strokeWidth="2" />
      {/* Data points */}
      {dataPoints.map((p, i) =>
      <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0284C7" />
      )}
      {/* Labels */}
      {data.map((d, i) => {
        const labelPt = pt(i, r + 16);
        return (
          <text key={i} x={labelPt.x} y={labelPt.y} textAnchor="middle" dominantBaseline="middle" fill="var(--muted-foreground)" fontSize="10" fontFamily="'Inter', sans-serif">
            {d.label}
          </text>);

      })}
    </svg>);

}

function TrendChart({ data }) {
  const w = 400;
  const h = 140;
  const pad = { top: 10, right: 10, bottom: 28, left: 28 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;

  const minV = 0;
  const maxV = 100;
  const xStep = iw / (data.length - 1);

  const pts = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + ih - (d.value - minV) / (maxV - minV) * ih
  }));

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${pad.top + ih} L${pts[0].x},${pad.top + ih} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y grid */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = pad.top + ih - v / 100 * ih;
        return (
          <g key={v}>
            <line x1={pad.left} y1={y} x2={pad.left + iw} y2={y} stroke="var(--border)" strokeWidth="1" />
            <text x={pad.left - 4} y={y} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="var(--muted-foreground)">{v}</text>
          </g>);

      })}
      {/* Area */}
      <path d={area} fill="url(#trendGrad)" />
      {/* Line */}
      <path d={line} fill="none" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {pts.map((p, i) =>
      <circle key={i} cx={p.x} cy={p.y} r="4" fill="#0284C7" />
      )}
      {/* X labels */}
      {data.map((d, i) =>
      <text key={i} x={pts[i].x} y={h - 4} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)" fontFamily="'Inter', sans-serif">{d.label}</text>
      )}
    </svg>);

}

function HandwritingSVG({ heatmap, annotatedUrl,heatmapurl  }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 600 160" style={{ display: "block" }}>
      <rect width="600" height="160" fill="white" />
      {annotatedUrl ? (
        <image
          href={annotatedUrl}
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />
      ) : (
        <>
          {[40, 80, 120].map((y) =>
          <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="#E0F2FE" strokeWidth="1" />
          )}
          <text x="300" y="82" textAnchor="middle" fill="#94A3B8" fontSize="13" fontFamily="'Inter', sans-serif">
            Annotated image unavailable
          </text>
        </>
      )}
      {heatmap &&
      <>
             <rect width="600" height="160" fill="white" />

            <image
          href={heatmapurl}
          x="0"
          y="0"
          width="100%"
          height="100%"
          
          preserveAspectRatio="none"
        />
         <defs>
            <linearGradient id="hbar" x1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0284C7" /><stop offset="50%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>
          <rect x="440" y="145" width="20%" height="5%" rx="3.5" fill="url(#hbar)" />
          <text x="437" y="151" fill="#94A3B8" fontSize="8" textAnchor="end">Low</text>
          <text x="564" y="151" fill="#94A3B8" fontSize="8">High</text>
        </>
      }
    </svg>);

}
