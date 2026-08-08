'use client';

import React from 'react';
import { useApp, Task } from '@/context/AppContext';
import { Calendar, MoreHorizontal, Plus, Tag } from 'lucide-react';

interface TaskBoardProps {
  onSelectTask: (task: Task) => void;
  onOpenCreate: (status: 'todo' | 'doing' | 'completed') => void;
}

export default function TaskBoard({ onSelectTask, onOpenCreate }: TaskBoardProps) {
  const { tasks, updateTask } = useApp();
  const [dragOverCol, setDragOverCol] = React.useState<'todo' | 'doing' | 'completed' | null>(null);

  const columns: { id: 'todo' | 'doing' | 'completed'; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'doing', title: 'Doing' },
    { id: 'completed', title: 'Completed' },
  ];

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, colId: 'todo' | 'doing' | 'completed') => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e: React.DragEvent, status: 'todo' | 'doing' | 'completed') => {
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      await updateTask(taskId, { status });
    }
  };

  // Formatting date for displaying
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getFilteredTasks = (colId: string) => {
    return tasks.filter((t) => t.status === colId);
  };

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex gap-6 min-h-full items-start">
        {columns.map((col) => {
          const colTasks = getFilteredTasks(col.id);

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex-1 min-w-[280px] max-w-[360px] bg-app-bg border rounded-2xl p-4 flex flex-col transition-all duration-200 ${
                dragOverCol === col.id 
                  ? 'border-accent ring-2 ring-accent/15 bg-accent-light/10 scale-[1.01]' 
                  : 'border-border-color'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-text-primary text-sm tracking-tight">{col.title}</h3>
                  <span className="bg-border-color/60 dark:bg-border-color text-text-secondary text-xs px-2 py-0.5 rounded-full font-bold">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onOpenCreate(col.id)}
                    className="p-1 hover:bg-border-color/30 rounded text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <button className="p-1 hover:bg-border-color/30 rounded text-text-secondary hover:text-text-primary transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Tasks Cards Container */}
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
                {colTasks.map((task) => {
                  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
                  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

                  return (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      onClick={() => onSelectTask(task)}
                      className="bg-card-bg border border-border-color rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer hover:border-accent/40 hover:scale-[1.01] transition-all duration-150 select-none group"
                    >
                      {/* Card Actions Button */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <h4 className="font-semibold text-text-primary text-sm group-hover:text-accent transition-colors leading-snug">
                          {task.title}
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Optional task actions menu
                          }}
                          className="text-text-secondary opacity-0 group-hover:opacity-100 hover:text-text-primary p-0.5 rounded transition-opacity"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </div>

                      {/* Description snippet */}
                      {task.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks Progress */}
                      {hasSubtasks && (
                        <div className="space-y-1.5 mb-3">
                          <div className="flex justify-between text-[10px] font-semibold text-text-secondary">
                            <span>Checklist</span>
                            <span>{completedSubtasks}/{task.subtasks.length}</span>
                          </div>
                          <div className="w-full bg-border-color/50 dark:bg-border-color/30 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-accent h-full rounded-full transition-all duration-300"
                              style={{ width: `${(completedSubtasks / task.subtasks.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Bottom Info Section */}
                      <div className="flex items-center justify-between border-t border-border-color/50 pt-2.5 mt-2">
                        
                        {/* Assignee Details */}
                        <div className="flex items-center space-x-2">
                          {task.assignees && task.assignees[0] ? (
                            <div className="flex items-center space-x-1.5">
                              {task.assignees[0].avatarUrl ? (
                                <img
                                  src={task.assignees[0].avatarUrl}
                                  alt={task.assignees[0].name}
                                  className="w-5 h-5 rounded-full border border-border-color bg-white object-cover"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center font-bold text-[9px] uppercase">
                                  {task.assignees[0].name.slice(0, 2)}
                                </div>
                              )}
                              <span className="text-[10px] font-medium text-text-secondary">
                                {task.assignees[0].name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-text-secondary italic">Unassigned</span>
                          )}
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/25 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                            <Calendar size={10} />
                            <span>{formatDueDate(task.dueDate)}</span>
                          </div>
                        )}

                      </div>

                      {/* Labels Pills */}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pt-1 border-t border-dashed border-border-color/50">
                          {task.labels.map((lbl, idx) => (
                            <span
                              key={idx}
                              className="flex items-center space-x-1 text-[10px] font-semibold text-text-secondary bg-app-bg border border-border-color/80 px-2 py-0.5 rounded-full"
                            >
                              <Tag size={8} className="text-accent" />
                              <span>{lbl}</span>
                            </span>
                          ))}
                        </div>
                      )}

                    </div>
                  );
                })}

                {/* Empty State */}
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-border-color/40 rounded-xl p-6 text-center text-xs text-text-secondary font-medium select-none py-10">
                    Drag tasks here
                  </div>
                )}
              </div>

              {/* Add Task Button at bottom */}
              <button
                onClick={() => onOpenCreate(col.id)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 mt-3 rounded-lg text-text-secondary hover:text-accent hover:bg-accent-light/50 text-xs font-semibold border border-transparent hover:border-accent-light transition-all duration-150"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}
