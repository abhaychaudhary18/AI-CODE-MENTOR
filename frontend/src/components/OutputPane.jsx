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
                <div className="output-body">
                    {isLoadingExecution ? (
                        <div className="output-text info">Executing code in sandboxed environment...</div>
                    ) : (
                        <>
                            {output && <div className="output-text success">{output}</div>}
                            {error && !output && <div className="output-text error">{error}</div>}
                            {error && output && <div className="output-text error" style={{marginTop: "10px"}}>{error}</div>}
                            {!output && !error && !isLoadingExecution && <div className="output-text muted">Run your code to see output here.</div>}
                        </>
                    )}
                </div>
            </div>
            
            <div className="ai-section">
                <div className="ai-header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                    AI Insights &amp; Mentorship
                </div>
                <div className="ai-body">
                    {isLoadingAI ? (
                        <div style={{display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-secondary)'}}>
                            <div className="loader" style={{borderColor: 'rgba(139,92,246,0.2)', borderTopColor: 'var(--accent-purple)'}}></div>
                            <span style={{fontSize:'0.85rem'}}>Gemini is analyzing your code...</span>
                        </div>
                    ) : aiExplanation ? (
                        <div className="ai-content" dangerouslySetInnerHTML={renderMarkdown(aiExplanation)} />
                    ) : (
                        <div className="ai-content" style={{color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem'}}>
                            AI explanations and debugging tips will appear here after execution.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OutputPane;
