import React, { useState } from 'react';
import { NeuralDocProvider, useNeuralDoc } from './context/NeuralDocContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { DocumentsView } from './components/documents/DocumentsView';
import { AssistantView } from './components/chat/AssistantView';
import { CollectionsView } from './components/collections/CollectionsView';
import { QueriesView } from './components/queries/QueriesView';
import { SourcesExplorerView } from './components/sources/SourcesExplorerView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useNeuralDoc();
  const [showUploadModal, setShowUploadModal] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 antialiased font-sans">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenUpload={() => setShowUploadModal(true)} />

        <div className="flex-1 overflow-y-auto bg-slate-950">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenUpload={() => setShowUploadModal(true)} />
          )}
          {activeTab === 'documents' && (
            <DocumentsView
              showUploadModal={showUploadModal}
              setShowUploadModal={setShowUploadModal}
            />
          )}
          {activeTab === 'assistant' && <AssistantView />}
          {activeTab === 'collections' && <CollectionsView />}
          {activeTab === 'queries' && <QueriesView />}
          {activeTab === 'sources' && <SourcesExplorerView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <NeuralDocProvider>
      <MainLayout />
    </NeuralDocProvider>
  );
}
