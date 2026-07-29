import { useState, useRef, useEffect } from "react";
import {
  Zap, Search, RefreshCw, Link2, ChevronRight, Check,
  Circle, MessageSquare, Clock, Layers, Music2,
  FlaskConical, Sliders, BookOpen, BarChart2, Cpu,
  Plus, ExternalLink, ChevronDown, ArrowRight, Mic2,
  FileText, Target, AlertTriangle, Headphones, Brain,
  Activity
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = "Sound Design" | "Arrangement" | "Mixing" | "Mastering" | "Export";

interface Priority {
  id: string;
  text: string;
  done: boolean;
  tag: string;
}

interface Note {
  id: string;
  type: "breakthrough" | "issue" | "idea";
  text: string;
  time: string;
}

interface Session {
  id: string;
  date: string;
  goal: string;
  duration: string;
  outcome: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const STAGES: Stage[] = ["Sound Design", "Arrangement", "Mixing", "Mastering", "Export"];

const PRIORITIES: Priority[] = [
  { id: "p1", text: "Lock sub layer — mono below 80Hz, sidechain from kick", done: true, tag: "LOW END" },
  { id: "p2", text: "Re-evaluate body oscillator detune — too wide vs reference", done: true, tag: "BASS" },
  { id: "p3", text: "Build drop B variation — compress energy to 8 bars", done: false, tag: "ARRANGEMENT" },
  { id: "p4", text: "Snare transient check — compare vs Mefjus / Noisia ratio", done: false, tag: "DRUMS" },
  { id: "p5", text: "Automate filter cutoff through mid-section — not static", done: false, tag: "AUTOMATION" },
];

const NOTES: Note[] = [
  {
    id: "n1", type: "breakthrough", time: "14:32",
    text: "Parallel distortion on body layer — 3:1 blend solves harshness without losing presence."
  },
  {
    id: "n2", type: "issue", time: "13:55",
    text: "Sub and kick collision between bars 33–36. Phase relationship unclear. Test polarity flip."
  },
  {
    id: "n3", type: "idea", time: "11:20",
    text: "Use FM ratio 1:3.5 as modulator for movement layer — cross-reference Redpill's approach."
  },
];

const SESSIONS: Session[] = [
  { id: "s1", date: "Today, 09:00", goal: "Sound Design – Body Layer", duration: "3h 20m", outcome: "Bass foundation locked. 2 issues flagged." },
  { id: "s2", date: "Yesterday", goal: "Drum Engineering – Groove", duration: "2h 10m", outcome: "Kick/snare ratio confirmed. Groove template saved." },
  { id: "s3", date: "Mon 21 Jul", goal: "Reference Analysis – Noisia", duration: "1h 45m", outcome: "3 production decisions extracted. Case study updated." },
];

const FAST_ACTIONS = [
  { id: "a1", label: "New Session", icon: Plus, shortcut: "⌘N", color: "#00ff41" },
  { id: "a2", label: "Open Build Sheet", icon: FileText, shortcut: "⌘B", color: "#00ccff" },
  { id: "a3", label: "Reference Analysis", icon: BarChart2, shortcut: "⌘R", color: "#ffaa00" },
  { id: "a4", label: "Preset Browser", icon: Sliders, shortcut: "⌘P", color: "#cc44ff" },
  { id: "a5", label: "Knowledge Base", icon: BookOpen, shortcut: "⌘K", color: "#00ccff" },
  { id: "a6", label: "AI Mentor", icon: Brain, shortcut: "⌘M", color: "#00ff41" },
];

const NOTE_COLORS = {
  breakthrough: "#00ff41",
  issue: "#ff2244",
  idea: "#ffaa00",
};

const NOTE_LABELS = {
  breakthrough: "BREAKTHROUGH",
  issue: "ISSUE",
  idea: "IDEA",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const suggestions = [
    "Bass Engineering", "Drum Layering", "FM Synthesis", "Low End System",
    "Mefjus Production Philosophy", "Noisia Case Study", "Preset Analysis Framework",
    "Session Planner", "Troubleshooting – Weak Bass", "Reference Analysis"
  ].filter(s => query === "" || s.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <div className="w-full max-w-xl mx-4 border"
        style={{ backgroundColor: "#0a0a0a", borderColor: "rgba(0,255,65,0.3)",
          boxShadow: "0 0 40px rgba(0,255,65,0.1)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "#1a1a1a" }}>
          <Search size={14} style={{ color: "#00ff41" }} />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search NPOS..."
            className="flex-1 bg-transparent outline-none text-sm font-mono text-foreground placeholder:text-muted-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace" }} />
          <span className="text-[9px] text-muted-foreground tracking-widest border px-1.5 py-0.5"
            style={{ borderColor: "#1a1a1a" }}>ESC</span>
        </div>
        <div className="py-2 max-h-72 overflow-auto">
          {suggestions.map((s, i) => (
            <button key={i} onClick={onClose}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,255,65,0.05)")}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
              <ChevronRight size={10} style={{ color: "#333" }} />
              <span className="text-[11px] text-foreground">{s}</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t flex items-center gap-4 text-[8px] text-muted-foreground tracking-widest"
          style={{ borderColor: "#1a1a1a" }}>
          <span>↑↓ NAVIGATE</span>
          <span>↵ SELECT</span>
          <span>ESC CLOSE</span>
        </div>
      </div>
    </div>
  );
}

function ProgressStepper({ currentStage, onStageChange }: {
  currentStage: Stage; onStageChange: (s: Stage) => void;
}) {
  return (
    <div className="flex items-center gap-0">
      {STAGES.map((stage, i) => {
        const idx = STAGES.indexOf(currentStage);
        const done = i < idx;
        const active = i === idx;
        const upcoming = i > idx;
        return (
          <div key={stage} className="flex items-center">
            <button onClick={() => onStageChange(stage)}
              className="flex flex-col items-center gap-1.5 px-4 py-3 border transition-all"
              style={{
                borderColor: active ? "#00ff41" : done ? "rgba(0,255,65,0.2)" : "#1a1a1a",
                backgroundColor: active ? "rgba(0,255,65,0.06)" : "transparent",
                minWidth: 120,
              }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 border transition-all"
                  style={{
                    borderColor: active ? "#00ff41" : done ? "#00ff41" : "#333",
                    backgroundColor: done ? "#00ff41" : "transparent",
                    boxShadow: active ? "0 0 6px #00ff41" : "none",
                  }} />
                <span className="text-[9px] tracking-widest uppercase font-mono"
                  style={{ color: active ? "#00ff41" : done ? "#00cc30" : "#444" }}>
                  {stage}
                </span>
              </div>
              {active && (
                <span className="text-[8px] text-muted-foreground tracking-wider">CURRENT</span>
              )}
              {done && (
                <span className="text-[8px] tracking-wider" style={{ color: "#00cc3066" }}>DONE</span>
              )}
            </button>
            {i < STAGES.length - 1 && (
              <div className="h-px w-4 shrink-0"
                style={{ backgroundColor: done ? "rgba(0,255,65,0.3)" : "#1a1a1a" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>("Arrangement");
  const [priorities, setPriorities] = useState<Priority[]>(PRIORITIES);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [bpm] = useState(174);
  const [key] = useState("D min");
  const [synced] = useState(true);
  const [notes, setNotes] = useState<Note[]>(NOTES);
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [mentorInput, setMentorInput] = useState("");
  const [mentorResponse, setMentorResponse] = useState<string | null>(null);
  const [mentorLoading, setMentorLoading] = useState(false);

  const navItems = ["Dashboard", "Build Sheet", "Session Log", "Knowledge", "Case Studies", "Presets", "AI Mentor"];

  const togglePriority = (id: string) => {
    setPriorities(prev => prev.map(p => p.id === id ? { ...p, done: !p.done } : p));
  };

  const simulateMentor = () => {
    if (!mentorInput.trim()) return;
    setMentorLoading(true);
    setMentorResponse(null);
    setTimeout(() => {
      setMentorLoading(false);
      setMentorResponse(
        "Stage: Arrangement. Based on your current build sheet, your Drop A foundation is locked. Next concrete step: compress your mid-section energy by reducing harmonic density — keep only Sub + Body + Rhythm. Remove or mute all layers that are not performing a single, clearly defined function. Reference: Mefjus 'Machinate' — note how bars 33–40 strip to two layers before the main drop. Once density is reduced, evaluate groove feel before adding back movement layer."
      );
      setMentorInput("");
    }, 1200);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const doneCount = priorities.filter(p => p.done).length;

  return (
    <div className="size-full flex flex-col bg-background overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* ══ HEADER ══ */}
      <header className="shrink-0 border-b" style={{ borderColor: "rgba(0,255,65,0.15)", backgroundColor: "#080808" }}>
        {/* Top strip */}
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "#111" }}>
          <div className="flex items-center gap-3">
            <Zap size={14} style={{ color: "#00ff41", filter: "drop-shadow(0 0 6px #00ff41)" }} />
            <span className="text-sm font-bold tracking-[0.25em]" style={{ color: "#00ff41", textShadow: "0 0 12px #00ff41" }}>
              NPOS/CTRL
            </span>
            <span className="text-[8px] text-muted-foreground tracking-widest hidden sm:block">
              NEUROFUNK PRODUCTION OS
            </span>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 border text-[9px] tracking-widest transition-colors"
              style={{ borderColor: "#1a1a1a", color: "#555" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#333"; (e.currentTarget as HTMLElement).style.color = "#888"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a"; (e.currentTarget as HTMLElement).style.color = "#555"; }}>
              <Search size={10} />
              <span>SEARCH</span>
              <span className="border px-1 py-0.5 ml-1" style={{ borderColor: "#222", color: "#444" }}>⌘K</span>
            </button>

            {/* Module status */}
            <div className="flex items-center gap-0 border" style={{ borderColor: "#1a1a1a" }}>
              {[
                { label: "BPM", value: String(bpm), color: "#00ccff" },
                { label: "KEY", value: key, color: "#ffaa00" },
                { label: "SYNC", value: synced ? "ON" : "OFF", color: synced ? "#00ff41" : "#ff2244" },
                { label: "LINK", value: "ACTIVE", color: "#00ff41" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 border-r last:border-r-0"
                  style={{ borderColor: "#1a1a1a" }}>
                  <span className="text-[8px] text-muted-foreground tracking-widest">{label}</span>
                  <span className="text-[10px] font-mono tabular-nums font-bold" style={{ color }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-[8px]" style={{ color: "#00ff41" }}>
              <RefreshCw size={9} style={{ animation: "spin 4s linear infinite" }} />
              <span className="tracking-widest">AUTOSAVE</span>
            </div>
          </div>
        </div>

        {/* Nav strip */}
        <nav className="flex items-center px-6">
          {navItems.map(item => (
            <button key={item} onClick={() => setActiveNav(item)}
              className="px-4 py-2.5 text-[10px] tracking-widest uppercase transition-all border-b-2"
              style={{
                color: activeNav === item ? "#00ff41" : "#444",
                borderBottomColor: activeNav === item ? "#00ff41" : "transparent",
                backgroundColor: "transparent",
              }}
              onMouseEnter={e => { if (activeNav !== item) (e.currentTarget as HTMLElement).style.color = "#888"; }}
              onMouseLeave={e => { if (activeNav !== item) (e.currentTarget as HTMLElement).style.color = "#444"; }}>
              {item}
            </button>
          ))}
        </nav>
      </header>

      {/* ══ MAIN CONTENT ══ */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">

          {/* ── 1. Current Track ── */}
          <section className="border" style={{ borderColor: "#1a1a1a" }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "#111", backgroundColor: "#0a0a0a" }}>
              <div className="flex items-center gap-2">
                <Music2 size={11} style={{ color: "#00ff41" }} />
                <span className="text-[9px] tracking-widest text-muted-foreground uppercase">Current Track</span>
              </div>
              <button className="text-[8px] tracking-widest text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors">
                Edit <ExternalLink size={8} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gridTemplateRows: "auto" }}>
              {[
                { label: "TITLE", value: "Untitled 07", accent: true },
                { label: "TEMPO", value: "174 BPM", accent: false },
                { label: "KEY", value: "D Minor", accent: false },
                { label: "STAGE", value: "Arrangement", accent: false },
                { label: "GOAL", value: "Lock Drop B structure", accent: false },
                { label: "REFERENCE", value: "Mefjus – Machinate", accent: false },
                { label: "MAIN PROBLEM", value: "Sub/kick collision bars 33–36", accent: false, warn: true },
                { label: "BASS ARCH", value: "Reese Body + 808 Sub", accent: false },
                { label: "CONFIDENCE", value: "62%", accent: false },
              ].map(({ label, value, accent, warn }) => (
                <div key={label} className="px-4 py-3 border-r border-b last:border-r-0"
                  style={{ borderColor: "#111" }}>
                  <div className="text-[8px] text-muted-foreground tracking-widest mb-1">{label}</div>
                  <div className="text-[11px] font-mono leading-tight"
                    style={{ color: warn ? "#ff2244" : accent ? "#00ff41" : "#c8c8c8",
                      textShadow: accent ? "0 0 8px #00ff41" : warn ? "0 0 6px #ff2244" : "none" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 2. Session Focus / Progress Stepper ── */}
          <section className="border" style={{ borderColor: "#1a1a1a" }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "#111", backgroundColor: "#0a0a0a" }}>
              <Activity size={11} style={{ color: "#00ff41" }} />
              <span className="text-[9px] tracking-widest text-muted-foreground uppercase">Session Focus</span>
            </div>
            <div className="px-4 py-4 flex flex-col gap-4">
              <ProgressStepper currentStage={currentStage} onStageChange={setCurrentStage} />
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="border-l-2 pl-3" style={{ borderColor: "rgba(0,255,65,0.3)" }}>
                  <div className="text-[8px] text-muted-foreground tracking-widest mb-1">LAST SESSION</div>
                  <div className="text-[10px] text-foreground">Body layer + sub routing locked. Parallel distortion blend confirmed.</div>
                </div>
                <div className="border-l-2 pl-3" style={{ borderColor: "rgba(0,204,255,0.3)" }}>
                  <div className="text-[8px] text-muted-foreground tracking-widest mb-1">NEXT STEP</div>
                  <div className="text-[10px] text-foreground">Build Drop B — reduce to 2 layers. Compress energy before reintroducing movement.</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3. Recent Notes ── */}
          <section className="border" style={{ borderColor: "#1a1a1a" }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "#111", backgroundColor: "#0a0a0a" }}>
              <div className="flex items-center gap-2">
                <FileText size={11} style={{ color: "#00ff41" }} />
                <span className="text-[9px] tracking-widest text-muted-foreground uppercase">Recent Notes</span>
              </div>
              <button className="flex items-center gap-1 text-[8px] tracking-widest transition-colors"
                style={{ color: "#00ff41" }}>
                <Plus size={9} />ADD
              </button>
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: "#111" }}>
              {notes.map(note => (
                <div key={note.id} className="px-4 py-3 transition-colors cursor-pointer"
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                  style={{ borderColor: "#111" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <div className="flex items-start gap-3">
                    <span className="text-[8px] font-mono tracking-widest px-1.5 py-0.5 border mt-0.5 shrink-0"
                      style={{ borderColor: `${NOTE_COLORS[note.type]}44`, color: NOTE_COLORS[note.type] }}>
                      {NOTE_LABELS[note.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-foreground leading-relaxed">{note.text}</div>
                    </div>
                    <span className="text-[8px] text-muted-foreground shrink-0 tabular-nums">{note.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. Daily Priorities ── */}
          <section className="border" style={{ borderColor: "#1a1a1a" }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "#111", backgroundColor: "#0a0a0a" }}>
              <div className="flex items-center gap-2">
                <Target size={11} style={{ color: "#00ff41" }} />
                <span className="text-[9px] tracking-widest text-muted-foreground uppercase">Daily Priorities</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono tabular-nums" style={{ color: "#00ff41" }}>
                  {doneCount}/{priorities.length}
                </span>
                <div className="w-24 h-1 bg-[#111]">
                  <div className="h-full transition-all duration-300"
                    style={{ width: `${(doneCount / priorities.length) * 100}%`,
                      backgroundColor: "#00ff41", boxShadow: "0 0 4px #00ff41" }} />
                </div>
              </div>
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: "#111" }}>
              {priorities.map(p => (
                <button key={p.id} onClick={() => togglePriority(p.id)}
                  className="flex items-center gap-3 px-4 py-3 text-left w-full transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                  <div className="w-4 h-4 border shrink-0 flex items-center justify-center transition-all"
                    style={{
                      borderColor: p.done ? "#00ff41" : "#333",
                      backgroundColor: p.done ? "rgba(0,255,65,0.1)" : "transparent",
                      boxShadow: p.done ? "0 0 6px rgba(0,255,65,0.3)" : "none",
                    }}>
                    {p.done && <Check size={10} style={{ color: "#00ff41" }} />}
                  </div>
                  <span className="text-[11px] flex-1 text-left transition-colors leading-relaxed"
                    style={{ color: p.done ? "#444" : "#c8c8c8",
                      textDecoration: p.done ? "line-through" : "none" }}>
                    {p.text}
                  </span>
                  <span className="text-[8px] tracking-widest border px-1.5 py-0.5 shrink-0"
                    style={{ borderColor: "#1a1a1a", color: "#555" }}>
                    {p.tag}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── 5. AI Mentor ── */}
          <section className="border" style={{ borderColor: "#1a1a1a" }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "#111", backgroundColor: "#0a0a0a" }}>
              <Brain size={11} style={{ color: "#00ff41" }} />
              <span className="text-[9px] tracking-widest text-muted-foreground uppercase">AI Mentor</span>
              <span className="ml-auto text-[8px] tracking-widest border px-1.5 py-0.5"
                style={{ borderColor: "#1a1a1a", color: "#444" }}>PRODUCTION MENTOR MODE</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Not a search engine. Ask a specific production question and get a concrete next step — referenced to your current build sheet, stage, and known problems.
              </p>
              {mentorResponse && (
                <div className="border-l-2 pl-3 py-2" style={{ borderColor: "#00ff41", backgroundColor: "rgba(0,255,65,0.03)" }}>
                  <div className="text-[8px] text-muted-foreground tracking-widest mb-1.5">MENTOR RESPONSE</div>
                  <p className="text-[11px] leading-relaxed" style={{ color: "#c8c8c8" }}>{mentorResponse}</p>
                </div>
              )}
              {mentorLoading && (
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "#00ff41" }}>
                  <div className="flex gap-0.5">
                    {[0.1, 0.2, 0.3].map(d => (
                      <div key={d} className="w-1 h-1 animate-pulse" style={{ backgroundColor: "#00ff41",
                        animationDelay: `${d}s` }} />
                    ))}
                  </div>
                  PROCESSING...
                </div>
              )}
              <div className="flex gap-2">
                <input value={mentorInput} onChange={e => setMentorInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") simulateMentor(); }}
                  placeholder="e.g. My sub feels weak against the kick — what's the decision tree?"
                  className="flex-1 bg-[#0a0a0a] border px-3 py-2.5 text-[11px] outline-none text-foreground placeholder:text-muted-foreground"
                  style={{ borderColor: "#1a1a1a", fontFamily: "'JetBrains Mono', monospace" }} />
                <button onClick={simulateMentor}
                  className="flex items-center gap-1.5 px-4 py-2.5 border text-[10px] tracking-widest uppercase transition-all"
                  style={{ borderColor: "#00ff41", color: "#00ff41", backgroundColor: "rgba(0,255,65,0.05)",
                    boxShadow: "0 0 12px rgba(0,255,65,0.1)" }}>
                  <ArrowRight size={11} />ASK
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  "What should I do next?",
                  "Weak sub against kick",
                  "How do I fix muddy mids?",
                  "Arrange Drop B from scratch",
                ].map(q => (
                  <button key={q} onClick={() => { setMentorInput(q); }}
                    className="text-[9px] border px-2 py-1 tracking-wide transition-colors"
                    style={{ borderColor: "#1a1a1a", color: "#555" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#333"; (e.currentTarget as HTMLElement).style.color = "#888"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1a1a1a"; (e.currentTarget as HTMLElement).style.color = "#555"; }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── 6. Recent Sessions ── */}
          <section className="border" style={{ borderColor: "#1a1a1a" }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "#111", backgroundColor: "#0a0a0a" }}>
              <div className="flex items-center gap-2">
                <Clock size={11} style={{ color: "#00ff41" }} />
                <span className="text-[9px] tracking-widest text-muted-foreground uppercase">Recent Sessions</span>
              </div>
              <button className="text-[8px] tracking-widest transition-colors"
                style={{ color: "#444" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#888")}
                onMouseLeave={e => (e.currentTarget.style.color = "#444")}>
                VIEW ALL LOG →
              </button>
            </div>
            {SESSIONS.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Clock size={20} className="mx-auto mb-3" style={{ color: "#222" }} />
                <div className="text-[10px] text-muted-foreground">No sessions logged yet.</div>
                <button className="mt-3 text-[9px] tracking-widest border px-3 py-1.5 transition-colors"
                  style={{ borderColor: "#1a1a1a", color: "#444" }}>
                  + START FIRST SESSION
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y" style={{ borderColor: "#111" }}>
                {SESSIONS.map(s => (
                  <div key={s.id} className="flex items-start gap-4 px-4 py-3 transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.01)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <div className="shrink-0">
                      <div className="text-[8px] text-muted-foreground tracking-widest tabular-nums">{s.date}</div>
                      <div className="text-[9px] tabular-nums mt-0.5" style={{ color: "#555" }}>{s.duration}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono" style={{ color: "#00ff41" }}>{s.goal}</div>
                      <div className="text-[10px] mt-1 leading-relaxed" style={{ color: "#666" }}>{s.outcome}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── 7. Fast Actions ── */}
          <section className="border" style={{ borderColor: "#1a1a1a" }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: "#111", backgroundColor: "#0a0a0a" }}>
              <Zap size={11} style={{ color: "#00ff41" }} />
              <span className="text-[9px] tracking-widest text-muted-foreground uppercase">Fast Actions</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 divide-x" style={{ borderColor: "#111" }}>
              {FAST_ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button key={action.id}
                    className="flex flex-col items-center gap-2 px-3 py-5 transition-all group"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(0,255,65,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                    <div className="flex items-center justify-center w-8 h-8 border transition-all group-hover:border-opacity-100"
                      style={{ borderColor: `${action.color}33` }}>
                      <Icon size={13} style={{ color: action.color }} />
                    </div>
                    <div className="text-[9px] tracking-wide text-center leading-tight"
                      style={{ color: "#666" }}>{action.label}</div>
                    <span className="text-[8px] border px-1 py-0.5"
                      style={{ borderColor: "#1a1a1a", color: "#333" }}>{action.shortcut}</span>
                  </button>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* ══ STATUS BAR ══ */}
      <footer className="shrink-0 border-t flex items-center justify-between px-6 py-1.5"
        style={{ borderColor: "#111", backgroundColor: "#070707" }}>
        <div className="flex items-center gap-4 text-[8px] text-muted-foreground tracking-widest">
          <span style={{ color: "#00ff41" }}>● NPOS ACTIVE</span>
          <span>SESSION: 3h 22m</span>
          <span>TRACK: Untitled 07</span>
          <span>STAGE: {currentStage.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 text-[8px] text-muted-foreground tracking-widest">
          <span>{doneCount}/{priorities.length} TASKS DONE</span>
          <span style={{ color: "#00ff41" }}>AUTOSAVE ON</span>
        </div>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
