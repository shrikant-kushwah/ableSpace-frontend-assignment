'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Folder, 
  LayoutGrid, 
  LogOut, 
  Moon, 
  Sun,
  User as UserIcon
} from 'lucide-react';

interface SidebarProps {
  activeTab?: 'tasks' | 'profile';
  setActiveTab?: (tab: 'tasks' | 'profile') => void;
}

export default function Sidebar({ activeTab = 'tasks', setActiveTab }: SidebarProps) {
  const { 
    user, 
    logout, 
    theme, 
    setTheme, 
    accentColor, 
    setAccentColor,
    reseedDatabase
  } = useApp();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  React.useEffect(() => {
    if (!showLogoutConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLogoutConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm]);

  const colors: { name: 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black'; hex: string }[] = [
    { name: 'amber', hex: 'bg-amber-500' },
    { name: 'blue', hex: 'bg-blue-500' },
    { name: 'pink', hex: 'bg-pink-500' },
    { name: 'rose', hex: 'bg-rose-500' },
    { name: 'emerald', hex: 'bg-emerald-500' },
    { name: 'black', hex: 'bg-slate-900 dark:bg-slate-100' },
  ];

  return (
    <div className="w-64 bg-sidebar-bg border-r border-sidebar-border h-screen flex flex-col justify-between p-4 select-none shrink-0 transition-colors duration-200">
      
      {/* Top Workspace Section */}
      <div className="space-y-6">
        
        {/* Workspace Dropdown Mock */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-app-bg border border-border-color hover:bg-border-color/20 cursor-pointer transition-all duration-150">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm shadow-sm transition-colors duration-200">
              D
            </div>
            <div className="text-left">
              <div className="text-xs text-text-secondary font-medium uppercase tracking-wider">Workspace</div>
              <div className="text-sm font-semibold text-text-primary leading-tight">Dexter</div>
            </div>
          </div>
          <div className="flex flex-col text-text-secondary">
            <ChevronUp size={12} className="-mb-0.5" />
            <ChevronDown size={12} className="-mt-0.5" />
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-1.5">
          <div className="px-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">Workspace</div>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('tasks')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${
              activeTab === 'tasks'
                ? 'bg-accent-light text-accent font-semibold text-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-border-color/20 text-sm font-medium'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Tasks</span>
          </button>
          
          <button 
            onClick={() => setActiveTab && setActiveTab('projects')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${
              activeTab === 'projects'
                ? 'bg-accent-light text-accent font-semibold text-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-border-color/20 text-sm font-medium'
            }`}
          >
            <Folder size={18} />
            <span>Projects</span>
          </button>

          <button 
            onClick={() => setActiveTab && setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${
              activeTab === 'profile'
                ? 'bg-accent-light text-accent font-semibold text-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-border-color/20 text-sm font-medium'
            }`}
          >
            <UserIcon size={18} />
            <span>Profile</span>
          </button>
        </div>
      </div>

      {/* Middle & Bottom Configuration Sections */}
      <div className="space-y-6 border-t border-border-color pt-4">
        
        {/* Theme Settings */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary px-1">Theme</div>
          <div className="grid grid-cols-2 gap-2 bg-app-bg p-1 rounded-xl border border-border-color transition-colors duration-200">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center space-x-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                theme === 'light' 
                  ? 'bg-card-bg text-text-primary shadow-sm border border-border-color/50' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sun size={14} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center space-x-2 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-150 ${
                theme === 'dark' 
                  ? 'bg-card-bg text-text-primary shadow-sm border border-border-color/50' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Moon size={14} />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Color Mode Switcher */}
        <div className="space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-widest text-text-secondary px-1">Color Mode</div>
          <div className="flex flex-wrap gap-2 px-1">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setAccentColor(c.name)}
                className={`w-6 h-6 rounded-full ${c.hex} flex items-center justify-center relative hover:scale-110 transition-transform duration-100 shadow-sm border border-border-color/20`}
                title={c.name}
              >
                {accentColor === c.name && (
                  <Check 
                    size={12} 
                    className={c.name === 'black' ? 'text-white dark:text-slate-900' : 'text-white'} 
                    strokeWidth={3}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Database Control Helper */}
        <button
          onClick={reseedDatabase}
          className="w-full text-center text-xs py-1.5 px-2 rounded-lg border border-dashed border-border-color text-text-secondary hover:text-text-primary hover:border-accent transition-colors duration-150"
        >
          Reset Demo Data
        </button>

        {/* Profile Card / Sign Out */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-app-bg border border-border-color transition-colors duration-200">
          <div 
            onClick={() => setActiveTab && setActiveTab('profile')}
            className="flex items-center space-x-2.5 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {user?.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-border-color/50 object-cover bg-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs uppercase leading-none">
                {user?.name?.slice(0, 2)}
              </div>
            )}
            <div className="text-left min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">{user?.name}</div>
              <div className="text-[10px] text-text-secondary font-medium leading-none mt-0.5">{user?.role || 'Guest'}</div>
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="p-1.5 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Premium Sign Out Confirmation Popup */}
      {showLogoutConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div 
            className="bg-card-bg border border-border-color p-6 rounded-2xl max-w-[340px] w-full mx-4 shadow-xl transform scale-100 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-500">
                <LogOut size={22} className="ml-0.5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary">Confirm Sign Out</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Are you sure you want to sign out? Any unsaved active drawer progress will be lost.
                </p>
              </div>
              <div className="flex items-center space-x-3 w-full pt-1">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-border-color hover:bg-border-color/10 text-text-primary text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
