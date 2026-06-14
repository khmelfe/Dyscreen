import { useState } from "react";
import {
  LayoutDashboard,
  FlaskConical,
  History,
  Database,
  User,
  LogOut,
  Brain,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight } from
"lucide-react";












const navItems = [
{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
{ id: "new-analysis", label: "New Analysis", icon: FlaskConical },
{ id: "history", label: "History", icon: History },
{ id: "contribution", label: "Contribute", icon: Database },
{ id: "profile", label: "Profile", icon: User }];


export function Sidebar({ currentScreen, onNavigate, darkMode, onToggleDark, onLogout, userName }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
      collapsed ? "w-16" : "w-60"}`
      }>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed &&
        <span className="text-sidebar-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 18 }}>
            Dy<span className="text-primary">Screen</span>
          </span>
        }
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-sidebar-foreground transition-colors">

          {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              active ?
              "bg-sidebar-accent text-sidebar-primary" :
              "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`
              }>

              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed &&
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: active ? 600 : 500 }}>
                  {item.label}
                </span>
              }
              {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>);

        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <button
          onClick={onToggleDark}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all">

          {darkMode ? <Sun className="w-4 h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 flex-shrink-0" />}
          {!collapsed && <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 500 }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        {!collapsed &&
        <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary" style={{ fontSize: 12, fontWeight: 700 }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground truncate" style={{ fontSize: 12, fontWeight: 600 }}>{userName}</p>
            </div>
            <button onClick={onLogout} className="text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      </div>
    </aside>);

}

export function BottomNav({ currentScreen, onNavigate }) {
  const items = navItems.slice(0, 5);
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-2 py-1 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
              active ? "text-primary" : "text-muted-foreground"}`
              }>

              <Icon className="w-5 h-5" />
              <span style={{ fontSize: 10, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: active ? 600 : 500 }}>
                {item.label.split(" ")[0]}
              </span>
            </button>);

        })}
      </div>
    </nav>);

}

export function MobileHeader({
  currentScreen,
  darkMode,
  onToggleDark,
  onLogout





}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const label = navItems.find((n) => n.id === currentScreen)?.label ?? "DyScreen";

  return (
    <header className="md:hidden sticky top-0 z-40 bg-card/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16 }} className="text-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToggleDark} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={onLogout} className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>);

}
