package br.com.taskflow.controller;

import br.com.taskflow.service.AIAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIController {
    private final AIAnalysisService aiAnalysisService;

    public AIController(AIAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(@RequestBody Map<String, String> request) {
        String repoIdStr = request.get("repoId");
        String query = request.get("query");

        if (repoIdStr == null || query == null) {
            return ResponseEntity.badRequest().body("Missing repoId or query");
        }

        try {
            UUID repoId = UUID.fromString(repoIdStr);
            String response = aiAnalysisService.analyzeRepository(repoId, query);
            return ResponseEntity.ok(Map.of("response", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid repoId format");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("AI Analysis failed: " + e.getMessage());
        }
    }
}
