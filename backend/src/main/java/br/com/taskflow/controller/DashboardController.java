package br.com.taskflow.controller;

import br.com.taskflow.dto.TaskDTO;
import br.com.taskflow.service.TaskService;
import br.com.taskflow.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        long totalProjects = projectService.getAll().size();
        List<TaskDTO> allTasks = taskService.getAll();
        long totalTasks = allTasks.size();
        long pending = allTasks.stream().filter(t -> t.getStatus().name().equals("PENDING")).count();
        long inProgress = allTasks.stream().filter(t -> t.getStatus().name().equals("IN_PROGRESS")).count();
        long completed = allTasks.stream().filter(t -> t.getStatus().name().equals("COMPLETED")).count();
        long canceled = allTasks.stream().filter(t -> t.getStatus().name().equals("CANCELED")).count();
        long overdue = taskService.getOverdueTasks().size();
        double percentComplete = totalTasks == 0 ? 0.0 : (double) completed / totalTasks * 100.0;
        Map<String, Object> map = new HashMap<>();
        map.put("totalProjects", totalProjects);
        map.put("totalTasks", totalTasks);
        map.put("pending", pending);
        map.put("inProgress", inProgress);
        map.put("completed", completed);
        map.put("canceled", canceled);
        map.put("overdue", overdue);
        map.put("percentComplete", percentComplete);
        return map;
    }

    @GetMapping("/tasks-by-status")
    public Map<String, Long> getTasksByStatus() {
        List<TaskDTO> allTasks = taskService.getAll();
        Map<String, Long> result = new HashMap<>();
        for (TaskDTO t : allTasks) {
            String key = t.getStatus().name();
            result.put(key, result.getOrDefault(key, 0L) + 1);
        }
        return result;
    }

    @GetMapping("/upcoming-deadlines")
    public List<TaskDTO> getUpcomingDeadlines() {
        // Return tasks due in next 7 days and not completed/canceled
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate limit = today.plusDays(7);
        return taskService.getAll().stream()
                .filter(t -> t.getDueDate() != null && !t.getStatus().name().equals("COMPLETED") && !t.getStatus().name().equals("CANCELED"))
                .filter(t -> !t.getDueDate().isBefore(today) && !t.getDueDate().isAfter(limit))
                .sorted((a, b) -> a.getDueDate().compareTo(b.getDueDate()))
                .toList();
    }
}
