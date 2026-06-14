import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, Info, TrendingDown, Eye, Zap } from "lucide-react";





const explanations = [
{
  id: 1,
  severity: "high",
  icon: AlertCircle,
  title: "Irregular baseline alignment detected",
  summary: "Writing drifts significantly above and below the expected line.",
  detail:
  "The model identified that the text does not maintain a consistent horizontal baseline. Words appear at varying vertical positions relative to each other, which is a common marker in dysgraphia. The affected regions are highlighted in red on the heatmap. This pattern accounted for ~28% of the model's confidence score.",
  regions: [{ x: 80, y: 48, w: 60, h: 28 }, { x: 310, y: 52, w: 45, h: 25 }],
  contribution: 28
},
{
  id: 2,
  severity: "high",
  icon: TrendingDown,
  title: "Large variation in word spacing",
  summary: "Significant and irregular gaps between words throughout the sample.",
  detail:
  "Word spacing analysis revealed gaps ranging from 4px to 38px between adjacent words, compared to an expected range of 8–14px. This extreme variability in spacing is associated with difficulties in visual-spatial planning, a key characteristic of dysgraphia. This finding contributed ~24% to the model output.",
  regions: [{ x: 105, y: 42, w: 32, h: 32 }, { x: 258, y: 42, w: 28, h: 30 }],
  contribution: 24
},
{
  id: 3,
  severity: "moderate",
  icon: Info,
  title: "Inconsistent letter size across sample",
  summary: "Letter height varies considerably, particularly in lowercase ascenders.",
  detail:
  "Letter height analysis shows a coefficient of variation of 0.41 across all characters. Specifically, letters 'b', 'd', 'h', 'l' showed the most variability. Consistent letter sizing requires fine motor control and working memory for letterform templates — both areas that may be affected in dysgraphia.",
  regions: [{ x: 140, y: 38, w: 40, h: 35 }, { x: 380, y: 40, w: 35, h: 32 }],
  contribution: 19
},
{
  id: 4,
  severity: "moderate",
  icon: Eye,
  title: "Pen pressure inconsistency",
  summary: "Stroke weight varies significantly across the handwriting sample.",
  detail:
  "Analysis of stroke width (as a proxy for pen pressure) revealed inconsistency throughout the sample. Heavy pressure appears in initial strokes, while finishing strokes show much lighter pressure. This pattern may indicate motor control difficulties common in dysgraphia.",
  regions: [{ x: 30, y: 40, w: 50, h: 30 }],
  contribution: 15
},
{
  id: 5,
  severity: "low",
  icon: Zap,
  title: "Letter reversal not detected",
  summary: "No significant b/d or p/q reversal patterns were identified.",
  detail:
  "The model specifically checked for common reversal patterns (b↔d, p↔q, n↔u). While these are often associated with dyslexia, they can also appear in dysgraphia. In this sample, no statistically significant reversals were detected. This is a positive finding that reduces the overall risk score.",
  regions: [],
  contribution: -8
}];


const severityStyles = {
  high: { bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", icon: "text-red-500 bg-red-100", badge: "bg-red-100 text-red-600" },
  moderate: { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-500 bg-amber-100", badge: "bg-amber-100 text-amber-600" },
  low: { bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", icon: "text-green-600 bg-green-100", badge: "bg-green-100 text-green-600" }
};

export function ExplainabilityScreen({ onBack }) {
  const [expanded, setExpanded] = useState(1);
  const [activeRegion, setActiveRegion] = useState(null);

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22 }}>AI Explanation</h1>
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>Why did the model predict Moderate Risk?</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: heatmap + explanation cards */}
        <div className="lg:col-span-3 space-y-4">
          {/* Heatmap visualization */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
                Grad-CAM Attention Map
              </h3>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full" style={{ fontSize: 11, fontWeight: 700 }}>
                AI Attention
              </span>
            </div>
            <div className="rounded-xl overflow-hidden bg-muted" style={{ height: 180 }}>
              <GradCAMSVG activeRegion={activeRegion} />
            </div>
            <p className="text-muted-foreground mt-2" style={{ fontSize: 11 }}>
              Brighter areas indicate regions that most strongly influenced the AI's prediction. Click an explanation card to highlight regions.
            </p>
          </div>

          {/* Explanation cards */}
          <div className="space-y-3">
            {explanations.map((exp) => {
              const Icon = exp.icon;
              const style = severityStyles[exp.severity];
              const isOpen = expanded === exp.id;
              return (
                <div
                  key={exp.id}
                  className={`rounded-2xl border transition-all cursor-pointer ${style.bg} ${style.border}`}
                  onClick={() => {
                    setExpanded(isOpen ? null : exp.id);
                    setActiveRegion(isOpen ? null : exp.id);
                  }}>

                  <div className="flex items-start gap-3 p-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h4 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
                          {exp.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full ${style.badge} flex-shrink-0`} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                          {exp.severity}
                        </span>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: 13 }}>{exp.summary}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span
                        className={`${exp.contribution > 0 ? "text-red-500" : "text-green-500"}`}
                        style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>

                        {exp.contribution > 0 ? `+${exp.contribution}` : exp.contribution}%
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {isOpen &&
                  <div className="px-4 pb-4 border-t border-border/50 pt-3">
                      <p className="text-foreground" style={{ fontSize: 13, lineHeight: 1.65 }}>{exp.detail}</p>
                      {exp.regions.length > 0 &&
                    <div className="mt-3 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm bg-red-400 opacity-70" />
                          <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                            {exp.regions.length} region{exp.regions.length > 1 ? "s" : ""} highlighted in the heatmap above
                          </p>
                        </div>
                    }
                    </div>
                  }
                </div>);

            })}
          </div>
        </div>

        {/* Right: contribution breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
              Factor Contributions
            </h3>
            <div className="space-y-3">
              {explanations.map((exp) =>
              <div key={exp.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground" style={{ fontSize: 12 }}>{exp.title.split(" ").slice(0, 3).join(" ")}…</span>
                    <span
                    className={exp.contribution > 0 ? "text-red-500" : "text-green-500"}
                    style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>

                      {exp.contribution > 0 ? `+${exp.contribution}%` : `${exp.contribution}%`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.abs(exp.contribution) * 3}%`,
                      background: exp.contribution > 0 ? "#EF4444" : "#0D9488"
                    }} />

                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
              About this model
            </h3>
            <div className="space-y-3 text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>
              <p>DyScreen uses a ResNet-50 backbone fine-tuned on 12,000+ handwriting samples, with Grad-CAM for visual explainability.</p>
              <p>The model was validated against clinical dysgraphia assessments with 94.2% sensitivity and 89.7% specificity.</p>
              <p className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg" style={{ fontSize: 12 }}>
                ⚠️ This is a screening tool. AI predictions require clinical validation before acting on results.
              </p>
            </div>
          </div>

          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-primary mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
              Next Steps
            </p>
            <ul className="space-y-1.5">
              {[
              "Share this report with an educational specialist",
              "Book a formal handwriting assessment",
              "Try the writing canvas for a follow-up sample"].
              map((s) =>
              <li key={s} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-foreground" style={{ fontSize: 13 }}>{s}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>);

}

function GradCAMSVG({ activeRegion }) {
  const allHotspots = [
  // region 1 — baseline
  { x: 80, y: 44, rx: 40, ry: 22, color: "#EF4444", opacity: 0.5 },
  { x: 310, y: 48, rx: 32, ry: 18, color: "#EF4444", opacity: 0.4 },
  // region 2 — spacing
  { x: 107, y: 44, rx: 18, ry: 16, color: "#F97316", opacity: 0.55 },
  { x: 260, y: 44, rx: 16, ry: 15, color: "#F97316", opacity: 0.45 },
  // region 3 — letter size
  { x: 150, y: 40, rx: 28, ry: 20, color: "#F59E0B", opacity: 0.4 },
  { x: 390, y: 42, rx: 24, ry: 18, color: "#F59E0B", opacity: 0.35 },
  // region 4 — pressure
  { x: 48, y: 42, rx: 32, ry: 18, color: "#F59E0B", opacity: 0.3 }];


  const regionMap = {
    1: [0, 1],
    2: [2, 3],
    3: [4, 5],
    4: [6]
  };

  const visible = activeRegion === null ?
  allHotspots :
  (regionMap[activeRegion] ?? []).map((i) => allHotspots[i]);

  return (
    <svg width="100%" height="180" viewBox="0 0 600 180" style={{ display: "block" }}>
      <rect width="600" height="180" fill="white" />
      {[45, 90, 135].map((y) =>
      <line key={y} x1="20" y1={y} x2="580" y2={y} stroke="#E0F2FE" strokeWidth="1" />
      )}
      {/* Handwriting */}
      <g stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7">
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
      {/* Heatmap blobs */}
      {visible.map((h, i) =>
      <ellipse
        key={i}
        cx={h.x}
        cy={h.y}
        rx={h.rx}
        ry={h.ry}
        fill={h.color}
        fillOpacity={h.opacity}
        style={{ filter: "blur(8px)", transition: "all 0.3s" }} />

      )}
      {/* Colorbar */}
      <defs>
        <linearGradient id="heatbar" x1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>
      <rect x="440" y="155" width="120" height="8" rx="4" fill="url(#heatbar)" />
      <text x="437" y="163" fill="#94A3B8" fontSize="9" textAnchor="end">Low</text>
      <text x="565" y="163" fill="#94A3B8" fontSize="9">High</text>
    </svg>);

}
