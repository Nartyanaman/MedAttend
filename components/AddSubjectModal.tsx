
import React, { useState, useEffect } from 'react';
import { ComponentType } from '../types';
import { PROF_SUBJECTS } from '../Constants/constants';

interface AddSubjectModalProps {
  onClose: () => void;
  onAdd: (name: string, componentConfigs: {type: ComponentType, requiredPct: number}[]) => void;
  isMYSY?: boolean;
  userYear?: string;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ onClose, onAdd, isMYSY = false, userYear = '1st Prof' }) => {
  const [name, setName] = useState('');
  const [componentConfigs, setComponentConfigs] = useState<{type: ComponentType, requiredPct: number}[]>([
    { type: 'Theory', requiredPct: isMYSY ? 80 : 75 },
    { type: 'Practical', requiredPct: isMYSY ? 85 : 80 }
  ]);

  const presets = PROF_SUBJECTS[userYear] || [];

  const handlePresetClick = (subjectName: string) => {
    setName(subjectName);
    // Auto-configure standard Theory + Practical for common subjects
    setComponentConfigs([
      { type: 'Theory', requiredPct: isMYSY ? 80 : 75 },
      { type: 'Practical', requiredPct: isMYSY ? 85 : 80 }
    ]);
  };

  const toggleType = (type: ComponentType) => {
    const exists = componentConfigs.find(c => c.type === type);
    if (exists) {
      if (componentConfigs.length > 1) {
        setComponentConfigs(componentConfigs.filter(c => c.type !== type));
      }
    } else {
      let defaultPct = 75;
      if (type === 'Theory') defaultPct = isMYSY ? 80 : 75;
      else if (type === 'Practical') defaultPct = isMYSY ? 85 : 80;
      else defaultPct = 75;

      setComponentConfigs([...componentConfigs, { type, requiredPct: defaultPct }]);
    }
  };

  const updatePct = (type: ComponentType, pct: number) => {
    setComponentConfigs(componentConfigs.map(c => 
      c.type === type ? { ...c, requiredPct: Math.min(100, Math.max(0, pct)) } : c
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), componentConfigs);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp border-t-8 border-blue-600">
        <div className="p-8 pb-4 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Manual Registry</h3>
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1">Add Clinical Subject</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-2xl bg-white text-slate-400 flex items-center justify-center active:scale-75 transition-all shadow-sm border border-slate-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Quick Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Common {userYear} Subjects</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePresetClick(p)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${name === p ? 'bg-blue-600 text-white shadow-lg' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Subject Name</label>
            <div className="relative">
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Pharmacology"
                className="w-full bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] p-5 pl-12 text-sm font-bold text-slate-800 outline-none focus:ring-4 ring-blue-500/10 focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                <i className="fas fa-file-medical text-lg"></i>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Components & Criteria</label>
              {isMYSY && (
                <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest border border-amber-200">MYSY Default</span>
              )}
            </div>
            
            <div className="space-y-3">
              {(['Theory', 'Practical', 'Tutorial', 'Seminar/Viva'] as ComponentType[]).map(type => {
                const config = componentConfigs.find(c => c.type === type);
                return (
                  <div 
                    key={type} 
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${config ? 'border-blue-100 bg-blue-50/30' : 'border-slate-50 bg-white opacity-60'}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleType(type)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${config ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-300'}`}>
                        <i className={`fas ${type === 'Theory' ? 'fa-book' : type === 'Practical' ? 'fa-flask' : type === 'Tutorial' ? 'fa-chalkboard-user' : 'fa-comments'} text-xs`}></i>
                      </div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${config ? 'text-slate-800' : 'text-slate-300'}`}>
                        {type === 'Seminar/Viva' ? 'Viva' : type}
                      </span>
                    </button>

                    {config && (
                      <div className="flex items-center gap-2 animate-fadeIn">
                        <div className="flex flex-col items-end">
                          <label className="text-[7px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Min Pct</label>
                          <div className="flex items-center bg-white border border-blue-200 rounded-lg px-2 py-1 shadow-sm">
                            <input 
                              type="number"
                              className="w-7 text-[11px] font-black text-blue-600 outline-none bg-transparent"
                              value={config.requiredPct}
                              onChange={(e) => updatePct(type, parseInt(e.target.value) || 0)}
                            />
                            <span className="text-[10px] font-black text-blue-300">%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs tracking-[0.2em] uppercase shadow-2xl shadow-blue-200 active:scale-95 transition-all border-b-4 border-blue-800 mt-4 flex items-center justify-center gap-2"
          >
            <i className="fas fa-check-double"></i> Register Subject
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSubjectModal;
