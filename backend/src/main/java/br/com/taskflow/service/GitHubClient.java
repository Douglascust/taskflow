package br.com.taskflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class GitHubClient {
    private final RestTemplate restTemplate;
    private final String token;

    public GitHubClient(RestTemplate restTemplate, @Value("${github.token}") String token) {
        this.restTemplate = restTemplate;
        this.token = token;
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "token " + token);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return headers;
    }

    public List<Map<String, Object>> fetchRepositories(int page) {
        String url = "https://api.github.com/user/repos?per_page=100&page=" + page;
        return executeGet(url);
    }

    public List<Map<String, Object>> fetchIssues(String owner, String repo, int page) {
        String url = String.format("https://api.github.com/repos/%s/%s/issues?state=all&per_page=100&page=%d", owner, repo, page);
        return executeGet(url);
    }

    /**
     * Returns the authenticated account (login, name, avatar, url) or {@code null}
     * when the token is invalid or expired (HTTP 401). Never exposes the token.
     */
    public Map<String, Object> fetchAuthenticatedUser() {
        String url = "https://api.github.com/user";
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                return null;
            }
            throw new RuntimeException("GitHub API Client Error: " + e.getStatusCode());
        }
    }

    /**
     * Returns rate limit info ({@code resources.core}) or {@code null} on any failure.
     * This endpoint does not count against the API rate limit.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> fetchRateLimit() {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response =
                    restTemplate.exchange("https://api.github.com/rate_limit", HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.get("resources") instanceof Map<?, ?> resources) {
                return (Map<String, Object>) resources.get("core");
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Fetches a single repository by its GitHub ID.
     */
    public Map<String, Object> fetchRepositoryById(Long repoId) {
        String url = String.format("https://api.github.com/repositories/%d", repoId);
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch repository by ID from GitHub: " + e.getMessage());
        }
    }

    /**
     * Fetches the repository contents recursively.
     */
    public List<Map<String, Object>> fetchRepositoryContents(String owner, String repo, String path) {
        String url = String.format("https://api.github.com/repos/%s/%s/contents/%s", owner, repo, path);
        return executeGet(url);
    }

    /**
     * Fetches the raw content of a specific file.
     */
    public String fetchFileContent(String owner, String repo, String path) {
        String url = String.format("https://api.github.com/repos/%s/%s/contents/%s", owner, repo, path);
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("content")) {
                // GitHub returns content as base64 encoded string
                String encodedContent = (String) body.get("content");
                return new String(java.util.Base64.getDecoder().decode(encodedContent.replaceAll("\\s", "")));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch file content from GitHub: " + e.getMessage());
        }
        return null;
    }

    private List<Map<String, Object>> executeGet(String url) {
        try {
            HttpEntity<Void> entity = new HttpEntity<>(createHeaders());
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            return (List<Map<String, Object>>) (Object) response.getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new RuntimeException("GitHub Authentication failed: Invalid or expired token.");
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                String rateLimitReset = e.getResponseHeaders().getFirst("X-RateLimit-Reset");
                if (rateLimitReset != null) {
                    throw new RuntimeException("GitHub Rate Limit exceeded. Please try again after timestamp: " + rateLimitReset);
                }
                throw new RuntimeException("GitHub Access Forbidden: Insufficient permissions.");
            } else if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                throw new RuntimeException("GitHub Resource not found.");
            }
            throw new RuntimeException("GitHub API Client Error: " + e.getStatusCode());
        } catch (HttpServerErrorException e) {
            throw new RuntimeException("GitHub Server Error: " + e.getStatusCode());
        } catch (Exception e) {
            throw new RuntimeException("GitHub API unexpected error: " + e.getMessage());
        }
    }

    public boolean hasMorePages(ResponseEntity<List> response) {
        return response.getHeaders().containsKey("Link");
    }
}
