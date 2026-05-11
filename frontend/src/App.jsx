import React, { useState, useRef } from 'react';
import EditorPane from './components/EditorPane';
import OutputPane from './components/OutputPane';
import { executeCode, explainCode } from './api';
import './index.css';

const DEFAULT_CODE = {
    javascript: "console.log('Hello, AI Code Mentor!');\n\n// Try creating an array and mapping over it!\nconst arr = [1, 2, 3];\nconst doubled = arr.map(x => x * 2);\nconsole.log(doubled);\n",
    python: "print('Hello, AI Code Mentor!')\n\n# Let's write a function to calculate factorial\ndef get_factorial(n):\n    if n <= 1:\n        return 1\n    return n * get_factorial(n - 1)\n\nprint(f'Factorial of 5 is {get_factorial(5)}')\n",
    java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, AI Code Mentor!\");\n    }\n}\n",
    cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, AI Code Mentor!\" << std::endl;\n    return 0;\n}\n",
    c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, AI Code Mentor!\\n\");\n    return 0;\n}\n"
};

const EXT_MAP = { py: 'python', js: 'javascript', java: 'java', cpp: 'cpp', c: 'c' };
const FILE_EXT = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', c: 'c' };

function App() {
    const [language, setLanguage]           = useState("python");
    const [code, setCode]                   = useState(DEFAULT_CODE.python);
    const [output, setOutput]               = useState("");
    const [executionError, setExecutionError] = useState("");
    const [isExecuting, setIsExecuting]     = useState(false);
    const [aiExplanation, setAiExplanation] = useState("");
    const [isExplaining, setIsExplaining]   = useState(false);
    const [fileName, setFileName]           = useState("main.py");

    const fileInputRef = useRef(null);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(DEFAULT_CODE[newLang]);
        setFileName(`main.${FILE_EXT[newLang]}`);
        setOutput("");
        setExecutionError("");
        setAiExplanation("");
    };

    const handleRunCode = async () => {
        setIsExecuting(true);
        setOutput("");
        setExecutionError("");
        setAiExplanation("");

        const result = await executeCode(language, code);
        setIsExecuting(false);

        if (result.isError) {
            setExecutionError(result.error);
            setOutput(result.output || "");
        } else {
            setOutput(result.output);
        }

        setIsExplaining(true);
        const explanation = await explainCode(language, code, result.output, result.isError ? result.error : null);
        setAiExplanation(explanation);
        setIsExplaining(false);
    };

    // ── Upload ──────────────────────────────────────
    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const ext = file.name.split('.').pop()?.toLowerCase();
        const detectedLang = EXT_MAP[ext];
        if (!detectedLang) {
            alert(`Unsupported file type ".${ext}".\nSupported: .py .js .java .cpp .c`);
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result;
            if (typeof content === 'string') {
                setLanguage(detectedLang);
                setCode(content);
                setFileName(file.name);
                setOutput("");
                setExecutionError("");
                setAiExplanation("");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // ── Download ────────────────────────────────────
    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-title">
                    AI Code Mentor 🚀
                </div>
                <div className="nav-controls">
                    {/* File name badge */}
                    <span className="file-badge">{fileName}</span>

                    {/* Language select */}
                    <select className="language-select" value={language} onChange={handleLanguageChange}>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                    </select>

                    {/* Hidden file input */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden-input"
                        accept=".py,.js,.java,.cpp,.c"
                    />

                    {/* Upload button */}
                    <button className="icon-btn" onClick={handleUploadClick} title="Upload file">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload
                    </button>

                    {/* Download button */}
                    <button className="icon-btn" onClick={handleDownload} title="Download file">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download
                    </button>

                    {/* Run button */}
                    <button
                        className="run-btn"
                        onClick={handleRunCode}
                        disabled={isExecuting || isExplaining}
                    >
                        {(isExecuting || isExplaining) && <div className="loader"></div>}
                        {isExecuting ? "Executing..." : isExplaining ? "Analyzing..." : "▶ Run Code"}
                    </button>
                </div>
            </nav>

            <main className="main-content">
                <div className="editor-panel">
                    <EditorPane language={language} code={code} onChange={setCode} />
                </div>
                <div className="right-panel">
                    <OutputPane
                        output={output}
                        error={executionError}
                        aiExplanation={aiExplanation}
                        isLoadingAI={isExplaining}
                        isLoadingExecution={isExecuting}
                    />
                </div>
            </main>
        </div>
    );
}

export default App;
