import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, MessageSquare, LogOut, GraduationCap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ExamType } from '../types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentExam: ExamType;
  onExamChange: (exam: ExamType) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, currentExam, onExamChange, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'tracker', label: 'Study Tracker', icon: CheckSquare },
    { id: 'ai', label: 'AI Doubt Solver', icon: MessageSquare },
  ];

  const exams: { id: ExamType; label: string }[] = [
    { id: 'JEE', label: 'JEE (Engineering)' },
    { id: 'NEET', label: 'NEET (Medical)' },
    { id: 'UPSC', label: 'UPSC (Civil Services)' },
    { id: 'NDA', label: 'NDA (Defense)' },
    { id: 'CBSE', label: 'CBSE Board' },
    { id: 'ICSE', label: 'ICSE Board' },
    { id: 'STATE_BOARD', label: 'State Board' },
    { id: 'OTHER', label: 'Other Exams' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col h-screen transition-transform duration-300 lg:sticky lg:top-0 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-brand-600 tracking-tight">AspirantFlow</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">by Gargi Bagul</p>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-0.5">Study Companion</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500">
            <LogOut size={20} className="rotate-180" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); onClose(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-brand-50 text-brand-700 shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>

          <div>
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Switch Section</p>
            <div className="space-y-1">
              {exams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => { onExamChange(exam.id); onClose(); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                    currentExam === exam.id 
                      ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <GraduationCap size={16} />
                  {exam.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
