'use client';

import React, { useState, useEffect } from 'react';
import { useApp, Task } from '@/context/AppContext';
import { 
  CheckSquare, 
  Clock, 
  FileText, 
  Link as LinkIcon, 
  MessageSquare, 
  Plus, 
  Tag as TagIcon, 
  Trash2, 
  X 
} from 'lucide-react';

interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const { updateTask, deleteTask, addComment, addResource, users } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'doing' | 'completed'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  // Subtask additions
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Resource additions
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [showResourceForm, setShowResourceForm] = useState(false);

  // Comment additions
  const [newComment, setNewComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm, task, title, description]);

  // Slide animation trigger
  useEffect(() => {
    if (task) {
      setIsOpen(true);
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setSelectedLabels(task.labels || []);
      setAssigneeIds(task.assignees?.map(a => a.id) || []);
    } else {
      setIsOpen(false);
    }
  }, [task]);

  if (!task) return null;

  const handleClose = async () => {
    setShowDeleteConfirm(false);
    // Auto-save any active changes on close to prevent race conditions
    if (title.trim() && title !== task.title) {
      await updateTask(task._id, { title: title.trim() });
    }
    if (description !== (task.description || '')) {
      await updateTask(task._id, { description });
    }
    setIsOpen(false);
    setTimeout(onClose, 200); // Allow slide-out animation to finish
  };

  // Sync edits to backend on change or blur
  const handleSaveField = async (fieldName: string, value: any) => {
    await updateTask(task._id, { [fieldName]: value });
  };

  const handleToggleSubtask = async (subtaskIndex: number, completed: boolean) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed,
    };
    await updateTask(task._id, { subtasks: updatedSubtasks });
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const updatedSubtasks = [...task.subtasks, { title: newSubtaskTitle.trim(), completed: false }];
    await updateTask(task._id, { subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = async (subtaskIndex: number) => {
    const updatedSubtasks = task.subtasks.filter((_, idx) => idx !== subtaskIndex);
    await updateTask(task._id, { subtasks: updatedSubtasks });
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;
    await addResource(task._id, resourceTitle.trim(), resourceUrl.trim());
    setResourceTitle('');
    setResourceUrl('');
    setShowResourceForm(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(task._id, newComment.trim());
    setNewComment('');
  };

  const toggleLabel = async (lbl: string) => {
    const isSelected = selectedLabels.includes(lbl);
    let newLabels: string[];
    if (isSelected) {
      newLabels = selectedLabels.filter(l => l !== lbl);
    } else {
      newLabels = [...selectedLabels, lbl];
    }
    setSelectedLabels(newLabels);
    await updateTask(task._id, { labels: newLabels });
  };

  const handleToggleAssignee = async (userId: string) => {
    const isAssigned = assigneeIds.includes(userId);
    let newAssignees: string[];
    if (isAssigned) {
      newAssignees = assigneeIds.filter(id => id !== userId);
    } else {
      newAssignees = [...assigneeIds, userId];
    }
    setAssigneeIds(newAssignees);
    await updateTask(task._id, { assignees: newAssignees } as any);
  };

  const handleDeleteTask = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTask = async () => {
    setShowDeleteConfirm(false);
    const success = await deleteTask(task._id);
    if (success) {
      handleClose();
    }
  };

  const allAvailableLabels = ['Research', 'Design', 'Development', 'Testing', 'Deployment', 'Audit'];

  return (
    <div className={`fixed inset-0 z-50 flex justify-end select-none transition-all duration-300 ${
      isOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
    }`}>
      {/* Backdrop overlay */}
      <div 
        onClick={handleClose}
        className={`absolute inset-0 bg-slate-900/40 dark:bg-black/60 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over Content Drawer */}
      <div className={`relative w-full max-w-2xl bg-card-bg h-full shadow-2xl flex flex-col justify-between border-l border-border-color transition-transform duration-300 transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color select-none">
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary text-xs font-semibold px-2 py-0.5 rounded bg-app-bg uppercase tracking-wide">
              Task Details
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleDeleteTask}
              className="p-2 text-text-secondary hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={handleClose}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-app-bg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Title & Description Grid */}
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleSaveField('title', title)}
              placeholder="Task Title"
              className="w-full text-2xl font-bold bg-transparent text-text-primary focus:outline-none focus:border-b border-accent/40 pb-1 leading-snug"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveField('description', description)}
                placeholder="Add a detailed description for this task..."
                className="w-full h-24 p-3 bg-app-bg border border-border-color rounded-xl text-sm focus:outline-none focus:border-accent text-text-primary focus:ring-1 focus:ring-accent resize-none transition-colors"
              />
            </div>
          </div>

          {/* Properties Column Settings Grid */}
          <div className="grid grid-cols-2 gap-6 bg-app-bg p-4 rounded-xl border border-border-color">
            
            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setStatus(val);
                  handleSaveField('status', val);
                }}
                className="w-full bg-card-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setPriority(val);
                  handleSaveField('priority', val);
                }}
                className="w-full bg-card-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Due Date picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    handleSaveField('dueDate', e.target.value ? new Date(e.target.value) : null);
                  }}
                  className="w-full bg-card-bg border border-border-color rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Members selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                Assignees
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 bg-card-bg border border-border-color rounded-lg">
                {users.map(u => {
                  const isAssigned = assigneeIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleToggleAssignee(u.id)}
                      className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs transition-all ${
                        isAssigned 
                          ? 'bg-accent-light text-accent font-semibold border border-accent/20' 
                          : 'bg-app-bg text-text-secondary border border-transparent hover:bg-border-color/30'
                      }`}
                    >
                      <img src={u.avatarUrl} alt={u.name} className="w-4.5 h-4.5 rounded-full" />
                      <span>{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Labels Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {allAvailableLabels.map((lbl) => {
                const isSelected = selectedLabels.includes(lbl);
                return (
                  <button
                    key={lbl}
                    onClick={() => toggleLabel(lbl)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-accent-light text-accent border-accent/40 shadow-sm'
                        : 'bg-app-bg text-text-secondary border-border-color hover:bg-border-color/30'
                    }`}
                  >
                    <TagIcon size={12} className={isSelected ? 'text-accent' : 'text-text-secondary/60'} />
                    <span>{lbl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-color pb-1.5">
              <h4 className="font-bold text-sm text-text-primary tracking-wide flex items-center space-x-2">
                <CheckSquare size={16} className="text-accent" />
                <span>Subtasks Checklist</span>
              </h4>
              <span className="text-xs text-text-secondary font-semibold">
                {task.subtasks?.filter(s => s.completed).length || 0} of {task.subtasks?.length || 0} completed
              </span>
            </div>

            <div className="space-y-2.5">
              {task.subtasks?.map((subtask, idx) => (
                <div 
                  key={subtask._id || idx}
                  className="flex items-center justify-between p-2.5 bg-app-bg border border-border-color/60 rounded-xl hover:border-border-color transition-colors"
                >
                  <label className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(e) => handleToggleSubtask(idx, e.target.checked)}
                      className="rounded border-border-color text-accent focus:ring-accent h-4 w-4 bg-card-bg"
                    />
                    <span className={`text-sm truncate select-none leading-none mt-0.5 ${
                      subtask.completed ? 'line-through text-text-secondary/60' : 'text-text-primary font-medium'
                    }`}>
                      {subtask.title}
                    </span>
                  </label>
                  <button 
                    onClick={() => handleDeleteSubtask(idx)}
                    className="text-text-secondary hover:text-red-500 p-1 rounded hover:bg-card-bg transition-colors ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <form onSubmit={handleAddSubtask} className="flex space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Add a subtask checklist item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 bg-app-bg border border-border-color rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent text-text-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white hover:bg-accent-hover text-xs font-bold rounded-xl flex items-center space-x-1 shadow-sm transition-all"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>

          {/* Resources / Links attachments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-color pb-1.5">
              <h4 className="font-bold text-sm text-text-primary tracking-wide flex items-center space-x-2">
                <LinkIcon size={16} className="text-accent" />
                <span>Resources & Attachments</span>
              </h4>
              <button 
                onClick={() => setShowResourceForm(!showResourceForm)}
                className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center space-x-1"
              >
                <Plus size={12} />
                <span>Add Resource</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {showResourceForm && (
                <form onSubmit={handleAddResource} className="p-4 bg-app-bg border border-border-color rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Resource Title (e.g. Spec Doc)"
                      value={resourceTitle}
                      onChange={(e) => setResourceTitle(e.target.value)}
                      className="bg-card-bg border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="url"
                      placeholder="Resource URL (e.g. https://...)"
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      className="bg-card-bg border border-border-color rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover shadow-sm"
                    >
                      Save Resource
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResourceForm(false)}
                      className="px-3.5 py-1.5 bg-card-bg border border-border-color text-text-secondary text-xs rounded-lg hover:bg-border-color/30"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {task.resources && task.resources.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {task.resources.map((res, idx) => (
                    <a
                      key={res._id || idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2.5 p-3 bg-app-bg border border-border-color rounded-xl hover:border-accent/40 hover:bg-accent-light/10 transition-all text-xs text-text-primary font-semibold truncate group"
                    >
                      <FileText size={16} className="text-accent group-hover:scale-105 transition-transform" />
                      <div className="truncate">
                        <div className="truncate text-text-primary group-hover:text-accent transition-colors">{res.title}</div>
                        <div className="text-[10px] text-text-secondary/70 truncate font-normal">{res.url}</div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-secondary/60 italic px-1">No documents attached.</p>
              )}
            </div>
          </div>

          {/* Comments Timeline */}
          <div className="space-y-4">
            <div className="border-b border-border-color pb-1.5">
              <h4 className="font-bold text-sm text-text-primary tracking-wide flex items-center space-x-2">
                <MessageSquare size={16} className="text-accent" />
                <span>Comments Timeline</span>
              </h4>
            </div>

            {/* Existing comments list */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment, idx) => (
                  <div key={comment._id || idx} className="flex space-x-3 text-left">
                    {comment.authorAvatar ? (
                      <img 
                        src={comment.authorAvatar} 
                        alt={comment.authorName} 
                        className="w-7 h-7 rounded-full bg-white border border-border-color" 
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {comment.authorName.slice(0, 2)}
                      </div>
                    )}
                    <div className="bg-app-bg border border-border-color/60 rounded-2xl p-3 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-text-primary">{comment.authorName}</span>
                        <span className="text-[10px] text-text-secondary flex items-center space-x-0.5">
                          <Clock size={10} className="mr-0.5" />
                          <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary font-medium leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-text-secondary/60 italic px-1">No comments posted yet.</p>
              )}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleAddComment} className="flex space-x-2 pt-2 border-t border-dashed border-border-color/60">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-app-bg border border-border-color rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-accent text-text-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white hover:bg-accent-hover text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Post
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Premium Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-card-bg border border-border-color p-6 rounded-2xl max-w-[340px] w-full mx-4 shadow-xl transform scale-100 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-red-500 animate-bounce">
                <Trash2 size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-text-primary">Delete Task</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Are you sure you want to delete this task? This action cannot be undone and will permanently remove all associated comments, subtasks, and files.
                </p>
              </div>
              <div className="flex items-center space-x-3 w-full pt-1">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-xl border border-border-color hover:bg-border-color/10 text-text-primary text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteTask}
                  className="flex-1 py-2 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
