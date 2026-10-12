package br.com.taskflow.service;

import br.com.taskflow.entity.Project;
import br.com.taskflow.repository.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIAnalysisService {
    private static final Logger logger = LoggerFactory.getLogger(AIAnalysisService.class);
    private final AIClient aiClient;
    private final GitHubClient githubClient;
    private final ProjectRepository projectRepository;

    public AIAnalysisService(AIClient aiClient, GitHubClient githubClient, ProjectRepository projectRepository) {
        this.aiClient = aiClient;
        this.githubClient = githubClient;
        this.projectRepository = projectRepository;
    }

    public String analyzeRepository(UUID repoId, String query) {
        long startTime = System.currentTimeMillis();
        logger.info("Starting AI analysis for repoId: {} with query: {}", repoId, query);

        Project project = projectRepository.findById(repoId)
                .orElseThrow(() -> new RuntimeException("Repository not found"));

        String fullName = project.getGithubRepoName();

        // Recovery Logic: If githubRepoName is null, try to recover it from GitHub API using githubRepoId
        if (fullName == null || fullName.isBlank()) {
            if (project.getGithubRepoId() != null) {
                try {
                    Map<String, Object> repoData = githubClient.fetchRepositoryById(project.getGithubRepoId());
                    if (repoData != null && repoData.containsKey("full_name")) {
                        fullName = (String) repoData.get("full_name");
                        // Update the database to fix the record for next time
                        project.setGithubRepoName(fullName);
                        projectRepository.save(project);
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Could not recover repository name from GitHub API: " + e.getMessage());
                }
            } else {
                throw new RuntimeException("GitHub repository identifier is missing. Cannot analyze this project.");
            }
        }

        String owner = getOwnerFromRepoName(fullName);
        String repoName = getRepoNameFromFullName(fullName);

        // 1. Get Initial Context (File Tree + README)
        long step1Start = System.currentTimeMillis();
        String fileTree = getRepoStructure(owner, repoName);
        String readme = fetchReadme(owner, repoName);
        logger.info("Step 1 (Structure & README) completed in {}ms", System.currentTimeMillis() - step1Start);

        // 2. Planning Step: Ask AI which files are needed
        long step2Start = System.currentTimeMillis();
        String planningPrompt = String.format(
            "You are a technical architect. The user asks: '%s'.\n\n" +
            "Repository Structure:\n%s\n\n" +
            "README:\n%s\n\n" +
            "Identify the top 3-5 most relevant files from the structure above that are necessary to answer the query. " +
            "Respond ONLY with a comma-separated list of paths. If none, respond 'NONE'.",
            query, fileTree, readme
        );

        String neededFiles = aiClient.generateResponse(planningPrompt);
        logger.info("Step 2 (AI Planning) completed in {}ms. Files requested: {}", System.currentTimeMillis() - step2Start, neededFiles);

        // 3. Context Augmentation: Fetch selected files
        long step3Start = System.currentTimeMillis();
        StringBuilder augmentedContext = new StringBuilder();
        if (neededFiles != null && !"NONE".equalsIgnoreCase(neededFiles.trim())) {
            String[] paths = neededFiles.split(",");
            for (String path : paths) {
                String trimmedPath = path.trim();
                try {
                    String content = githubClient.fetchFileContent(owner, repoName, trimmedPath);
                    augmentedContext.append("\n--- File: ").append(trimmedPath).append("\n")
                                      .append(content).append("\n");
                } catch (Exception e) {
                    augmentedContext.append("\n[Could not fetch file: ").append(trimmedPath).append("]\n");
                }
            }
        }
        logger.info("Step 3 (Context Augmentation) completed in {}ms", System.currentTimeMillis() - step3Start);

        // 4. Final Generation
        long step4Start = System.currentTimeMillis();
        String finalPrompt = String.format(
            "You are an expert software engineer. Analyze the following repository context and answer the user query.\n\n" +
            "User Query: %s\n\n" +
            "Relevant Files:\n%s\n\n" +
            "README:\n%s\n\n" +
            "Answer precisely. If you lack information, state it clearly. Do not invent details.",
            query, augmentedContext, readme
        );

        String result = aiClient.generateResponse(finalPrompt);
        logger.info("Step 4 (Final AI Generation) completed in {}ms", System.currentTimeMillis() - step4Start);

        logger.info("Total AI analysis time for repo {}: {}ms", repoId, System.currentTimeMillis() - startTime);
        return result;
    }

    private String getRepoStructure(String owner, String repo) {
        try {
            List<Map<String, Object>> contents = githubClient.fetchRepositoryContents(owner, repo, "");
            return contents.stream()
                    .map(item -> (String) item.get("name") + (Boolean.TRUE.equals(item.get("type").equals("dir")) ? "/" : ""))
                    .collect(Collectors.joining("\n"));
        } catch (Exception e) {
            return "Could not fetch structure.";
        }
    }

    private String fetchReadme(String owner, String repo) {
        try {
            return githubClient.fetchFileContent(owner, repo, "README.md");
        } catch (Exception e) {
            return "README not found.";
        }
    }

    private String getOwnerFromRepoName(String fullName) {
        return fullName.split("/")[0];
    }

    private String getRepoNameFromFullName(String fullName) {
        String[] parts = fullName.split("/");
        return parts.length > 1 ? parts[1] : fullName;
    }
}
