import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { TimetableEntry } from '../types';

const Timetable: React.FC = () => {
  const [entries, setEntries] = useState<TimetableEntry[]>(() => {
    try {
      const saved = localStorage.getItem('aspirant_timetable');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing aspirant_timetable:', e);
      return [];
    }
  });
  const [isAdding, setIsAdding] = useState(false);
  const [clearTarget, setClearTarget] = useState<'all' | string | null>(null);
  const [newEntry, setNewEntry] = useState<Partial<TimetableEntry>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subject: '',
    activity: ''
  });

  useEffect(() => {
    localStorage.setItem('aspirant_timetable', JSON.stringify(entries));
  }, [entries]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const addEntry = () => {
    if (!newEntry.subject || !newEntry.activity) return;
    const entry: TimetableEntry = {
      id: Math.random().toString(36).substr(2, 9),
      day: newEntry.day!,
      startTime: newEntry.startTime!,
      endTime: newEntry.endTime!,
      subject: newEntry.subject!,
      activity: newEntry.activity!
    };
    setEntries([...entries, entry]);
    setIsAdding(false);
    setNewEntry({ ...newEntry, subject: '', activity: '' });
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const clearDay = (day: string) => {
    setClearTarget(day);
  };

  const confirmClear = () => {
    if (clearTarget === 'all') {
      setEntries([]);
    } else if (clearTarget) {
      setEntries(entries.filter(e => e.day !== clearTarget));
    }
    setClearTarget(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Clear Confirmation Modal */}
      {clearTarget && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {clearTarget === 'all' ? 'Clear Entire Timetable?' : `Clear ${clearTarget}?`}
            </h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              {clearTarget === 'all' 
                ? 'Are you sure you want to clear your entire weekly schedule?' 
                : `Are you sure you want to clear all entries for ${clearTarget}?`} This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setClearTarget(null)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmClear}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Weekly Timetable</h2>
        <div className="flex gap-3">
          {entries.length > 0 && (
            <button 
              onClick={() => setClearTarget('all')}
              className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors px-4 py-2 bg-red-50 rounded-xl border border-red-100"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Add Schedule
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-brand-100 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-semibold text-gray-800 mb-4">New Schedule Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Day</label>
              <select 
                value={newEntry.day}
                onChange={(e) => setNewEntry({...newEntry, day: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20"
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Start Time</label>
              <input 
                type="time"
                value={newEntry.startTime}
                onChange={(e) => setNewEntry({...newEntry, startTime: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">End Time</label>
              <input 
                type="time"
                value={newEntry.endTime}
                onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Subject</label>
              <input 
                type="text"
                placeholder="e.g. Mathematics"
                value={newEntry.subject}
                onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Activity</label>
              <input 
                type="text"
                placeholder="e.g. Solving PYQs"
                value={newEntry.activity}
                onChange={(e) => setNewEntry({...newEntry, activity: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button 
              onClick={addEntry}
              className="bg-brand-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-brand-700 transition-all"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayEntries = entries
            .filter(e => e.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[300px] group/day hover:border-brand-200 transition-all">
              <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex flex-col items-center gap-1 relative">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</span>
                {dayEntries.length > 0 && (
                  <button 
                    onClick={() => setClearTarget(day)}
                    className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-tighter transition-all"
                  >
                    Clear Day
                  </button>
                )}
              </div>
              <div className="flex-1 p-2 space-y-2">
                {dayEntries.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[10px] text-gray-300 italic">
                    Free
                  </div>
                ) : (
                  dayEntries.map((entry) => (
                    <div key={entry.id} className="p-2 bg-brand-50/50 border border-brand-100 rounded-lg group relative">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-brand-700">{entry.startTime}</span>
                        <button 
                          onClick={() => deleteEntry(entry.id)}
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                      <h4 className="text-[11px] font-bold text-gray-800 leading-tight">{entry.subject}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{entry.activity}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timetable;
