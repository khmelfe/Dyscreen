import { useState } from "react";
import { Search, Filter, BarChart3, ChevronDown, Eye, Download, Calendar, AlertTriangle } from "lucide-react";





const analyses = [
{ id: 1, date: "May 29, 2026", subject: "Writing sample A", risk: "Moderate", riskColor: "text-amber-600 bg-amber-100", confidence: 87.3, score: 42, notes: "Morning session" },
{ id: 2, date: "May 22, 2026", subject: "Morning exercise", risk: "Low", riskColor: "text-green-600 bg-green-100", confidence: 91.2, score: 28, notes: "After OT session" },
{ id: 3, date: "May 15, 2026", subject: "Copy task", risk: "High", riskColor: "text-red-600 bg-red-100", confidence: 78.6, score: 71, notes: "Copied from board" },
{ id: 4, date: "May 9, 2026", subject: "Sentence dictation", risk: "Moderate", riskColor: "text-amber-600 bg-amber-100", confidence: 83.1, score: 55, notes: "" },
{ id: 5, date: "Apr 29, 2026", subject: "Free writing", risk: "Moderate", riskColor: "text-amber-600 bg-amber-100", confidence: 80.4, score: 49, notes: "Creative writing" },
{ id: 6, date: "Apr 22, 2026", subject: "Alphabet exercise", risk: "Low", riskColor: "text-green-600 bg-green-100", confidence: 89.0, score: 31, notes: "Letter practice" },
{ id: 7, date: "Apr 15, 2026", subject: "Story writing", risk: "High", riskColor: "text-red-600 bg-red-100", confidence: 76.2, score: 68, notes: "Baseline" },
{ id: 8, date: "Apr 8, 2026", subject: "Initial assessment", risk: "High", riskColor: "text-red-600 bg-red-100", confidence: 82.5, score: 73, notes: "First analysis" }];


export function HistoryScreen({ onViewResult }) {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const filtered = analyses.filter((a) => {
    const matchSearch = a.subject.toLowerCase().includes(search.toLowerCase()) || a.notes.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === "all" || a.risk.toLowerCase() === riskFilter;
    return matchSearch && matchRisk;
  }).sort((a, b) => {
    if (sortBy === "score") return a.score - b.score;
    if (sortBy === "confidence") return b.confidence - a.confidence;
    return 0;
  });

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24 }}>Analysis History</h1>
        <p className="text-muted-foreground" style={{ fontSize: 14 }}>{analyses.length} analyses · Oldest: Apr 8, 2026</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
        { label: "Total", value: "8", color: "text-primary" },
        { label: "Avg Score", value: "52/100", color: "text-amber-500" },
        { label: "Improvement", value: "↓31pts", color: "text-accent" }].
        map((s) =>
        <div key={s.label} className="bg-card rounded-2xl border border-border p-3 text-center">
            <p className={`${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }}>{s.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: 12 }}>{s.label}</p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search analyses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            style={{ fontSize: 14 }} />

        </div>

        {/* Risk filter */}
        <div className="flex gap-1.5 flex-wrap">
          {["all", "low", "moderate", "high"].map((r) =>
          <button
            key={r}
            onClick={() => setRiskFilter(r)}
            className={`px-3 py-2 rounded-lg capitalize transition-all ${riskFilter === r ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            style={{ fontSize: 13, fontWeight: 600 }}>

              {r}
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-card text-foreground focus:outline-none cursor-pointer"
            style={{ fontSize: 13 }}>

            <option value="date">Sort: Date</option>
            <option value="score">Sort: Risk Score</option>
            <option value="confidence">Sort: Confidence</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden sm:block bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Date", "Subject", "Risk Level", "Score", "Confidence", "Actions"].map((h) =>
              <th key={h} className="text-left px-4 py-3 text-muted-foreground" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) =>
            <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span style={{ fontSize: 13 }} className="text-foreground">{a.date}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>{a.subject}</p>
                  {a.notes && <p className="text-muted-foreground" style={{ fontSize: 11 }}>{a.notes}</p>}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full ${a.riskColor}`} style={{ fontSize: 11, fontWeight: 700 }}>{a.risk}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted">
                      <div className="h-1.5 rounded-full" style={{ width: `${a.score}%`, background: a.score < 35 ? "#0D9488" : a.score < 65 ? "#F59E0B" : "#EF4444" }} />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace" }} className="text-muted-foreground">{a.score}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span style={{ fontSize: 13, fontFamily: "'DM Mono', monospace" }} className="text-muted-foreground">{a.confidence}%</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={onViewResult} className="flex items-center gap-1 text-primary hover:underline" style={{ fontSize: 12, fontWeight: 600 }}>
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: 12 }}>
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length === 0 &&
        <div className="py-12 text-center text-muted-foreground" style={{ fontSize: 14 }}>No analyses match your filters.</div>
        }
      </div>

      {/* Card layout — mobile */}
      <div className="sm:hidden space-y-3">
        {filtered.map((a) =>
        <div key={a.id} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-foreground" style={{ fontSize: 14, fontWeight: 600 }}>{a.subject}</p>
                <p className="text-muted-foreground" style={{ fontSize: 12 }}>{a.date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full flex-shrink-0 ${a.riskColor}`} style={{ fontSize: 11, fontWeight: 700 }}>{a.risk}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-muted-foreground" style={{ fontSize: 11 }}>Risk Score</span>
                  <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }} className="text-muted-foreground">{a.score}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full" style={{ width: `${a.score}%`, background: a.score < 35 ? "#0D9488" : a.score < 65 ? "#F59E0B" : "#EF4444" }} />
                </div>
              </div>
              <button onClick={onViewResult} className="flex items-center gap-1 text-primary" style={{ fontSize: 12, fontWeight: 600 }}>
                <Eye className="w-3.5 h-3.5" /> View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

}
