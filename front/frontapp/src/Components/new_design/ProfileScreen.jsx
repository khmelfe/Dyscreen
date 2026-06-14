import { useState } from "react";
import { User, Mail, Lock, Bell, Download, LogOut, Moon, Sun, Shield, ChevronRight, CheckCircle, BarChart3, Activity, Database } from "lucide-react";








export function ProfileScreen({ userName, darkMode, onToggleDark, onLogout }) {
  const [editingField, setEditingField] = useState(null);
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState("maya.chen@example.com");

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-foreground mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24 }}>Profile</h1>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left — user card */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar & identity */}
          <div className="bg-card rounded-2xl border border-border p-5 text-center">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #0284C7, #0D9488)", fontSize: 32, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>

              {name.charAt(0).toUpperCase()}
            </div>
            <p className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 18 }}>{name}</p>
            <p className="text-muted-foreground mb-3" style={{ fontSize: 13 }}>{email}</p>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full" style={{ fontSize: 12, fontWeight: 700 }}>
              <CheckCircle className="w-3.5 h-3.5" />
              Verified Account
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>My Statistics</h3>
            <div className="space-y-3">
              {[
              { icon: BarChart3, label: "Total Analyses", value: "24", color: "text-primary bg-primary/10" },
              { icon: Activity, label: "Avg Risk Score", value: "52/100", color: "text-amber-500 bg-amber-100" },
              { icon: Database, label: "Contributions", value: "3 samples", color: "text-accent bg-accent/10" }].
              map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{s.value}</p>
                      <p className="text-muted-foreground" style={{ fontSize: 12 }}>{s.label}</p>
                    </div>
                  </div>);

              })}
            </div>
          </div>
        </div>

        {/* Right — settings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal info */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Personal Information</h3>
            <div className="space-y-3">
              <EditableField
                label="Full Name"
                icon={<User className="w-4 h-4" />}
                value={name}
                isEditing={editingField === "name"}
                onEdit={() => setEditingField("name")}
                onSave={(v) => {setName(v);setEditingField(null);}}
                onCancel={() => setEditingField(null)} />

              <EditableField
                label="Email Address"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                isEditing={editingField === "email"}
                onEdit={() => setEditingField("email")}
                onSave={(v) => {setEmail(v);setEditingField(null);}}
                onCancel={() => setEditingField(null)} />

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <div className="text-muted-foreground"><Lock className="w-4 h-4" /></div>
                <div className="flex-1">
                  <p className="text-muted-foreground" style={{ fontSize: 12, fontWeight: 600 }}>Password</p>
                  <p className="text-foreground" style={{ fontSize: 14 }}>••••••••••</p>
                </div>
                <button className="text-primary" style={{ fontSize: 13, fontWeight: 600 }}>Change</button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Preferences</h3>
            <div className="space-y-1">
              <ToggleRow
                icon={darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                label="Dark Mode"
                desc="Switch between light and dark themes"
                enabled={darkMode}
                onToggle={onToggleDark} />

              <ToggleRow
                icon={<Bell className="w-4 h-4" />}
                label="Analysis Reminders"
                desc="Weekly reminder to submit a new writing sample"
                enabled={true}
                onToggle={() => {}} />

              <ToggleRow
                icon={<Shield className="w-4 h-4" />}
                label="Data Sharing"
                desc="Allow anonymized data to improve DyScreen AI"
                enabled={false}
                onToggle={() => {}} />

            </div>
          </div>

          {/* Reports */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Reports & Data</h3>
            <div className="space-y-2">
              {[
              { label: "Download all analysis reports (PDF)", icon: Download },
              { label: "Export raw data (CSV)", icon: Download },
              { label: "Request data deletion", icon: Shield }].
              map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors text-left">

                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground" style={{ fontSize: 13 }}>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>);

              })}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-5">
            <h3 className="text-red-600 dark:text-red-400 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>Account</h3>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:underline"
              style={{ fontSize: 14, fontWeight: 600 }}>

              <LogOut className="w-4 h-4" />
              Sign out of DyScreen
            </button>
          </div>
        </div>
      </div>
    </div>);

}

function EditableField({
  label,
  icon,
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel








}) {
  const [draft, setDraft] = useState(value);

  if (isEditing) {
    return (
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
        <p className="text-muted-foreground mb-1.5" style={{ fontSize: 12, fontWeight: 600 }}>{label}</p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full bg-transparent text-foreground focus:outline-none mb-2"
          style={{ fontSize: 14 }}
          autoFocus />

        <div className="flex gap-2">
          <button onClick={() => onSave(draft)} className="text-primary" style={{ fontSize: 12, fontWeight: 700 }}>Save</button>
          <button onClick={onCancel} className="text-muted-foreground" style={{ fontSize: 12 }}>Cancel</button>
        </div>
      </div>);

  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-muted-foreground" style={{ fontSize: 12, fontWeight: 600 }}>{label}</p>
        <p className="text-foreground" style={{ fontSize: 14 }}>{value}</p>
      </div>
      <button onClick={onEdit} className="text-primary" style={{ fontSize: 13, fontWeight: 600 }}>Edit</button>
    </div>);

}

function ToggleRow({
  icon,
  label,
  desc,
  enabled,
  onToggle






}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground" style={{ fontSize: 14, fontWeight: 500 }}>{label}</p>
        <p className="text-muted-foreground truncate" style={{ fontSize: 12 }}>{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-6 rounded-full transition-all flex-shrink-0 relative ${enabled ? "bg-primary" : "bg-switch-background"}`}>

        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: enabled ? "translateX(20px)" : "translateX(2px)" }} />

      </button>
    </div>);

}
