import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Trash2,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { useStudioData } from '../context/StudioDataContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/calculations';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { EventTask, TaskPriority, TaskStatus } from '../types';

interface TasksPageProps {
  navigate: (path: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ navigate }) => {
  const { tasks, events, teamMembers, createTask, updateTask, deleteTask, addToast } = useStudioData();
  const { isAdmin, user } = useAuth();

  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('Normal');
  const [description, setDescription] = useState('');

  const filteredTasks = tasks.filter(t => {
    return priorityFilter === 'ALL' || t.priority === priorityFilter;
  });

  const columns: TaskStatus[] = ['Pending', 'In Progress', 'Review', 'Completed'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventId) {
      addToast('Title and Event are required', 'error');
      return;
    }

    await createTask({
      eventId,
      title,
      assigneeId: assigneeId || undefined,
      dueDate,
      priority,
      description
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Post-Production Pipeline</h2>
          <p className="text-xs text-gray-500">
            Editing queues, DaVinci Resolve color grading, highlight reels, and client album reviews.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-xs"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent Only</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>

          <button
            onClick={() => {
              if (events.length > 0 && !eventId) setEventId(events[0].id);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {columns.map(status => {
          const colTasks = filteredTasks.filter(t => t.status === status);

          return (
            <div key={status} className="bg-gray-100/70 rounded-2xl p-4 space-y-3 min-h-[500px] border border-gray-200/80">
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
                  {status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-gray-700 shadow-xs border border-gray-200">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTasks.map(task => {
                  const evt = events.find(e => e.id === task.eventId);
                  const assignee = teamMembers.find(m => m.id === task.assigneeId);
                  const isOverdue = task.status !== 'Completed' && task.dueDate < todayStr;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 bg-white rounded-xl border shadow-xs space-y-2 transition-all ${
                        isOverdue ? 'border-rose-300 ring-1 ring-rose-200' : 'border-gray-200 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-gray-900 leading-snug">{task.title}</span>
                        <StatusBadge status={task.priority} size="sm" />
                      </div>

                      {evt && (
                        <div
                          onClick={() => navigate(`/events/${evt.id}`)}
                          className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer truncate"
                        >
                          {evt.title}
                        </div>
                      )}

                      {task.description && (
                        <p className="text-[11px] text-gray-600 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <strong>{assignee?.name || 'Unassigned'}</strong>
                        </span>
                        <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                          <Clock className="w-3 h-3" />
                          {formatDate(task.dueDate)} {isOverdue && '(Overdue)'}
                        </span>
                      </div>

                      {/* Status select & delete */}
                      <div className="pt-2 flex items-center justify-between gap-1 border-t border-gray-50">
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-medium text-gray-800"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Completed">Completed</option>
                        </select>

                        {isAdmin && (
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Post-Production Task"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Event *</label>
            <select
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            >
              <option value="">-- Choose Event --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({formatDate(ev.eventDate)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 4K Drone Color Grading & Teaser Cut"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="">-- Unassigned --</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Client Preferences</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
