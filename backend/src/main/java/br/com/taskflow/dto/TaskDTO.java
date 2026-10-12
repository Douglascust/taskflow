package br.com.taskflow.dto;

import br.com.taskflow.enums.TaskPriority;
import br.com.taskflow.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public class TaskDTO {
    private UUID id;
    private String title;
    private String description;
    private UUID projectId;
    private TaskPriority priority;
    private TaskStatus status;
    private OffsetDateTime createdAt;
    private LocalDate dueDate;
    private OffsetDateTime updatedAt;
    private OffsetDateTime completedAt;
    private String githubIssueUrl;
    private OffsetDateTime githubUpdatedAt;
    private OffsetDateTime githubClosedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public TaskPriority getPriority() { return priority; }
    public void setPriority(TaskPriority priority) { this.priority = priority; }
    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public OffsetDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(OffsetDateTime completedAt) { this.completedAt = completedAt; }
    public String getGithubIssueUrl() { return githubIssueUrl; }
    public void setGithubIssueUrl(String githubIssueUrl) { this.githubIssueUrl = githubIssueUrl; }
    public OffsetDateTime getGithubUpdatedAt() { return githubUpdatedAt; }
    public void setGithubUpdatedAt(OffsetDateTime githubUpdatedAt) { this.githubUpdatedAt = githubUpdatedAt; }
    public OffsetDateTime getGithubClosedAt() { return githubClosedAt; }
    public void setGithubClosedAt(OffsetDateTime githubClosedAt) { this.githubClosedAt = githubClosedAt; }
}
