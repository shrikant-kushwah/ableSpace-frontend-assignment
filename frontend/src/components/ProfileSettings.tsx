'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Camera, 
  Check, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

export default function ProfileSettings() {
  const { user, updateProfile, logout } = useApp();
  
  // Local states matching Figma inputs
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Avatar presets using DiceBear seeds
  const avatarPresets = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=dexter',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
    'https://api.dicebear.com/7.x/bottts/svg?seed=cyber',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=alex',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    const success = await updateProfile({
      name,
      email,
      role,
      username,
      avatarUrl
    });
    
    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setSaveError('Failed to save profile changes. Please try again.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-app-bg p-6 text-left transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Page Heading */}
        <div className="flex items-center justify-between pb-4 border-b border-border-color">
          <div>
            <h2 className="text-xl font-bold text-text-primary tracking-tight">Profile</h2>
            <p className="text-xs text-text-secondary mt-0.5">Manage your personal details and workspace settings</p>
          </div>
        </div>

        {/* Main Settings Form Card */}
        <form onSubmit={handleSubmit} className="bg-card-bg border border-border-color rounded-2xl p-6 shadow-sm space-y-6 transition-colors duration-200">
          
          {/* Profile Picture Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Profile picture
            </label>
            <div className="flex items-center space-x-5">
              <div className="relative group cursor-pointer">
                <img 
                  src={avatarUrl} 
                  alt={name} 
                  className="w-16 h-16 rounded-full border border-border-color bg-white object-cover shadow-sm transition-all group-hover:opacity-85"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              
              {/* Presets List */}
              <div className="flex flex-wrap gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 bg-white object-cover hover:scale-105 transition-all ${
                      avatarUrl === preset ? 'border-accent ring-2 ring-accent-light' : 'border-border-color'
                    }`}
                  >
                    <img src={preset} alt={`preset-${idx}`} className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Full name
              </label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  id="fullName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-app-bg border border-border-color rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-app-bg border border-border-color rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  required
                />
              </div>
            </div>

            {/* Job Title / Role */}
            <div className="space-y-1.5">
              <label htmlFor="jobTitle" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Title
              </label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  id="jobTitle"
                  type="text"
                  placeholder="e.g. Designer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-app-bg border border-border-color rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>
              <p className="text-[10px] text-text-secondary/70">Your job title or role</p>
            </div>

            {/* Username / Nickname */}
            <div className="space-y-1.5">
              <label htmlFor="nickname" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary font-semibold">@</span>
                <input
                  id="nickname"
                  type="text"
                  placeholder="e.g. dexuser"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-app-bg border border-border-color rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
              </div>
              <p className="text-[10px] text-text-secondary/70">One word, like a nickname or first name</p>
            </div>

          </div>

          {/* Feedback Messages */}
          {saveSuccess && (
            <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3 rounded-xl">
              <Check size={14} className="shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center space-x-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-3 rounded-xl">
              <AlertCircle size={14} className="shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-start pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 py-2.5 px-6 rounded-full bg-accent text-white hover:bg-accent-hover text-xs font-semibold shadow-sm transition-all duration-150 disabled:opacity-50"
            >
              {isSaving && <Loader2 size={12} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>

        </form>

        {/* Workspace Access Panel */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-text-primary tracking-wide">Workspace access</h3>
          
          <div className="bg-card-bg border border-border-color rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors duration-200">
            <div>
              <p className="text-xs font-medium text-text-primary">Remove yourself from the workspace</p>
              <p className="text-[10px] text-text-secondary/70 mt-0.5">You will lose access to all task boards and checklists in this workspace</p>
            </div>
            
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 rounded-full border border-red-200 hover:border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/10 hover:bg-red-100 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors duration-150 self-start sm:self-auto"
            >
              Leave Workspace
            </button>
          </div>
        </div>

      </div>

      {/* Leave Workspace Modal Confirm Overlay */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-border-color rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle size={20} />
              <h4 className="font-bold text-sm">Leave Workspace</h4>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to remove yourself from the workspace? You will be signed out and your active session will be deleted.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Yes, Leave
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-full border border-border-color text-text-secondary text-xs font-semibold hover:bg-app-bg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
