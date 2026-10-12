package br.com.taskflow.entity;

import br.com.taskflow.enums.TaskPriority;
import br.com.taskflow.enums.TaskStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "github_issue_id")
    private Long githubIssueId;

    @Column(name = "github_issue_url")
    private String githubIssueUrl;

    @Column(name = "github_updated_at")
    private OffsetDateTime githubUpdatedAt;

    @Column(name = "github_closed_at")
    private OffsetDateTime githubClosedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
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

    public Long getGithubIssueId() { return githubIssueId; }
    public void setGithubIssueId(Long githubIssueId) { this.githubIssueId = githubIssueId; }

    public String getGithubIssueUrl() { return githubIssueUrl; }
    public void setGithubIssueUrl(String githubIssueUrl) { this.githubIssueUrl = githubIssueUrl; }
    public OffsetDateTime getGithubUpdatedAt() { return githubUpdatedAt; }
    public void setGithubUpdatedAt(OffsetDateTime githubUpdatedAt) { this.githubUpdatedAt = githubUpdatedAt; }
    public OffsetDateTime getGithubClosedAt() { return githubClosedAt; }
    public void setGithubClosedAt(OffsetDateTime githubClosedAt) { this.githubClosedAt = githubClosedAt; }
}
