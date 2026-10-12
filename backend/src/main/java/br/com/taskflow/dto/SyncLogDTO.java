package br.com.taskflow.dto;

import br.com.taskflow.entity.SyncLog;
import java.time.OffsetDateTime;
import java.util.UUID;

public class SyncLogDTO {
    private UUID id;
    private OffsetDateTime syncDate;
    private String status;
    private int repositoriesSynced;
    private int issuesSynced;
    private String errorMessage;

    public static SyncLogDTO from(SyncLog log) {
        SyncLogDTO dto = new SyncLogDTO();
        dto.setId(log.getId());
        dto.setSyncDate(log.getSyncDate());
        dto.setStatus(log.getStatus());
        dto.setRepositoriesSynced(log.getRepositoriesSynced() == null ? 0 : log.getRepositoriesSynced());
        dto.setIssuesSynced(log.getIssuesSynced() == null ? 0 : log.getIssuesSynced());
        dto.setErrorMessage(log.getErrorMessage());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public OffsetDateTime getSyncDate() { return syncDate; }
    public void setSyncDate(OffsetDateTime syncDate) { this.syncDate = syncDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getRepositoriesSynced() { return repositoriesSynced; }
    public void setRepositoriesSynced(int repositoriesSynced) { this.repositoriesSynced = repositoriesSynced; }
    public int getIssuesSynced() { return issuesSynced; }
    public void setIssuesSynced(int issuesSynced) { this.issuesSynced = issuesSynced; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}