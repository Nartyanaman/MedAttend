
import React, { useState } from 'react';
import { AttendanceEntry, Subject, SubjectComponent } from '../types';

interface CalendarViewProps {
  history: AttendanceEntry[];
  subjects: Subject[];
  onLogAttendance: (subjectId: string, componentId: string, attended: number, total: number, status?: 'present' | 'absent', date?: string) => void;
  onDeleteLog: (entryId: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ history, subjects, onLogAttendance, onDeleteLog }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const entriesForDate = (dateStr: string) => history.filter(e => e.date === dateStr);

  const renderDays = () => {
    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(<div key={`empty-${i}`} className="h-12 w-full"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = entriesForDate(dateStr);
      const isSelected = selectedDate === dateStr;
      
      const total = dayEntries.length;
      const presentCount = dayEntries.filter(e => e.status === 'present').length;
      const absentCount = dayEntries.filter(e => e.status === 'absent').length;

      let bgColor = 'bg-slate-50'; 
      let textColor = 'text-slate-400';

      if (total > 0) {
        if (presentCount === total) {
          bgColor = 'bg-emerald-500';
          textColor = 'text-white';
        } else if (absentCount === total) {
          bgColor = 'bg-rose-500';
          textColor = 'text-white';
        } else {
          bgColor = 'bg-violet-600';
          textColor = 'text-white';
        }
      }

      cells.push(
        <button
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-11 w-full rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${bgColor} ${textColor} ${
            isSelected 
            ? 'ring-4 ring-blue-500/20 scale-105 z-10 shadow-lg border-2 border-blue-500' 
            : 'hover:bg-slate-100'
          }`}
        >
          <span className={`text-[12px] font-black`}>{day}</span>
          {isSelected && <div className="absolute -bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
        </button>
      );
    }

    return cells;
  };

  const selectedEntries = entriesForDate(selectedDate);

  const handleToggleAttendance = (subject: Subject, component: SubjectComponent) => {
    const existing = selectedEntries.find(e => e.subjectId === subject.id && e.componentId === component.id);
    
    if (!existing) {
      onLogAttendance(subject.id, component.id, component.attended + 1, component.total + 1, 'present', selectedDate);
    } else if (existing.status === 'present') {
      onDeleteLog(existing.id);
      onLogAttendance(subject.id, component.id, component.attended - 1, component.total, 'absent', selectedDate);
    } else {
      onDeleteLog(existing.id);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="px-2 pt-2">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1">Clinic Journal</p>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Attendance Log</h2>
      </div>

      <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-8 px-2">
          <button onClick={prevMonth} className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center active:scale-90 border border-slate-100"><i className="fas fa-chevron-left"></i></button>
          <h3 className="font-black text-slate-800 uppercase tracking-[0.25em] text-[10px]">{monthNames[month]} {year}</h3>
          <button onClick={nextMonth} className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center active:scale-90 border border-slate-100"><i className="fas fa-chevron-right"></i></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (<div key={`day-${idx}`} className="text-center text-[9px] font-black text-slate-300 py-1 uppercase tracking-widest">{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
        
        <div className="mt-10 flex flex-wrap justify-center gap-6 border-t border-slate-50 pt-8">
          <LegendItem color="bg-emerald-500" label="Full" />
          <LegendItem color="bg-rose-500" label="Missed" />
          <LegendItem color="bg-violet-600" label="Mixed" />
          <LegendItem color="bg-slate-100" label="Off" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">Registry: {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</h4>
        </div>
        
        <div className="space-y-4">
          {subjects.map(s => (
            <div key={s.id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-lg space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                  <i className="fas fa-flask"></i>
                </div>
                <h5 className="text-[12px] font-black text-slate-800 uppercase tracking-widest truncate">{s.name}</h5>
              </div>
              
              <div className="flex gap-4">
                {s.components.map(c => {
                  const log = selectedEntries.find(e => e.subjectId === s.id && e.componentId === c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleToggleAttendance(s, c)}
                      className={`flex-1 flex flex-col items-center justify-center py-5 rounded-2xl border-2 transition-all active:scale-95 ${
                        log?.status === 'present' ? 'bg-emerald-500 border-emerald-600 text-white shadow-xl shadow-emerald-100' :
                        log?.status === 'absent' ? 'bg-rose-500 border-rose-600 text-white shadow-xl shadow-rose-100' :
                        'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">{c.type === 'Seminar/Viva' ? 'Viva' : c.type}</span>
                      {log && <span className="text-[8px] font-black uppercase tracking-tighter opacity-80">{log.status}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {subjects.length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center">
               <i className="fas fa-box-open text-slate-200 text-3xl mb-4 block"></i>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Please add your subject list<br/>in the Setup tab</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default CalendarView;
