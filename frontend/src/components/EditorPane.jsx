import React from 'react';
import Editor from '@monaco-editor/react';

const EditorPane = ({ language, code, onChange, onCursorChange }) => {
    
    const langMap = {
        cpp: 'cpp',
        c: 'c',
        python: 'python',
        java: 'java',
        javascript: 'javascript',
        html: 'html',
        css: 'css'
    };

    const handleEditorDidMount = (editor, monaco) => {
        monaco.editor.defineTheme('mentor-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#1E1E1E',
                'editor.lineHighlightBackground': '#2A2A2A',
                'editorLineNumber.foreground': '#454545',
                'editorIndentGuide.background': '#30363D',
            }
        });
        monaco.editor.setTheme('mentor-dark');

        editor.onDidChangeCursorPosition((e) => {
            if (onCursorChange) {
                onCursorChange({ line: e.position.lineNumber, column: e.position.column });
            }
        });
    };

    return (
        <Editor
            onMount={handleEditorDidMount}
            height="100%"
            language={langMap[language] || 'javascript'}
            value={code}
            onChange={(value) => onChange(value || "")}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 22,
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
                guides: { indentation: true },
                formatOnPaste: true,
                formatOnType: true,
                automaticLayout: true
            }}
        />
    );
};

export default EditorPane;
