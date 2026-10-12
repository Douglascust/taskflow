package br.com.taskflow.entity;

import br.com.taskflow.enums.ProjectStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status = ProjectStatus.PLANNED;

    private String color;

    @Column(name = "github_repo_id")
    private Long githubRepoId;

    @Column(name = "github_repo_name")
    private String githubRepoName;

    @Column(length = 100)
    private String language;

    @Column(name = "github_pushed_at")
    private OffsetDateTime githubPushedAt;

    @Column(name = "updated_at", nullable = false)

    private OffsetDateTime updatedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

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

    public Long getGithubRepoId() { return githubRepoId; }
    public void setGithubRepoId(Long githubRepoId) { this.githubRepoId = githubRepoId; }

    public String getGithubRepoName() { return githubRepoName; }
    public void setGithubRepoName(String githubRepoName) { this.githubRepoName = githubRepoName; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public OffsetDateTime getGithubPushedAt() { return githubPushedAt; }
    public void setGithubPushedAt(OffsetDateTime githubPushedAt) { this.githubPushedAt = githubPushedAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
}
