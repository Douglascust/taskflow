package br.com.taskflow.controller;

import br.com.taskflow.dto.SyncLogDTO;
import br.com.taskflow.entity.SyncLog;
import br.com.taskflow.repository.SyncLogRepository;
import br.com.taskflow.service.GitHubIntegrationService;
import br.com.taskflow.service.GitHubIntegrationService.SyncResult;
import br.com.taskflow.service.IntegrationStatusService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/integration")
public class IntegrationController {
    private final GitHubIntegrationService integrationService;
    private final IntegrationStatusService statusService;
    private final SyncLogRepository syncLogRepository;

    public IntegrationController(
            GitHubIntegrationService integrationService,
            IntegrationStatusService statusService,
            SyncLogRepository syncLogRepository) {
        this.integrationService = integrationService;
        this.statusService = statusService;
        this.syncLogRepository = syncLogRepository;
    }

    @PostMapping("/sync")
    public ResponseEntity<SyncResult> triggerSync() {
        SyncResult result = integrationService.synchronize();
        return ResponseEntity.ok(result);
    }

    /**
     * Estado real da conexão/autenticação, conta conectada, rate limit,
     * configuração de sync e última sincronização. Nunca expõe o token.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(statusService.getStatus());
    }

    /**
     * Histórico de sincronizações a partir da tabela sync_logs.
     */
    @GetMapping("/history")
    public List<SyncLogDTO> history(@RequestParam(defaultValue = "10") int limit) {
        int capped = Math.max(1, Math.min(limit, 50));
        PageRequest page = PageRequest.of(0, capped, Sort.by("syncDate").descending());
        return syncLogRepository.findAll(page)
                .getContent()
                .stream()
                .map(SyncLogDTO::from)
                .toList();
    }
}
