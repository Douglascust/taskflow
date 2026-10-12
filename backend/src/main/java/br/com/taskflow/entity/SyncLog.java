package br.com.taskflow.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Registro de uma execução de sincronização com o GitHub.
 * Mapeia a tabela sync_logs criada na migração V2.
 */
@Entity
@Table(name = "sync_logs")
public class SyncLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "sync_date", nullable = false)
    private OffsetDateTime syncDate = OffsetDateTime.now();

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS | PARTIAL | FAILED

    @Column(name = "repositories_synced")
    private Integer repositoriesSynced = 0;

    @Column(name = "issues_synced")
    private Integer issuesSynced = 0;

    @Column(name = "error_message")
    private String errorMessage;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public OffsetDateTime getSyncDate() { return syncDate; }
    public void setSyncDate(OffsetDateTime syncDate) { this.syncDate = syncDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getRepositoriesSynced() { return repositoriesSynced; }
    public void setRepositoriesSynced(Integer repositoriesSynced) { this.repositoriesSynced = repositoriesSynced; }
    public Integer getIssuesSynced() { return issuesSynced; }
    public void setIssuesSynced(Integer issuesSynced) { this.issuesSynced = issuesSynced; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}