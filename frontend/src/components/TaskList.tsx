'use client';

import React, { useState } from 'react';
import { useApp, Task, User } from '@/context/AppContext';
import { 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  UserPlus 
} from 'lucide-react';

interface TaskListProps {
  onSelectTask: (task: Task) => void;
  onOpenCreate: (status: 'todo' | 'doing' | 'completed') => void;
}

export default function TaskList({ onSelectTask, onOpenCreate }: TaskListProps) {
  const { tasks, updateTask, deleteTask, visibleFields, users } = useApp();

  // Collapsed sections states
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    todo: false,
    doing: false,
    completed: false,
  });

  // Action dropdown states
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Assignee selection menu states
  const [activeAssigneeMenu, setActiveAssigneeMenu] = useState<string | null>(null);

  const sections: { id: 'todo' | 'doing' | 'completed'; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'doing', title: 'Doing' },
    { id: 'completed', title: 'Completed' },
  ];

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getFilteredTasks = (colId: string) => {
    return tasks.filter((t) => t.status === colId);
  };

  // Render Priority indicator matching Figma signal bars
  const renderPriority = (priority: 'low' | 'medium' | 'high') => {
    if (priority === 'high') {
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs text-red-500 font-semibold">
          <span className="flex space-x-0.5 items-end h-3 w-3">
            <span className="w-0.5 h-1.5 bg-red-500 rounded-full"></span>
            <span className="w-0.5 h-2.5 bg-red-500 rounded-full"></span>
            <span className="w-0.5 h-3.5 bg-red-500 rounded-full"></span>
          </span>
          <span>High</span>
        </span>
      );
    }
    if (priority === 'medium') {
      return (
        <span className="inline-flex items-center space-x-1.5 text-xs text-amber-500 font-semibold">
          <span className="flex space-x-0.5 items-end h-3 w-3">
            <span className="w-0.5 h-1.5 bg-amber-500 rounded-full"></span>
            <span className="w-0.5 h-2.5 bg-amber-500 rounded-full"></span>
            <span className="w-0.5 h-3.5 bg-border-color rounded-full"></span>
          </span>
          <span>Medium</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 text-xs text-slate-400 dark:text-slate-500 font-semibold">
        <span className="flex space-x-0.5 items-end h-3 w-3">
          <span className="w-0.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></span>
          <span className="w-0.5 h-2.5 bg-border-color/60 dark:bg-border-color rounded-full"></span>
          <span className="w-0.5 h-3.5 bg-border-color/60 dark:bg-border-color rounded-full"></span>
        </span>
        <span>Low</span>
      </span>
    );
  };

  // Date formatting for list view
  const formatDateList = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Check if a field is visible
  const isFieldVisible = (fieldId: string) => visibleFields.includes(fieldId);

  // Assign user to task
  const handleAssignUser = async (taskId: string, userToAssign: User) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    
    // Toggle user assignment
    const alreadyAssigned = task.assignees.some(u => u.id === userToAssign.id);
    let newAssigneeIds: string[];
    
    if (alreadyAssigned) {
      newAssigneeIds = task.assignees.filter(u => u.id !== userToAssign.id).map(u => u.id);
    } else {
      newAssigneeIds = [...task.assignees.map(u => u.id), userToAssign.id];
    }
    await updateTask(taskId, { assignees: newAssigneeIds } as any);
    setActiveAssigneeMenu(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none">
      {sections.map((section) => {
        const isCollapsed = collapsed[section.id];
        const sectionTasks = getFilteredTasks(section.id);

        return (
          <div key={section.id} className="border border-border-color rounded-2xl bg-card-bg overflow-hidden shadow-sm transition-colors duration-200">
            
            {/* Section Header */}
            <div
              onClick={() => toggleCollapse(section.id)}
              className="flex items-center justify-between px-5 py-4 bg-app-bg border-b border-border-color cursor-pointer hover:bg-border-color/10 select-none transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-text-secondary">
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </span>
                <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">{section.title}</h3>
                <span className="bg-border-color/60 dark:bg-border-color text-text-secondary text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                  {sectionTasks.length}
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCreate(section.id);
                }}
                className="flex items-center space-x-1.5 py-1 px-3 bg-card-bg border border-border-color hover:bg-border-color/20 text-text-primary text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            </div>

            {/* Section Tasks Table */}
            {!isCollapsed && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-color text-[11px] font-bold text-text-secondary uppercase tracking-wider bg-app-bg/30">
                      <th className="px-6 py-3 min-w-[240px]">Task</th>
                      {isFieldVisible('priority') && <th className="px-6 py-3 min-w-[120px]">Priority</th>}
                      {isFieldVisible('assignees') && <th className="px-6 py-3 min-w-[150px]">Members</th>}
                      {isFieldVisible('dueDate') && <th className="px-6 py-3 min-w-[140px]">Due Date</th>}
                      <th className="px-6 py-3 text-right w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionTasks.map((task) => (
                      <tr
                        key={task._id}
                        className="border-b border-border-color hover:bg-app-bg/40 cursor-pointer group transition-colors duration-150"
                        onClick={() => onSelectTask(task)}
                      >
                        {/* Task Title */}
                        <td className="px-6 py-3.5">
                          <div>
                            <span className="font-semibold text-sm text-text-primary hover:text-accent transition-colors leading-tight">
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-text-secondary line-clamp-1 mt-0.5 font-normal">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Priority Column */}
                        {isFieldVisible('priority') && (
                          <td className="px-6 py-3.5">
                            {renderPriority(task.priority)}
                          </td>
                        )}

                        {/* Members / Assignee Column */}
                        {isFieldVisible('assignees') && (
                          <td className="px-6 py-3.5">
                            <div className="flex items-center space-x-2">
                              {/* Render Assingee Avatars */}
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {task.assignees?.map((asg) => (
                                  <div key={asg.id} title={asg.name}>
                                    {asg.avatarUrl ? (
                                      <img
                                        src={asg.avatarUrl}
                                        alt={asg.name}
                                        className="w-6 h-6 rounded-full border-2 border-card-bg bg-white object-cover"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full border-2 border-card-bg bg-accent text-white flex items-center justify-center font-bold text-[9px] uppercase">
                                        {asg.name.slice(0, 2)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Assign Button */}
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveAssigneeMenu(activeAssigneeMenu === task._id ? null : task._id);
                                  }}
                                  className="w-6 h-6 rounded-full bg-border-color/30 border border-border-color hover:bg-accent-light hover:border-accent hover:text-accent text-text-secondary flex items-center justify-center transition-all"
                                  title="Assign Member"
                                >
                                  <UserPlus size={12} />
                                </button>

                                {/* Assignee Dropdown */}
                                {activeAssigneeMenu === task._id && (
                                  <div className="absolute left-0 mt-2 w-48 bg-card-bg border border-border-color rounded-xl shadow-lg z-50 p-1">
                                    <div className="text-[10px] font-bold text-text-secondary uppercase px-2 py-1 border-b border-border-color">Assign Team Member</div>
                                    <div className="max-h-40 overflow-y-auto">
                                      {users.map(u => {
                                        const isAssigned = task.assignees?.some(ta => ta.id === u.id);
                                        return (
                                          <button
                                            key={u.id}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAssignUser(task._id, u);
                                            }}
                                            className={`w-full flex items-center justify-between text-left px-2 py-1.5 rounded-lg text-xs hover:bg-app-bg transition-colors ${
                                              isAssigned ? 'font-semibold text-accent' : 'text-text-primary'
                                            }`}
                                          >
                                            <div className="flex items-center space-x-2">
                                              <img src={u.avatarUrl} alt={u.name} className="w-4 h-4 rounded-full" />
                                              <span>{u.name}</span>
                                            </div>
                                            {isAssigned && <span className="text-[9px] bg-accent-light px-1.5 py-0.5 rounded text-accent">Active</span>}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Due Date Column */}
                        {isFieldVisible('dueDate') && (
                          <td className="px-6 py-3.5">
                            {task.dueDate ? (
                              <div className="flex items-center space-x-1.5 text-xs text-text-secondary font-medium">
                                <Calendar size={12} className="text-text-secondary/60" />
                                <span>{formatDateList(task.dueDate)}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-text-secondary/50 italic">No date</span>
                            )}
                          </td>
                        )}

                        {/* Actions Column */}
                        <td className="px-6 py-3.5 text-right relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === task._id ? null : task._id);
                            }}
                            className="p-1 hover:bg-border-color/30 rounded text-text-secondary hover:text-text-primary transition-colors inline-block"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {/* Inline options menu */}
                          {activeMenu === task._id && (
                            <div className="absolute right-6 mt-1 w-32 bg-card-bg border border-border-color rounded-xl shadow-lg z-50 p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenu(null);
                                  onSelectTask(task);
                                }}
                                className="w-full flex items-center space-x-2 text-left px-2.5 py-1.5 text-xs text-text-primary hover:bg-app-bg rounded-lg transition-colors"
                              >
                                <Edit size={12} />
                                <span>View Details</span>
                              </button>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setActiveMenu(null);
                                  await deleteTask(task._id);
                                }}
                                className="w-full flex items-center space-x-2 text-left px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                              >
                                <Trash2 size={12} />
                                <span>Delete Task</span>
                              </button>
                            </div>
                          )}
                        </td>

                      </tr>
                    ))}
                    {sectionTasks.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-6 text-center text-xs text-text-secondary/60 italic font-medium">
                          No tasks in this section. Click "Add Task" to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
