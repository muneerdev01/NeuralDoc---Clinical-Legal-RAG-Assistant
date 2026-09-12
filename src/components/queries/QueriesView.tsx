import React from 'react';
import {
  History,
  BotMessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
} from 'lucide-react';
import { useNeuralDoc } from '../../context/NeuralDocContext';

export const QueriesView: React.FC = () => {
  const { queriesLog, sendChatMessage, setActiveTab } = useNeuralDoc();

  const handleReopen = (question: string) => {
    sendChatMessage(question);
    setActiveTab('assistant');
  };

  return (
    <div id="queries-view" className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Query Retrieval Audit Log
          </h2>
          <p className="text-xs text-slate-400">
            Audit history of semantic searches, retrieval latency, and citation accuracy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
            Total Queries: {queriesLog.length}
          </span>
        </div>
      </div>

      {queriesLog.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-200">No queries recorded</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Queries executed in the AI Assistant will be logged here with latency benchmarks and citation scores.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User Question</th>
                  <th className="py-3 px-4">Synthesized Grounded Answer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Citations</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {queriesLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-100 max-w-xs">
                      <div className="line-clamp-2">{log.userQuestion}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md text-slate-300">
                      <div className="line-clamp-2 text-[11px] leading-relaxed">
                        {log.answer}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.grounded ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Grounded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Fallback
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-400 whitespace-nowrap">
                      {log.latencyMs} ms
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {log.sourcesCount} verified
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleReopen(log.userQuestion)}
                        className="px-2.5 py-1 rounded bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        Re-query
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
