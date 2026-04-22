import React, { useState, useRef, useCallback, useEffect } from 'react';
import EditorPane from './components/EditorPane';
import OutputPane from './components/OutputPane';
import { executeCode, explainCode } from './api';
import './index.css';

const DEFAULT_CODE = {
    javascript: "console.log('Hello, AI Code Mentor!');\n\n// Try creating an array and mapping over it!\n",
    python: "print('Hello, AI Code Mentor!')\n\n# Let's write a function to calculate factorial\ndef get_factorial(n):\n    if n <= 1:\n        return 1\n    return n * get_factorial(n - 1)\n\nprint(f'Factorial of 5 is {get_factorial(5)}')\n",
    java: "class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, AI Code Mentor!\");\n    }\n}\n",
    cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, AI Code Mentor!\" << std::endl;\n    return 0;\n}\n",
    c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, AI Code Mentor!\\n\");\n    return 0;\n}\n"
};

const LANG_ICONS = {
    python: '🐍', javascript: '🟨', java: '☕', cpp: '⚡', c: '🔵'
};

const EXT_MAP = { py: 'python', js: 'javascript', java: 'java', cpp: 'cpp', c: 'c' };
const FILE_EXT = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', c: 'c' };

function App() {
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

    // Resizable panel: store left panel width as percentage
    const [splitPct, setSplitPct] = useState(50);
    const isDragging = useRef(false);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    // ── Drag-to-resize ──────────────────────────────────────────
    const onMouseDown = useCallback((e) => {
        e.preventDefault();
        isDragging.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
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
            document.body.style.userSelect = '';
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    // ── File handlers ────────────────────────────────────────────
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        const lang = EXT_MAP[ext];
        if (lang) setLanguage(lang);
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (evt) => setCode(evt.target.result);
        reader.readAsText(file);
        // reset so same file can be re-uploaded
        e.target.value = '';
    };

    const handleDownload = () => {
        const ext = FILE_EXT[language] || 'txt';
        const blob = new Blob([code], { type: 'text/plain' });
        const url  = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName.endsWith(`.${ext}`) ? fileName : `code.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(DEFAULT_CODE[lang]);
        setFileName(`main.${FILE_EXT[lang]}`);
        setOutput(''); setExecError(''); setAiExp('');
    };

    // ── Run code ─────────────────────────────────────────────────
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
        const explanation = await explainCode(
            language, code, result.output,
            result.isError ? result.error : null
        );
        setAiExp(explanation);
        setIsExplaining(false);
    };

    // ── Status helpers ───────────────────────────────────────────
    const statusLabel = isExecuting ? '⚙ Running...'
        : isExplaining ? '🧠 Analyzing...'
        : executionError ? '✖ Error'
        : output ? '✔ Done'
        : '● Ready';

    const statusClass = isExecuting ? 'status-running'
        : isExplaining ? 'status-analyzing'
        : executionError ? 'status-error'
        : output ? 'status-done'
        : 'status-ready';

    return (
        <div className="app-container">

            {/* ── Navbar ─────────────────────────────────────── */}
            <nav className="navbar">
                <div className="nav-title">
                    <span>⚡</span> AI Code Mentor
                </div>
                <div className="nav-controls">
                    <select
                        className="language-select"
                        value={language}
                        onChange={handleLanguageChange}
                    >
                        <option value="python">🐍 Python</option>
                        <option value="javascript">🟨 JavaScript</option>
                        <option value="java">☕ Java</option>
                        <option value="cpp">⚡ C++</option>
                        <option value="c">🔵 C</option>
                    </select>
                    <button
                        className={`run-btn ${isExecuting ? 'running' : ''}`}
                        onClick={handleRunCode}
                        disabled={isExecuting || isExplaining}
                    >
                        {isExecuting || isExplaining
                            ? <><div className="loader"></div>{isExecuting ? 'Running...' : 'Analyzing...'}</>
                            : <>▶ Run Code</>
                        }
                    </button>
                </div>
            </nav>

            {/* ── Main content with resizable split ──────────── */}
            <main className="main-content" ref={containerRef}>

                {/* Left: Editor Panel */}
                <div className="editor-panel" style={{ width: `${splitPct}%` }}>

                    {/* Toolbar */}
                    <div className="editor-toolbar">
                        <div className="file-name-badge">
                            {LANG_ICONS[language]} {fileName}
                        </div>
                        <div className="toolbar-actions">
                            <button className="toolbar-btn" onClick={() => fileInputRef.current.click()}>
                                📂 Upload
                            </button>
                            <input
                                type="file" ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".js,.py,.java,.cpp,.c,.txt"
                                onChange={handleFileUpload}
                            />
                            <button className="toolbar-btn" onClick={handleDownload}>
                                ⬇ Download
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="editor-wrapper">
                        <EditorPane
                            language={language}
                            code={code}
                            onChange={setCode}
                            onCursorChange={setCursorPos}
                        />
                    </div>

                    {/* Stdin */}
                    <div className="stdin-section">
                        <div className="stdin-header">⌨ Standard Input (stdin)</div>
                        <textarea
                            className="stdin-input"
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            placeholder="Provide custom input for your program here..."
                        />
                    </div>
                </div>

                {/* Drag handle */}
                <div className="drag-handle" onMouseDown={onMouseDown}>
                    <div className="drag-handle-dots" />
                </div>

                {/* Right: Output + AI Panel */}
                <div className="right-panel" style={{ flex: 1 }}>
                    <OutputPane
                        output={output}
                        error={executionError}
                        isError={!!executionError}
                        aiExplanation={aiExplanation}
                        isLoadingAI={isExplaining}
                        isLoadingExecution={isExecuting}
                    />
                </div>
            </main>

            {/* ── Status Bar ─────────────────────────────────── */}
            <footer className="status-bar">
                <div className="status-left">
                    <span className="status-item lang-badge">{language.toUpperCase()}</span>
                    <span className="status-item">Ln {cursorPos.line}, Col {cursorPos.column}</span>
                    <span className="status-item dim">UTF-8</span>
                </div>
                <div className="status-right">
                    <span className={`status-item status-state ${statusClass}`}>{statusLabel}</span>
                </div>
            </footer>
        </div>
    );
}

export default App;
