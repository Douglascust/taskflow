import React, { useEffect, useState } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask, changeTaskStatus, changeTaskPriority, fetchProjects } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Task, Project } from '../types';
import './Tasks.css';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await fetchTasks();
      setTasks(res.data);
    } catch (error) {
      console.error('Error loading tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (data: any) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (error) {
      console.error('Error saving task', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        loadTasks();
      } catch (error) {
        console.error('Error deleting task', error);
      }
    }
  };

  const filteredTasks = filterStatus === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === filterStatus);

  if (loading) return <div className="tasks-loading">Loading tasks...</div>;

  return (
    <div className="tasks-container">
      <header className="page-header">
        <div className="header-title">
          <h1>Tasks</h1>
          <p className="text-muted">Track and prioritize your work items.</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <select
              className="input filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>
          <Button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} icon={<span>+</span>}>New Task</Button>
        </div>
      </header>

      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id}>
                <td className="task-cell">
                  <div className="task-title-cell">{task.title}</div>
                  <div className="task-desc-cell">{task.description}</div>
                </td>
                <td><Badge type={getPriorityBadge(task.priority)}>{task.priority}</Badge></td>
                <td><Badge type={getStatusBadge(task.status)}>{task.status}</Badge></td>
                <td className="date-cell">{task.dueDate}</td>
                <td className="text-right actions-cell">
                  <Button variant="ghost" onClick={() => { setEditingTask(task); setIsModalOpen(true); }}>Edit</Button>
                  <Button variant="ghost" className="btn-danger-text" onClick={() => handleDelete(task.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTasks.length === 0 && <div className="empty-state">No tasks found.</div>}
      </div>

      {isModalOpen && (
        <Modal
          title={editingTask ? 'Edit Task' : 'Create Task'}
          onClose={() => setIsModalOpen(false)}
        >
          <TaskForm
            initialData={editingTask}
            onSubmit={handleSaveTask}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

const TaskForm: React.FC<{ initialData: Task | null; onSubmit: (data: any) => void; onCancel: () => void }> = ({ initialData, onSubmit, onCancel }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    projectId: initialData?.projectId || '',
    priority: initialData?.priority || 'MEDIUM',
    status: initialData?.status || 'PENDING',
    dueDate: initialData?.dueDate || '',
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetchProjects();
        setProjects(res.data);
      } catch (error) {
        console.error('Error loading projects', error);
      } finally {
        setLoadingProjects(false);
      }
    };
    loadProjects();
  }, []);

  return (
    <div className="task-form">
      <Input
        label="Task Title"
        value={formData.title}
        onChange={e => setFormData({ ...formData, title: e.target.value })}
        placeholder="What needs to be done?"
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        placeholder="Add more details..."
      />
      <div className="form-row">
        <div className="input-group">
          <label className="input-label">Project</label>
          {loadingProjects ? (
            <select className="input" disabled>
              <option>Loading...</option>
            </select>
          ) : (
            <select
              className="input"
              value={formData.projectId}
              onChange={e => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Select a Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>
      <div className="form-row">
        <div className="input-group">
          <label className="input-label">Priority</label>
          <select
            className="input"
            value={formData.priority}
            onChange={e => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Status</label>
          <select
            className="input"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
      </div>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save Task</Button>
      </div>
    </div>
  );
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'URGENT': return 'error';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    default: return 'muted';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'PENDING': return 'muted';
    case 'CANCELED': return 'error';
    default: return 'muted';
  }
};

export default Tasks;
