import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export const InboundSimulatorModal = ({
  isOpen,
  onClose,
  onSimulate
}) => {
  const [selectedScenario, setSelectedScenario] = useState('client');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const scenarios = [
    {
      id: 'client',
      title: 'Executive Legal Sign-Off',
      expectedBadge: 'Client to Reply',
      badgeColor: 'bg-amber-100 text-amber-800',
      description: 'Urgent liquidity facility addendum requiring Sarah’s personal sign-off before market close.',
      sender: 'Victoria Sterling (General Counsel)'
    },
    {
      id: 'assistant',
      title: 'Meeting Reschedule Request',
      expectedBadge: 'Assistant to Reply',
      badgeColor: 'bg-brand-100 text-brand-800',
      description: 'Product design sync request asking assistant to find 45 mins next week.',
      sender: 'Derek Lin (DesignCraft)'
    },
    {
      id: 'automated',
      title: 'Automated Cloud Invoice',
      expectedBadge: 'No Reply Needed',
      badgeColor: 'bg-slate-100 text-slate-700',
      description: 'Monthly AWS cloud billing digest receipt with auto-payment confirmation.',
      sender: 'Amazon Web Services'
    }
  ];

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setLastResult(null);
    try {
      const res = await onSimulate(selectedScenario);
      setLastResult(res);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Icon name="zap" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inbound Email Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Test live AI classification, reasoning, and routing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Scenario Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Choose Simulation Scenario:
          </label>
          <div className="space-y-2">
            {scenarios.map(s => {
              const isSelected = selectedScenario === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedScenario(s.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-900">{s.title}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badgeColor}`}>
                      Expected: {s.expectedBadge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                  <div className="text-[11px] text-slate-400 mt-1">Sender: {s.sender}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Result Feedback */}
        {lastResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-emerald-900 font-bold">
              <span>Simulation Delivered & Classified!</span>
              <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-semibold text-[11px]">
                {lastResult.email?.classification} ({lastResult.email?.confidence}% confidence)
              </span>
            </div>
            <p className="text-emerald-800 leading-relaxed">
              Rationale: "{lastResult.email?.reasoning}"
            </p>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-colors"
          >
            <Icon name="zap" className="w-4 h-4" />
            <span>{isSimulating ? 'Processing Inbound...' : 'Inject Incoming Email'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
