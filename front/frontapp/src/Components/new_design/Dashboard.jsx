// import { TrendingUp, TrendingDown, FlaskConical, Clock, BarChart3, Database, AlertTriangle, CheckCircle, Activity, ArrowRight } from "lucide-react";

// interface DashboardProps {
//   userName: string;
//   onNewAnalysis: () => void;
//   onViewHistory: () => void;
//   onViewContribution: () => void;
// }

// const recentAnalyses = [
//   { id: 1, date: "May 29, 2026", risk: "Moderate", riskColor: "text-amber-500 bg-amber-100", confidence: 87.3, subject: "Writing sample A" },
//   { id: 2, date: "May 22, 2026", risk: "Low", riskColor: "text-green-600 bg-green-100", confidence: 91.2, subject: "Morning exercise" },
//   { id: 3, date: "May 15, 2026", risk: "High", riskColor: "text-red-500 bg-red-100", confidence: 78.6, subject: "Copy task" },
//   { id: 4, date: "May 9, 2026", risk: "Moderate", riskColor: "text-amber-500 bg-amber-100", confidence: 83.1, subject: "Sentence dictation" },
// ];

// const summaryCards = [
//   { label: "Total Analyses", value: "24", icon: BarChart3, change: "+3 this month", up: true, color: "text-primary bg-primary/10" },
//   { label: "Avg Risk Score", value: "42/100", icon: Activity, change: "-5 from last month", up: false, color: "text-accent bg-accent/10" },
//   { label: "Last Analysis", value: "1d ago", icon: Clock, change: "May 29, 2026", up: null, color: "text-violet-600 bg-violet-100" },
//   { label: "Contributions", value: "3", icon: Database, change: "Help improve AI", up: null, color: "text-amber-600 bg-amber-100" },
// ];

// export function Dashboard({ userName, onNewAnalysis, onViewHistory, onViewContribution }: DashboardProps) {
//   const hour = new Date().getHours();
//   const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

//   return (
//     <div className="p-4 sm:p-6 max-w-5xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
//       {/* Header */}
//       <div className="mb-6">
//         <p className="text-muted-foreground" style={{ fontSize: 14 }}>{greeting},</p>
//         <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 26 }}>
//           {userName}
//         </h1>
//       </div>

//       {/* Summary cards */}
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
//         {summaryCards.map((card) => {
//           const Icon = card.icon;
//           return (
//             <div key={card.label} className="bg-card rounded-2xl p-4 border border-border">
//               <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
//                 <Icon className="w-4 h-4" />
//               </div>
//               <p className="text-foreground mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 22 }}>{card.value}</p>
//               <p className="text-muted-foreground" style={{ fontSize: 11, fontWeight: 600 }}>{card.label}</p>
//               <div className="flex items-center gap-1 mt-1.5">
//                 {card.up === true && <TrendingUp className="w-3 h-3 text-green-500" />}
//                 {card.up === false && <TrendingDown className="w-3 h-3 text-red-400" />}
//                 <p className="text-muted-foreground" style={{ fontSize: 11 }}>{card.change}</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Main grid */}
//       <div className="grid lg:grid-cols-3 gap-4">
//         {/* New Analysis CTA */}
//         <div
//           className="lg:col-span-1 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:opacity-95 transition-opacity"
//           style={{ background: "linear-gradient(135deg, #0284C7, #0D9488)", minHeight: 200 }}
//           onClick={onNewAnalysis}
//         >
//           <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
//             <FlaskConical className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h3 className="text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }}>
//               New Analysis
//             </h3>
//             <p className="text-blue-100 mb-4" style={{ fontSize: 13, lineHeight: 1.5 }}>
//               Upload a handwriting sample or write directly on a canvas.
//             </p>
//             <div className="flex items-center gap-1.5 text-white" style={{ fontSize: 13, fontWeight: 600 }}>
//               Start now <ArrowRight className="w-3.5 h-3.5" />
//             </div>
//           </div>
//         </div>

//         {/* Recent Analyses */}
//         <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>Recent Analyses</h3>
//             <button onClick={onViewHistory} className="text-primary hover:underline" style={{ fontSize: 13, fontWeight: 600 }}>
//               View all
//             </button>
//           </div>
//           <div className="space-y-2">
//             {recentAnalyses.map((a) => (
//               <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
//                 <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
//                   <BarChart3 className="w-4 h-4 text-muted-foreground" />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-foreground truncate" style={{ fontSize: 13, fontWeight: 600 }}>{a.subject}</p>
//                   <p className="text-muted-foreground" style={{ fontSize: 11 }}>{a.date}</p>
//                 </div>
//                 <div className="flex items-center gap-2 flex-shrink-0">
//                   <span className={`px-2 py-0.5 rounded-full ${a.riskColor}`} style={{ fontSize: 11, fontWeight: 700 }}>
//                     {a.risk}
//                   </span>
//                   <span className="text-muted-foreground" style={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
//                     {a.confidence}%
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Disclaimer card */}
//         <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
//           <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
//           <div>
//             <p className="text-amber-800 dark:text-amber-300" style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
//               Screening Tool Only
//             </p>
//             <p className="text-amber-700 dark:text-amber-400" style={{ fontSize: 12, lineHeight: 1.5 }}>
//               DyScreen provides screening assistance and does not replace professional evaluation by an educational specialist or clinician.
//             </p>
//           </div>
//         </div>

//         {/* Contribute card */}
//         <div className="bg-card rounded-2xl border border-border p-5">
//           <div className="flex items-center gap-2 mb-3">
//             <Database className="w-4 h-4 text-accent" />
//             <h3 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Dataset Contribution</h3>
//           </div>
//           <p className="text-muted-foreground mb-4" style={{ fontSize: 13, lineHeight: 1.5 }}>
//             Help improve DyScreen by contributing anonymized handwriting samples to the training dataset.
//           </p>
//           <div className="mb-3">
//             <div className="flex justify-between mb-1">
//               <span className="text-muted-foreground" style={{ fontSize: 12 }}>Community goal: 15,000 samples</span>
//               <span className="text-accent" style={{ fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>12,847</span>
//             </div>
//             <div className="h-2 rounded-full bg-muted">
//               <div className="h-2 rounded-full bg-accent" style={{ width: "85.6%" }} />
//             </div>
//           </div>
//           <button onClick={onViewContribution} className="text-accent hover:underline" style={{ fontSize: 13, fontWeight: 600 }}>
//             Contribute a sample →
//           </button>
//         </div>

//         {/* Quick tips */}
//         <div className="bg-card rounded-2xl border border-border p-5">
//           <h3 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Tips for best results</h3>
//           <div className="space-y-2">
//             {[
//               "Use a well-lit, flat surface when photographing handwriting",
//               "Include at least 3–5 sentences for accurate analysis",
//               "Avoid crumpled or folded paper",
//               "Write naturally — don't alter your normal style",
//             ].map((tip) => (
//               <div key={tip} className="flex items-start gap-2">
//                 <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
//                 <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5 }}>{tip}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import {
  TrendingUp,
  TrendingDown,
  FlaskConical,
  Clock,
  BarChart3,
  Database,
  AlertTriangle,
  CheckCircle,
  Activity,
  ArrowRight,
} from "lucide-react";

const recentAnalyses = [
  {
    id: 1,
    date: "May 29, 2026",
    risk: "Moderate",
    riskColor: "text-amber-500 bg-amber-100",
    confidence: 87.3,
    subject: "Writing sample A",
  },
  {
    id: 2,
    date: "May 22, 2026",
    risk: "Low",
    riskColor: "text-green-600 bg-green-100",
    confidence: 91.2,
    subject: "Morning exercise",
  },
  {
    id: 3,
    date: "May 15, 2026",
    risk: "High",
    riskColor: "text-red-500 bg-red-100",
    confidence: 78.6,
    subject: "Copy task",
  },
  {
    id: 4,
    date: "May 9, 2026",
    risk: "Moderate",
    riskColor: "text-amber-500 bg-amber-100",
    confidence: 83.1,
    subject: "Sentence dictation",
  },
];

const summaryCards = [
  {
    label: "Total Analyses",
    value: "24",
    icon: BarChart3,
    change: "+3 this month",
    up: true,
    color: "text-primary bg-primary/10",
  },
  {
    label: "Avg Risk Score",
    value: "42/100",
    icon: Activity,
    change: "-5 from last month",
    up: false,
    color: "text-accent bg-accent/10",
  },
  {
    label: "Last Analysis",
    value: "1d ago",
    icon: Clock,
    change: "May 29, 2026",
    up: null,
    color: "text-violet-600 bg-violet-100",
  },
  {
    label: "Contributions",
    value: "3",
    icon: Database,
    change: "Help improve AI",
    up: null,
    color: "text-amber-600 bg-amber-100",
  },
];

export function Dashboard({
  userName,
  onNewAnalysis,
  onViewHistory,
  onViewContribution,
}) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="p-4 sm:p-6 max-w-5xl mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="mb-6">
        <p className="text-muted-foreground" style={{ fontSize: 14 }}>
          {greeting},
        </p>

        <h1
          className="text-foreground"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 26,
          }}
        >
          {userName}
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="bg-card rounded-2xl p-4 border border-border"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <p
                className="text-foreground mb-0.5"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                }}
              >
                {card.value}
              </p>

              <p
                className="text-muted-foreground"
                style={{ fontSize: 11, fontWeight: 600 }}
              >
                {card.label}
              </p>

              <div className="flex items-center gap-1 mt-1.5">
                {card.up === true && (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                )}

                {card.up === false && (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}

                <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                  {card.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* New Analysis CTA */}
        <div
          className="lg:col-span-1 rounded-2xl p-6 flex flex-col justify-between cursor-pointer hover:opacity-95 transition-opacity"
          style={{
            background: "linear-gradient(135deg, #0284C7, #0D9488)",
            minHeight: 200,
          }}
          onClick={onNewAnalysis}
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>

          <div>
            <h3
              className="text-white mb-1"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              New Analysis
            </h3>

            <p
              className="text-blue-100 mb-4"
              style={{ fontSize: 13, lineHeight: 1.5 }}
            >
              Upload a handwriting sample or write directly on a canvas.
            </p>

            <div
              className="flex items-center gap-1.5 text-white"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              Start now <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-foreground"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              Recent Analyses
            </h3>

            <button
              onClick={onViewHistory}
              className="text-primary hover:underline"
              style={{ fontSize: 13, fontWeight: 600 }}
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {recentAnalyses.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-foreground truncate"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    {a.subject}
                  </p>

                  <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                    {a.date}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full ${a.riskColor}`}
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {a.risk}
                  </span>

                  <span
                    className="text-muted-foreground"
                    style={{
                      fontSize: 11,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    {a.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer card */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />

          <div>
            <p
              className="text-amber-800 dark:text-amber-300"
              style={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Screening Tool Only
            </p>

            <p
              className="text-amber-700 dark:text-amber-400"
              style={{ fontSize: 12, lineHeight: 1.5 }}
            >
              DyScreen provides screening assistance and does not replace
              professional evaluation by an educational specialist or clinician.
            </p>
          </div>
        </div>

        {/* Contribute card */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-accent" />

            <h3
              className="text-foreground"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Dataset Contribution
            </h3>
          </div>

          <p
            className="text-muted-foreground mb-4"
            style={{ fontSize: 13, lineHeight: 1.5 }}
          >
            Help improve DyScreen by contributing anonymized handwriting samples
            to the training dataset.
          </p>

          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground" style={{ fontSize: 12 }}>
                Community goal: 15,000 samples
              </span>

              <span
                className="text-accent"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                12,847
              </span>
            </div>

            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-accent" style={{ width: "85.6%" }} />
            </div>
          </div>

          <button
            onClick={onViewContribution}
            className="text-accent hover:underline"
            style={{ fontSize: 13, fontWeight: 600 }}
          >
            Contribute a sample →
          </button>
        </div>

        {/* Quick tips */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3
            className="text-foreground mb-3"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Tips for best results
          </h3>

          <div className="space-y-2">
            {[
              "Use a well-lit, flat surface when photographing handwriting",
              "Include at least 3–5 sentences for accurate analysis",
              "Avoid crumpled or folded paper",
              "Write naturally — don't alter your normal style",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />

                <p
                  className="text-muted-foreground"
                  style={{ fontSize: 12, lineHeight: 1.5 }}
                >
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}