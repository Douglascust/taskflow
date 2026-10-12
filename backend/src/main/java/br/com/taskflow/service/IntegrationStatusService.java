package br.com.taskflow.service;

import br.com.taskflow.dto.SyncLogDTO;
import br.com.taskflow.repository.SyncLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Expõe o estado real da integração GitHub (autenticação, conta conectada,
 * rate limit e última sincronização) sem nunca retornar o token.
 *
 * As chamadas ao GitHub (/user e /rate_limit) são cacheadas por 5 minutos
 * para não consumir a cota da API.
 */
@Service
public class IntegrationStatusService {

    private static final Logger log = LoggerFactory.getLogger(IntegrationStatusService.class);
    private static final long CACHE_TTL_MS = 5 * 60 * 1000L;

    private final GitHubClient githubClient;
    private final SyncLogRepository syncLogRepository;
    private final long syncIntervalMs;

    private final Object cacheLock = new Object();
    private volatile long cacheTimestamp = 0;
    private volatile boolean cacheLoaded = false;
    private volatile String connectionState = "UNREACHABLE";
    private volatile String diagnostic;
    private volatile Map<String, Object> account;
    private volatile Map<String, Object> rateLimit;

    public IntegrationStatusService(
            GitHubClient githubClient,
            SyncLogRepository syncLogRepository,
            @Value("${github.sync.interval:3600000}") String syncInterval) {
        this.githubClient = githubClient;
        this.syncLogRepository = syncLogRepository;
        long parsed = 3600000L;
        try {
            parsed = Long.parseLong(syncInterval);
        } catch (NumberFormatException e) {
            log.warn("github.sync.interval inválido: {}", syncInterval);
        }
        this.syncIntervalMs = parsed;
    }

    public Map<String, Object> getStatus() {
        refreshCacheIfNeeded();

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("authenticated", "CONNECTED".equals(connectionState));
        status.put("connectionState", connectionState);
        status.put("diagnostic", diagnostic);
        status.put("account", account);
        status.put("rateLimit", rateLimit);
        status.put("syncIntervalMs", syncIntervalMs);
        status.put("serverTime", Instant.now().toString());

        syncLogRepository.findTopByOrderBySyncDateDesc()
                .ifPresent(log -> status.put("lastSync", SyncLogDTO.from(log)));

        return status;
    }

    private void refreshCacheIfNeeded() {
        long now = System.currentTimeMillis();
        if (cacheLoaded && now - cacheTimestamp < CACHE_TTL_MS) {
            return;
        }
        synchronized (cacheLock) {
            if (cacheLoaded && System.currentTimeMillis() - cacheTimestamp < CACHE_TTL_MS) {
                return;
            }
            try {
                Map<String, Object> user = githubClient.fetchAuthenticatedUser();
                if (user == null) {
                    connectionState = "AUTH_FAILED";
                    diagnostic = "Token inválido ou expirado (GitHub respondeu 401). Verifique o GITHUB_TOKEN sem compartilhar seu valor.";
                    account = null;
                    rateLimit = null;
                } else {
                    connectionState = "CONNECTED";
                    diagnostic = null;
                    account = slimAccount(user);
                    rateLimit = slimRateLimit(githubClient.fetchRateLimit());
                }
            } catch (Exception e) {
                connectionState = "UNREACHABLE";
                diagnostic = "Não foi possível contatar a API do GitHub: " + e.getMessage();
                account = null;
                rateLimit = null;
            }
            cacheTimestamp = System.currentTimeMillis();
            cacheLoaded = true;
        }
    }

    private Map<String, Object> slimAccount(Map<String, Object> user) {
        Map<String, Object> account = new LinkedHashMap<>();
        account.put("login", user.get("login"));
        account.put("name", user.get("name"));
        account.put("avatarUrl", user.get("avatar_url"));
        account.put("htmlUrl", user.get("html_url"));
        return account;
    }

    private Map<String, Object> slimRateLimit(Map<String, Object> core) {
        if (core == null) {
            return null;
        }
        Map<String, Object> rateLimit = new LinkedHashMap<>();
        rateLimit.put("limit", core.get("limit"));
        rateLimit.put("remaining", core.get("remaining"));
        rateLimit.put("reset", core.get("reset"));
        return rateLimit;
    }
}