import React from 'react';
import {
  Sliders,
  Database,
  Cpu,
  ShieldCheck,
  Check,
  RotateCcw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useNeuralDoc } from '../../context/NeuralDocContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useNeuralDoc();

  const handleReset = () => {
    updateSettings({
      topK: 4,
      similarityThreshold: 0.65,
      chunkSize: 1000,
      chunkOverlap: 150,
      embeddingProvider: 'demo',
      embeddingModel: 'BAAI/bge-small-en-v1.5 (384-d)',
      llmProvider: 'demo',
      llmModel: 'gpt-4o-mini',
      debugMode: false,
      clinicalGuardrailsEnabled: true,
    });
  };

  return (
    <div id="settings-view" className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            RAG Configuration &amp; Model Parameters
          </h2>
          <p className="text-xs text-slate-400">
            Fine-tune retrieval parameters, chunking geometry, and hallucination guardrail thresholds
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Retrieval Tuning Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-400" />
          <span>Semantic Retrieval Parameters</span>
        </h3>

        <div className="space-y-4 text-xs">
          {/* Top-K */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-200">
                Top-K Retrieved Chunks (match_count)
              </label>
              <span className="font-mono text-teal-400 font-bold">{settings.topK}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.topK}
              onChange={(e) => updateSettings({ topK: parseInt(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Maximum number of most relevant chunks passed into the context window for synthesis.
            </p>
          </div>

          {/* Similarity Threshold */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-200">
                Minimum Similarity Threshold (Cosine Distance)
              </label>
              <span className="font-mono text-teal-400 font-bold">
                {settings.similarityThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={settings.similarityThreshold}
              onChange={(e) =>
                updateSettings({ similarityThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-teal-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Guardrail 1: If no retrieved chunk meets this cosine score, the assistant responds strictly: <em>"Information not available in document."</em>
            </p>
          </div>
        </div>
      </div>

      {/* Recursive Chunking Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Recursive Text Chunking Geometry</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-200">
                Chunk Size (~Tokens/Chars)
              </label>
              <span className="font-mono text-cyan-400 font-bold">{settings.chunkSize}</span>
            </div>
            <input
              type="range"
              min="500"
              max="1500"
              step="100"
              value={settings.chunkSize}
              onChange={(e) => updateSettings({ chunkSize: parseInt(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Target length per recursive segment (800–1200 recommended for clinical/legal).
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-slate-200">
                Chunk Overlap (Chars)
              </label>
              <span className="font-mono text-cyan-400 font-bold">
                {settings.chunkOverlap}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="25"
              value={settings.chunkOverlap}
              onChange={(e) => updateSettings({ chunkOverlap: parseInt(e.target.value) })}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">
              Boundary overlap preserved across adjacent segments to maintain semantic continuity.
            </p>
          </div>
        </div>
      </div>

      {/* Model Providers Abstraction */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Model Provider Abstraction</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-slate-200 block">
              LLM Generation Engine
            </label>
            <select
              value={settings.llmProvider}
              onChange={(e) => updateSettings({ llmProvider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="demo">Demo Mode Synthesizer (Instant, 100% Grounded)</option>
              <option value="gemini">Google Gemini 2.5 Flash</option>
              <option value="openai">OpenAI Compatible (gpt-4o-mini)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-slate-200 block">
              Embedding Provider
            </label>
            <select
              value={settings.embeddingProvider}
              onChange={(e) => updateSettings({ embeddingProvider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="demo">NeuralDoc 384-d Dense Vectorizer (Local)</option>
              <option value="openai">OpenAI text-embedding-3-small (1536-d)</option>
              <option value="huggingface">HuggingFace BAAI/bge-small-en-v1.5</option>
            </select>
          </div>
        </div>

        {/* Developer Debug Mode Toggle */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-medium text-slate-200 text-xs block">
              Developer Retrieval Debug Mode
            </span>
            <p className="text-[11px] text-slate-400">
              Display raw vector similarity scores, query embeddings, and latency benchmarks in chat.
            </p>
          </div>
          <button
            onClick={() => updateSettings({ debugMode: !settings.debugMode })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              settings.debugMode ? 'bg-teal-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.debugMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Supabase pgvector Architecture Summary */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs space-y-3 font-mono">
        <div className="text-teal-400 font-semibold flex items-center gap-1.5">
          <Terminal className="w-4 h-4" />
          <span>PostgreSQL pgvector Schema Configuration</span>
        </div>
        <div className="text-slate-400 text-[11px] space-y-1">
          <div>• Extension: <span className="text-slate-200">vector (pgvector)</span></div>
          <div>• Table: <span className="text-slate-200">public.document_chunks (embedding vector(384))</span></div>
          <div>• Index: <span className="text-slate-200">HNSW (embedding vector_cosine_ops) WITH (m=16, ef_construction=64)</span></div>
          <div>• Search RPC: <span className="text-slate-200">public.match_documents(query_embedding, match_count, filter_doc_ids, similarity_threshold)</span></div>
        </div>
      </div>
    </div>
  );
};
