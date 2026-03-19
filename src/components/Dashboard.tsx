import React, { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Clock, Calendar, Award, ChevronRight, Bell, BellOff, Settings, BellRing, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ExamType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
  exam: ExamType;
  name: string;
  targetDate: string;
  onNavigate: (tab: string) => void;
  onProfileUpdate: (profile: Partial<{ name: string; exam: ExamType; targetDate: string }>) => void;
}

const Sparkles = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const Dashboard: React.FC<DashboardProps> = ({ exam, name, targetDate, onNavigate, onProfileUpdate }) => {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDate, setNewDate] = useState(targetDate);

  const daysRemaining = (() => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  })();

  const handleDateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileUpdate({ targetDate: newDate });
    setIsEditingDate(false);
    showToast("Exam date updated!", 'success');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      showToast("Browser notifications not supported. Try opening in a new tab.");
      return;
    }
    
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'denied') {
        showToast("Notifications denied. Check browser settings.");
      } else if (result === 'granted') {
        showToast("Notifications enabled!", 'success');
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      showToast("Blocked by browser. Try opening in a new tab.");
    }
  };

  const [subjects, setSubjects] = useState<{ name: string; progress: number; color: string }[]>([]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTasks = localStorage.getItem('aspirant_tasks');
        if (savedTasks) {
          const tasks: any[] = JSON.parse(savedTasks);
          const subjectMap: Record<string, { total: number; completed: number }> = {};
          
          tasks.forEach(task => {
            if (!subjectMap[task.subject]) {
              subjectMap[task.subject] = { total: 0, completed: 0 };
            }
            subjectMap[task.subject].total += 1;
            if (task.completed) {
              subjectMap[task.subject].completed += 1;
            }
          });

          const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500'];
          const calculatedSubjects = Object.entries(subjectMap).map(([name, stats], index) => ({
            name,
            progress: Math.round((stats.completed / stats.total) * 100),
            color: colors[index % colors.length]
          }));

          setSubjects(calculatedSubjects);
        }
      }
    } catch (e) {
      console.error('Error parsing aspirant_tasks in Dashboard useEffect:', e);
    }
  }, []);

  const totalStudiedHours = (() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTasks = localStorage.getItem('aspirant_tasks');
        if (!savedTasks) return 0;
        const tasks: any[] = JSON.parse(savedTasks);
        const totalMins = tasks.reduce((acc, t) => t.completed ? acc + t.duration : acc, 0);
        return Math.round((totalMins / 60) * 10) / 10;
      }
    } catch (e) {
      console.error('Error parsing totalStudiedHours:', e);
      return 0;
    }
    return 0;
  })();

  const currentStreak = (() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedTasks = localStorage.getItem('aspirant_tasks');
        if (!savedTasks) return 0;
        const tasks: any[] = JSON.parse(savedTasks);
        const completedDates = [...new Set(tasks
          .filter(t => t.completed)
          .map(t => new Date(t.date).toDateString())
        )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (completedDates.length === 0) return 0;

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if last completed was today or yesterday
        const lastDate = new Date(completedDates[0]);
        lastDate.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) return 0;

        for (let i = 0; i < completedDates.length; i++) {
          const d = new Date(completedDates[i]);
          d.setHours(0, 0, 0, 0);
          
          const expectedDate = new Date(currentDate);
          expectedDate.setDate(currentDate.getDate() - i);
          expectedDate.setHours(0, 0, 0, 0);

          if (d.getTime() === expectedDate.getTime()) {
            streak++;
          } else {
            break;
          }
        }
        return streak;
      }
    } catch (e) {
      console.error('Error parsing currentStreak:', e);
      return 0;
    }
    return 0;
  })();

  const dailyTip = (() => {
    const tips = [
      "The Pomodoro Technique can help you maintain focus for longer periods. Try 50 minutes of deep work followed by a 10-minute break.",
      "Active recall is one of the most effective study methods. Try to explain a concept out loud without looking at your notes.",
      "Spaced repetition helps move information from short-term to long-term memory. Review your notes at increasing intervals.",
      "A clean workspace leads to a clear mind. Spend 5 minutes decluttering your study area before you start.",
      "Stay hydrated! Your brain needs water to function at its peak. Keep a water bottle nearby while studying.",
      "Sleep is when your brain consolidates what you've learned. Aim for 7-8 hours of quality sleep every night.",
      "Try the Feynman Technique: Explain a topic to a 'child' (or yourself) in simple terms to identify gaps in your understanding.",
      "Interleaving involves mixing different subjects or topics in one study session. It improves long-term retention.",
      "Take short walks during your breaks. Physical movement increases blood flow to the brain and boosts creativity.",
      "Mind mapping can help you visualize connections between complex topics and make them easier to remember.",
      "Set specific, measurable goals for each study session. Instead of 'study physics', try 'solve 10 mechanics problems'.",
      "Avoid multitasking. Focus on one task at a time to achieve deep work and better results.",
      "Use mnemonics or acronyms to remember lists or complex sequences of information.",
      "Teach what you learn. Explaining a concept to a friend or even an imaginary audience solidifies your knowledge.",
      "Listen to lo-fi or classical music if you find silence distracting, but avoid music with lyrics while reading."
    ];
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return tips[dayOfYear % tips.length];
  })();

  return (
    <div className="space-y-8 relative">
      {/* Custom Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-300">
          <div className={cn(
            "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border",
            toast.type === 'success' ? "bg-green-600 text-white border-green-500" : "bg-red-600 text-white border-red-500"
          )}>
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Edit Date Modal */}
      {isEditingDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Update Exam Date</h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              When is your target exam? We'll update your countdown.
            </p>
            <form onSubmit={handleDateUpdate} className="space-y-6">
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditingDate(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, {name}!</h2>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Award size={16} className="text-brand-600" />
            Preparing for <span className="font-semibold text-brand-700">{exam}</span> • 
            <button 
              onClick={() => setIsEditingDate(true)}
              className="hover:text-brand-600 transition-colors flex items-center gap-1 group"
            >
              <span className="font-semibold text-brand-700">{daysRemaining} days</span> left to target
              <Settings size={12} className="opacity-0 group-hover:opacity-100" />
            </button>
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={handleRefresh}
            className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-brand-600 hover:border-brand-200 rounded-xl shadow-sm transition-all group"
            title="Refresh Stats"
          >
            <RotateCcw size={20} className={isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          </button>
          <button 
            onClick={() => onNavigate('tracker')}
            className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-all group"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600">Live Study Session</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="lg:col-span-2 space-y-6">
          <div 
            onClick={() => onNavigate('tracker')}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-brand-200 hover:shadow-md active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-600" />
                Subject Progress
              </h3>
              <span className="text-xs text-brand-600 font-semibold group-hover:underline flex items-center gap-1">
                View Details <ChevronRight size={12} />
              </span>
            </div>
            <div className="space-y-5">
              {subjects.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-400">No subjects tracked yet. Add tasks in the Study Tracker to see progress!</p>
                </div>
              ) : (
                subjects.map((sub) => (
                  <div key={sub.name} className="group/sub">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700 group-hover/sub:text-brand-600 transition-colors">{sub.name}</span>
                      <span className="text-gray-500">{sub.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${sub.color} rounded-full transition-all duration-1000 group-hover/sub:brightness-110`} 
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => onNavigate('tracker')}
              className="bg-brand-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group text-left transition-all hover:scale-[1.02] hover:shadow-brand-500/30"
            >
              <div className="relative z-10">
                <h4 className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-1">Current Streak</h4>
                <p className="text-4xl font-bold">{currentStreak} Days</p>
                <p className="text-brand-100 text-xs mt-4 flex items-center gap-1">
                  {currentStreak > 0 ? "Keep it up! You're doing great" : "Start your streak today!"} <ChevronRight size={12} />
                </p>
              </div>
              <Sparkles className="absolute -right-4 -bottom-4 text-brand-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" size={120} />
            </button>
            <button 
              onClick={() => onNavigate('tracker')}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left transition-all hover:border-brand-200 hover:scale-[1.02] hover:shadow-md"
            >
              <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Time Studied Total</h4>
              <p className="text-4xl font-bold text-gray-900">{totalStudiedHours}h</p>
              <div className="mt-4 flex items-center gap-2 text-green-600 text-xs font-bold">
                <TrendingUp size={14} />
                <span>Productive sessions</span>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <BellRing size={20} className="text-brand-600" />
                Notification Center
              </h3>
              <Settings size={16} className="text-gray-400 cursor-pointer hover:text-brand-600 transition-colors" />
            </div>
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl border flex items-center justify-between gap-4 transition-all",
                notifPermission === 'granted' ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                    notifPermission === 'granted' ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                  )}>
                    {notifPermission === 'granted' ? <Bell size={18} /> : <BellOff size={18} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {notifPermission === 'granted' ? "Notifications Active" : "Notifications Paused"}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {notifPermission === 'granted' ? "You'll receive study reminders" : "Enable to get study alerts"}
                    </p>
                  </div>
                </div>
                {notifPermission !== 'granted' && (
                  <button 
                    onClick={() => {
                      console.log("Enable button clicked");
                      requestPermission();
                    }}
                    className="bg-brand-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center min-w-[60px]"
                  >
                    Enable
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                * We'll remind you about pending tasks every 5 minutes if you're active.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-2xl shadow-sm text-white hover:shadow-xl transition-all group">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-brand-400 group-hover:rotate-12 transition-transform" />
              Daily Tip
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed italic">
              "{dailyTip}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
