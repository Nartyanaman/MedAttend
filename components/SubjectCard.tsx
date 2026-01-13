
import React, { useState, useEffect } from 'react';
import { Subject, SubjectComponent, RiskLevel } from '../types';
import { calculateSafeBunks } from '../utils/calculations';

interface SubjectCardProps {
  subject: Subject;
  onUpdateComponent: (subjectId: string, componentId: string, attended: number, total: number, status?: 'present' | 'absent') => void;
  onUpdateCriteria?: (componentId: string, requiredPct: number) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onUpdateComponent, onUpdateCriteria }) => {
  return (
    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden mb-10">
      <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">{subject.name}</h3>
      </div>
      <div className="p-8 space-y-16">
        {subject.components.map(comp => (
          <ComponentItem 
            key={comp.id} 
            component={comp} 
            onUpdate={(att, tot, status) => onUpdateComponent(subject.id, comp.id, att, tot, status)}
            onUpdateCriteria={(pct) => onUpdateCriteria && onUpdateCriteria(comp.id, pct)}
          />
        ))}
      </div>
    </div>
  );
};

interface ComponentItemProps {
  component: SubjectComponent;
  onUpdate: (a: number, t: number, s?: 'present' | 'absent') => void;
  onUpdateCriteria: (pct: number) => void;
}

const ComponentItem: React.FC<ComponentItemProps> = ({ component, onUpdate, onUpdateCriteria }) => {
  const { safeBunks, currentPct, risk, needed } = calculateSafeBunks(component.attended, component.total, component.requiredPct);
  const [isEditingCriteria, setIsEditingCriteria] = useState(false);
  const [tempCriteria, setTempCriteria] = useState(component.requiredPct);
  const [attendedInput, setAttendedInput] = useState<string>(component.attended.toString());
  const [totalInput, setTotalInput] = useState<string>(component.total.toString());

  // Sync local state when component prop changes
  useEffect(() => {
    setAttendedInput(component.attended.toString());
    setTotalInput(component.total.toString());
  }, [component.attended, component.total]);

  const getRiskColor = () => {
    if (risk === RiskLevel.SAFE) return 'text-emerald-600';
    if (risk === RiskLevel.BORDERLINE) return 'text-amber-500';
    return 'text-rose-600';
  };

  const getRiskBg = () => {
    if (risk === RiskLevel.SAFE) return 'bg-emerald-50 border-emerald-200';
    if (risk === RiskLevel.BORDERLINE) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const handleCriteriaSave = () => {
    onUpdateCriteria(tempCriteria);
    setIsEditingCriteria(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{component.type}</p>
            {!isEditingCriteria ? (
              <button 
                onClick={() => setIsEditingCriteria(true)}
                className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors uppercase tracking-widest"
              >
                Target: {component.requiredPct}% <i className="fas fa-pen ml-1 scale-75"></i>
              </button>
            ) : (
              <div className="flex items-center gap-1 animate-fadeIn">
                <input 
                  type="number"
                  className="w-12 text-[10px] font-black text-blue-600 border border-blue-200 rounded px-1 outline-none"
                  value={tempCriteria}
                  onChange={(e) => setTempCriteria(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                />
                <button onClick={handleCriteriaSave} className="text-emerald-500 text-[10px] font-bold"><i className="fas fa-check"></i></button>
                <button onClick={() => setIsEditingCriteria(false)} className="text-rose-500 text-[10px] font-bold"><i className="fas fa-times"></i></button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-5xl font-black tracking-tighter text-slate-800">{currentPct.toFixed(1)}<span className="text-xl text-slate-300">%</span></span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Safe Bunks</p>
          <div className={`text-4xl font-black leading-none tracking-tighter ${safeBunks < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {safeBunks > 0 ? `+${safeBunks}` : safeBunks}
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner p-[1px]">
        <div 
          className={`h-full rounded-full transition-all duration-700 shadow-sm ${
            risk === RiskLevel.SAFE ? 'bg-emerald-500' : 
            risk === RiskLevel.BORDERLINE ? 'bg-amber-400' : 'bg-rose-500'
          }`}
          style={{ width: `${Math.min(100, currentPct)}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className={`px-4 py-2 rounded-2xl border-2 font-black text-[9px] uppercase tracking-widest ${getRiskBg()} ${getRiskColor()}`}>
          {risk} STATUS
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Attended</label>
          <input
            type="text"
            inputMode="numeric"
            value={attendedInput}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string or numbers only
              if (value === '' || /^\d+$/.test(value)) {
                setAttendedInput(value);
                if (value !== '') {
                  const attended = Math.max(0, parseInt(value) || 0);
                  onUpdate(attended, component.total);
                }
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value === '') {
                setAttendedInput('0');
                onUpdate(0, component.total);
              } else {
                const attended = Math.max(0, parseInt(value) || 0);
                setAttendedInput(attended.toString());
                onUpdate(attended, component.total);
              }
            }}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-lg font-black text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Held</label>
          <input
            type="text"
            inputMode="numeric"
            value={totalInput}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty string or numbers only
              if (value === '' || /^\d+$/.test(value)) {
                setTotalInput(value);
                if (value !== '') {
                  const total = Math.max(0, parseInt(value) || 0);
                  // Ensure attended doesn't exceed total
                  const attended = Math.min(component.attended, total);
                  onUpdate(attended, total);
                }
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value === '') {
                setTotalInput('0');
                onUpdate(Math.min(component.attended, 0), 0);
              } else {
                const total = Math.max(0, parseInt(value) || 0);
                setTotalInput(total.toString());
                // Ensure attended doesn't exceed total
                const attended = Math.min(component.attended, total);
                onUpdate(attended, total);
              }
            }}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-lg font-black text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {needed > 0 && (
        <div className="bg-rose-500 text-white p-5 rounded-[2rem] flex items-center gap-4 shadow-xl shadow-rose-100 animate-pulse">
          <i className="fas fa-triangle-exclamation text-xl"></i>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest">Deficit Warning</p>
            <p className="text-xs font-bold">Attend next <span className="underline decoration-2 underline-offset-4">{needed}</span> classes to clear.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectCard;
