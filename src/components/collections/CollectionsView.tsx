import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  FileText,
  BotMessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useNeuralDoc } from '../../context/NeuralDocContext';

export const CollectionsView: React.FC = () => {
  const {
    collections,
    documents,
    createCollection,
    setSelectedCollectionId,
    setSelectedDocId,
    setActiveTab,
  } = useNeuralDoc();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createCollection(name.trim(), description.trim());
    setName('');
    setDescription('');
    setShowCreateModal(false);
  };

  const startQueryCollection = (colId: string) => {
    setSelectedCollectionId(colId);
    setSelectedDocId(null);
    setActiveTab('assistant');
  };

  return (
    <div id="collections-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Document Collections
          </h2>
          <p className="text-xs text-slate-400">
            Group related documents to execute multi-document semantic retrieval
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => {
          const colDocs = documents.filter((d) => d.collectionId === col.id);
          const totalChunks = colDocs.reduce((acc, d) => acc + d.chunkCount, 0);

          return (
            <div
              key={col.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {colDocs.length} {colDocs.length === 1 ? 'doc' : 'docs'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-100">{col.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {col.description || 'Custom collection of documents.'}
                  </p>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] space-y-1">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Aggregated Chunks:</span>
                    <span className="font-mono text-slate-200">{totalChunks} vectors</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => startQueryCollection(col.id)}
                  className="w-full py-2 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BotMessageSquare className="w-3.5 h-3.5" />
                  <span>Query Entire Collection</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">
              Create New Document Collection
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology Clinical Trials, M&A Contracts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Description</label>
                <textarea
                  placeholder="Purpose of this grouping..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium cursor-pointer"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
