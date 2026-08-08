'use client';

import React, { useState, useEffect } from 'react';
import { useApp, Task } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TaskBoard from '@/components/TaskBoard';
import TaskList from '@/components/TaskList';
import TaskDrawer from '@/components/TaskDrawer';
import TaskCreateModal from '@/components/TaskCreateModal';
import ProfileSettings from '@/components/ProfileSettings';
import ProjectsList from '@/components/ProjectsList';
import { 
  Eye, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Search 
} from 'lucide-react';

export default function DashboardPage() {
  const { 
    user, 
    viewMode, 
    setViewMode, 
    searchQuery, 
    setSearchQuery, 
    selectedPriority, 
    setSelectedPriority,
    selectedLabel,
    setSelectedLabel,
    visibleFields, 
    setVisibleFields,
    tasks,
    isLoading 
  } = useApp();

  const router = useRouter();

  // Local UI States
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<'todo' | 'doing' | 'completed'>('todo');
  const [showFieldsMenu, setShowFieldsMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'projects' | 'profile'>('tasks');

  // Authentication check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-app-bg text-text-primary">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-wide">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Sync selected task updates from global tasks array (to show updated comments, subtasks instantly in drawer)
  const activeTask = selectedTask ? tasks.find(t => t._id === selectedTask._id) || null : null;

  const handleOpenCreate = (status: 'todo' | 'doing' | 'completed') => {
    setCreateDefaultStatus(status);
    setIsCreateOpen(true);
  };

  const toggleField = (fieldId: string) => {
    if (visibleFields.includes(fieldId)) {
      // Keep at least task title visible
      if (visibleFields.length > 1) {
        setVisibleFields(visibleFields.filter(f => f !== fieldId));
      }
    } else {
      setVisibleFields([...visibleFields, fieldId]);
    }
  };

  // Extract unique labels for tags filter dropdown
  const allLabels = Array.from(
    new Set(tasks.flatMap(t => t.labels || []))
  );

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'tasks' ? (
          <>
            {/* Top Header Section */}
            <header className="h-16 border-b border-border-color bg-sidebar-bg flex items-center justify-between px-6 shrink-0 transition-colors duration-200 select-none">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-text-primary tracking-wide">Tasks</span>
                <span className="text-xs text-text-secondary">/</span>
                <span className="text-xs font-semibold text-text-secondary">All Tasks</span>
              </div>

              <div className="flex items-center space-x-3">
                
                {/* Expandable Search Button */}
                <div className="flex items-center">
                  {showSearch || searchQuery ? (
                    <div className="relative w-48 transition-all duration-300">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={() => {
                          if (!searchQuery) setShowSearch(false);
                        }}
                        className="w-full bg-app-bg border border-border-color rounded-xl pl-9 pr-8 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                        autoFocus
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            setShowSearch(false);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-secondary hover:text-text-primary font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowSearch(true)}
                      className="flex items-center justify-center p-2 bg-app-bg border border-border-color rounded-xl hover:bg-border-color/20 text-text-primary shadow-sm transition-all"
                      title="Search Tasks"
                    >
                      <Search size={14} />
                    </button>
                  )}
                </div>

                {/* Fields Toggle Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFieldsMenu(!showFieldsMenu);
                      setShowFilterMenu(false);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 bg-app-bg border border-border-color rounded-xl hover:bg-border-color/20 text-xs font-semibold text-text-primary shadow-sm transition-all`}
                  >
                    <Eye size={12} />
                    <span>Fields</span>
                  </button>

                  {showFieldsMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-card-bg border border-border-color rounded-xl shadow-xl z-50 p-2.5 space-y-3">
                      {/* Segmented View Switcher */}
                      <div className="flex bg-app-bg p-0.5 border border-border-color rounded-lg text-xs">
                        <button
                          onClick={() => setViewMode('list')}
                          className={`flex-1 flex items-center justify-center space-x-1.5 py-1 rounded-md font-semibold transition-all ${
                            viewMode === 'list' 
                              ? 'bg-card-bg text-accent shadow-sm border border-border-color/30' 
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <List size={13} />
                          <span>List</span>
                        </button>
                        <button
                          onClick={() => setViewMode('board')}
                          className={`flex-1 flex items-center justify-center space-x-1.5 py-1 rounded-md font-semibold transition-all ${
                            viewMode === 'board' 
                              ? 'bg-card-bg text-accent shadow-sm border border-border-color/30' 
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <Grid size={13} />
                          <span>Board</span>
                        </button>
                      </div>

                      <div className="border-t border-border-color pt-2">
                        <div className="text-[10px] font-bold text-text-secondary uppercase px-2 py-1 mb-1">Visible Fields</div>
                        {[
                          { id: 'priority', name: 'Priority' },
                          { id: 'assignees', name: 'Members' },
                          { id: 'dueDate', name: 'Due Date' },
                          { id: 'labels', name: 'Labels' },
                        ].map(f => (
                          <label key={f.id} className="flex items-center space-x-2.5 px-2 py-1.5 hover:bg-app-bg rounded-lg cursor-pointer text-xs text-text-primary select-none">
                            <input
                              type="checkbox"
                              checked={visibleFields.includes(f.id)}
                              onChange={() => toggleField(f.id)}
                              className="rounded border-border-color text-accent focus:ring-accent h-3.5 w-3.5"
                            />
                            <span>{f.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filters Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowFilterMenu(!showFilterMenu);
                      setShowFieldsMenu(false);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 bg-app-bg border border-border-color rounded-xl hover:bg-border-color/20 text-xs font-semibold text-text-primary shadow-sm transition-all ${
                      selectedPriority || selectedLabel ? 'border-accent text-accent bg-accent-light/10' : ''
                    }`}
                  >
                    <Filter size={12} />
                    <span>Filter</span>
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-card-bg border border-border-color rounded-xl shadow-xl z-50 p-3 space-y-3">
                      <div className="text-[10px] font-bold text-text-secondary uppercase pb-1 border-b border-border-color">Filter Workspace</div>
                      
                      {/* Priority Filter */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Priority</label>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value)}
                          className="w-full bg-app-bg border border-border-color rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent"
                        >
                          <option value="">All Priorities</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      {/* Labels Filter */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Labels</label>
                        <select
                          value={selectedLabel}
                          onChange={(e) => setSelectedLabel(e.target.value)}
                          className="w-full bg-app-bg border border-border-color rounded-lg px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent"
                        >
                          <option value="">All Labels</option>
                          {allLabels.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>

                      {/* Clear Button */}
                      {(selectedPriority || selectedLabel) && (
                        <button
                          onClick={() => {
                            setSelectedPriority('');
                            setSelectedLabel('');
                            setShowFilterMenu(false);
                          }}
                          className="w-full text-center text-xs py-1 rounded bg-red-50 hover:bg-red-100 text-red-500 font-semibold"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* "+ Add Task" button */}
                <button
                  onClick={() => handleOpenCreate('todo')}
                  className="flex items-center space-x-1.5 py-1.5 px-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-150"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>

              </div>
            </header>

            {/* Dynamic Inner View Pane */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {viewMode === 'board' ? (
                <TaskBoard 
                  onSelectTask={setSelectedTask} 
                  onOpenCreate={handleOpenCreate} 
                />
              ) : (
                <TaskList 
                  onSelectTask={setSelectedTask} 
                  onOpenCreate={handleOpenCreate} 
                />
              )}
            </div>
          </>
        ) : activeTab === 'projects' ? (
          <ProjectsList onSelectTask={setSelectedTask} />
        ) : (
          <ProfileSettings />
        )}

        {/* Task Edit Drawer */}
        <TaskDrawer 
          task={activeTask} 
          onClose={() => setSelectedTask(null)} 
        />

        {/* Task Create Modal */}
        <TaskCreateModal 
          isOpen={isCreateOpen} 
          onClose={() => setIsCreateOpen(false)} 
          defaultStatus={createDefaultStatus} 
        />

      </div>

    </div>
  );
}
