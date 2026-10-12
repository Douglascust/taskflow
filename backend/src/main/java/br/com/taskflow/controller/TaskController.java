package br.com.taskflow.controller;

import br.com.taskflow.dto.CreateTaskDTO;
import br.com.taskflow.dto.TaskDTO;
import br.com.taskflow.dto.UpdateTaskDTO;
import br.com.taskflow.enums.TaskPriority;
import br.com.taskflow.enums.TaskStatus;
import br.com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    public List<TaskDTO> listAll() {
        return taskService.getAll();
    }

    @GetMapping("/paged")
    public Page<TaskDTO> listPaged(Pageable pageable) {
        return taskService.getAllPaged(pageable);
    }

    @GetMapping("/{id}")
    public TaskDTO get(@PathVariable UUID id) {
        return taskService.getById(id);
    }

    @PostMapping
    public ResponseEntity<TaskDTO> create(@Valid @RequestBody CreateTaskDTO dto) {
        TaskDTO created = taskService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public TaskDTO update(@PathVariable UUID id, @RequestBody UpdateTaskDTO dto) {
        return taskService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public TaskDTO changeStatus(@PathVariable UUID id, @RequestParam String status) {
        TaskStatus newStatus = TaskStatus.valueOf(status.toUpperCase());
        return taskService.changeStatus(id, newStatus);
    }

    @PatchMapping("/{id}/priority")
    public TaskDTO changePriority(@PathVariable UUID id, @RequestParam String priority) {
        TaskPriority newPriority = TaskPriority.valueOf(priority.toUpperCase());
        return taskService.changePriority(id, newPriority);
    }
}
