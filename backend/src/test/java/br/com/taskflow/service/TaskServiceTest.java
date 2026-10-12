package br.com.taskflow.service;

import br.com.taskflow.dto.CreateTaskDTO;
import br.com.taskflow.dto.TaskDTO;
import br.com.taskflow.entity.Project;
import br.com.taskflow.entity.Task;
import br.com.taskflow.enums.TaskPriority;
import br.com.taskflow.enums.TaskStatus;
import br.com.taskflow.exception.ResourceNotFoundException;
import br.com.taskflow.repository.ProjectRepository;
import br.com.taskflow.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TaskServiceTest {
    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private TaskService taskService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateTask_Success() {
        UUID projectId = UUID.randomUUID();
        Project project = new Project();
        project.setId(projectId);
        project.setName("Test Project");

        CreateTaskDTO dto = new CreateTaskDTO();
        dto.setTitle("Test Task");
        dto.setProjectId(projectId);
        dto.setPriority("HIGH");
        dto.setStatus("PENDING");

        when(projectRepository.findById(projectId)).thenReturn(Optional.of(project));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return t;
        });

        TaskDTO result = taskService.create(dto);

        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        assertEquals(TaskPriority.HIGH, result.getPriority());
    }

    @Test
    void testCreateTask_ProjectNotFound() {
        UUID projectId = UUID.randomUUID();
        CreateTaskDTO dto = new CreateTaskDTO();
        dto.setProjectId(projectId);

        when(projectRepository.findById(projectId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.create(dto));
    }

    @Test
    void testGetById_NotFound() {
        UUID id = UUID.randomUUID();
        when(taskRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getById(id));
    }

    @Test
    void testChangeStatus_Success() {
        UUID id = UUID.randomUUID();
        Task task = new Task();
        task.setId(id);
        task.setStatus(TaskStatus.PENDING);

        when(taskRepository.findById(id)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        TaskDTO result = taskService.changeStatus(id, TaskStatus.COMPLETED);

        assertEquals(TaskStatus.COMPLETED, result.getStatus());
        verify(taskRepository).save(task);
    }
}
