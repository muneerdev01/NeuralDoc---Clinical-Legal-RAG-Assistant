import React from 'react';
import {
  LayoutDashboard,
  FileText,
  BotMessageSquare,
  FolderKanban,
  History,
  Layers,
  Settings,
  ShieldCheck,
  Cpu,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useNeuralDoc, ActiveTab } from '../../context/NeuralDocContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, documents } = useNeuralDoc();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<any>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Documents', icon: FileText, badge: documents.length },
    { id: 'assistant', label: 'AI Assistant', icon: BotMessageSquare },
    { id: 'collections', label: 'Collections', icon: FolderKanban },
    { id: 'queries', label: 'Recent Queries', icon: History },
    { id: 'sources', label: 'Sources Explorer', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      id="sidebar-nav"
      className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none z-20 shrink-0"
    >
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-100 tracking-tight text-base flex items-center gap-1.5">
                NeuralDoc
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  RAG
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Clinical & Legal Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-teal-500/25 text-teal-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Disclaimers */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
        <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            pgvector Active
          </span>
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
            384-d
          </span>
        </div>

        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <div className="flex items-center gap-1 text-slate-300 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span>Demonstration Notice</span>
          </div>
          <p className="line-clamp-3 text-[10.5px]">
            NeuralDoc is a document-grounded AI demonstration. Not medical diagnosis or legal advice.
          </p>
        </div>

        <div className="text-center text-[10px] text-slate-400">
          NeuralDoc v1.0 • Supabase pgvector
        </div>
      </div>
    </aside>
  );
};
