import React from 'react';
import { 
  Terminal, Sparkles, AlertCircle, CheckCircle2, Info, 
  Lightbulb, Zap, Activity, ShieldAlert, Cpu
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const OutputPane = ({ output, error, isError, aiExplanation, isLoadingAI, isLoadingExecution }) => {
    
    const renderMarkdown = (markdown) => {
        const rawHtml = marked.parse(markdown || '');
        return { __html: DOMPurify.sanitize(rawHtml) };
    };

    // ── AI Response Section Parser ────────────────────────────────
    const parseAiResponse = (text) => {
      if (!text) return null;
      
      const sections = [
        { key: 'Code Explanation', color: 'border-blue-500/30 bg-blue-500/5', accent: 'text-blue-400', icon: <Info size={16} /> },
        { key: 'Error Analysis', color: 'border-red-500/30 bg-red-500/5', accent: 'text-red-400', icon: <ShieldAlert size={16} /> },
        { key: 'Suggested Fix', color: 'border-purple-500/30 bg-purple-500/5', accent: 'text-purple-400', icon: <Zap size={16} /> },
        { key: 'Complexity Analysis', color: 'border-cyan-500/30 bg-cyan-500/5', accent: 'text-cyan-400', icon: <Cpu size={16} /> }
      ];

      // If text doesn't seem to have numbered sections, just render as markdown
      if (!text.includes('1.') && !text.includes('Code Explanation')) {
        return <div className="prose prose-invert prose-sm max-w-none ai-content p-2" dangerouslySetInnerHTML={renderMarkdown(text)} />;
      }

      // Very simple parsing: split by common patterns
      // Real implementation might need more robust regex or specific AI prompt formatting
      return (
        <div className="space-y-4 p-2">
          {sections.map((sec, i) => {
            // Find content between this section and the next
            const startIndex = text.toLowerCase().indexOf(sec.key.toLowerCase());
            if (startIndex === -1) return null;

            // Simple heuristic to find end of section
            let nextIndex = text.length;
            sections.forEach(other => {
              const pos = text.toLowerCase().indexOf(other.key.toLowerCase(), startIndex + 1);
              if (pos !== -1 && pos < nextIndex) nextIndex = pos;
            });

            let content = text.substring(startIndex + sec.key.length, nextIndex).trim();
            // Clean up common leading characters like ":", "1.", etc.
            content = content.replace(/^[:\s\-.]+/g, '').trim();

            return (
              <div key={i} className={`p-4 rounded-xl border ${sec.color} space-y-2 group transition-all duration-300 hover:shadow-lg`}>
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${sec.accent}`}>
                  {sec.icon}
                  {sec.key}
                </div>
                <div className="text-xs leading-relaxed text-text-dim group-hover:text-text-main transition-colors" dangerouslySetInnerHTML={renderMarkdown(content)} />
              </div>
            );
          })}
        </div>
      );
    };

    return (
        <div className="flex flex-col h-full overflow-hidden divide-y divide-border-main">
            
            {/* Terminal Section */}
            <div className="flex-1 flex flex-col min-h-0 bg-deep-dark/30">
                <div className="px-4 py-3 bg-panel-dark/50 border-b border-border-main flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-text-dim uppercase tracking-widest">
                        <Terminal className="w-4 h-4 text-accent-primary" />
                        Terminal Output
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 font-mono text-sm leading-relaxed scrollbar-thin">
                    {isLoadingExecution ? (
                        <div className="flex items-center gap-3 text-accent-primary animate-pulse">
                            <Terminal className="w-4 h-4" />
                            <span>Executing code in sandboxed environment...</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {output && (
                                <div className="flex gap-3 text-success-green">
                                    <CheckCircle2 className="w-4 h-4 mt-1 shrink-0" />
                                    <pre className="whitespace-pre-wrap">{output}</pre>
                                </div>
                            )}
                            {error && (
                                <div className="flex gap-3 text-warning-orange bg-warning-orange/5 p-4 rounded-xl border border-warning-orange/20">
                                    <AlertCircle className="w-4 h-4 mt-1 shrink-0" />
                                    <pre className="whitespace-pre-wrap">{error}</pre>
                                </div>
                            )}
                            {!output && !error && !isLoadingExecution && (
                                <div className="text-text-dim/40 italic flex items-center gap-2 h-full flex-col justify-center opacity-50">
                                    <Terminal className="w-8 h-8 mb-2" />
                                    <p>Run your code to see output here.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* AI Insights Section */}
            <div className="flex-1 flex flex-col min-h-0 bg-accent-primary/[0.01]">
                <div className="px-4 py-3 bg-panel-dark/50 border-b border-border-main flex items-center gap-2 text-[11px] font-bold text-accent-primary uppercase tracking-widest sticky top-0 z-10">
                    <Sparkles className="w-4 h-4" />
                    AI Insights & Mentorship
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                    {isLoadingAI ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50">
                            <div className="w-10 h-10 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
                            <span className="text-xs font-bold tracking-widest uppercase animate-pulse">Gemini is analyzing your logic...</span>
                        </div>
                    ) : aiExplanation ? (
                        parseAiResponse(aiExplanation)
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-20">
                            <Sparkles className="w-12 h-12 text-accent-primary" />
                            <p className="text-xs font-bold uppercase tracking-widest max-w-[200px]">Mentorship data pending...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutputPane;
