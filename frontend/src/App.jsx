import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Play, Upload, Download, Code2, Terminal, Sparkles, Settings, User, 
  LayoutDashboard, History, ShieldCheck, Zap, Menu, ChevronRight,
  Search, CheckCircle2, AlertCircle, Activity, Github, ArrowRight,
  Lock, Key, Sliders, UserCircle, X, Mail,
  BookOpen, Brain, Shield, Clock, Layers, MessageSquare
} from 'lucide-react';

import EditorPane from './components/EditorPane.jsx';
import OutputPane from './components/OutputPane.jsx';
import HomePage from './components/HomePage.jsx';
import { executeCode, explainCode } from './api';

import './index.css';

// ── Constants & Mock Data ──────────────────────────────────
const DEFAULT_CODE = {
    javascript: "console.log('Hello, AI Code Mentor!');\n\n// Try creating an array and mapping over it!\nconst arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled);",
    python: "print('Hello, AI Code Mentor!')\n\n# Let's write a function to calculate factorial\ndef get_factorial(n):\n    if n <= 1:\n        return 1\n    return n * get_factorial(n - 1)\n\nprint(f'Factorial of 5 is {get_factorial(5)}')\n",
    java: "class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, AI Code Mentor!\");\n    }\n}\n",
    cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, AI Code Mentor!\" << std::endl;\n    return 0;\n}\n",
    c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, AI Code Mentor!\\n\");\n    return 0;\n}\n",
    html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>AI Code Mentor</title>\n</head>\n<body>\n  <h1>Hello Mentor!</h1>\n  <p>Start coding with AI assistance.</p>\n</body>\n</html>",
    css: "body {\n  background: #0d1117;\n  color: #e6edf3;\n  font-family: sans-serif;\n}\n\nh1 {\n  color: #58a6ff;\n}"
};

const EXT_MAP = { py: 'python', js: 'javascript', java: 'java', cpp: 'cpp', c: 'c', html: 'html', css: 'css' };
const FILE_EXT = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', c: 'c', html: 'html', css: 'css' };

const MOCK_REVIEWS = [ 
  { name: 'Auth Module', status: 'Safe', date: '2h ago', desc: 'Secure login logic audit.' }, 
  { name: 'Payment API', status: 'Warning', date: '5h ago', desc: 'Price precision check.' } 
];

const MOCK_AUDITS = [ 
  { name: 'Dependency Scan', status: 'Safe', date: '1h ago', desc: 'All 42 packages secure.' }, 
  { name: 'SQL Injection', status: 'Safe', date: '4h ago', desc: 'No vulnerabilities.' } 
];

// ── Sub-Components ──────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick, open }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${active ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-dim hover:bg-white/5 hover:text-text-main'}`}>
      {active && <div className="absolute inset-0 bg-accent-primary/10 rounded-xl border-l-2 border-accent-primary shadow-[inset_10px_0_20px_-10px_rgba(88,166,255,0.3)]" />}
      <div className={`${active ? 'text-accent-primary' : 'text-text-dim group-hover:text-text-main'} transition-colors relative z-10`}><Icon size={20} /></div>
      {open && <span className="font-semibold text-sm relative z-10">{label}</span>}
      {active && open && <ChevronRight className="ml-auto w-4 h-4 relative z-10" />}
    </button>
  );
}

function ListView({ title, icon: Icon, description, items }) {
  return (
    <div className="p-10 space-y-8 h-full overflow-y-auto max-w-6xl mx-auto scrollbar-thin">
      <header className="space-y-2">
        <div className="flex items-center gap-3 text-accent-primary"><Icon size={24} /><h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1></div>
        <p className="text-text-dim">{description}</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="p-5 premium-card group cursor-pointer hover:border-accent-primary/30 hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'Safe' ? 'bg-success-green/20 text-success-green' : 'bg-warning-orange/20 text-warning-orange'}`}>{item.status}</span>
              <span className="text-[10px] text-text-dim uppercase font-bold">{item.date}</span>
            </div>
            <h3 className="font-bold text-white mb-1">{item.name}</h3>
            <p className="text-xs text-text-dim leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsCard({ title, icon: Icon, children }) { 
  return <div className="p-8 premium-card space-y-6"><h3 className="text-lg font-bold flex items-center gap-3 text-white"><Icon size={20} className="text-accent-primary" />{title}</h3>{children}</div>; 
}

function SettingsView() {
  return (
    <div className="p-10 space-y-8 h-full overflow-y-auto max-w-4xl mx-auto scrollbar-thin">
      <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3"><Settings className="text-accent-primary" /> Settings</h1>
      <div className="space-y-6">
        <SettingsCard title="Editor Preferences" icon={Code2}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Font Size</label><select className="w-full bg-deep-dark border border-border-main rounded-xl p-3 text-sm outline-none focus:border-accent-primary transition-all"><option>14px</option><option>16px</option></select></div>
            <div className="space-y-1"><label className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Theme</label><select className="w-full bg-deep-dark border border-border-main rounded-xl p-3 text-sm outline-none focus:border-accent-primary transition-all"><option>VS Code Dark</option></select></div>
          </div>
        </SettingsCard>
        <SettingsCard title="AI Intelligence" icon={Zap}><div className="space-y-4"><div className="space-y-1"><label className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Provider</label><div className="p-4 bg-deep-dark border border-border-main rounded-xl flex items-center justify-between"><div className="flex items-center gap-2 font-bold text-sm text-accent-primary"><Sparkles size={16} /> Gemini 2.0 Pro</div><div className="px-2 py-0.5 rounded bg-success-green/20 text-success-green text-[10px] font-bold">ACTIVE</div></div></div></div></SettingsCard>
      </div>
    </div>
  );
}

function ProfileStat({ label, value, icon: Icon }) { 
  return <div className="p-8 premium-card text-center space-y-3 group hover:border-accent-primary/50 hover:-translate-y-1 transition-all"><div className="mx-auto w-fit text-accent-primary p-3 bg-accent-primary/10 rounded-2xl group-hover:scale-110 transition-transform"><Icon size={24} /></div><p className="text-3xl font-black text-white tracking-tighter">{value}</p><p className="text-[10px] font-bold text-text-dim uppercase tracking-widest">{label}</p></div>; 
}

function ProfileView({ user, onLogout }) {
  return (
    <div className="p-10 space-y-8 h-full overflow-y-auto max-w-4xl mx-auto scrollbar-thin">
      <div className="flex items-center gap-8 p-10 bg-gradient-to-br from-panel-dark to-deep-dark border border-border-main rounded-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="w-32 h-32 rounded-[32px] bg-accent-primary flex items-center justify-center text-5xl font-black text-white relative z-10 shadow-2xl shadow-accent-primary/20 rotate-3">{user?.initials || 'AC'}</div>
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-black text-white tracking-tighter">{user?.name || 'User'}</h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-text-dim flex items-center gap-2 tracking-widest uppercase">Senior Member</span>
            <button onClick={onLogout} className="text-xs font-bold text-red-400 hover:underline">Sign Out</button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <ProfileStat label="Reviews" value="128" icon={Activity} />
        <ProfileStat label="Security" value="99%" icon={ShieldCheck} />
        <ProfileStat label="Language" value="7" icon={BookOpen} />
      </div>
    </div>
  );
}

// ── Main App Component ──────────────────────────────────
function App() {
    const [view, setView]                 = useState('dashboard');
    const [language, setLanguage]         = useState('python');
    const [code, setCode]                 = useState(DEFAULT_CODE.python);
    const [output, setOutput]             = useState('');
    const [executionError, setExecError]  = useState('');
    const [isExecuting, setIsExecuting]   = useState(false);
    const [aiExplanation, setAiExp]       = useState('');
    const [isExplaining, setIsExplaining] = useState(false);
    const [stdin, setStdin]               = useState('');
    const [cursorPos, setCursorPos]       = useState({ line: 1, column: 1 });
    const [fileName, setFileName]         = useState('main.py');
    const [sidebarOpen, setSidebarOpen]   = useState(true);

    const [isLoggedIn, setIsLoggedIn]     = useState(false);
    const [showLoginModal, setShowLogin]  = useState(false);
    const [user, setUser]                 = useState(null);

    const [splitPct, setSplitPct] = useState(50);
    const isDragging = useRef(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    const onMouseDown = useCallback((e) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
    }, []);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isDragging.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const newPct = ((e.clientX - rect.left) / rect.width) * 100;
            setSplitPct(Math.min(Math.max(newPct, 25), 75));
        };
        const onMouseUp = () => {
            isDragging.current = false;
            document.body.style.cursor = '';
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const handleRunCode = async () => {
        setIsExecuting(true);
        setOutput(''); setExecError(''); setAiExp('');
        const result = await executeCode(language, code, stdin);
        setIsExecuting(false);
        if (result.isError) {
            setExecError(result.error);
            setOutput(result.output || '');
        } else {
            setOutput(result.output);
        }
        setIsExplaining(true);
        const explanation = await explainCode(language, code, result.output, result.isError ? result.error : null);
        setAiExp(explanation);
        setIsExplaining(false);
    };

    const handleLanguageChange = (e) => {
      const lang = e.target.value;
      setLanguage(lang);
      setCode(DEFAULT_CODE[lang]);
      setFileName(`main.${FILE_EXT[lang]}`);
    };

    const handleUploadClick = () => fileInputRef.current?.click();
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const detectedLang = EXT_MAP[ext];
        if (detectedLang) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result;
                if (typeof content === 'string') {
                    setLanguage(detectedLang);
                    setCode(content);
                    setFileName(file.name);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Unsupported file type.');
        }
        e.target.value = '';
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleLogin = (e) => {
      e.preventDefault();
      setIsLoggedIn(true);
      setUser({ name: 'Abhay Chaudhary', initials: 'AC' });
      setShowLogin(false);
    };

    const renderContent = () => {
      switch(view) {
        case 'dashboard':
          return <HomePage onOpenEditor={() => setView('editor')} />;
        case 'editor':
          return (
            <div key="editor" className="flex-1 flex flex-col h-full overflow-hidden">
              <header className="h-16 border-b border-border-main bg-panel-dark/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-editor-dark border border-border-main rounded-lg text-sm font-medium">
                    <Code2 className="w-4 h-4 text-accent-primary" />
                    <span className="text-text-dim">{fileName}</span>
                  </div>
                  <select value={language} onChange={handleLanguageChange} className="bg-transparent text-sm font-semibold text-text-dim hover:text-text-main cursor-pointer outline-none">
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".py,.js,.java,.cpp,.c,.html,.css" />
                  <button onClick={handleUploadClick} title="Upload File" className="p-2 text-text-dim hover:text-text-main hover:bg-white/5 rounded-lg transition-colors">
                    <Upload className="w-5 h-5" />
                  </button>
                  <button onClick={handleDownload} title="Download File" className="p-2 text-text-dim hover:text-text-main hover:bg-white/5 rounded-lg transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-border-main mx-1" />
                  <button onClick={handleRunCode} disabled={isExecuting || isExplaining} className="flex items-center gap-2 bg-gradient-to-r from-accent-primary to-[#8b5cf6] text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                    {isExecuting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    Run Code
                  </button>
                </div>
              </header>
              <div className="flex-1 flex min-h-0 h-full overflow-hidden" ref={containerRef}>
                <div className="h-full overflow-hidden shrink-0" style={{ width: `${splitPct}%` }}>
                  <EditorPane language={language} code={code} onChange={setCode} onCursorChange={setCursorPos} />
                </div>
                <div onMouseDown={onMouseDown} className="w-1.5 bg-deep-dark border-x border-border-main cursor-col-resize hover:bg-accent-primary/30 transition-colors shrink-0" />
                <div className="flex-1 min-w-0 bg-panel-dark/30 flex flex-col h-full overflow-hidden">
                  <OutputPane output={output} error={executionError} isError={!!executionError} aiExplanation={aiExplanation} isLoadingAI={isExplaining} isLoadingExecution={isExecuting} />
                </div>
              </div>
              <footer className="h-8 bg-panel-dark border-t border-border-main flex items-center justify-between px-4 text-[11px] text-text-dim shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success-green animate-pulse" />
                    <span className="font-bold uppercase tracking-wider text-success-green">Connected</span>
                  </div>
                  <span>Ln {cursorPos.line}, Col {cursorPos.column}</span>
                  <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-4 uppercase font-bold tracking-tighter">
                  <span>{language}</span>
                  <span className="text-accent-primary">AI MENTOR ACTIVE</span>
                </div>
              </footer>
            </div>
          );
        case 'reviews':
          return <ListView title="Recent Reviews" icon={History} description="Track your recent code analysis history." items={MOCK_REVIEWS} />;
        case 'security':
          return <ListView title="Security Audits" icon={ShieldCheck} description="Vulnerability reports for your codebase." items={MOCK_AUDITS} />;
        case 'settings':
          return <SettingsView />;
        case 'profile':
          return <ProfileView user={user} onLogout={() => setIsLoggedIn(false)} />;
        default:
          return <HomePage onOpenEditor={() => setView('editor')} />;
      }
    };

    return (
        <div className="flex h-screen bg-deep-dark text-text-main font-inter overflow-hidden">
            <aside style={{ width: sidebarOpen ? 260 : 80 }} className="bg-panel-dark border-r border-border-main flex flex-col z-50 shrink-0 shadow-2xl transition-all duration-300">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
                  <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center shadow-lg shadow-accent-primary/20">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  {sidebarOpen && <span className="font-extrabold text-xl tracking-tight">MentorAI</span>}
                </div>
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-text-dim hover:text-text-main">
                  <Menu className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-2">
                <NavItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} open={sidebarOpen} />
                <NavItem icon={Code2} label="Code Editor" active={view === 'editor'} onClick={() => setView('editor')} open={sidebarOpen} />
                <NavItem icon={History} label="Recent Reviews" active={view === 'reviews'} onClick={() => setView('reviews')} open={sidebarOpen} />
                <NavItem icon={ShieldCheck} label="Security Audits" active={view === 'security'} onClick={() => setView('security')} open={sidebarOpen} />
                <div className="pt-4 pb-2">
                  <div className={`h-px bg-border-main mx-2 ${sidebarOpen ? 'mb-4' : 'mb-2'}`} />
                  <NavItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} open={sidebarOpen} />
                  {isLoggedIn ? (
                    <NavItem icon={User} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} open={sidebarOpen} />
                  ) : (
                    <NavItem icon={Lock} label="Sign In" onClick={() => setShowLogin(true)} open={sidebarOpen} />
                  )}
                </div>
              </nav>
              <div className="p-4 mt-auto">
                {isLoggedIn && sidebarOpen ? (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center font-bold text-white shadow-lg">
                      {user?.initials || 'AC'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                      <p className="text-[10px] text-text-dim uppercase tracking-widest">Premium Member</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-editor-dark/50 border border-border-main rounded-xl p-4">
                    {sidebarOpen ? (
                      <>
                        <p className="text-xs font-bold text-accent-primary uppercase tracking-widest mb-1">Pro Plan</p>
                        <p className="text-[11px] text-text-dim leading-relaxed mb-3">Get unlimited AI reviews.</p>
                        <button className="w-full py-2 bg-accent-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all">Upgrade Now</button>
                      </>
                    ) : (
                      <div className="flex justify-center"><Zap className="w-5 h-5 text-accent-primary animate-pulse" /></div>
                    )}
                  </div>
                )}
              </div>
            </aside>
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
              <div key={view} className="flex-1 flex flex-col h-full overflow-hidden">
                {renderContent()}
              </div>
            </main>
            {showLoginModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div onClick={() => setShowLogin(false)} className="absolute inset-0 bg-deep-dark/80 backdrop-blur-sm" />
                <div className="w-full max-w-md bg-panel-dark border border-border-main rounded-[32px] p-10 relative z-10 shadow-2xl">
                  <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-text-dim hover:text-text-main"><X size={20} /></button>
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-accent-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-primary/20">
                      <Lock size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Welcome Back</h2>
                    <p className="text-sm text-text-dim mt-2">Sign in to your MentorAI account</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                        <input type="email" placeholder="name@company.com" className="w-full bg-deep-dark border border-border-main rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-accent-primary transition-all" required />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-text-dim uppercase tracking-widest ml-1">Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                        <input type="password" placeholder="••••••••" className="w-full bg-deep-dark border border-border-main rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-accent-primary transition-all" required />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs px-1">
                      <label className="flex items-center gap-2 cursor-pointer text-text-dim"><input type="checkbox" className="rounded bg-deep-dark border-border-main" /> Remember me</label>
                      <a href="#" className="text-accent-primary font-bold hover:underline">Forgot password?</a>
                    </div>
                    <button type="submit" className="w-full py-4 bg-white text-deep-dark font-black rounded-2xl hover:bg-opacity-90 transition-all shadow-xl shadow-white/5">Sign In</button>
                  </form>
                  <div className="relative my-8 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-main" /></div>
                    <span className="relative bg-panel-dark px-4 text-[10px] font-bold text-text-dim uppercase tracking-[0.2em]">Or continue with</span>
                  </div>
                  <button className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                    <Github size={20} /> Sign in with GitHub
                  </button>
                  <p className="text-center text-xs text-text-dim mt-8">Don't have an account? <a href="#" className="text-accent-primary font-bold hover:underline">Create Account</a></p>
                </div>
              </div>
            )}
        </div>
    );
}

export default App;
