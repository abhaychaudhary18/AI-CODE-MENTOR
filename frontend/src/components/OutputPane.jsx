import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const OutputPane = ({ output, error, isError, aiExplanation, isLoadingAI, isLoadingExecution }) => {
    
    const renderMarkdown = (markdown) => {
        const rawHtml = marked.parse(markdown || '');
        return { __html: DOMPurify.sanitize(rawHtml) };
    };

    return (
        <>
            <div className="output-section">
                <div className="output-header">
                    <span>Terminal Output</span>
                </div>
                {isLoadingExecution ? (
                    <div className="output-text" style={{color: "var(--text-muted)", fontStyle: "italic"}}>Executing code in sandboxed environment...</div>
                ) : (
                    <>
                        {output && <div className="output-text success">{output}</div>}
                        {error && !output && <div className="output-text error">{error}</div>}
                        {error && output && <div className="output-text error" style={{marginTop: "8px"}}>{error}</div>}
                        {!output && !error && !isLoadingExecution && <div className="output-text" style={{color: "var(--text-muted)"}}>Run your code to see output here.</div>}
                    </>
                )}
            </div>
            
            <div className="ai-section">
                <div className="ai-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                    AI Insights & Mentorship
                </div>
                {isLoadingAI ? (
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)'}}>
                        <div className="loader" style={{borderColor: "rgba(139, 92, 246, 0.2)", borderTopColor: "var(--accent-purple)"}}></div>
                        <span>Gemini is analyzing the execution result...</span>
                    </div>
                ) : aiExplanation ? (
                    <div className="ai-content" dangerouslySetInnerHTML={renderMarkdown(aiExplanation)} />
                ) : (
                    <div className="ai-content" style={{color: "var(--text-muted)", fontStyle: "italic"}}>
                        AI explanations and debugging tips will appear here after execution.
                    </div>
                )}
            </div>
        </>
    );
};

export default OutputPane;
