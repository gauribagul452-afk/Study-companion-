import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudyTask } from '../types';

interface NotificationSystemProps {
  onNavigate: (tab: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ onNavigate }) => {
  const [pendingTasks, setPendingTasks] = useState<StudyTask[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    const checkTasks = () => {
      try {
        const savedTasks = localStorage.getItem('aspirant_tasks');
        if (savedTasks) {
          const tasks: StudyTask[] = JSON.parse(savedTasks);
          const incomplete = tasks.filter(t => !t.completed);
          setPendingTasks(incomplete);

          // If there are incomplete tasks and we haven't shown a toast in this session
          if (incomplete.length > 0 && !sessionStorage.getItem('reminder_shown')) {
            setShowToast(true);
            sessionStorage.setItem('reminder_shown', 'true');
            
            // Browser notification if permitted
            if (Notification.permission === 'granted') {
              new Notification('Study Reminder', {
                body: `You have ${incomplete.length} pending tasks to complete!`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      } catch (e) {
        console.error('NotificationSystem: Error parsing tasks', e);
      }
    };

    // Check on mount and then every 5 minutes
    checkTasks();
    const interval = setInterval(checkTasks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setPermission('denied');
      return;
    }
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (error) {
      console.error("Notification permission error:", error);
      setPermission('denied');
    }
  };

  if (!showToast && pendingTasks.length === 0) return null;

  return (
    <>
      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[60] animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-white rounded-2xl shadow-2xl border border-brand-100 p-5 max-w-sm w-full flex gap-4 items-start relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-brand-600" />
            <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0">
              <BellRing size={20} className="animate-bounce" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 text-sm">Study Reminder!</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                You have <span className="font-bold text-brand-600">{pendingTasks.length} pending tasks</span>. Don't break your streak!
              </p>
              <div className="mt-3 flex gap-2">
                <button 
                  onClick={() => {
                    onNavigate('tracker');
                    setShowToast(false);
                  }}
                  className="text-[10px] font-bold bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
                >
                  View Tasks
                </button>
                <button 
                  onClick={() => setShowToast(false)}
                  className="text-[10px] font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5"
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Permission Request Banner (if not granted) */}
      {permission === 'default' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4 animate-in slide-in-from-top-10">
          <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-500/20 text-brand-400 rounded-lg flex items-center justify-center">
                <Bell size={18} />
              </div>
              <p className="text-xs font-medium">Enable browser notifications for study reminders?</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  console.log("NotificationSystem Enable clicked");
                  requestPermission();
                }}
                className="text-[10px] font-bold bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-400 transition-colors flex items-center justify-center min-w-[60px]"
              >
                Enable
              </button>
              <button 
                onClick={() => setPermission('denied')}
                className="text-[10px] font-bold text-gray-400 hover:text-white"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationSystem;
