import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  FileText,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  FileSpreadsheet,
  Activity,
  Terminal,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNeuralDoc } from '../../context/NeuralDocContext';
import { DisclaimerBanner } from '../layout/DisclaimerBanner';
import { SourceCitation } from '../../types';

export const AssistantView: React.FC = () => {
  const {
    documents,
    collections,
    messages,
    sendChatMessage,
    clearChat,
    selectedDocId,
    setSelectedDocId,
    selectedCollectionId,
    setSelectedCollectionId,
    activeCitation,
    setActiveCitation,
    setInspectingDoc,
    isGenerating,
    settings,
  } = useNeuralDoc();

  const [inputQuestion, setInputQuestion] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [showDebugDrawer, setShowDebugDrawer] = useState(settings.debugMode);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const activeDoc = documents.find((d) => d.id === selectedDocId);
  const activeCol = collections.find((c) => c.id === selectedCollectionId);
  const activeCategory = activeDoc?.category || (activeCol ? 'clinical' : null);

  // Quick Questions templates
  const clinicalQuestions = [
    "Summarize the patient's discharge instructions.",
    "What medications are mentioned in this document?",
    "What diagnosis and procedure are mentioned?",
    "What are the emergency red-flag warning signs?",
    "What are the important follow-up dates?",
  ];

  const legalQuestions = [
    "What are the termination conditions without cause?",
    "What does Section 10 say about liability limitations?",
    "Summarize the executive compensation and bonus.",
    "Who are the contracting parties in this agreement?",
    "What are the non-compete restrictive covenants?",
  ];

  const handleSend = (text?: string) => {
    const q = text || inputQuestion;
    if (!q.trim() || isGenerating) return;
    sendChatMessage(q);
    setInputQuestion('');
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 1500);
  };

  const handleCopyCitation = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCitationId(id);
    setTimeout(() => setCopiedCitationId(null), 1500);
  };

  // Get the citations from the latest assistant message if activeCitation is null
  const latestAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const currentSources = latestAssistantMessage?.sources || [];
  const displayCitation = activeCitation || currentSources[0] || null;

  return (
    <div id="assistant-view" className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
      {/* LEFT COLUMN: Target Scope & Suggested Questions (w-72) */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between hidden lg:flex select-none overflow-y-auto shrink-0">
        <div className="space-y-4">
          <div>
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
              Target Retrieval Scope
            </span>

            {/* Document Selector Dropdown */}
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Target Document:</label>
                <select
                  id="doc-selector-dropdown"
                  value={selectedDocId || ''}
                  onChange={(e) => {
                    setSelectedDocId(e.target.value || null);
                    setSelectedCollectionId(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="">All Indexed Documents ({documents.length})</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.category.toUpperCase()}: {doc.title.substring(0, 28)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Collection Selector */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Or By Collection:</label>
                <select
                  value={selectedCollectionId || ''}
                  onChange={(e) => {
                    setSelectedCollectionId(e.target.value || null);
                    setSelectedDocId(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="">No Collection Filter</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Target Info Card */}
          {activeDoc && (
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400">
                  Active Document
                </span>
                <button
                  onClick={() => setInspectingDoc(activeDoc)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Inspect
                </button>
              </div>
              <h4 className="font-medium text-slate-200 line-clamp-1">{activeDoc.title}</h4>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>{activeDoc.pageCount} pages</span>
                <span>•</span>
                <span>{activeDoc.chunkCount} pgvector chunks</span>
              </div>
            </div>
          )}

          {/* Suggested Quick Prompts */}
          <div className="space-y-2 pt-2">
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-slate-400 block">
              Suggested Questions
            </span>
            <div className="space-y-1.5">
              {(activeCategory === 'legal' ? legalQuestions : clinicalQuestions).map(
                (q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-slate-100 text-xs transition-colors border border-slate-800 hover:border-slate-700 cursor-pointer line-clamp-2"
                  >
                    "{q}"
                  </button>
                )
              )}
            </div>
          </div>

          {/* Negative Guardrail Test Prompt */}
          <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Hallucination Guardrail Test</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ask an ungrounded question outside the documents to verify strict fallback enforcement:
            </p>
            <button
              id="guardrail-negative-test-btn"
              onClick={() => handleSend('What is the capital of France?')}
              className="w-full text-left p-2 rounded bg-rose-900/20 hover:bg-rose-900/40 text-rose-300 text-[11px] font-mono transition-colors border border-rose-800/40 cursor-pointer"
            >
              "What is the capital of France?"
            </button>
          </div>
        </div>

        {/* Status in Sidebar footer */}
        <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-1">
          <div>Top-K: {settings.topK} chunks</div>
          <div>Threshold: {settings.similarityThreshold}</div>
        </div>
      </aside>

      {/* CENTER COLUMN: Chat Interface */}
      <main className="flex-1 flex flex-col justify-between bg-slate-950 overflow-hidden">
        {/* Chat Header Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-200">
              {activeDoc
                ? `Querying: ${activeDoc.title}`
                : activeCol
                ? `Querying Collection: ${activeCol.name}`
                : `Querying All Documents (${documents.length})`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDebugDrawer(!showDebugDrawer)}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                showDebugDrawer
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Retrieval Debug Panel"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="text-[11px]">Debug</span>
            </button>
            <button
              id="clear-chat-btn"
              onClick={clearChat}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <DisclaimerBanner category={activeCategory} />

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs space-y-3 leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  {/* Assistant Header Badges */}
                  {!isUser && (
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        {msg.isGrounded ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Grounded Answer
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            Guardrail Fallback
                          </span>
                        )}

                        {msg.latencyMs && (
                          <span className="font-mono text-slate-400">
                            {msg.latencyMs}ms
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                        title="Copy Answer"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="prose prose-invert prose-xs max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Source Citations Buttons */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Verified Sources ({msg.sources.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((cite) => {
                          const isSelected = activeCitation?.chunkId === cite.chunkId;
                          return (
                            <button
                              key={cite.id}
                              onClick={() => setActiveCitation(cite)}
                              className={`text-[11px] font-mono px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-500/20 border-teal-400 text-teal-300 ring-1 ring-teal-400'
                                  : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                              }`}
                            >
                              <FileText className="w-3 h-3 text-teal-400" />
                              <span className="truncate max-w-[180px]">
                                {cite.documentTitle}
                              </span>
                              <span className="bg-slate-900 px-1 rounded text-[10px] text-teal-300 font-semibold">
                                Page {cite.page}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Generating Indicator */}
          {isGenerating && (
            <div className="flex gap-3.5 items-center text-slate-400 text-xs">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span>Searching pgvector &amp; applying strict guardrails...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Debug Drawer (If toggled) */}
        {showDebugDrawer && latestAssistantMessage?.debugInfo && (
          <div className="bg-slate-950 border-t border-slate-800 p-3 text-[11px] font-mono text-slate-400 space-y-1.5 shrink-0 max-h-36 overflow-y-auto">
            <div className="flex items-center justify-between text-teal-400 font-semibold">
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                RAG Pipeline Execution Trace
              </span>
              <span>{latestAssistantMessage.debugInfo.executionTimeMs} ms</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
              <div>Top-K: {latestAssistantMessage.debugInfo.topK}</div>
              <div>Threshold: {latestAssistantMessage.debugInfo.threshold}</div>
              <div>Retrieved: {latestAssistantMessage.debugInfo.retrievedCount} chunks</div>
              <div>
                Raw Cosine: [{latestAssistantMessage.debugInfo.rawScores.join(', ')}]
              </div>
            </div>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <input
              id="rag-chat-input"
              type="text"
              placeholder="Ask a question about your documents (e.g. medications, termination clauses, dates)..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={isGenerating}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors shadow-inner"
            />
            <button
              id="rag-send-btn"
              type="submit"
              disabled={!inputQuestion.trim() || isGenerating}
              className="px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </main>

      {/* RIGHT COLUMN: Sources & Verifiable Evidence Panel (w-80) */}
      <aside
        id="sources-panel"
        className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col justify-between hidden xl:flex select-none overflow-y-auto shrink-0"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Source Evidence
              </h3>
              <p className="text-[11px] text-slate-400">
                Retrieved chunks &amp; pgvector cosine similarity
              </p>
            </div>
            <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
              pgvector
            </span>
          </div>

          {displayCitation ? (
            <div className="space-y-3">
              {/* Citation Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-teal-500/30 space-y-3 shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 block mb-0.5">
                      Selected Evidence
                    </span>
                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-2">
                      {displayCitation.documentTitle}
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyCitation(
                        displayCitation.excerpt,
                        displayCitation.id
                      )
                    }
                    className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer shrink-0"
                    title="Copy excerpt"
                  >
                    {copiedCitationId === displayCitation.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-medium">
                    Page {displayCitation.page}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    Similarity: {displayCitation.similarity.toFixed(3)}
                  </span>
                </div>

                {displayCitation.section && (
                  <div className="text-[11px] text-slate-300 font-medium bg-slate-900 p-2 rounded border border-slate-800">
                    {displayCitation.section}
                  </div>
                )}

                {/* Excerpt with highlight styling */}
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans max-h-60 overflow-y-auto">
                  "{displayCitation.excerpt}"
                </div>

                <button
                  onClick={() => {
                    const doc = documents.find((d) => d.id === displayCitation.documentId);
                    if (doc) setInspectingDoc(doc);
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Document Page</span>
                </button>
              </div>

              {/* Other Retrieved Sources list */}
              {currentSources.length > 1 && (
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Other Matching Chunks ({currentSources.length - 1}):
                  </span>
                  <div className="space-y-2">
                    {currentSources
                      .filter((s) => s.chunkId !== displayCitation.chunkId)
                      .map((src) => (
                        <button
                          key={src.id}
                          onClick={() => setActiveCitation(src)}
                          className="w-full text-left bg-slate-950/60 hover:bg-slate-950 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[10.5px]">
                            <span className="font-medium text-slate-300 truncate max-w-[140px]">
                              {src.documentTitle}
                            </span>
                            <span className="text-teal-400 font-mono">
                              P.{src.page} ({src.similarity.toFixed(2)})
                            </span>
                          </div>
                          <p className="text-slate-400 text-[11px] line-clamp-2">
                            "{src.excerpt}"
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/40 p-8 rounded-xl border border-slate-800 text-center space-y-2">
              <Layers className="w-6 h-6 text-slate-500 mx-auto" />
              <h4 className="text-xs font-medium text-slate-300">No active citation</h4>
              <p className="text-[11px] text-slate-400">
                Ask a question to see retrieved chunks, cosine similarity scores, and verifiable citations.
              </p>
            </div>
          )}
        </div>

        {/* Sources Footer */}
        <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 text-center">
          Hallucination Protection: Active
        </div>
      </aside>
    </div>
  );
};
