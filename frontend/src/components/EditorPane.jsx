import React from 'react';
import Editor from '@monaco-editor/react';

const EditorPane = ({ language, code, onChange }) => {
    
    // Map languages to monaco editor identifiers
    const langMap = {
        cpp: 'cpp',
        c: 'c',
        python: 'python',
        java: 'java',
        javascript: 'javascript'
    };

    return (
        <Editor
            height="100%"
            language={langMap[language] || 'javascript'}
            value={code}
            theme="vs-dark"
            onChange={(value) => onChange(value || "")}
            options={{
                minimap: { enabled: false },
                fontSize: 15,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 24,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth"
            }}
        />
    );
};

export default EditorPane;
