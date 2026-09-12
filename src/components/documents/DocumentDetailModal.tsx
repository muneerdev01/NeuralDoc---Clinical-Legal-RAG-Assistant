import React, { useState } from 'react';
import {
  X,
  FileText,
  Layers,
  Calendar,
  User,
  Database,
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import { DocumentMetadata } from '../../types';
import { useNeuralDoc } from '../../context/NeuralDocContext';

export const DocumentDetailModal: React.FC<{
  document: DocumentMetadata;
  onClose: () => void;
}> = ({ document, onClose }) => {
  const { chunks, startChatWithDocument } = useNeuralDoc();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'chunks'>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get chunks belonging to this document
  const docChunks = chunks.filter((c) => c.documentId === document.id);

  // Split raw text by pages if available
  const pagesText = (document.rawText || '')
    .split(/\n(?=--- PAGE \d+)/)
    .filter(Boolean);

  const totalPages = Math.max(document.pageCount, pagesText.length || 1);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      id="document-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg border ${
                document.category === 'clinical'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : document.category === 'legal'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100 line-clamp-1">
                  {document.title}
                </h2>
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                    document.category === 'clinical'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      : document.category === 'legal'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {document.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{document.filename}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                startChatWithDocument(document.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <BotMessageSquare className="w-3.5 h-3.5" />
              <span>Ask Questions</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview &amp; Intelligence
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'content'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Extracted Content ({totalPages} Pages)
          </button>
          <button
            onClick={() => setActiveTab('chunks')}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'chunks'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            pgvector Chunks ({docChunks.length} Vectors)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Summary Box */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-400" />
                  Grounded Document Summary
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {document.summary || 'Summary synthesized from extracted document pages.'}
                </p>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Author / Source</span>
                  <span className="font-medium text-slate-200 line-clamp-1">
                    {document.author || 'System Ingested'}
                  </span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Total Pages</span>
                  <span className="font-mono text-slate-200">{document.pageCount}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">Vector Chunks</span>
                  <span className="font-mono text-slate-200">{document.chunkCount}</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1">File Size</span>
                  <span className="font-mono text-slate-200">
                    {(document.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              {/* Indexing Status Details */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium">Embedding Pipeline Architecture</span>
                  <span className="text-teal-400 font-mono text-[11px]">
                    384-dimensional dense vectors
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] leading-relaxed">
                  Extracted via recursive text splitter preserving page boundaries. Stored with cosine distance index in Supabase pgvector (<code className="text-teal-300 font-mono">&lt;=&gt;</code> operator). Ready for sub-second similarity matching.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              {/* Page Navigator */}
              <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
                <div className="text-xs text-slate-300 font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Page Extracted Content */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                {pagesText[currentPage - 1] ||
                  docChunks
                    .filter((c) => c.pageNumber === currentPage)
                    .map((c) => c.content)
                    .join('\n\n') ||
                  document.rawText ||
                  'No extracted text available for this page.'}
              </div>
            </div>
          )}

          {activeTab === 'chunks' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">
                Indexed chunks with page citations and vector metadata:
              </div>
              {docChunks.map((chunk, idx) => (
                <div
                  key={chunk.id}
                  className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-teal-400">
                        Chunk #{idx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        Page {chunk.pageNumber}
                      </span>
                      {chunk.section && (
                        <span className="text-[11px] text-slate-300 font-medium line-clamp-1">
                          {chunk.section}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ~{chunk.tokenCount} tokens
                      </span>
                      <button
                        onClick={() => handleCopy(chunk.content, chunk.id)}
                        className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                        title="Copy chunk text"
                      >
                        {copiedId === chunk.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-sans">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
