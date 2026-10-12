import React, { useEffect, useState } from 'react';
import { fetchProjects, createProject, updateProject, deleteProject } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import './Projects.css';

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: string;
  color: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetchProjects();
      setProjects(res.data);
    } catch (error) {
      console.error('Error loading projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (data: any) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await createProject(data);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error saving project', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        loadProjects();
      } catch (error) {
        console.error('Error deleting project', error);
      }
    }
  };

  const openCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  if (loading) return <div className="projects-loading">Loading projects...</div>;

  return (
    <div className="projects-container">
      <header className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="text-muted">Manage your strategic initiatives and goals.</p>
        </div>
        <Button onClick={openCreate} icon={<span>+</span>}>New Project</Button>
      </header>

      <div className="projects-grid">
        {projects.map(project => (
          <Card key={project.id} className="project-card">
            <div className="project-card-header">
              <Badge type={getProjectStatusBadge(project.status)}>{project.status}</Badge>
              <div className="project-actions">
                <Button variant="ghost" onClick={() => openEdit(project)}>Edit</Button>
                <Button variant="ghost" className="btn-danger-text" onClick={() => handleDelete(project.id)}>Delete</Button>
              </div>
            </div>
            <h3 className="project-name">{project.name}</h3>
            <p className="project-desc">{project.description}</p>
            <div className="project-meta">
              <span className="meta-item">📅 {project.startDate}</span>
              <span className="meta-item">🏁 {project.dueDate}</span>
            </div>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <Modal
          title={editingProject ? 'Edit Project' : 'Create Project'}
          onClose={() => setIsModalOpen(false)}
        >
          <ProjectForm
            initialData={editingProject}
            onSubmit={handleSaveProject}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

const ProjectForm: React.FC<{ initialData: Project | null; onSubmit: (data: any) => void; onCancel: () => void }> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate || '',
    dueDate: initialData?.dueDate || '',
    status: initialData?.status || 'PLANNED',
  });

  return (
    <div className="project-form">
      <Input
        label="Project Name"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g. Q4 Infrastructure Migration"
      />
      <Input
        label="Description"
        value={formData.description}
        onChange={e => setFormData({ ...formData, description: e.target.value })}
        placeholder="Enter project goals..."
      />
      <div className="form-row">
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={e => setFormData({ ...formData, startDate: e.target.value })}
        />
        <Input
          label="Due Date"
          type="date"
          value={formData.dueDate}
          onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
        />
      </div>
      <div className="input-group">
        <label className="input-label">Status</label>
        <select
          className="input"
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save Project</Button>
      </div>
    </div>
  );
};

const getProjectStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'PLANNED': return 'info';
    case 'ARCHIVED': return 'muted';
    default: return 'muted';
  }
};

export default Projects;
