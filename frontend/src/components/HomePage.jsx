import React, { useRef } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Search, 
  Code2, 
  Sparkles, 
  ArrowRight,
  Github,
  CheckCircle2,
  AlertCircle,
  Activity,
  Brain,
  Cpu,
  Lock,
  Layers,
  BookOpen,
  MessageSquare
} from 'lucide-react';

const HomePage = ({ onOpenEditor }) => {
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-full bg-deep-dark p-10 space-y-16 max-w-7xl mx-auto overflow-y-auto scroll-smooth h-full scrollbar-thin">
      
      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-panel-dark to-deep-dark border border-border-main p-16">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-accent-primary text-[10px] font-black tracking-[0.2em] uppercase">
            <Sparkles className="w-4 h-4" />
            Next-Gen Code Intelligence
          </div>
          
          <h1 className="text-7xl font-black leading-[0.95] tracking-tighter text-white">
            AI-powered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-[#a78bfa]">
              Coding Mentor.
            </span>
          </h1>
          
          <p className="text-xl text-text-dim leading-relaxed max-w-2xl font-medium">
            Professional AI-powered coding mentor for 7 programming languages. Build, debug, and optimize with absolute confidence.
          </p>
          
          <div className="flex items-center gap-5 pt-4">
            <button 
              onClick={onOpenEditor}
              className="flex items-center gap-3 bg-white text-deep-dark px-10 py-5 rounded-[20px] font-black text-lg hover:bg-opacity-90 hover:scale-[1.05] transition-all shadow-2xl shadow-white/10 active:scale-95"
            >
              Launch Reviewer
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => window.open("https://github.com/abhaychaudhary18/AI-CODE-MENTOR", "_blank")}
              className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-10 py-5 rounded-[20px] font-black text-lg hover:bg-white/10 hover:scale-[1.05] transition-all active:scale-95"
            >
              <Github className="w-6 h-6" />
              View on GitHub
            </button>
          </div>
        </div>

        {/* Floating Stat Card */}
        <div className="absolute top-16 right-16 hidden xl:block w-80 p-8 bg-editor-dark border border-border-main rounded-[32px] shadow-2xl neon-glow backdrop-blur-xl bg-opacity-80">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-success-green/10 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-success-green" />
            </div>
            <span className="text-[10px] font-black text-text-dim uppercase tracking-widest">Live Security</span>
          </div>
          <p className="text-3xl font-black text-white mb-2 tracking-tighter">99.8% Accuracy</p>
          <p className="text-sm text-text-dim leading-relaxed font-medium">Enterprise-grade logic validation for critical systems.</p>
        </div>
      </section>

      {/* ── Stats Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Terminal} value="< 2s" label="Analysis Speed" color="text-accent-primary" />
        <StatCard icon={ShieldCheck} value="50+" label="Security Patterns" color="text-success-green" />
        <StatCard icon={Cpu} value="O(Log N)" label="Perf Optimization" color="text-warning-orange" />
        <StatCard icon={Zap} value="7" label="Supported Languages" color="text-purple-400" />
      </div>

      {/* ── Features Section ────────────────────────────────── */}
      <section ref={featuresRef} className="space-y-12 pt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tighter">Engineered for Excellence.</h2>
            <p className="text-text-dim font-medium">Unique features that redefine the developer experience.</p>
          </div>
          <button 
            onClick={scrollToFeatures}
            className="text-accent-primary font-black flex items-center gap-2 hover:translate-x-1 transition-transform tracking-tight"
          >
            See all features <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard icon={Brain} title="AI Error Mentor" desc="Explains complex errors in simple terms." />
          <FeatureCard icon={CheckCircle2} title="Smart Fix Suggestions" desc="Optimized snippets with reasoning." />
          <FeatureCard icon={Activity} title="Complexity Analyzer" desc="Big O calculation for your logic." />
          <FeatureCard icon={Lock} title="Secure Code Runner" desc="Isolated Docker container execution." />
          <FeatureCard icon={Layers} title="Multi-Language" desc="Python, JS, Java, C++, C, HTML, CSS." />
          <FeatureCard icon={History} title="Code History" desc="Every review is saved and searchable." />
          <FeatureCard icon={MessageSquare} title="Interview Mode" desc="AI hints instead of direct fixes." />
          <FeatureCard icon={BookOpen} title="Learning Mode" desc="Line-by-line breakdown of codebases." />
          <FeatureCard icon={Search} title="Semantic Search" desc="Find code by what it does, not keywords." />
        </div>
      </section>

      {/* ── Supported Languages ───────────────────────────── */}
      <section className="p-12 premium-card text-center space-y-8 bg-gradient-to-b from-panel-dark to-deep-dark">
        <h2 className="text-3xl font-black text-white tracking-tighter">Supported Languages</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {['Python', 'JavaScript', 'Java', 'C++', 'C', 'HTML', 'CSS'].map((lang) => (
            <div key={lang} className="px-6 py-3 bg-deep-dark border border-border-main rounded-2xl text-sm font-bold text-accent-primary shadow-lg hover:border-accent-primary/50 transition-colors">
              {lang}
            </div>
          ))}
        </div>
      </section>

      <footer className="pt-16 pb-8 border-t border-border-main flex flex-col md:flex-row items-center justify-between gap-8 opacity-60">
        <div className="flex items-center gap-3 font-black text-xl tracking-tighter">
          <Zap className="w-6 h-6 text-accent-primary" />
          AI Code Mentor
        </div>
        <p className="text-sm font-medium">Built with ❤️ by <span className="text-white font-black">Abhay Chaudhary</span></p>
      </footer>
    </div>
  );
};

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="p-8 bg-panel-dark border border-border-main rounded-[32px] space-y-4 group transition-all duration-300 hover:-translate-y-1">
      <div className={`p-3 w-fit bg-white/5 rounded-2xl ${color} group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
      <div>
        <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
        <p className="text-xs font-bold text-text-dim uppercase tracking-[0.1em]">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="group p-10 bg-panel-dark border border-border-main rounded-[40px] hover:border-accent-primary/50 transition-all duration-300 hover:-translate-y-1">
      <div className="p-4 w-fit bg-accent-primary/10 rounded-2xl text-accent-primary mb-8 group-hover:rotate-6 group-hover:scale-110 transition-transform"><Icon size={32} /></div>
      <h3 className="text-2xl font-black text-white mb-4 tracking-tighter">{title}</h3>
      <p className="text-text-dim leading-relaxed font-medium text-sm">{desc}</p>
    </div>
  );
}

export default HomePage;
