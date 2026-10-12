package br.com.taskflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AIClient {
    private final RestTemplate restTemplate;
    private final String endpoint;
    private final String model;
    private final String apiKey;

    public AIClient(RestTemplate restTemplate,
                   @Value("${ai.endpoint:http://localhost:11434/api/generate}") String endpoint,
                   @Value("${ai.model:llama3}") String model,
                   @Value("${ai.api-key:}") String apiKey) {
        this.restTemplate = restTemplate;
        this.endpoint = endpoint;
        this.model = model;
        this.apiKey = apiKey;
    }

    public String generateResponse(String prompt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (!apiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + apiKey);
            }

            // This structure is compatible with Ollama /api/generate
            Map<String, Object> requestBody = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(endpoint, entity, Map.class);

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("response")) {
                return (String) body.get("response");
            }
        } catch (Exception e) {
            throw new RuntimeException("AI Model Error: " + e.getMessage());
        }
        return "No response received from AI model.";
    }
}
