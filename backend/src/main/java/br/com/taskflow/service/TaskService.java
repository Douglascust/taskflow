package br.com.taskflow.service;

import br.com.taskflow.dto.CreateTaskDTO;
import br.com.taskflow.dto.TaskDTO;
import br.com.taskflow.dto.UpdateTaskDTO;
import br.com.taskflow.entity.Project;
import br.com.taskflow.entity.Task;
import br.com.taskflow.enums.TaskPriority;
import br.com.taskflow.enums.TaskStatus;
import br.com.taskflow.exception.ResourceNotFoundException;
import br.com.taskflow.repository.ProjectRepository;
import br.com.taskflow.repository.TaskRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private TaskDTO toDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId());
        }
        dto.setPriority(task.getPriority());
        dto.setStatus(task.getStatus());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setDueDate(task.getDueDate());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setGithubIssueUrl(task.getGithubIssueUrl());
        dto.setGithubUpdatedAt(task.getGithubUpdatedAt());
        dto.setGithubClosedAt(task.getGithubClosedAt());
        return dto;
    }

    public List<TaskDTO> getAll() {
        return taskRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public Page<TaskDTO> getAllPaged(Pageable pageable) {
        return taskRepository.findAll(pageable).map(this::toDTO);
    }

    public TaskDTO getById(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada"));
        return toDTO(task);
    }

    @Transactional
    public TaskDTO create(CreateTaskDTO dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto associado não encontrado"));
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setProject(project);
        task.setPriority(TaskPriority.valueOf(dto.getPriority().toUpperCase()));
        task.setStatus(TaskStatus.valueOf(dto.getStatus().toUpperCase()));
        task.setDueDate(dto.getDueDate());
        task.setCreatedAt(OffsetDateTime.now());
        task.setUpdatedAt(OffsetDateTime.now());
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public TaskDTO update(UUID id, UpdateTaskDTO dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada"));
        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getProjectId() != null) {
            Project project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Projeto associado não encontrado"));
            task.setProject(project);
        }
        if (dto.getPriority() != null) task.setPriority(TaskPriority.valueOf(dto.getPriority().toUpperCase()));
        if (dto.getStatus() != null) task.setStatus(TaskStatus.valueOf(dto.getStatus().toUpperCase()));
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        task.setUpdatedAt(OffsetDateTime.now());
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada"));
        taskRepository.delete(task);
    }

    @Transactional
    public TaskDTO changeStatus(UUID id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada"));
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setCompletedAt(OffsetDateTime.now());
        } else {
            task.setCompletedAt(null);
        }
        task.setUpdatedAt(OffsetDateTime.now());
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    @Transactional
    public TaskDTO changePriority(UUID id, TaskPriority priority) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarefa não encontrada"));
        task.setPriority(priority);
        task.setUpdatedAt(OffsetDateTime.now());
        Task saved = taskRepository.save(task);
        return toDTO(saved);
    }

    public List<TaskDTO> getOverdueTasks() {
        LocalDate today = LocalDate.now();
        List<Task> overdue = taskRepository.findByDueDateBeforeAndStatusNot(today, TaskStatus.COMPLETED);
        return overdue.stream().filter(t -> t.getStatus() != TaskStatus.CANCELED).map(this::toDTO).collect(Collectors.toList());
    }
}
