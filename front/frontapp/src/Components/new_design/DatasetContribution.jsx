import { useState } from "react";
import { Upload, CheckCircle, Database, Users, Globe, ChevronDown } from "lucide-react";

export function DatasetContribution() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    ageGroup: "",
    language: "",
    condition: "",
    consent: false
  });
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.consent || !form.ageGroup || !form.language) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4 sm:p-6 max-w-xl mx-auto flex flex-col items-center justify-center text-center" style={{ minHeight: "60vh", fontFamily: "'Inter', sans-serif" }}>
        <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-5">
          <CheckCircle className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-foreground mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24 }}>
          Thank you for contributing!
        </h2>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Your anonymized handwriting sample has been added to the DyScreen dataset. Every contribution helps improve AI accuracy for dysgraphia screening worldwide.
        </p>
        <div className="bg-accent/10 rounded-2xl px-8 py-4 mb-6">
          <p className="text-accent" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28 }}>12,848</p>
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>total samples (you're #12,848!)</p>
        </div>
        <button
          onClick={() => {setSubmitted(false);setForm({ ageGroup: "", language: "", condition: "", consent: false });setFile(null);}}
          className="text-primary hover:underline"
          style={{ fontSize: 14, fontWeight: 600 }}>

          Contribute another sample
        </button>
      </div>);

  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="mb-6">
        <h1 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24 }}>Dataset Contribution</h1>
        <p className="text-muted-foreground" style={{ fontSize: 14 }}>Help improve DyScreen by contributing anonymized handwriting samples.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 space-y-5">
            <h3 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>Sample Information</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <SelectField
                label="Age Group"
                value={form.ageGroup}
                onChange={(v) => setForm({ ...form, ageGroup: v })}
                options={[
                { value: "5-7", label: "5–7 years" },
                { value: "8-10", label: "8–10 years" },
                { value: "11-13", label: "11–13 years" },
                { value: "14-17", label: "14–17 years" },
                { value: "18+", label: "18+ years" }]
                }
                required />

              <SelectField
                label="Language / Script"
                value={form.language}
                onChange={(v) => setForm({ ...form, language: v })}
                options={[
                { value: "english", label: "English (Latin)" },
                { value: "arabic", label: "Arabic" },
                { value: "hindi", label: "Hindi (Devanagari)" },
                { value: "chinese", label: "Chinese (Simplified)" },
                { value: "spanish", label: "Spanish" },
                { value: "french", label: "French" },
                { value: "other", label: "Other" }]
                }
                required />

            </div>

            <SelectField
              label="Diagnosis / Condition (optional)"
              value={form.condition}
              onChange={(v) => setForm({ ...form, condition: v })}
              options={[
              { value: "none", label: "No known diagnosis" },
              { value: "dysgraphia", label: "Diagnosed dysgraphia" },
              { value: "dyslexia", label: "Dyslexia" },
              { value: "adhd", label: "ADHD" },
              { value: "asd", label: "Autism spectrum" },
              { value: "other", label: "Other / prefer not to say" }]
              } />


            {/* Upload */}
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 14, fontWeight: 600 }}>Handwriting Sample *</label>
              {!file ?
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}
                onDragOver={(e) => {e.preventDefault();setIsDragging(true);}}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {e.preventDefault();setIsDragging(false);const f = e.dataTransfer.files[0];if (f) setFile(f);}}
                onClick={() => document.getElementById("contrib-upload")?.click()}>

                  <input id="contrib-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-foreground" style={{ fontSize: 14, fontWeight: 600 }}>Drop image or click to upload</p>
                  <p className="text-muted-foreground" style={{ fontSize: 12 }}>JPG, PNG · max 20MB</p>
                </div> :

              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <p className="text-foreground flex-1 truncate" style={{ fontSize: 13, fontWeight: 600 }}>{file.name}</p>
                  <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-destructive" style={{ fontSize: 12 }}>Remove</button>
                </div>
              }
            </div>

            {/* Notes */}
            <div>
              <label className="block text-foreground mb-1.5" style={{ fontSize: 14, fontWeight: 600 }}>Additional notes (optional)</label>
              <textarea
                rows={3}
                placeholder="e.g. Written with dominant hand, after lunch break, using standard pencil…"
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
                style={{ fontSize: 14 }} />

            </div>

            {/* Consent */}
            <div className="bg-muted rounded-xl p-4">
              <p className="text-foreground mb-3" style={{ fontSize: 13, fontWeight: 600 }}>Data Use Consent</p>
              <p className="text-muted-foreground mb-3" style={{ fontSize: 12, lineHeight: 1.6 }}>
                By contributing, you agree that the handwriting sample will be anonymized, used solely for AI research and model improvement, and will not be linked to any personal identification. All data is handled in accordance with GDPR and COPPA regulations.
              </p>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded border-border accent-primary" />

                <span className="text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>
                  I consent to the anonymized use of this handwriting sample for AI research purposes. *
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!form.consent || !form.ageGroup || !form.language}
              className="w-full bg-accent text-white py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>

              Submit Contribution
            </button>
          </form>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Progress */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-accent" />
              <h3 className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Community Goal</h3>
            </div>
            <div className="mb-1 flex justify-between">
              <span className="text-muted-foreground" style={{ fontSize: 12 }}>15,000 samples</span>
              <span className="text-accent" style={{ fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>12,847</span>
            </div>
            <div className="h-3 rounded-full bg-muted mb-2 overflow-hidden">
              <div className="h-3 rounded-full bg-accent" style={{ width: "85.6%" }} />
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 12 }}>85.6% of goal · 2,153 samples to go</p>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Dataset Stats</h3>
            <div className="space-y-3">
              {[
              { icon: Users, label: "Contributors", value: "4,218", color: "text-primary" },
              { icon: Globe, label: "Languages", value: "27", color: "text-accent" },
              { icon: Database, label: "Total Samples", value: "12,847", color: "text-violet-600" }].
              map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }}>{s.value}</p>
                      <p className="text-muted-foreground" style={{ fontSize: 12 }}>{s.label}</p>
                    </div>
                  </div>);

              })}
            </div>
          </div>

          {/* Why contribute */}
          <div className="bg-primary/10 rounded-2xl p-4">
            <p className="text-primary mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
              Why contribute?
            </p>
            <ul className="space-y-1.5">
              {[
              "More data = more accurate AI predictions",
              "Helps underrepresented scripts and ages",
              "Your data stays anonymous and private",
              "You're advancing educational research"].
              map((item) =>
              <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground" style={{ fontSize: 12, lineHeight: 1.5 }}>{item}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>);

}

function SelectField({
  label,
  value,
  onChange,
  options,
  required






}) {
  return (
    <div>
      <label className="block text-foreground mb-1.5" style={{ fontSize: 14, fontWeight: 600 }}>
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer"
          style={{ fontSize: 14 }}>

          <option value="">Select…</option>
          {options.map((o) =>
          <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>);

}
