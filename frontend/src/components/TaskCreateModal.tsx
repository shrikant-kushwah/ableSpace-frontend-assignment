'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X } from 'lucide-react';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus: 'todo' | 'doing' | 'completed';
}

export default function TaskCreateModal({ isOpen, onClose, defaultStatus }: TaskCreateModalProps) {
  const { createTask } = useApp();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'todo' | 'doing' | 'completed'>('todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [labelsInput, setLabelsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus || 'todo');
      setPriority('medium');
      setDueDate('');
      setLabelsInput('');
    }
  }, [isOpen, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const parsedLabels = labelsInput
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const data = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      labels: parsedLabels,
    };

    const task = await createTask(data);
    setIsSubmitting(false);
    if (task) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 transition-opacity duration-200"
      />

      {/* Modal Dialog Content */}
      <div className="relative bg-card-bg w-full max-w-lg rounded-2xl border border-border-color shadow-2xl p-6 overflow-hidden z-10 transition-all duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-color pb-4 mb-4 select-none">
          <h3 className="font-bold text-text-primary text-base">Create New Task</h3>
          <button 
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-app-bg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g. Design Homepage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 text-sm bg-app-bg border border-border-color rounded-lg focus:outline-none focus:border-accent text-text-primary focus:ring-1 focus:ring-accent"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Description
            </label>
            <textarea
              placeholder="Provide a brief task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-20 px-4 py-2 text-sm bg-app-bg border border-border-color rounded-lg focus:outline-none focus:border-accent text-text-primary focus:ring-1 focus:ring-accent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-app-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-app-bg border border-border-color rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-app-bg border border-border-color rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Labels (comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Design, Deployment"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-app-bg border border-border-color rounded-lg focus:outline-none focus:border-accent text-text-primary focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-color mt-6 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border-color text-text-secondary text-sm font-semibold rounded-lg hover:bg-app-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-all duration-150"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
