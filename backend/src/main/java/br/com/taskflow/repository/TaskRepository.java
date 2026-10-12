package br.com.taskflow.repository;

import br.com.taskflow.entity.Task;
import br.com.taskflow.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findAllByProjectId(UUID projectId, Pageable pageable);
    Page<Task> findAllByStatus(TaskStatus status, Pageable pageable);
    Page<Task> findAllByPriority(br.com.taskflow.enums.TaskPriority priority, Pageable pageable);
    List<Task> findByDueDateBeforeAndStatusNot(LocalDate date, TaskStatus excludedStatus);
    // Search by title containing (case-insensitive)
    Page<Task> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Optional<Task> findByGithubIssueId(Long githubIssueId);
}
