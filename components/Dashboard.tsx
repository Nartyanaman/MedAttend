
import React from 'react';
import { Subject, RiskLevel, UserSettings } from '../types';
import { calculateSafeBunks } from '../utils/calculations';

interface DashboardProps {
  subjects: Subject[];
  settings: UserSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ subjects, settings }) => {
  const allComponents = subjects.flatMap(s => s.components.map(c => ({ ...c, subjectName: s.name })));
  
  const theoryComponents = allComponents.filter(c => c.type === 'Theory');
  const practicalComponents = allComponents.filter(c => c.type === 'Practical');

  const theoryTarget = settings.isMYSY ? 80 : 75;
  const practicalTarget = settings.isMYSY ? 85 : 80;

  const calculateAggregate = (comps: any[]) => {
    const total = comps.reduce((acc, c) => acc + c.total, 0);
    const attended = comps.reduce((acc, c) => acc + c.attended, 0);
    return total > 0 ? (attended / total) * 100 : 0;
  };

  const theoryPct = calculateAggregate(theoryComponents);
  const practicalPct = calculateAggregate(practicalComponents);
  
  const totalLectures = allComponents.reduce((acc, c) => acc + c.total, 0);
  const totalAttended = allComponents.reduce((acc, c) => acc + c.attended, 0);
  const overallPct = totalLectures > 0 ? (totalAttended / totalLectures) * 100 : 0;

  const totalSafeBunks = allComponents.reduce((acc, c) => {
    const { safeBunks } = calculateSafeBunks(c.attended, c.total, c.requiredPct);
    return acc + (safeBunks > 0 ? safeBunks : 0);
  }, 0);

  const totalDeficit = allComponents.reduce((acc, c) => {
    const { safeBunks } = calculateSafeBunks(c.attended, c.total, c.requiredPct);
    return acc + (safeBunks < 0 ? -safeBunks : 0);
  }, 0);

  const dangerComponents = allComponents.filter(c => {
    const { risk } = calculateSafeBunks(c.attended, c.total, c.requiredPct);
    return risk === RiskLevel.DANGER;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Dynamic Header */}
      <div className="px-2 pt-2 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Active Rounds • {settings.year}</p>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
            Dr. {settings.name?.split(' ')[0] || 'Medico'}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
          <p className="text-xs font-bold text-slate-600">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
        </div>
      </div>

      {/* Aggregate Vitals Card */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle ECG Line Background SVG */}
          <svg className="absolute bottom-0 left-0 w-full h-24 opacity-10 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,50 L50,50 L60,20 L75,80 L85,50 L150,50 L160,10 L180,90 L200,50 L300,50 L310,30 L325,70 L335,50 L400,50" fill="none" stroke="currentColor" strokeWidth="2" className="animate-pulse" />
          </svg>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-1">
                <p className="text-blue-100/50 text-[10px] uppercase tracking-[0.4em] font-black">Attendance Vitals</p>
                <h2 className="text-7xl font-black tracking-tighter leading-none">
                  {overallPct.toFixed(1)}<span className="text-2xl text-blue-300 ml-1 font-black opacity-60">%</span>
                </h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                {settings.isMYSY && (
                  <div className="bg-amber-400 text-amber-950 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 border border-amber-300">
                    <i className="fas fa-crown text-[10px]"></i>
                    <span className="text-[9px] font-black uppercase tracking-widest">MYSY</span>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-100">Safe to skip: {totalSafeBunks}</p>
                </div>
                {totalDeficit > 0 && (
                  <div className="bg-rose-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-300/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white">Deficit: {totalDeficit}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/10">
              <StatIndicator label={`Theory`} value={theoryPct} target={theoryTarget} />
              <StatIndicator label={`Practical`} value={practicalPct} target={practicalTarget} />
            </div>
          </div>
        </div>
      </div>

      {/* STAT Alerts Section */}
      {dangerComponents.length > 0 && (
        <div className="px-1 animate-slideUp">
          <div className="bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-rose-900">
              <i className="fas fa-triangle-exclamation text-8xl"></i>
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center text-[10px] shadow-lg shadow-rose-200">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3 className="text-rose-900 font-black text-[11px] uppercase tracking-[0.2em]">STAT: Deficit Detected</h3>
              </div>
              <span className="text-[8px] font-black bg-rose-200 text-rose-800 px-2 py-1 rounded-full uppercase tracking-widest">Priority 1</span>
            </div>
            <div className="space-y-2 relative z-10">
              {dangerComponents.map(c => {
                const { needed } = calculateSafeBunks(c.attended, c.total, c.requiredPct);
                return (
                  <div key={c.id} className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-rose-100 shadow-sm hover:translate-x-1 transition-transform">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-800">{c.subjectName}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.type}</span>
                    </div>
                    <div className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-100">
                      Attend {needed}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Clinical Registry / Proficiency */}
      <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Clinical Proficiency</h3>
          <i className="fas fa-stethoscope text-slate-100 text-xl"></i>
        </div>
        
        {subjects.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200">
               <i className="fas fa-folder-plus text-2xl"></i>
            </div>
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Registry Empty • Add Subjects</p>
          </div>
        ) : (
          <div className="space-y-8">
            {subjects.map(s => {
              const totalHeld = s.components.reduce((acc, c) => acc + c.total, 0);
              const totalAtt = s.components.reduce((acc, c) => acc + c.attended, 0);
              const pct = totalHeld > 0 ? (totalAtt / totalHeld) * 100 : 0;
              
              // Determine overall color based on worst performing component
              const componentResults = s.components.map(c => calculateSafeBunks(c.attended, c.total, c.requiredPct));
              const isDanger = componentResults.some(c => c.risk === RiskLevel.DANGER);
              const isSafe = componentResults.every(c => c.risk === RiskLevel.SAFE);
              const subjectBunkRemain = componentResults.reduce((sum, c) => sum + c.safeBunks, 0);

              return (
                <div key={s.id} className="space-y-3 group cursor-default">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{s.name}</h4>
                      <div className="flex gap-2 mt-1">
                         {s.components.map(c => (
                            <span key={c.id} className="text-[8px] font-black text-slate-400 uppercase border border-slate-100 px-1.5 rounded-md">{c.type[0]}</span>
                         ))}
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-xl font-black leading-none tracking-tighter ${isSafe ? 'text-emerald-500' : isDanger ? 'text-rose-500' : 'text-amber-500'}`}>
                        {pct.toFixed(0)}%
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${subjectBunkRemain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {subjectBunkRemain >= 0 ? `Bunks: +${subjectBunkRemain}` : `Deficit: ${-subjectBunkRemain}`}
                      </p>
                    </div>
                  </div>
                  <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    {/* Target Indicator Line */}
                    <div className="absolute top-0 left-[75%] w-[1px] h-full bg-slate-300 z-10"></div>
                    
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${isSafe ? 'bg-emerald-500' : isDanger ? 'bg-rose-500' : 'bg-amber-400'}`} 
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access Stats */}
      <div className="grid grid-cols-2 gap-4 px-1">
        <SmallStat icon="fa-clipboard-list" label="Total Held" value={totalLectures} color="text-slate-500" bg="bg-white" />
        <SmallStat icon="fa-user-check" label="Total Attended" value={totalAttended} color="text-blue-600" bg="bg-blue-50/40" />
      </div>
    </div>
  );
};

const StatIndicator = ({ label, value, target }: { label: string, value: number, target: number }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-baseline">
      <span className="text-[9px] font-black text-blue-100/60 uppercase tracking-[0.2em]">{label}</span>
      <span className={`text-xs font-black ${value >= target ? 'text-emerald-400' : 'text-amber-300'}`}>{value.toFixed(0)}%</span>
    </div>
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5 relative shadow-inner">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${value >= target ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]'}`} 
        style={{ width: `${Math.min(100, (value/target)*100)}%` }}
      />
    </div>
    <p className="text-[8px] font-black text-blue-200/40 uppercase tracking-widest text-center">Goal: {target}%</p>
  </div>
);

const SmallStat = ({ icon, label, value, color, bg }: any) => (
  <div className={`${bg} p-6 rounded-[2.5rem] shadow-lg border border-slate-100 flex flex-col items-center text-center transition-all hover:shadow-xl active:scale-95 group`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:-translate-y-1 ${color.includes('blue') ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-300 border border-slate-100 shadow-inner'}`}>
      <i className={`fas ${icon} text-lg`}></i>
    </div>
    <span className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">{label}</span>
    <span className={`text-3xl font-black tracking-tighter ${color.includes('blue') ? 'text-slate-800' : 'text-slate-700'}`}>{value}</span>
  </div>
);

export default Dashboard;
