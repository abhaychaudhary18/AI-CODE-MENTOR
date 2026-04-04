import React, { useState } from 'react';
import EditorPane from './components/EditorPane';
import OutputPane from './components/OutputPane';
import { executeCode, explainCode } from './api';
import './index.css';

const DEFAULT_CODE = {
    javascript: "console.log('Hello, AI Code Mentor!');\n\n// Try creating an array and mapping over it!\n",
    python: "print('Hello, AI Code Mentor!')\n\n# Let's write a function to calculate factorial\ndef get_factorial(n):\n    if n <= 1:\n        return 1\n    return n * get_factorial(n - 1)\n\nprint(f'Factorial of 5 is {get_factorial(5)}')\n",
    java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, AI Code Mentor!\");\n    }\n}\n",
    cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello, AI Code Mentor!\" << std::endl;\n    return 0;\n}\n",
    c: "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, AI Code Mentor!\\n\");\n    return 0;\n}\n"
};

function App() {
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState(DEFAULT_CODE.python);
    const [output, setOutput] = useState("");
    const [executionError, setExecutionError] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    
    // AI Explanation State
    const [aiExplanation, setAiExplanation] = useState("");
    const [isExplaining, setIsExplaining] = useState(false);

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        setCode(DEFAULT_CODE[newLang]);
        setOutput("");
        setExecutionError("");
        setAiExplanation("");
    };

    const handleRunCode = async () => {
        setIsExecuting(true);
        setOutput("");
        setExecutionError("");
        setAiExplanation("");
        
        // 1. Execute
        const result = await executeCode(language, code);
        setIsExecuting(false);
        
        if (result.isError) {
            setExecutionError(result.error);
            setOutput(result.output || "");
        } else {
            setOutput(result.output);
        }

        // 2. Automatically ask AI for Explanation
        setIsExplaining(true);
        const explanation = await explainCode(language, code, result.output, result.isError ? result.error : null);
        setAiExplanation(explanation);
        setIsExplaining(false);
    };

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="nav-title">
                    AI Code Mentor 🚀
                </div>
                <div className="nav-controls">
                    <select className="language-select" value={language} onChange={handleLanguageChange}>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                    </select>
                    <button 
                        className="run-btn" 
                        onClick={handleRunCode}
                        disabled={isExecuting || isExplaining}
                    >
                        {(isExecuting || isExplaining) && <div className="loader"></div>}
                        {isExecuting ? "Executing..." : isExplaining ? "Analyzing..." : "Run Code"}
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
                        isError={!!executionError}
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
