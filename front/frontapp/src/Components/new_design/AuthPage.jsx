// import { useState } from "react";
// import { Brain, Eye, EyeOff, ArrowLeft, Mail, Lock, User, CheckCircle } from "lucide-react";

// type AuthMode = "login" | "register" | "forgot";

// interface AuthPageProps {
//   onAuth: (name: string) => void;
//   onBack: () => void;
// }

// export function AuthPage({ onAuth, onBack }: AuthPageProps) {
//   const [mode, setMode] = useState<AuthMode>("login");
//   const [showPassword, setShowPassword] = useState(false);
//   const [forgotSent, setForgotSent] = useState(false);
//   const [form, setForm] = useState({ name: "", email: "", password: "" });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (mode === "forgot") {
//       setForgotSent(true);
//       return;
//     }
//     onAuth(form.name || form.email.split("@")[0] || "User");
//   };

//   return (
//     <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Inter', sans-serif" }}>
//       {/* Left panel — hidden on mobile */}
//       <div
//         className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
//         style={{ background: "linear-gradient(135deg, #0284C7, #0D9488)" }}
//       >
//         <div className="absolute inset-0 opacity-10">
//           {Array.from({ length: 20 }).map((_, i) => (
//             <div
//               key={i}
//               className="absolute rounded-full border border-white"
//               style={{
//                 width: (i + 1) * 60,
//                 height: (i + 1) * 60,
//                 top: "50%",
//                 left: "50%",
//                 transform: "translate(-50%, -50%)",
//                 opacity: 0.3 - i * 0.01,
//               }}
//             />
//           ))}
//         </div>
//         <div className="flex items-center gap-2 relative">
//           <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
//             <Brain className="w-5 h-5 text-white" />
//           </div>
//           <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22 }} className="text-white">
//             DyScreen
//           </span>
//         </div>
//         <div className="relative">
//           <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 32, lineHeight: 1.2 }} className="text-white mb-4">
//             Understand handwriting like never before
//           </h2>
//           <p className="text-blue-100" style={{ fontSize: 15, lineHeight: 1.6 }}>
//             DyScreen uses advanced AI to identify potential dysgraphia markers in handwriting samples — helping educators, parents, and clinicians act early.
//           </p>
//           <div className="mt-8 space-y-3">
//             {[
//               "AI-powered handwriting analysis",
//               "Visual explainability with heatmaps",
//               "Track progress over time",
//               "Share reports with specialists",
//             ].map((item) => (
//               <div key={item} className="flex items-center gap-2 text-blue-100">
//                 <CheckCircle className="w-4 h-4 text-teal-300 flex-shrink-0" />
//                 <span style={{ fontSize: 14 }}>{item}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//         <p className="text-blue-200 relative" style={{ fontSize: 12 }}>
//           ⚠️ DyScreen provides screening assistance and does not replace professional evaluation.
//         </p>
//       </div>

//       {/* Right panel — form */}
//       <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
//         <div className="w-full max-w-sm">
//           <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-8" style={{ fontSize: 14, fontWeight: 500 }}>
//             <ArrowLeft className="w-4 h-4" />
//             Back to home
//           </button>

//           {/* Mobile logo */}
//           <div className="lg:hidden flex items-center gap-2 mb-6">
//             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
//               <Brain className="w-4 h-4 text-white" />
//             </div>
//             <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }} className="text-foreground">DyScreen</span>
//           </div>

//           {mode === "forgot" ? (
//             <ForgotForm
//               sent={forgotSent}
//               email={form.email}
//               onEmailChange={(e) => setForm({ ...form, email: e })}
//               onSubmit={handleSubmit}
//               onBack={() => { setMode("login"); setForgotSent(false); }}
//             />
//           ) : (
//             <>
//               {/* Tab switcher */}
//               <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
//                 {(["login", "register"] as const).map((m) => (
//                   <button
//                     key={m}
//                     onClick={() => setMode(m)}
//                     className={`flex-1 py-2 rounded-lg transition-all ${
//                       mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
//                     }`}
//                     style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14 }}
//                   >
//                     {m === "login" ? "Sign In" : "Register"}
//                   </button>
//                 ))}
//               </div>

//               <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24 }} className="text-foreground mb-1">
//                 {mode === "login" ? "Welcome back" : "Create account"}
//               </h2>
//               <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
//                 {mode === "login" ? "Sign in to your DyScreen account" : "Start your free handwriting analysis"}
//               </p>

//               <form onSubmit={handleSubmit} className="space-y-4">
//                 {mode === "register" && (
//                   <InputField
//                     icon={<User className="w-4 h-4" />}
//                     type="text"
//                     placeholder="Full name"
//                     value={form.name}
//                     onChange={(v) => setForm({ ...form, name: v })}
//                     required
//                   />
//                 )}
//                 <InputField
//                   icon={<Mail className="w-4 h-4" />}
//                   type="email"
//                   placeholder="Email address"
//                   value={form.email}
//                   onChange={(v) => setForm({ ...form, email: v })}
//                   required
//                 />
//                 <div className="relative">
//                   <InputField
//                     icon={<Lock className="w-4 h-4" />}
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Password"
//                     value={form.password}
//                     onChange={(v) => setForm({ ...form, password: v })}
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                   >
//                     {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>

//                 {mode === "login" && (
//                   <button
//                     type="button"
//                     onClick={() => setMode("forgot")}
//                     className="text-primary hover:underline"
//                     style={{ fontSize: 13, fontWeight: 500 }}
//                   >
//                     Forgot password?
//                   </button>
//                 )}

//                 <button
//                   type="submit"
//                   className="w-full bg-primary text-white py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
//                   style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}
//                 >
//                   {mode === "login" ? "Sign In" : "Create Account"}
//                 </button>
//               </form>

//               {/* Divider */}
//               <div className="flex items-center gap-3 my-5">
//                 <div className="flex-1 h-px bg-border" />
//                 <span className="text-muted-foreground" style={{ fontSize: 12 }}>or continue with</span>
//                 <div className="flex-1 h-px bg-border" />
//               </div>

//               {/* Social */}
//               <div className="grid grid-cols-2 gap-3">
//                 {[
//                   {
//                     label: "Google",
//                     icon: (
//                       <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
//                         <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
//                         <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
//                         <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
//                         <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
//                       </svg>
//                     ),
//                   },
//                   {
//                     label: "Apple",
//                     icon: (
//                       <svg width="14" height="16" viewBox="0 0 14 17" fill="currentColor">
//                         <path d="M13.0007 13.8C12.6607 14.58 12.2607 15.3 11.8007 15.96C11.1807 16.86 10.6607 17.48 10.2607 17.8C9.64071 18.38 8.98071 18.68 8.28071 18.7C7.76071 18.7 7.14071 18.54 6.42071 18.22C5.68071 17.9 5.00071 17.74 4.38071 17.74C3.72071 17.74 3.02071 17.9 2.28071 18.22C1.52071 18.54 0.920713 18.7 0.480713 18.72C-0.199287 18.74 -0.859287 18.44 -1.49929 17.82C-1.93929 17.48 -2.47929 16.84 -3.09929 15.9C-3.75929 14.9 -4.29929 13.74 -4.71929 12.4C-5.15929 10.96 -5.37929 9.56 -5.37929 8.22C-5.37929 6.68 -5.07929 5.34 -4.47929 4.22C-4.01929 3.32 -3.37929 2.6 -2.55929 2.06C-1.73929 1.52 -0.859287 1.24 0.0807129 1.22C0.620713 1.22 1.34071 1.4 2.24071 1.74C3.12071 2.08 3.70071 2.26 3.96071 2.26C4.16071 2.26 4.82071 2.04 5.86071 1.62C6.86071 1.22 7.68071 1.04 8.32071 1.1C10.0807 1.24 11.4207 1.96 12.3407 3.26C10.7807 4.2 10.0207 5.52 10.0407 7.2C10.0607 8.52 10.5207 9.62 11.4207 10.5C11.8607 10.92 12.3607 11.24 12.9207 11.46C12.8007 11.82 12.6207 12.18 13.0007 13.8Z" fill="currentColor"/>
//                       </svg>
//                     ),
//                   },
//                 ].map((s) => (
//                   <button
//                     key={s.label}
//                     type="button"
//                     className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-muted transition-colors"
//                     style={{ fontSize: 14, fontWeight: 500 }}
//                   >
//                     {s.icon}
//                     <span className="text-foreground">{s.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function InputField({
//   icon,
//   type,
//   placeholder,
//   value,
//   onChange,
//   required,
// }: {
//   icon: React.ReactNode;
//   type: string;
//   placeholder: string;
//   value: string;
//   onChange: (v: string) => void;
//   required?: boolean;
// }) {
//   return (
//     <div className="relative">
//       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>
//       <input
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         required={required}
//         className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
//         style={{ fontSize: 14 }}
//       />
//     </div>
//   );
// }

// function ForgotForm({
//   sent,
//   email,
//   onEmailChange,
//   onSubmit,
//   onBack,
// }: {
//   sent: boolean;
//   email: string;
//   onEmailChange: (v: string) => void;
//   onSubmit: (e: React.FormEvent) => void;
//   onBack: () => void;
// }) {
//   if (sent) {
//     return (
//       <div className="text-center">
//         <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
//           <Mail className="w-8 h-8 text-accent" />
//         </div>
//         <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22 }} className="text-foreground mb-2">Check your inbox</h2>
//         <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>We sent a reset link to <strong>{email}</strong></p>
//         <button onClick={onBack} className="text-primary hover:underline" style={{ fontSize: 14, fontWeight: 600 }}>
//           Back to Sign In
//         </button>
//       </div>
//     );
//   }
//   return (
//     <>
//       <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24 }} className="text-foreground mb-1">Reset password</h2>
//       <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>Enter your email and we'll send a reset link.</p>
//       <form onSubmit={onSubmit} className="space-y-4">
//         <InputField icon={<Mail className="w-4 h-4" />} type="email" placeholder="Email address" value={email} onChange={onEmailChange} required />
//         <button type="submit" className="w-full bg-primary text-white py-3 rounded-xl hover:opacity-90 transition-opacity" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>
//           Send Reset Link
//         </button>
//       </form>
//       <button onClick={onBack} className="mt-4 text-muted-foreground hover:text-foreground transition-colors block" style={{ fontSize: 14 }}>← Back to Sign In</button>
//     </>
//   );
// }
import { useState } from "react";
import {
  Brain,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  CheckCircle,
} from "lucide-react";

export function AuthPage({ onAuth, onBack }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === "forgot") {
      setForgotSent(true);
      return;
    }

    onAuth(form.name || form.email.split("@")[0] || "User");
  };

  return (
    <div
      className="min-h-screen bg-background flex"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0284C7, #0D9488)" }}
      >
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: (i + 1) * 60,
                height: (i + 1) * 60,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.3 - i * 0.01,
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-white"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            DyScreen
          </span>
        </div>

        <div className="relative">
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1.2,
            }}
          >
            Understand handwriting like never before
          </h2>

          <p className="text-blue-100" style={{ fontSize: 15, lineHeight: 1.6 }}>
            DyScreen uses advanced AI to identify potential dysgraphia markers in
            handwriting samples — helping educators, parents, and clinicians act
            early.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "AI-powered handwriting analysis",
              "Visual explainability with heatmaps",
              "Track progress over time",
              "Share reports with specialists",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-blue-100">
                <CheckCircle className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span style={{ fontSize: 14 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-200 relative" style={{ fontSize: 12 }}>
          ⚠️ DyScreen provides screening assistance and does not replace
          professional evaluation.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-8"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>

          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-foreground"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              DyScreen
            </span>
          </div>

          {mode === "forgot" ? (
            <ForgotForm
              sent={forgotSent}
              email={form.email}
              onEmailChange={(email) => setForm({ ...form, email })}
              onSubmit={handleSubmit}
              onBack={() => {
                setMode("login");
                setForgotSent(false);
              }}
            />
          ) : (
            <>
              <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
                {["login", "register"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      mode === m
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {m === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              <h2
                className="text-foreground mb-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 24,
                }}
              >
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>

              <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
                {mode === "login"
                  ? "Sign in to your DyScreen account"
                  : "Start your free handwriting analysis"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <InputField
                    icon={<User className="w-4 h-4" />}
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(name) => setForm({ ...form, name })}
                    required
                  />
                )}

                <InputField
                  icon={<Mail className="w-4 h-4" />}
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(email) => setForm({ ...form, email })}
                  required
                />

                <div className="relative">
                  <InputField
                    icon={<Lock className="w-4 h-4" />}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={(password) => setForm({ ...form, password })}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-primary hover:underline"
                    style={{ fontSize: 13, fontWeight: 500 }}
                  >
                    Forgot password?
                  </button>
                )}

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-xl hover:opacity-90 transition-opacity mt-2"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange, required }) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </div>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-all"
        style={{ fontSize: 14 }}
      />
    </div>
  );
}

function ForgotForm({ sent, email, onEmailChange, onSubmit, onBack }) {
  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-accent" />
        </div>

        <h2
          className="text-foreground mb-2"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 800,
            fontSize: 22,
          }}
        >
          Check your inbox
        </h2>

        <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
          We sent a reset link to <strong>{email}</strong>
        </p>

        <button
          onClick={onBack}
          className="text-primary hover:underline"
          style={{ fontSize: 14, fontWeight: 600 }}
        >
          Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <>
      <h2
        className="text-foreground mb-1"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800,
          fontSize: 24,
        }}
      >
        Reset password
      </h2>

      <p className="text-muted-foreground mb-6" style={{ fontSize: 14 }}>
        Enter your email and we'll send a reset link.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <InputField
          icon={<Mail className="w-4 h-4" />}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={onEmailChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-xl hover:opacity-90 transition-opacity"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Send Reset Link
        </button>
      </form>

      <button
        onClick={onBack}
        className="mt-4 text-muted-foreground hover:text-foreground transition-colors block"
        style={{ fontSize: 14 }}
      >
        ← Back to Sign In
      </button>
    </>
  );
}