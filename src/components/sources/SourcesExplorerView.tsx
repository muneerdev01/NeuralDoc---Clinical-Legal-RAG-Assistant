import React, { useState } from 'react';
import {
  Layers,
  Search,
  FileText,
  Copy,
  Check,
  Cpu,
  Hash,
  Database,
} from 'lucide-react';
import { useNeuralDoc } from '../../context/NeuralDocContext';

export const SourcesExplorerView: React.FC = () => {
  const { chunks, documents } = useNeuralDoc();
  const [filterDocId, setFilterDocId] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredChunks = chunks.filter((c) => {
    const matchesDoc = filterDocId === 'all' || c.documentId === filterDocId;
    const matchesSearch =
      c.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.documentTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.section && c.section.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesDoc && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div id="sources-explorer-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Vector Store &amp; Sources Explorer
          </h2>
          <p className="text-xs text-slate-400">
            Inspect recursive chunks, token allocations, and vector embeddings in Supabase pgvector
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Database className="w-4 h-4 text-teal-400" />
          <span>{chunks.length} Total Vectors Indexed (384-d float4)</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={filterDocId}
            onChange={(e) => setFilterDocId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Documents ({chunks.length} Chunks)</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.chunkCount} chunks)
              </option>
            ))}
          </select>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search chunk contents..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Chunks List */}
      <div className="space-y-3">
        {filteredChunks.map((chunk, idx) => (
          <div
            key={chunk.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-teal-400 text-xs">
                  Vector #{idx + 1}
                </span>
                <span className="text-[11px] text-slate-300 font-medium line-clamp-1">
                  {chunk.documentTitle}
                </span>
                <span className="bg-slate-800 text-teal-300 px-2 py-0.5 rounded text-[10.5px] font-mono">
                  Page {chunk.pageNumber}
                </span>
                <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10.5px] font-mono">
                  Index {chunk.chunkIndex}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-400">
                  ~{chunk.tokenCount} tokens
                </span>
                <button
                  onClick={() => handleCopy(chunk.content, chunk.id)}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title="Copy Chunk Text"
                >
                  {copiedId === chunk.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {chunk.section && (
              <div className="text-[11px] text-teal-300/90 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800/80 inline-block">
                Section: {chunk.section}
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {chunk.content}
            </p>

            {/* Embedding Vector Dimension Preview */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Embedding Vector Dimension: 384 floats</span>
              <span className="text-teal-400">Indexed in pgvector HNSW</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
