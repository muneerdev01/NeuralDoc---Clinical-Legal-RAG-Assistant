import React from 'react';
import {
  ShieldAlert,
  Sparkles,
  Sliders,
  Database,
  Search,
  UploadCloud,
  FileCheck,
} from 'lucide-react';
import { useNeuralDoc, ActiveTab } from '../../context/NeuralDocContext';

export const Header: React.FC<{ onOpenUpload?: () => void }> = ({ onOpenUpload }) => {
  const { activeTab, setActiveTab, documents, settings } = useNeuralDoc();

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Document Intelligence Dashboard',
      subtitle: 'Overview of indexed clinical & legal records, embeddings, and semantic queries',
    },
    documents: {
      title: 'Document Library',
      subtitle: 'Upload, manage, and inspect clinical summaries and legal contracts',
    },
    assistant: {
      title: 'RAG Assistant & Citations',
      subtitle: 'Document-grounded question answering with pgvector semantic retrieval',
    },
    collections: {
      title: 'Document Collections',
      subtitle: 'Group related clinical cases or contracts for multi-document retrieval',
    },
    queries: {
      title: 'Query Audit Log',
      subtitle: 'Historical retrieval queries, latency metrics, and citation accuracy',
    },
    sources: {
      title: 'Sources & Vector Explorer',
      subtitle: 'Inspect recursive chunks and pgvector embedding distributions',
    },
    settings: {
      title: 'RAG Configuration & Parameters',
      subtitle: 'Adjust Top-K, similarity thresholds, chunk sizes, and vector providers',
    },
  };

  const currentMeta = tabTitles[activeTab];

  return (
    <header
      id="main-header"
      className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between shrink-0 select-none z-10"
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-400 font-normal hidden sm:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Guardrails Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
          <FileCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Strict Guardrails</span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
        </div>

        {/* Demo Mode Badge */}
        <div
          id="demo-mode-badge"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>DEMO MODE</span>
        </div>

        {/* Quick Upload Action */}
        <button
          id="header-upload-btn"
          onClick={() => {
            setActiveTab('documents');
            onOpenUpload?.();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="hidden sm:inline">Upload Document</span>
        </button>

        {/* Quick Settings Icon */}
        <button
          id="header-settings-btn"
          onClick={() => setActiveTab('settings')}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="RAG Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
