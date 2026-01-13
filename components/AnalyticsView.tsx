
import React from 'react';
import { AppState, RiskLevel } from '../types';
import { calculateSafeBunks } from '../utils/calculations';

interface AnalyticsViewProps {
  state: AppState;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state }) => {
  const allComponents = state.subjects.flatMap(s => s.components.map(c => ({ ...c, subjectName: s.name })));
  const totalHeld = allComponents.reduce((acc, c) => acc + c.total, 0);
  const totalAttended = allComponents.reduce((acc, c) => acc + c.attended, 0);
  const overallPct = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;

  const results = allComponents.map(c => calculateSafeBunks(c.attended, c.total, c.requiredPct));
  const safeCount = results.filter(r => r.risk === RiskLevel.SAFE).length;
  const dangerCount = results.filter(r => r.risk === RiskLevel.DANGER).length;
  
  const eligibilityScore = Math.max(0, 100 - (dangerCount * 15) - (dangerCount === 0 && overallPct < 75 ? 20 : 0));

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="px-2 pt-2">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-1">Clinic Pro: Analytics</p>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Eligibility Report</h2>
      </div>

      <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 right-0 p-8 text-6xl opacity-5 ${eligibilityScore > 80 ? 'text-emerald-500' : 'text-rose-500'}`}>
           <i className={`fas ${eligibilityScore > 80 ? 'fa-user-check' : 'fa-user-ninja'}`}></i>
        </div>
        <div className="relative z-10 text-center space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Predictive Exam Score</p>
            <h3 className={`text-7xl font-black tracking-tighter ${eligibilityScore > 80 ? 'text-emerald-500' : eligibilityScore > 60 ? 'text-amber-500' : 'text-rose-500'}`}>
                {eligibilityScore.toFixed(0)}<span className="text-2xl text-slate-300 ml-1">/100</span>
            </h3>
            <p className="text-xs font-bold text-slate-500 max-w-[200px] mx-auto leading-relaxed pt-4">
                {eligibilityScore > 80 ? "You are highly likely to be eligible for all professional exams." : "Risk of detention detected in clinical components."}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <InsightCard label="Safe Units" value={safeCount} icon="fa-shield-check" color="text-emerald-500" bg="bg-emerald-50" />
          <InsightCard label="Deficit Units" value={dangerCount} icon="fa-triangle-exclamation" color="text-rose-500" bg="bg-rose-50" />
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
          <h4 className="text-[10px] font-black text-blue-300 uppercase tracking-[0.3em] mb-6">Component Breakdown</h4>
          <div className="space-y-6">
              {allComponents.map(c => {
                  const { currentPct, risk } = calculateSafeBunks(c.attended, c.total, c.requiredPct);
                  return (
                    <div key={c.id} className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider">{c.subjectName}</span>
                            <span className="text-[9px] text-slate-500 font-bold">{c.type}</span>
                        </div>
                        <div className="text-right">
                             <span className={`text-xs font-black ${risk === RiskLevel.SAFE ? 'text-emerald-400' : risk === RiskLevel.BORDERLINE ? 'text-amber-400' : 'text-rose-400'}`}>
                                {currentPct.toFixed(0)}%
                             </span>
                             <div className="w-16 h-1 bg-white/10 rounded-full mt-1">
                                <div className={`h-full rounded-full ${risk === RiskLevel.SAFE ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{width: `${Math.min(100, currentPct)}%`}}></div>
                             </div>
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>
    </div>
  );
};

const InsightCard = ({ label, value, icon, color, bg }: any) => (
    <div className={`p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex flex-col items-center`}>
        <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4`}>
            <i className={`fas ${icon} text-lg`}></i>
        </div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-black text-slate-800">{value}</span>
    </div>
);

export default AnalyticsView;
