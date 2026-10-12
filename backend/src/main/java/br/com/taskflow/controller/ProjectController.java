package br.com.taskflow.controller;

import br.com.taskflow.dto.CreateProjectDTO;
import br.com.taskflow.dto.ProjectDTO;
import br.com.taskflow.dto.UpdateProjectDTO;
import br.com.taskflow.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public List<ProjectDTO> list() {
        return projectService.getAll();
    }

    @GetMapping("/{id}")
    public ProjectDTO get(@PathVariable UUID id) {
        return projectService.getById(id);
    }

    @PostMapping
    public ResponseEntity<ProjectDTO> create(@Valid @RequestBody CreateProjectDTO dto) {
        ProjectDTO created = projectService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ProjectDTO update(@PathVariable UUID id, @RequestBody UpdateProjectDTO dto) {
        return projectService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
