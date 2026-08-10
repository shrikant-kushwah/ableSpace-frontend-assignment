'use client';

import React, { useState } from 'react';
import { useApp, Task, User } from '@/context/AppContext';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Trash2,
  Edit3
} from 'lucide-react';
import TaskCreateModal from './TaskCreateModal';

interface ProjectsListProps {
  onSelectTask: (task: Task) => void;
}

export default function ProjectsList({ onSelectTask }: ProjectsListProps) {
  const { 
    tasks, 
    searchQuery, 
    setSearchQuery, 
    selectedPriority, 
    setSelectedPriority,
    selectedLabel,
    setSelectedLabel,
    deleteTask
  } = useApp();

  const [showSearch, setShowSearch] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Filter tasks to show as projects
  const filteredProjects = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority ? task.priority === selectedPriority : true;
    const matchesLabel = selectedLabel ? task.labels?.includes(selectedLabel) : true;
    return matchesSearch && matchesPriority && matchesLabel;
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400', label: 'High' };
      case 'medium':
        return { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', label: 'Medium' };
      case 'low':
        return { bg: 'bg-slate-400/10 dark:bg-slate-500/20', text: 'text-slate-400 dark:text-slate-500', label: 'Low' };
      default:
        return { bg: 'bg-slate-400/10 dark:bg-slate-500/20', text: 'text-slate-400 dark:text-slate-500', label: 'Low' };
    }
  };

  const getLeadUser = (task: Task): User | null => {
    if (task.assignees && task.assignees.length > 0) {
      return task.assignees[0];
    }
    return null;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Unique labels list
  const allLabels = Array.from(new Set(tasks.flatMap(t => t.labels || [])));

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-app-bg text-left transition-colors duration-200">
      
      {/* Projects Header Toolbar */}
      <header className="h-16 border-b border-border-color bg-sidebar-bg flex items-center justify-between px-6 shrink-0 transition-colors duration-200 select-none">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-bold text-text-primary tracking-wide">Projects</span>
          <span className="text-xs text-text-secondary">/</span>
          <span className="text-xs font-semibold text-text-secondary">Active Projects</span>
        </div>

        <div className="flex items-center space-x-3">
          
          {/* Expandable Search Button */}
          <div className="flex items-center">
            {showSearch || searchQuery ? (
              <div className="relative w-48 transition-all duration-300">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search projects..."
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
                title="Search Projects"
              >
                <Search size={14} />
              </button>
            )}
          </div>

          {/* Filters Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 bg-app-bg border border-border-color rounded-xl hover:bg-border-color/20 text-xs font-semibold text-text-primary shadow-sm transition-all ${
                selectedPriority || selectedLabel ? 'border-accent text-accent bg-accent-light/10' : ''
              }`}
            >
              <Filter size={12} />
              <span>Filter</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-card-bg border border-border-color rounded-xl shadow-xl z-50 p-3 space-y-3">
                <div className="text-[10px] font-bold text-text-secondary uppercase pb-1 border-b border-border-color">Filter Projects</div>
                
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

          {/* "+ Add Project" button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center space-x-1.5 py-1.5 px-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-150"
          >
            <Plus size={14} />
            <span>Add Project</span>
          </button>

        </div>
      </header>

      {/* Projects List Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-card-bg border border-border-color rounded-2xl shadow-sm overflow-hidden transition-colors duration-200">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-color/60 text-text-secondary uppercase text-[10px] font-bold tracking-wider select-none bg-sidebar-bg/50">
                <th className="py-3.5 px-6 text-left w-2/5">Projects</th>
                <th className="py-3.5 px-4 text-left w-1/5">Priority</th>
                <th className="py-3.5 px-4 text-left w-1/5">Lead</th>
                <th className="py-3.5 px-4 text-left w-1/5">Due Date</th>
                <th className="py-3.5 px-6 text-right w-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color/40">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-secondary">
                    No active projects found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const priority = getPriorityStyle(project.priority);
                  const lead = getLeadUser(project);
                  return (
                    <tr 
                      key={project._id}
                      className="hover:bg-sidebar-bg/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectTask(project)}
                    >
                      {/* Name / Title */}
                      <td className="py-4 px-6 font-semibold text-text-primary group-hover:text-accent transition-colors">
                        {project.title}
                      </td>
                      
                      {/* Priority */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-border-color/30 ${priority.bg} ${priority.text}`}>
                          {priority.label}
                        </span>
                      </td>

                      {/* Lead / Assignee */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        {lead ? (
                          <div className="flex items-center space-x-2">
                            <img 
                              src={lead.avatarUrl} 
                              alt={lead.name}
                              className="w-6 h-6 rounded-full border border-border-color bg-white object-cover shadow-xs" 
                            />
                            <span className="font-semibold text-text-primary text-[11px]">{lead.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-text-secondary">
                            <div className="w-6 h-6 rounded-full border border-border-color border-dashed bg-app-bg flex items-center justify-center text-xs">
                              +
                            </div>
                            <span className="font-medium text-[11px]">Unassigned</span>
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 text-text-secondary font-medium">
                        {formatDate(project.dueDate)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === project._id ? null : project._id)}
                            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-border-color/20 transition-all"
                          >
                            <MoreHorizontal size={14} />
                          </button>

                          {activeMenuId === project._id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                              <div className="absolute right-0 mt-1 w-32 bg-card-bg border border-border-color rounded-xl shadow-xl z-50 py-1 text-left">
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onSelectTask(project);
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-app-bg text-text-primary transition-colors text-[11px] font-medium"
                                >
                                  <Edit3 size={12} />
                                  <span>Edit Project</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    if (confirm('Are you sure you want to delete this project?')) {
                                      deleteTask(project._id);
                                    }
                                  }}
                                  className="w-full flex items-center space-x-2 px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors text-[11px] font-medium"
                                >
                                  <Trash2 size={12} />
                                  <span>Delete Project</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Create Modal (Project Mode) */}
      <TaskCreateModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultStatus="todo"
      />

    </div>
  );
}
