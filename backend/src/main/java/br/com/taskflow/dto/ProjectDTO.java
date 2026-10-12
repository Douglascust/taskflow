package br.com.taskflow.dto;

import br.com.taskflow.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class ProjectDTO {
    private UUID id;
    private String name;
    private String description;
    private OffsetDateTime createdAt;
    private LocalDate startDate;
    private LocalDate dueDate;
    private ProjectStatus status;
    private String color;
    private OffsetDateTime updatedAt;
    private Long githubRepoId;
    private String githubRepoName;
    private String language;
    private OffsetDateTime githubPushedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getGithubRepoId() { return githubRepoId; }
    public void setGithubRepoId(Long githubRepoId) { this.githubRepoId = githubRepoId; }
    public String getGithubRepoName() { return githubRepoName; }
    public void setGithubRepoName(String githubRepoName) { this.githubRepoName = githubRepoName; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public OffsetDateTime getGithubPushedAt() { return githubPushedAt; }
    public void setGithubPushedAt(OffsetDateTime githubPushedAt) { this.githubPushedAt = githubPushedAt; }
}
