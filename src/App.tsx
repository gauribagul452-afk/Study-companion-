/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Timetable from './components/Timetable';
import StudyTracker from './components/StudyTracker';
import AIDoubtSolver from './components/AIDoubtSolver';
import NotificationSystem from './components/NotificationSystem';
import { UserProfile, ExamType } from './types';
import { User, Target, Calendar, Sparkles, LogOut, Menu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      // Check if localStorage is available and accessible
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem('aspirant_profile');
        if (saved) {
          return JSON.parse(saved);
        }
      }
    } catch (e) {
      console.error('App: Error accessing profile', e);
    }
    return null;
  });

  const [setupData, setSetupData] = useState({
    name: '',
    exam: 'JEE' as ExamType,
    targetDate: ''
  });

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData.name || !setupData.targetDate) return;
    const profile: UserProfile = { ...setupData };
    setUserProfile(profile);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('aspirant_profile', JSON.stringify(profile));
      }
    } catch (e) {
      console.error('App: Error saving profile', e);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('aspirant_profile');
      }
    } catch (e) {
      console.error('App: Error removing profile', e);
    }
    setUserProfile(null);
    setActiveTab('dashboard');
    setShowLogoutConfirm(false);
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-brand-600 p-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Sparkles size={32} />
            </div>
            <h1 className="text-2xl font-bold">Welcome to AspirantFlow</h1>
            <p className="text-[10px] text-brand-200 font-bold uppercase tracking-widest mt-0.5">by Gargi Bagul</p>
            <p className="text-brand-100 text-sm mt-2">Let's set up your study companion</p>
          </div>
          
          <form onSubmit={handleSetup} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={setupData.name}
                  onChange={(e) => setSetupData({...setupData, name: e.target.value})}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Exam</label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={setupData.exam}
                  onChange={(e) => setSetupData({...setupData, exam: e.target.value as ExamType})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
                >
                  <option value="JEE">JEE (Engineering)</option>
                  <option value="NEET">NEET (Medical)</option>
                  <option value="UPSC">UPSC (Civil Services)</option>
                  <option value="NDA">NDA (Defense)</option>
                  <option value="CBSE">CBSE Board</option>
                  <option value="ICSE">ICSE Board</option>
                  <option value="STATE_BOARD">State Board</option>
                  <option value="OTHER">Other Exams</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Exam Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  required
                  value={setupData.targetDate}
                  onChange={(e) => setSetupData({...setupData, targetDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all transform hover:-translate-y-0.5"
            >
              Start My Journey
            </button>
            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Reset All App Data
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            exam={userProfile.exam} 
            name={userProfile.name} 
            targetDate={userProfile.targetDate}
            onNavigate={setActiveTab} 
            onProfileUpdate={(updated) => {
              const newProfile = { ...userProfile, ...updated };
              setUserProfile(newProfile);
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  localStorage.setItem('aspirant_profile', JSON.stringify(newProfile));
                }
              } catch (e) {
                console.error('App: Error saving profile', e);
              }
            }}
          />
        );
      case 'timetable':
        return <Timetable />;
      case 'tracker':
        return <StudyTracker />;
      case 'ai':
        return <AIDoubtSolver />;
      default:
        return (
          <Dashboard 
            exam={userProfile.exam} 
            name={userProfile.name} 
            targetDate={userProfile.targetDate}
            onNavigate={setActiveTab} 
            onProfileUpdate={(updated) => {
              const newProfile = { ...userProfile, ...updated };
              setUserProfile(newProfile);
              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  localStorage.setItem('aspirant_profile', JSON.stringify(newProfile));
                }
              } catch (e) {
                console.error('App: Error saving profile', e);
              }
            }}
          />
        );
    }
  };

  const handleExamChange = (exam: ExamType) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, exam };
      setUserProfile(updatedProfile);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('aspirant_profile', JSON.stringify(updatedProfile));
        }
      } catch (e) {
        console.error('App: Error saving profile', e);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setShowLogoutConfirm(true)} 
        currentExam={userProfile.exam}
        onExamChange={handleExamChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden p-4 bg-white border-b border-gray-200 flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-500">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-brand-600">AspirantFlow</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative">
          {renderContent()}
        </main>
      </div>
      <NotificationSystem onNavigate={setActiveTab} />

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LogOut size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Logout?</h3>
            <p className="text-gray-500 text-center text-sm mb-8">
              Are you sure you want to logout? This will reset your profile so you can choose a different exam section.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

