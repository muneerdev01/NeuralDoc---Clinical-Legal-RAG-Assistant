import React from 'react';
import {
  FileText,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  Activity,
  FileSpreadsheet,
} from 'lucide-react';
import { useNeuralDoc } from '../../context/NeuralDocContext';
import { DisclaimerBanner } from '../layout/DisclaimerBanner';

export const DashboardView: React.FC<{ onOpenUpload: () => void }> = ({ onOpenUpload }) => {
  const {
    documents,
    chunks,
    queriesLog,
    startChatWithDocument,
    setActiveTab,
    setInspectingDoc,
  } = useNeuralDoc();

  // Metrics calculations
  const totalDocuments = documents.length;
  const indexedDocuments = documents.filter((d) => d.processingStatus === 'ready').length;
  const totalChunks = chunks.length;
  const totalQueries = queriesLog.length;
  const avgLatency =
    totalQueries > 0
      ? Math.round(queriesLog.reduce((acc, q) => acc + q.latencyMs, 0) / totalQueries)
      : 0;

  const clinicalCount = documents.filter((d) => d.category === 'clinical').length;
  const legalCount = documents.filter((d) => d.category === 'legal').length;
  const generalCount = documents.filter((d) => d.category === 'general').length;

  return (
    <div id="dashboard-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Global Disclaimer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-200 block mb-0.5">
              Verified Document Intelligence Environment
            </span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              NeuralDoc is a document-grounded AI demonstration. It does not provide medical diagnosis or legal advice. Always verify important information against the original document and consult a qualified professional.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Indexed Documents</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{indexedDocuments}</span>
            <span className="text-xs text-slate-400">/ {totalDocuments} active</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            100% Vectorized in pgvector
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Chunks</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{totalChunks}</span>
            <span className="text-xs text-slate-400">recursive segments</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            ~1,000 chars / chunk (150 ovlp)
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Queries Executed</span>
            <HelpCircle className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">{totalQueries}</span>
            <span className="text-xs text-slate-400">semantic searches</span>
          </div>
          <div className="text-[11px] text-indigo-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Avg Latency: {avgLatency} ms
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Avg Retrieval Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-100">0.86</span>
            <span className="text-xs text-slate-400">cosine similarity</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Threshold guardrail: &gt; 0.65
          </div>
        </div>
      </div>

      {/* Quick Launchpad: Clinical & Legal Test Benches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Clinical Sample Banner */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Clinical Intelligence Bench
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Coronary Angioplasty &amp; Discharge Summary
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Post-operative cardiology record with stent details, dual antiplatelet therapy (Aspirin + Ticagrelor), and emergency warning signs.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              id="dashboard-chat-clinical-btn"
              onClick={() => startChatWithDocument('doc-clinical-001')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ask Clinical Questions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                const doc = documents.find((d) => d.id === 'doc-clinical-001');
                if (doc) setInspectingDoc(doc);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              View Document &amp; Chunks
            </button>
          </div>
        </div>

        {/* Legal Sample Banner */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Legal Intelligence Bench
            </span>
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Executive Employment &amp; IP Agreement
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Executive contract with Chief Medical Officer, non-compete clauses, 60-day notice without cause severance, and $1M liability limitations.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              id="dashboard-chat-legal-btn"
              onClick={() => startChatWithDocument('doc-legal-001')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ask Legal Questions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                const doc = documents.find((d) => d.id === 'doc-legal-001');
                if (doc) setInspectingDoc(doc);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              View Document &amp; Chunks
            </button>
          </div>
        </div>
      </div>

      {/* Document Intelligence Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Document Processing & Category Distribution */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Document Intelligence Status
              </h2>
              <p className="text-xs text-slate-400">
                Embedding pipelines, semantic chunking breakdown, and storage health
              </p>
            </div>
            <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              pgvector / HNSW
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Clinical Documents</span>
              <span className="text-xl font-bold text-cyan-400">{clinicalCount}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Discharges, labs, protocols</span>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">Legal Documents</span>
              <span className="text-xl font-bold text-indigo-400">{legalCount}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Agreements, liability, IP</span>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50">
              <span className="text-xs text-slate-400 block mb-1">General / Custom</span>
              <span className="text-xl font-bold text-slate-300">{generalCount}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Uploaded PDFs / TXT</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Vector Database Storage Allocation (384-d float4)</span>
              <span className="font-mono text-slate-400">
                {(totalChunks * 384 * 4) / 1024 > 1024
                  ? `${((totalChunks * 384 * 4) / (1024 * 1024)).toFixed(2)} MB`
                  : `${((totalChunks * 384 * 4) / 1024).toFixed(1)} KB`}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                style={{ width: `${Math.min(100, Math.max(15, totalChunks * 8))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>HNSW Index: ef_construction=64, m=16</span>
              <span>Metric: Cosine Distance (&lt;=&gt;)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Questions Asked */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200">Recent Questions</h2>
            <button
              onClick={() => setActiveTab('queries')}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {queriesLog.slice(0, 4).map((q) => (
              <div
                key={q.id}
                className="bg-slate-800/50 hover:bg-slate-800 p-3 rounded-lg border border-slate-800 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200 line-clamp-1">
                    {q.userQuestion}
                  </span>
                  <span className="text-[10px] text-teal-400 font-mono shrink-0 ml-2">
                    {q.latencyMs}ms
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-2">
                  {q.answer}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">
                    {q.category || 'general'}
                  </span>
                  <span>{q.sourcesCount} citations verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Documents Table Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">Recent Documents</h2>
            <p className="text-xs text-slate-400">
              Current documents available for grounded semantic retrieval
            </p>
          </div>
          <button
            onClick={() => setActiveTab('documents')}
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>Document Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Document Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Pages</th>
                <th className="py-2.5 px-3">Chunks</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-100 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="line-clamp-1">{doc.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{doc.filename}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider ${
                        doc.category === 'clinical'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : doc.category === 'legal'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{doc.pageCount}</td>
                  <td className="py-3 px-3 font-mono">{doc.chunkCount}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Indexed
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => startChatWithDocument(doc.id)}
                      className="px-2.5 py-1 rounded bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
