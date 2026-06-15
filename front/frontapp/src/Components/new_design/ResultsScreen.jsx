import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell } from
"recharts";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  Eye,
  Layers,
  ArrowLeft,
  Share2,
  ChevronRight } from
"lucide-react";






const radarData = [
{ metric: "Baseline", score: 52, fullMark: 100 },
{ metric: "Spacing", score: 41, fullMark: 100 },
{ metric: "Letter Size", score: 68, fullMark: 100 },
{ metric: "Alignment", score: 58, fullMark: 100 },
{ metric: "Slant", score: 74, fullMark: 100 },
{ metric: "Pressure", score: 45, fullMark: 100 }];


const trendData = [
{ date: "Apr 8", score: 65 },
{ date: "Apr 22", score: 58 },
{ date: "May 9", score: 61 },
{ date: "May 15", score: 55 },
{ date: "May 22", score: 48 },
{ date: "May 29", score: 42 }];


const metrics = [
{ label: "Baseline Consistency", value: 52, status: "moderate", desc: "Significant deviation from a stable writing baseline across the sample." },
{ label: "Word Spacing", value: 41, status: "poor", desc: "Large and irregular gaps between words indicate spatial planning difficulty." },
{ label: "Letter Size Variation", value: 68, status: "moderate", desc: "Noticeable inconsistency in letter height, particularly ascenders and descenders." },
{ label: "Line Alignment", value: 58, status: "moderate", desc: "Words drift slightly above and below the expected line of text." },
{ label: "Slant Consistency", value: 74, status: "good", desc: "Relatively stable slant angle maintained throughout the writing." },
{ label: "Writing Pressure", value: 45, status: "moderate", desc: "Pressure variation analysis coming in a future update." }];


const RISK_SCORE = 42;
const CONFIDENCE = 87.3;

function riskColor(score) {
  if (score < 35) return { text: "text-green-600", bg: "bg-green-100", label: "Low Risk" };
  if (score < 65) return { text: "text-amber-600", bg: "bg-amber-100", label: "Moderate Risk" };
  return { text: "text-red-600", bg: "bg-red-100", label: "High Risk" };
}

function statusColor(s) {
  if (s === "good") return { bar: "#0D9488", text: "text-accent" };
  if (s === "moderate") return { bar: "#F59E0B", text: "text-amber-500" };
  return { bar: "#EF4444", text: "text-red-500" };
}

export function ResultsScreen({ onBack, onViewExplainability }) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const risk = riskColor(RISK_SCORE);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22 }}>Analysis Results</h1>
            <p className="text-muted-foreground" style={{ fontSize: 13 }}>May 29, 2026 · Writing sample A</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 13 }}>
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 13 }}>
            <Download className="w-4 h-4" /> Report
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 12 }} className="text-amber-700 dark:text-amber-400">
          <strong>Screening only.</strong> DyScreen provides screening assistance and does not replace professional evaluation. Consult an educational specialist or clinician.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Main prediction card */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Gauge */}
            <div className="flex-shrink-0">
              <RiskGauge score={RISK_SCORE} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full ${risk.bg} ${risk.text}`} style={{ fontSize: 13, fontWeight: 700 }}>
                  {risk.label}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                  {CONFIDENCE}% confidence
                </span>
              </div>
              <h3 className="text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 18 }}>
                Potential dysgraphia markers detected
              </h3>
              <p className="text-muted-foreground mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>
                The analysis identified moderate signs of dysgraphia, including inconsistent word spacing, baseline drift, and variable letter sizing. These patterns may warrant further professional evaluation.
              </p>
              <button
                onClick={onViewExplainability}
                className="flex items-center gap-2 text-primary hover:underline"
                style={{ fontSize: 14, fontWeight: 600 }}>

                <Eye className="w-4 h-4" /> View AI explanation
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Confidence + score summary */}
        <div className="flex flex-col gap-3">
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-muted-foreground mb-1" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Risk Score</p>
            <p className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 36 }}>{RISK_SCORE}<span style={{ fontSize: 16, fontWeight: 500 }}>/100</span></p>
            <div className="h-2 rounded-full bg-muted mt-2">
              <div className="h-2 rounded-full" style={{ width: `${RISK_SCORE}%`, background: "linear-gradient(90deg, #0D9488, #F59E0B)" }} />
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-muted-foreground mb-1" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Confidence</p>
            <p className="text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 36, fontFamily: "'DM Mono', monospace" }}>{CONFIDENCE}%</p>
          </div>
        </div>

        {/* Handwriting image + heatmap toggle */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
              Visual Analysis
            </h3>
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setShowHeatmap(false)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${!showHeatmap ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                style={{ fontSize: 12, fontWeight: 600 }}>

                Original
              </button>
              <button
                onClick={() => setShowHeatmap(true)}
                className={`px-3 py-1 rounded-md text-sm transition-all ${showHeatmap ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
                style={{ fontSize: 12, fontWeight: 600 }}>

                <Layers className="w-3 h-3 inline mr-1" />
                Heatmap
              </button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden bg-muted" style={{ height: 180 }}>
            <HandwritingSVG heatmap={showHeatmap} />
          </div>
          <p className="text-muted-foreground mt-2" style={{ fontSize: 11 }}>
            {showHeatmap ? "Red regions indicate areas that most influenced the AI's prediction." : "Original handwriting sample submitted for analysis."}
          </p>
        </div>

        {/* Radar chart */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Metric Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Radar name="Score" dataKey="score" stroke="#0284C7" fill="#0284C7" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics grid */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Handwriting Metrics</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {metrics.map((m) => {
              const s = statusColor(m.status);
              return (
                <div key={m.label} className="p-3 rounded-xl bg-muted">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</p>
                    <span className={s.text} style={{ fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{m.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border mb-2">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${m.value}%`, background: s.bar }} />
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: 11, lineHeight: 1.4 }}>{m.desc}</p>
                </div>);

            })}
          </div>
          
        </div>
        
        

        {/* Trend chart */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border p-5">
          <h3 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Risk Score Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--muted-foreground)" }} />

              <Line type="monotone" dataKey="score" stroke="#0284C7" strokeWidth={2.5} dot={{ r: 4, fill: "#0284C7" }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-muted-foreground text-center mt-1" style={{ fontSize: 11 }}>Improving trend — score decreased 23 points</p>
        </div>

        {/* Recommendations */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Recommendations</h3>
          <div className="space-y-2">
            {[
            { icon: Info, color: "text-primary bg-primary/10", text: "Consider consulting an occupational therapist specializing in handwriting difficulties." },
            { icon: CheckCircle, color: "text-accent bg-accent/10", text: "Practice letter formation exercises focusing on consistent sizing and baseline adherence." },
            { icon: AlertTriangle, color: "text-amber-500 bg-amber-100", text: "Word spacing difficulties may benefit from structured grid or lined paper exercises." }].
            map((r, i) => {
              const Icon = r.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-foreground" style={{ fontSize: 13, lineHeight: 1.5 }}>{r.text}</p>
                </div>);

            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onViewExplainability}
            className="bg-primary text-white py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>

            <Eye className="w-4 h-4" /> View Explanation
          </button>
          <button
            className="border border-border text-foreground py-3 rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>

            <Download className="w-4 h-4" /> Download PDF Report
          </button>
          <button
            onClick={onBack}
            className="border border-border text-foreground py-3 rounded-xl hover:bg-muted transition-colors"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>

            New Analysis
          </button>
        </div>
        
        

      </div>
    </div>);

}

function RiskGauge({ score }) {
  const angle = score / 100 * 180 - 90;
  const gaugeData = [
  { value: 35, color: "#0D9488" },
  { value: 30, color: "#F59E0B" },
  { value: 35, color: "#EF4444" }];


  return (
    <div className="relative w-40 h-20">
      <ResponsiveContainer width="100%" height={80}>
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={45}
            outerRadius={65}
            dataKey="value"
            strokeWidth={0}>

            {gaugeData.map((entry, index) =>
            <Cell key={index} fill={entry.color} />
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        className="absolute bottom-1 left-1/2 w-0.5 h-10 bg-foreground rounded-full origin-bottom"
        style={{ transform: `translateX(-50%) rotate(${angle}deg)`, transformOrigin: "bottom center" }} />

      <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18 }}>
        {score}
      </p>
    </div>);

}

function HandwritingSVG({ heatmap }) {
  return (
    <svg width="100%" height="180" viewBox="0 0 600 180" style={{ display: "block" }}>
      {/* Background */}
      <rect width="600" height="180" fill="white" />
      {/* Ruled lines */}
      {[45, 90, 135].map((y) =>
      <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="#E0F2FE" strokeWidth="1" />
      )}
      {/* Handwriting */}
      <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <path d="M30 60 Q50 40 70 60 Q90 80 110 60" />
        <path d="M118 60 Q125 45 135 60 L135 80" />
        <path d="M145 60 Q160 38 175 60 Q170 75 160 70" />
        <path d="M188 48 L188 80 Q196 88 206 78 Q214 68 206 55 Q198 43 188 48Z" />
        <path d="M225 60 Q235 42 250 60 Q260 75 255 80" />
        <path d="M265 45 L265 80" />
        <path d="M278 60 Q290 40 305 60 Q320 80 335 60" />
        <path d="M345 60 Q358 42 368 60 L368 80" />
        <path d="M383 55 Q396 38 410 55 Q415 65 407 72" />
        <path d="M422 60 Q435 42 448 60 Q455 75 448 80" />
        <path d="M30 110 Q50 90 70 110 Q90 130 110 110" />
        <path d="M120 108 L120 132 Q128 138 138 128 Q146 118 138 105 Q130 93 120 108Z" />
        <path d="M155 110 Q170 92 185 110" />
        <path d="M195 100 L195 135" />
      </g>
      {/* Heatmap overlay */}
      {heatmap &&
      <g>
          <ellipse cx="110" cy="60" rx="35" ry="22" fill="#EF4444" fillOpacity="0.45" />
          <ellipse cx="188" cy="62" rx="28" ry="20" fill="#F59E0B" fillOpacity="0.35" />
          <ellipse cx="265" cy="60" rx="15" ry="16" fill="#EF4444" fillOpacity="0.4" />
          <ellipse cx="345" cy="62" rx="30" ry="18" fill="#F59E0B" fillOpacity="0.3" />
          <ellipse cx="120" cy="115" rx="20" ry="14" fill="#EF4444" fillOpacity="0.35" />
          <ellipse cx="60" cy="110" rx="25" ry="18" fill="#0284C7" fillOpacity="0.25" />
        </g>
      }
    </svg>);

}
