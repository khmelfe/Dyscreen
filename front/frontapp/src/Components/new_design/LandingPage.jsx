import { Brain, Zap, BarChart3, Eye, TrendingUp, ArrowRight, CheckCircle, Shield, Users, ChevronDown } from "lucide-react";







const features = [
{
  icon: Zap,
  color: "text-primary bg-primary/10",
  title: "AI Detection",
  description: "Advanced computer vision models analyze handwriting patterns and identify potential dysgraphia markers with high accuracy."
},
{
  icon: BarChart3,
  color: "text-accent bg-accent/10",
  title: "Handwriting Metrics",
  description: "Quantitative measurements of baseline consistency, letter size variation, word spacing, and slant across your writing sample."
},
{
  icon: Eye,
  color: "text-violet-600 bg-violet-100",
  title: "Visual Explanations",
  description: "Grad-CAM heatmaps highlight which areas of the handwriting sample influenced the AI's decision — transparent and interpretable."
},
{
  icon: TrendingUp,
  color: "text-amber-600 bg-amber-100",
  title: "Progress Tracking",
  description: "Monitor trends over time with historical analysis records. Track improvement after interventions or therapy sessions."
}];


const stats = [
{ value: "94.2%", label: "Detection Accuracy" },
{ value: "12,000+", label: "Samples Analyzed" },
{ value: "8", label: "Handwriting Metrics" },
{ value: "< 30s", label: "Analysis Time" }];


const howItWorks = [
{ step: "01", title: "Upload or Write", desc: "Submit a handwriting sample via photo upload or write directly on a digital canvas." },
{ step: "02", title: "AI Analysis", desc: "Our model extracts 8 key metrics and runs through a multi-layer classification pipeline." },
{ step: "03", title: "Visual Results", desc: "Receive an explainable prediction with heatmaps, metric charts, and a risk score." },
{ step: "04", title: "Consult a Specialist", desc: "Download your report and share it with an educational specialist or clinician." }];


export function LandingPage({ onGetStarted, darkMode, onToggleDark }) {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }} className="text-foreground">
              Dy<span className="text-primary">Screen</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-muted-foreground" style={{ fontSize: 14, fontWeight: 500 }}>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onGetStarted}
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 14, fontWeight: 500 }}>

              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
              style={{ fontSize: 14, fontWeight: 600 }}>

              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: darkMode ?
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(56,189,248,0.15) 0%, transparent 60%)" :
            "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(2,132,199,0.1) 0%, transparent 60%)"
          }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full mb-6" style={{ fontSize: 13, fontWeight: 600 }}>
            <Shield className="w-3.5 h-3.5" />
            Early Screening · Not a Medical Diagnosis
          </div>
          <h1
            className="text-foreground mb-5 mx-auto max-w-3xl"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.15 }}>

            AI-Powered Dysgraphia
            <span
              style={{
                background: "linear-gradient(135deg, #0284C7, #0D9488)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>

              {" "}Screening
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8" style={{ fontSize: 18, lineHeight: 1.6 }}>
            Analyze handwriting samples for potential signs of dysgraphia using advanced computer vision and explainable AI — in under 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="bg-primary text-primary-foreground px-6 py-3.5 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>

              Start Free Analysis <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#how-it-works"
              className="border border-border text-foreground px-6 py-3.5 rounded-xl hover:bg-card transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 16 }}>

              Learn More <ChevronDown className="w-4 h-4" />
            </a>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-muted-foreground" style={{ fontSize: 12 }}>
            ⚠️ DyScreen provides screening assistance and does not replace professional evaluation.
          </p>
        </div>

        {/* Hero illustration */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div
            className="rounded-2xl border border-border overflow-hidden shadow-lg"
            style={{ background: darkMode ? "#112036" : "#FFFFFF" }}>

            {/* Fake browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 bg-muted rounded-md h-5 max-w-[200px]" />
            </div>
            {/* Mock dashboard */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {[
              { label: "Risk Level", value: "Moderate", color: "text-amber-500" },
              { label: "Confidence", value: "87.3%", color: "text-primary" },
              { label: "Analyses", value: "24", color: "text-accent" },
              { label: "Avg Score", value: "42/100", color: "text-muted-foreground" }].
              map((card) =>
              <div key={card.label} className="bg-muted rounded-xl p-3">
                  <p style={{ fontSize: 11, fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p style={{ fontSize: 20, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }} className={card.color}>{card.value}</p>
                </div>
              )}
              <div className="col-span-2 bg-muted rounded-xl p-3 flex items-center justify-center" style={{ minHeight: 120 }}>
                <HandwritingIllustration />
              </div>
              <div className="col-span-2 bg-muted rounded-xl p-3">
                <p style={{ fontSize: 11, fontWeight: 600 }} className="text-muted-foreground uppercase tracking-wider mb-2">Metrics</p>
                {[
                { label: "Baseline", pct: 62 },
                { label: "Spacing", pct: 45 },
                { label: "Letter size", pct: 78 }].
                map((m) =>
                <div key={m.label} className="mb-1.5">
                    <div className="flex justify-between mb-0.5">
                      <span style={{ fontSize: 11 }} className="text-muted-foreground">{m.label}</span>
                      <span style={{ fontSize: 11 }} className="text-muted-foreground">{m.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border">
                      <div className="h-1.5 rounded-full bg-primary" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) =>
          <div key={s.label}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)" }} className="text-white">{s.value}</p>
              <p style={{ fontSize: 13, fontWeight: 500 }} className="text-blue-200 mt-1">{s.label}</p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-widest" style={{ fontSize: 12, fontWeight: 700 }}>Capabilities</p>
          <h2 className="text-foreground mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)" }}>
            Everything you need to screen effectively
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>{f.title}</h3>
                <p className="text-muted-foreground" style={{ fontSize: 14, lineHeight: 1.6 }}>{f.description}</p>
              </div>);

          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-card border-y border-border py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-accent uppercase tracking-widest" style={{ fontSize: 12, fontWeight: 700 }}>Process</p>
            <h2 className="text-foreground mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)" }}>
              How DyScreen works
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, i) =>
            <div key={item.step} className="relative">
                {i < howItWorks.length - 1 &&
              <div className="hidden lg:block absolute top-6 left-1/2 w-full h-px border-t border-dashed border-border" />
              }
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 relative z-10">
                  <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 14 }} className="text-primary">{item.step}</span>
                </div>
                <h4 className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{item.title}</h4>
                <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-widest" style={{ fontSize: 12, fontWeight: 700 }}>For Everyone</p>
          <h2 className="text-foreground mt-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)" }}>
            Built for the whole support ecosystem
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
          { icon: "🎓", label: "Students", desc: "Self-screen for dysgraphia and understand your handwriting patterns." },
          { icon: "👨‍👩‍👧", label: "Parents", desc: "Monitor your child's handwriting development and get actionable insights." },
          { icon: "📚", label: "Teachers", desc: "Quickly assess students who may need extra writing support." },
          { icon: "🏫", label: "Specialists", desc: "Supplement clinical evaluation with quantitative handwriting data." },
          { icon: "🔬", label: "Researchers", desc: "Access anonymized datasets and contribute to dysgraphia research." },
          { icon: "🏥", label: "Clinicians", desc: "Pre-screen patients efficiently before formal assessments." }].
          map((item) =>
          <div key={item.label} className="bg-card rounded-2xl p-5 border border-border">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="text-foreground mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{item.label}</h4>
              <p className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-white mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "clamp(24px, 4vw, 36px)" }}>
            Ready to screen your handwriting?
          </h2>
          <p className="text-blue-200 mb-6" style={{ fontSize: 16 }}>Free to use. Private. No medical data stored.</p>
          <button
            onClick={onGetStarted}
            className="bg-white text-primary px-8 py-4 rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>

            Start Analysis Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-muted-foreground" style={{ fontSize: 13 }}>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span>DyScreen © 2026</span>
          </div>
          <p>⚠️ For screening purposes only — not a diagnostic tool.</p>
        </div>
      </footer>
    </div>);

}

function HandwritingIllustration() {
  return (
    <svg width="180" height="80" viewBox="0 0 180 80" fill="none">
      {/* Ruled lines */}
      {[20, 40, 60].map((y) =>
      <line key={y} x1="10" y1={y} x2="170" y2={y} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      )}
      {/* Handwriting paths */}
      <path d="M15 35 Q25 20 35 35 Q45 50 55 35" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M60 35 Q65 25 72 35 L72 50" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M80 35 Q90 20 100 35 Q95 45 90 40" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M108 25 L108 50 Q115 55 120 45 Q125 35 120 28 Q115 20 108 25Z" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M130 35 Q140 20 150 35 Q155 42 148 48" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Heatmap blobs */}
      <ellipse cx="30" cy="32" rx="12" ry="8" fill="#EF4444" fillOpacity="0.25" />
      <ellipse cx="95" cy="32" rx="15" ry="9" fill="#F59E0B" fillOpacity="0.2" />
    </svg>);

}
