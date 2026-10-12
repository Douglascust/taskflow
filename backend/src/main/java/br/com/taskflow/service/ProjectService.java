package br.com.taskflow.service;

import br.com.taskflow.dto.CreateProjectDTO;
import br.com.taskflow.dto.ProjectDTO;
import br.com.taskflow.dto.UpdateProjectDTO;
import br.com.taskflow.entity.Project;
import br.com.taskflow.exception.ResourceNotFoundException;
import br.com.taskflow.repository.ProjectRepository;
import br.com.taskflow.enums.ProjectStatus;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    private ProjectDTO toDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setStartDate(project.getStartDate());
        dto.setDueDate(project.getDueDate());
        dto.setStatus(project.getStatus());
        dto.setColor(project.getColor());
        dto.setUpdatedAt(project.getUpdatedAt());
        dto.setGithubRepoId(project.getGithubRepoId());
        dto.setGithubRepoName(project.getGithubRepoName());
        dto.setLanguage(project.getLanguage());
        dto.setGithubPushedAt(project.getGithubPushedAt());
        return dto;
    }

    public List<ProjectDTO> getAll() {
        return projectRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ProjectDTO getById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado"));
        return toDTO(project);
    }

    @Transactional
    public ProjectDTO create(CreateProjectDTO dto) {
        Project project = new Project();
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setDueDate(dto.getDueDate());
        project.setStatus(ProjectStatus.valueOf(dto.getStatus().toUpperCase()));
        project.setColor(dto.getColor());
        project.setCreatedAt(OffsetDateTime.now());
        project.setUpdatedAt(OffsetDateTime.now());
        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    @Transactional
    public ProjectDTO update(UUID id, UpdateProjectDTO dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado"));
        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) project.setStartDate(dto.getStartDate());
        if (dto.getDueDate() != null) project.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) project.setStatus(ProjectStatus.valueOf(dto.getStatus().toUpperCase()));
        if (dto.getColor() != null) project.setColor(dto.getColor());
        project.setUpdatedAt(OffsetDateTime.now());
        Project saved = projectRepository.save(project);
        return toDTO(saved);
    }

    @Transactional
    public void delete(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado"));
        projectRepository.delete(project);
    }
}
