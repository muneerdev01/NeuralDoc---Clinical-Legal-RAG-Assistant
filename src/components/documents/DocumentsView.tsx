import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Trash2,
  BotMessageSquare,
  Eye,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Plus,
} from 'lucide-react';
import { useNeuralDoc } from '../../context/NeuralDocContext';
import { DocumentCategory, DocumentMetadata } from '../../types';
import { DocumentDetailModal } from './DocumentDetailModal';
import { DisclaimerBanner } from '../layout/DisclaimerBanner';

export const DocumentsView: React.FC<{
  showUploadModal: boolean;
  setShowUploadModal: (v: boolean) => void;
}> = ({ showUploadModal, setShowUploadModal }) => {
  const {
    documents,
    deleteDocument,
    startChatWithDocument,
    inspectingDoc,
    setInspectingDoc,
    handleUploadFile,
    isUploading,
    uploadProgress,
  } = useNeuralDoc();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('clinical');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Filtering
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.author && doc.author.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onConfirmUpload = async () => {
    if (!selectedFile) return;
    await handleUploadFile(selectedFile, uploadCategory);
    setSelectedFile(null);
    setShowUploadModal(false);
  };

  return (
    <div id="documents-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Privacy disclaimer banner */}
      <DisclaimerBanner showPrivacyNotice={true} />

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'clinical', label: 'Clinical' },
            { id: 'legal', label: 'Legal' },
            { id: 'general', label: 'General' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Upload CTA */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <button
            id="open-upload-modal-btn"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Documents Grid / Cards */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No documents found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No documents matched your query. Try adjusting your search or category filter.'
              : 'Upload a clinical record or legal contract to begin semantic indexing.'}
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-medium hover:bg-teal-500 transition-colors cursor-pointer"
          >
            Upload Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg border ${
                        doc.category === 'clinical'
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : doc.category === 'legal'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {doc.category === 'clinical' ? (
                        <Activity className="w-4 h-4" />
                      ) : doc.category === 'legal' ? (
                        <FileSpreadsheet className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                        doc.category === 'clinical'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                          : doc.category === 'legal'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {doc.category}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Indexed
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-100 line-clamp-1 group-hover:text-teal-300 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {doc.filename}
                  </p>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.summary || 'Document ready for RAG semantic search.'}
                </p>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pages</span>
                    <span className="font-mono text-slate-200">{doc.pageCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Chunks</span>
                    <span className="font-mono text-slate-200">{doc.chunkCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Size</span>
                    <span className="font-mono text-slate-200">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setInspectingDoc(doc)}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-slate-100 font-medium cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startChatWithDocument(doc.id)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <BotMessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Delete document and pgvector chunks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div
          id="upload-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  Upload Clinical or Legal Document
                </h3>
                <p className="text-xs text-slate-400">
                  Ingests text, splits into recursive chunks, and indexes in pgvector
                </p>
              </div>
              <button
                disabled={isUploading}
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Privacy Alert */}
            <div className="bg-amber-500/10 border border-amber-500/25 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Demonstration deployment: Only upload synthetic or non-confidential sample files. Do not upload real patient records or confidential trade secrets.
              </span>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Document Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'clinical', label: 'Clinical' },
                  { id: 'legal', label: 'Legal' },
                  { id: 'general', label: 'General' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setUploadCategory(cat.id as DocumentCategory)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                      uploadCategory === cat.id
                        ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-teal-400 bg-teal-500/10'
                  : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'
              }`}
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.txt,.md,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-teal-400 mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-200">
                {selectedFile ? (
                  <span className="text-teal-300 font-mono">{selectedFile.name}</span>
                ) : (
                  <span>Click to browse or drag and drop your document</span>
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supported formats: PDF, TXT, MD (Max 25 MB)
              </p>
            </div>

            {/* Live Upload Progress Indicator */}
            {isUploading && (
              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-teal-300 uppercase tracking-wider text-[10px]">
                    {uploadProgress.status}
                  </span>
                  <span className="font-mono text-teal-400">{uploadProgress.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                  {uploadProgress.step}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isUploading}
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedFile || isUploading}
                onClick={onConfirmUpload}
                className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm"
              >
                {isUploading ? 'Processing Document...' : 'Start Indexing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {inspectingDoc && (
        <DocumentDetailModal
          document={inspectingDoc}
          onClose={() => setInspectingDoc(null)}
        />
      )}
    </div>
  );
};
