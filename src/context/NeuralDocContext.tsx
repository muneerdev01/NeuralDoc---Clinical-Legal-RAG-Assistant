import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DocumentMetadata,
  DocumentChunk,
  Collection,
  ChatMessage,
  RAGSettings,
  QueryLog,
  SourceCitation,
  DocumentCategory,
} from '../types';
import {
  INITIAL_DOCUMENTS,
  SAMPLE_CLINICAL_CHUNKS,
  SAMPLE_LEGAL_CHUNKS,
  INITIAL_COLLECTIONS,
} from '../lib/demo/sampleData';
import { vectorStore } from '../lib/rag/vectorStore';
import { executeRAGQuery } from '../lib/rag/engine';
import { processUploadedDocument } from '../lib/pdf/extractor';

export type ActiveTab =
  | 'dashboard'
  | 'documents'
  | 'assistant'
  | 'collections'
  | 'queries'
  | 'sources'
  | 'settings';

interface NeuralDocContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  documents: DocumentMetadata[];
  chunks: DocumentChunk[];
  collections: Collection[];
  messages: ChatMessage[];
  queriesLog: QueryLog[];
  settings: RAGSettings;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  selectedCollectionId: string | null;
  setSelectedCollectionId: (id: string | null) => void;
  activeCitation: SourceCitation | null;
  setActiveCitation: (cite: SourceCitation | null) => void;
  inspectingDoc: DocumentMetadata | null;
  setInspectingDoc: (doc: DocumentMetadata | null) => void;
  isUploading: boolean;
  uploadProgress: { status: string; progress: number; step: string };
  isGenerating: boolean;
  
  // Actions
  handleUploadFile: (file: File, category: DocumentCategory) => Promise<void>;
  deleteDocument: (id: string) => void;
  sendChatMessage: (question: string) => Promise<void>;
  clearChat: () => void;
  updateSettings: (newSettings: Partial<RAGSettings>) => void;
  startChatWithDocument: (docId: string) => void;
  createCollection: (name: string, description: string) => void;
}

const NeuralDocContext = createContext<NeuralDocContextType | undefined>(undefined);

const INITIAL_SETTINGS: RAGSettings = {
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
};

const INITIAL_QUERIES: QueryLog[] = [
  {
    id: 'q-demo-1',
    userQuestion: 'What are the patient discharge medications?',
    answer: 'Discharge medications include Aspirin 81 mg daily, Ticagrelor 90 mg BID (12 months mandatory), Atorvastatin 80 mg daily, Metoprolol Succinate ER 50 mg daily, and Lisinopril 5 mg daily [Sample Clinical Discharge Summary — Page 3].',
    createdAt: '2026-09-12T08:15:00Z',
    latencyMs: 342,
    documentCount: 1,
    sourcesCount: 2,
    grounded: true,
    category: 'clinical',
  },
  {
    id: 'q-demo-2',
    userQuestion: 'What are the termination conditions without cause?',
    answer: 'Pursuant to Section 7.2, termination without Cause requires sixty (60) days prior written notice, entitling Executive to 12 months base salary severance, pro-rata bonus, and 12 months COBRA healthcare continuation [ApexBio Executive Agreement — Page 4].',
    createdAt: '2026-09-12T08:32:00Z',
    latencyMs: 388,
    documentCount: 1,
    sourcesCount: 2,
    grounded: true,
    category: 'legal',
  },
];

export const NeuralDocProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [documents, setDocuments] = useState<DocumentMetadata[]>(INITIAL_DOCUMENTS);
  const [chunks, setChunks] = useState<DocumentChunk[]>([
    ...SAMPLE_CLINICAL_CHUNKS,
    ...SAMPLE_LEGAL_CHUNKS,
  ]);
  const [collections, setCollections] = useState<Collection[]>(INITIAL_COLLECTIONS);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<SourceCitation | null>(null);
  const [inspectingDoc, setInspectingDoc] = useState<DocumentMetadata | null>(null);
  const [settings, setSettings] = useState<RAGSettings>(INITIAL_SETTINGS);
  const [queriesLog, setQueriesLog] = useState<QueryLog[]>(INITIAL_QUERIES);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    status: string;
    progress: number;
    step: string;
  }>({
    status: 'idle',
    progress: 0,
    step: '',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Welcome to **NeuralDoc**. I am your grounded document intelligence assistant. 

Upload clinical summaries or legal agreements, or select one of the pre-indexed sample documents to ask specific questions. Every factual response will include verifiable source citations referencing exact pages and sections.`,
      timestamp: new Date().toISOString(),
      isGrounded: true,
    },
  ]);

  // Index initial sample chunks into in-memory vector store on mount
  useEffect(() => {
    vectorStore.addChunks([...SAMPLE_CLINICAL_CHUNKS, ...SAMPLE_LEGAL_CHUNKS]);
  }, []);

  const handleUploadFile = async (file: File, category: DocumentCategory) => {
    setIsUploading(true);
    setUploadProgress({
      status: 'uploading',
      progress: 10,
      step: 'Initiating document upload...',
    });

    try {
      const result = await processUploadedDocument(
        file,
        category,
        (status, progress, stepDescription) => {
          setUploadProgress({
            status,
            progress,
            step: stepDescription,
          });
        }
      );

      // Add to vector store
      vectorStore.addChunks(result.chunks);

      // Update state
      setDocuments((prev) => [result.document, ...prev]);
      setChunks((prev) => [...prev, ...result.chunks]);

      // Complete
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress({ status: 'idle', progress: 0, step: '' });
        // Jump to Assistant with new document selected
        setSelectedDocId(result.document.id);
        setActiveTab('assistant');
      }, 700);
    } catch (err: any) {
      console.error('Upload failure:', err);
      setUploadProgress({
        status: 'failed',
        progress: 100,
        step: `Processing failed: ${err?.message || 'Unknown error'}`,
      });
      setTimeout(() => {
        setIsUploading(false);
      }, 3000);
    }
  };

  const deleteDocument = (id: string) => {
    vectorStore.deleteDocumentChunks(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setChunks((prev) => prev.filter((c) => c.documentId !== id));
    if (selectedDocId === id) {
      setSelectedDocId(null);
    }
    if (inspectingDoc?.id === id) {
      setInspectingDoc(null);
    }
  };

  const sendChatMessage = async (question: string) => {
    if (!question.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Determine target documents based on selection
      let targetDocs = documents;
      if (selectedDocId) {
        targetDocs = documents.filter((d) => d.id === selectedDocId);
      } else if (selectedCollectionId) {
        targetDocs = documents.filter((d) => d.collectionId === selectedCollectionId);
      }

      const result = await executeRAGQuery(question, targetDocs, settings);

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: result.answer,
        timestamp: new Date().toISOString(),
        sources: result.sources,
        isGrounded: result.grounded,
        latencyMs: result.latencyMs,
        category: targetDocs[0]?.category,
        isDemo: settings.llmProvider === 'demo',
        debugInfo: result.debugInfo,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If sources retrieved, select the top source citation
      if (result.sources.length > 0) {
        setActiveCitation(result.sources[0]);
      }

      // Record in queries audit log
      const newQueryLog: QueryLog = {
        id: `q-${Date.now()}`,
        userQuestion: question,
        answer: result.answer,
        createdAt: new Date().toISOString(),
        latencyMs: result.latencyMs,
        documentCount: targetDocs.length,
        sourcesCount: result.sources.length,
        grounded: result.grounded,
        category: targetDocs[0]?.category,
      };
      setQueriesLog((prev) => [newQueryLog, ...prev]);
    } catch (err) {
      console.error('RAG query error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'An error occurred while executing the RAG pipeline. Please verify the document indexing status.',
        timestamp: new Date().toISOString(),
        isGrounded: false,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: 'Conversation cleared. Select a document or collection and ask a question.',
        timestamp: new Date().toISOString(),
        isGrounded: true,
      },
    ]);
    setActiveCitation(null);
  };

  const updateSettings = (newSettings: Partial<RAGSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const startChatWithDocument = (docId: string) => {
    setSelectedDocId(docId);
    setSelectedCollectionId(null);
    setActiveTab('assistant');
  };

  const createCollection = (name: string, description: string) => {
    const newCol: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      documentCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCollections((prev) => [...prev, newCol]);
  };

  return (
    <NeuralDocContext.Provider
      value={{
        activeTab,
        setActiveTab,
        documents,
        chunks,
        collections,
        messages,
        queriesLog,
        settings,
        selectedDocId,
        setSelectedDocId,
        selectedCollectionId,
        setSelectedCollectionId,
        activeCitation,
        setActiveCitation,
        inspectingDoc,
        setInspectingDoc,
        isUploading,
        uploadProgress,
        isGenerating,
        handleUploadFile,
        deleteDocument,
        sendChatMessage,
        clearChat,
        updateSettings,
        startChatWithDocument,
        createCollection,
      }}
    >
      {children}
    </NeuralDocContext.Provider>
  );
};

export const useNeuralDoc = () => {
  const context = useContext(NeuralDocContext);
  if (!context) {
    throw new Error('useNeuralDoc must be used within a NeuralDocProvider');
  }
  return context;
};
