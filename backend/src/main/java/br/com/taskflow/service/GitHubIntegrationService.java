package br.com.taskflow.service;

import br.com.taskflow.entity.Project;
import br.com.taskflow.entity.SyncLog;
import br.com.taskflow.entity.Task;
import br.com.taskflow.enums.ProjectStatus;
import br.com.taskflow.enums.TaskStatus;
import br.com.taskflow.repository.ProjectRepository;
import br.com.taskflow.repository.SyncLogRepository;
import br.com.taskflow.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
public class GitHubIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(GitHubIntegrationService.class);

    private final GitHubClient githubClient;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SyncLogRepository syncLogRepository;

    public GitHubIntegrationService(
            GitHubClient githubClient,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            SyncLogRepository syncLogRepository) {
        this.githubClient = githubClient;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.syncLogRepository = syncLogRepository;
    }

    @Scheduled(fixedDelayString = "${github.sync.interval:3600000}")
    public void scheduledSync() {
        synchronize();
    }

    public SyncResult synchronize() {
        int reposSynced = 0;
        int issuesSynced = 0;
        StringBuilder errorLog = new StringBuilder();

        try {
            int page = 1;
            List<Map<String, Object>> repos;

            do {
                repos = githubClient.fetchRepositories(page++);

                if (repos == null) {
                    break;
                }

                for (Map<String, Object> repoData : repos) {
                    try {
                        int repoIssues = syncRepository(repoData);

                        reposSynced++;
                        issuesSynced += repoIssues;

                    } catch (Exception e) {
                        errorLog.append("Repositório ")
                                .append(repoData.get("full_name"))
                                .append(": ")
                                .append(e.getMessage())
                                .append("; ");
                    }
                }

            } while (repos.size() == 100);

            boolean success = errorLog.length() == 0;

            SyncResult result = new SyncResult(
                    success,
                    reposSynced,
                    issuesSynced,
                    errorLog.toString()
            );
            persistSyncLog(reposSynced, issuesSynced, errorLog.toString(), success);
            return result;

        } catch (Exception e) {
            errorLog.append("Falha na sincronização: ")
                    .append(e.getMessage());

            SyncResult result = new SyncResult(
                    false,
                    reposSynced,
                    issuesSynced,
                    errorLog.toString()
            );
            persistSyncLog(reposSynced, issuesSynced, errorLog.toString(), false);
            return result;
        }
    }

    /**
     * Registra a execução na tabela sync_logs (criada na V2).
     * Uma falha no registro nunca interrompe a sincronização.
     */
    private void persistSyncLog(int reposSynced, int issuesSynced, String errorLog, boolean success) {
        try {
            SyncLog syncLog = new SyncLog();
            syncLog.setSyncDate(OffsetDateTime.now());
            if (success) {
                syncLog.setStatus("SUCCESS");
            } else {
                syncLog.setStatus(reposSynced > 0 ? "PARTIAL" : "FAILED");
            }
            syncLog.setRepositoriesSynced(reposSynced);
            syncLog.setIssuesSynced(issuesSynced);
            String error = (errorLog == null || errorLog.isBlank()) ? null : truncate(errorLog, 4000);
            syncLog.setErrorMessage(error);
            syncLogRepository.save(syncLog);
        } catch (Exception e) {
            log.error("Falha ao persistir log de sincronização: {}", e.getMessage());
        }
    }

    private static String truncate(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }

    private int syncRepository(Map<String, Object> repoData) {
        Long githubRepoId = ((Number) repoData.get("id")).longValue();
        String name = (String) repoData.get("name");
        String description = (String) repoData.get("description");
        String fullName = (String) repoData.get("full_name");

        Project project = projectRepository.findByGithubRepoId(githubRepoId)
                .orElseGet(() -> {
                    Project newProject = new Project();
                    newProject.setName(name);
                    newProject.setDescription(description);
                    newProject.setStatus(ProjectStatus.IN_PROGRESS);
                    newProject.setGithubRepoId(githubRepoId);
                    return newProject;
                });

        // Atualiza os dados dos repositórios novos e existentes.
        project.setGithubRepoId(githubRepoId);

        if (fullName != null && !fullName.isBlank()) {
            project.setGithubRepoName(fullName);
        }

        if (description != null) {
            project.setDescription(description);
        }

        // Dados técnicos já presentes no payload de /user/repos (sem chamadas extras à API).
        project.setLanguage((String) repoData.get("language"));
        OffsetDateTime pushedAt = parseGitHubDate((String) repoData.get("pushed_at"));
        if (pushedAt != null) {
            project.setGithubPushedAt(pushedAt);
        }

        projectRepository.save(project);

        return syncIssues(project, repoData);
    }

    @SuppressWarnings("unchecked")
    private int syncIssues(Project project, Map<String, Object> repoData) {
        Map<String, Object> ownerData =
                (Map<String, Object>) repoData.get("owner");

        String owner = (String) ownerData.get("login");
        String repoName = (String) repoData.get("name");

        int page = 1;
        int totalIssues = 0;
        List<Map<String, Object>> issues;

        do {
            issues = githubClient.fetchIssues(owner, repoName, page++);

            if (issues == null) {
                break;
            }

            for (Map<String, Object> issueData : issues) {
                // A API de issues do GitHub também pode retornar pull requests.
                if (issueData.containsKey("pull_request")) {
                    continue;
                }

                syncIssue(project, issueData);
                totalIssues++;
            }

        } while (issues.size() == 100);

        return totalIssues;
    }

    private void syncIssue(Project project, Map<String, Object> issueData) {
        Long githubIssueId =
                ((Number) issueData.get("id")).longValue();

        Task task = taskRepository.findByGithubIssueId(githubIssueId)
                .orElseGet(() -> {
                    Task newTask = new Task();
                    newTask.setProject(project);
                    newTask.setGithubIssueId(githubIssueId);
                    newTask.setGithubIssueUrl(
                            (String) issueData.get("html_url")
                    );
                    return newTask;
                });

        task.setTitle((String) issueData.get("title"));
        task.setDescription((String) issueData.get("body"));
        task.setGithubIssueUrl((String) issueData.get("html_url"));

        // Datas reais da issue no GitHub (payload já em memória).
        OffsetDateTime githubUpdatedAt = parseGitHubDate((String) issueData.get("updated_at"));
        OffsetDateTime githubClosedAt = parseGitHubDate((String) issueData.get("closed_at"));
        task.setGithubUpdatedAt(githubUpdatedAt);
        task.setGithubClosedAt(githubClosedAt);

        String state = (String) issueData.get("state");
        TaskStatus newStatus = "open".equals(state)
                ? TaskStatus.PENDING
                : TaskStatus.COMPLETED;

        if (task.getStatus() != newStatus) {
            task.setStatus(newStatus);
            task.setUpdatedAt(OffsetDateTime.now());
        }

        if (newStatus == TaskStatus.COMPLETED) {
            if (task.getCompletedAt() == null && githubClosedAt != null) {
                task.setCompletedAt(githubClosedAt);
            }
        } else {
            task.setCompletedAt(null);
        }

        taskRepository.save(task);
    }

    private OffsetDateTime parseGitHubDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return OffsetDateTime.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    public static class SyncResult {
        public final boolean success;
        public final int reposSynced;
        public final int issuesSynced;
        public final String errorLog;

        public SyncResult(
                boolean success,
                int repos,
                int issues,
                String error) {
            this.success = success;
            this.reposSynced = repos;
            this.issuesSynced = issues;
            this.errorLog = error;
        }
    }
}