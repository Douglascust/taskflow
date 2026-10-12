import React, { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { fetchTasks, changeTaskStatus } from '../api';
import { Badge } from '../components/Badge';
import { Task, TaskStatus } from '../types';
import './Kanban.css';

const STATUS_COLUMNS: TaskStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELED',
];

const Kanban: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await fetchTasks();
      setTasks(res.data);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const previousTasks = tasks;

    setUpdatingTaskId(draggableId);

    // Atualiza a interface antes da resposta da API.
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === draggableId
          ? { ...task, status: newStatus }
          : task
      )
    );

    try {
      await changeTaskStatus(draggableId, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar o status da tarefa:', error);

      // Restaura o estado anterior e tenta sincronizar com o backend.
      setTasks(previousTasks);
      await loadTasks();
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return <div className="kanban-loading">Carregando quadro...</div>;
  }

  return (
    <div className="kanban-container">
      <header className="page-header">
        <div>
          <h1>Quadro Kanban</h1>
          <p className="text-muted">
            Arraste as tarefas entre as colunas para acompanhar o progresso.
          </p>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {STATUS_COLUMNS.map((status) => (
            <div key={status} className="kanban-column">
              <div className="column-header">
                <span className="column-title">
                  {status.replace('_', ' ')}
                </span>

                <span className="column-count">
                  {tasks.filter((task) => task.status === status).length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    className="column-tasks"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {tasks
                      .filter((task) => task.status === status)
                      .map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                          isDragDisabled={updatingTaskId === task.id}
                        >
                          {(provided) => (
                            <div
                              className={`kanban-card ${
                                updatingTaskId === task.id ? 'updating' : ''
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div
                                className="card-priority-line"
                                style={{
                                  backgroundColor: getPriorityColor(
                                    task.priority
                                  ),
                                }}
                              />

                              <div className="card-content">
                                <div className="card-title">
                                  {task.title}
                                </div>

                                <div className="card-footer">
                                  <span className="card-project">
                                    {task.projectId
                                      ? `${task.projectId.substring(0, 8)}...`
                                      : 'Sem projeto'}
                                  </span>

                                  <Badge
                                    type={getPriorityBadge(task.priority)}
                                  >
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'URGENT':
      return 'var(--color-error)';
    case 'HIGH':
      return 'var(--color-warning)';
    case 'MEDIUM':
      return 'var(--color-info)';
    default:
      return 'var(--color-text-muted)';
  }
};

const getPriorityBadge = (
  priority: string
): 'error' | 'warning' | 'info' | 'muted' => {
  switch (priority) {
    case 'URGENT':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    default:
      return 'muted';
  }
};

export default Kanban;