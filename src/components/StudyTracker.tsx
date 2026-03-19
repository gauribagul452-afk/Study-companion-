import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, CheckCircle2, Circle, Trophy, Target, CheckSquare, Sparkles } from 'lucide-react';
import { StudyTask } from '../types';

const StudyTracker: React.FC = () => {
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem('aspirant_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing aspirant_tasks in StudyTracker:', e);
      return [];
    }
  });
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDuration, setNewDuration] = useState('60');

  useEffect(() => {
    localStorage.setItem('aspirant_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newSubject || !newTopic) return;
    const task: StudyTask = {
      id: Math.random().toString(36).substr(2, 9),
      subject: newSubject,
      topic: newTopic,
      duration: parseInt(newDuration),
      completed: false,
      date: new Date().toISOString(),
    };
    setTasks([task, ...tasks]);
    setNewSubject('');
    setNewTopic('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    hours: Math.round(tasks.reduce((acc, t) => t.completed ? acc + t.duration : acc, 0) / 60 * 10) / 10,
    avgSession: tasks.length > 0 ? Math.round(tasks.reduce((acc, t) => acc + t.duration, 0) / tasks.length) : 0
  };

  const generateSummary = () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return "No study sessions completed yet. Start tracking to see your summary!";
    
    const subjects = [...new Set(completedTasks.map(t => t.subject))];
    let summary = `Study Report Summary:\n`;
    summary += `----------------------\n`;
    summary += `Total Study Time: ${stats.hours} hours\n`;
    summary += `Sessions Completed: ${stats.completed}\n`;
    summary += `Average Session: ${stats.avgSession} mins\n\n`;
    summary += `Breakdown by Subject:\n`;
    
    subjects.forEach(sub => {
      const subTasks = completedTasks.filter(t => t.subject === sub);
      const subHours = Math.round(subTasks.reduce((acc, t) => acc + t.duration, 0) / 60 * 10) / 10;
      summary += `- ${sub}: ${subHours}h (${subTasks.length} sessions)\n`;
    });
    
    return summary;
  };

  const [showSummary, setShowSummary] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateSummary());
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearAllTasks = () => {
    setTasks([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Clear All Tasks?</h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              Are you sure you want to clear all tasks? This action cannot be undone and will reset your progress.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  console.log("StudyTracker Clear All confirmed");
                  clearAllTasks();
                }}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-brand-200 transition-all cursor-default group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-brand-200 transition-all cursor-default group">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSummary(!showSummary)}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:border-brand-500 transition-all group text-left"
        >
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Study Hours</p>
            <p className="text-2xl font-bold text-gray-900">{stats.hours}h</p>
          </div>
          <div className="text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trophy size={20} />
          </div>
        </button>
      </div>

      {showSummary && (
        <div className="bg-brand-900 text-brand-50 p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles size={20} className="text-brand-400" />
              Your Study Analysis
            </h3>
            <button 
              onClick={() => setShowSummary(false)}
              className="text-brand-300 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="bg-brand-800/50 p-4 rounded-xl border border-brand-700/50 font-mono text-sm whitespace-pre-wrap leading-relaxed">
            {generateSummary()}
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button 
              onClick={copyToClipboard}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                copyFeedback ? 'bg-green-600 text-white' : 'bg-brand-700 hover:bg-brand-600 text-brand-50'
              }`}
            >
              {copyFeedback ? (
                <><CheckCircle2 size={14} /> Copied!</>
              ) : (
                <><Sparkles size={14} /> Copy Text Summary</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Study Session</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Subject (e.g. Physics)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <input
            type="text"
            placeholder="Topic (e.g. Thermodynamics)"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
          <select
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="30">30 mins</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
          </select>
          <button
            onClick={addTask}
            className="bg-brand-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Recent Tasks</h3>
          {tasks.length > 0 && (
            <button 
              onClick={() => {
                console.log("Clear All clicked");
                setShowClearConfirm(true);
              }}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors px-3 py-1 bg-red-50 rounded-lg border border-red-100"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CheckSquare className="mx-auto mb-3 opacity-20" size={48} />
              <p>No tasks yet. Start your study session!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={task.completed ? "text-brand-600" : "text-gray-300 hover:text-brand-400"}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div>
                    <h4 className={`font-medium text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.subject}: {task.topic}
                    </h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {task.duration} mins • {new Date(task.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTracker;
