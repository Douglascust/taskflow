import React, { useCallback, useEffect, useState } from 'react';
import {
  fetchIntegrationStatus,
  fetchRepositories,
  fetchSyncHistory,
  triggerGitHubSync,
} from '../api';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Toast } from '../components/Toast';
import { IconExternal, IconSearch } from '../components/icons';
import { IntegrationStatus, Repository, SyncLogEntry } from '../types';
import {
  describeSyncError,
  formatDate,
  formatDateTime,
  syncStatusBadgeType,
  syncStatusLabel,
} from '../status';
import './GitHubIntegration.css';

interface SyncResult {
  success: boolean;
  reposSynced: number;
  issuesSynced: number;
  errorLog: string;
}

type ToastState = { message: string; variant: 'success' | 'error' } | null;

type ConnectionBadge = { type: 'success' | 'error' | 'warning' | 'muted'; label: string };

const connectionBadge = (status: IntegrationStatus | null): ConnectionBadge => {
  if (!status) return { type: 'muted', label: 'Verificando' };
  if (status.connectionState === 'CONNECTED') return { type: 'success', label: 'Conectado' };
  if (status.connectionState === 'AUTH_FAILED') return { type: 'error', label: 'Não autenticado' };
  return { type: 'warning', label: 'Inacessível' };
};

const GitHubIntegration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [history, setHistory] = useState<SyncLogEntry[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState<ToastState>(null);

  const loadMeta = useCallback(async () => {
    const [statusResult, historyResult] = await Promise.allSettled([
      fetchIntegrationStatus(),
      fetchSyncHistory(10),
    ]);
    if (statusResult.status === 'fulfilled') {
      setStatus(statusResult.value.data);
    }
    if (historyResult.status === 'fulfilled') {
      setHistory(historyResult.value.data);
    }
    setMetaLoading(false);
  }, []);

  const loadRepos = useCallback(async () => {
    try {
      const res = await fetchRepositories();
      setRepos(res.data);
    } catch {
      setRepos([]);
    }
  }, []);

  useEffect(() => {
    loadMeta();
    loadRepos();
  }, [loadMeta, loadRepos]);

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await triggerGitHubSync();
      const data = res.data as SyncResult;
      if (data?.success) {
        setToast({
          message: `Sincronização concluída: ${data.reposSynced} repositório(s), ${data.issuesSynced} issue(s).`,
          variant: 'success',
        });
      } else {
        setToast({
          message:
            describeSyncError(data?.errorLog) ||
            'Sincronização finalizada com erros. Verifique o diagnóstico.',
          variant: 'error',
        });
      }
    } catch {
      setToast({ message: 'Falha na comunicação com o servidor.', variant: 'error' });
    } finally {
      setLoading(false);
      // Atualiza status, histórico e lista após a sincronização.
      loadMeta();
      loadRepos();
    }
  };

  const connection = connectionBadge(status);
  const lastSync: SyncLogEntry | null = status?.lastSync ?? history[0] ?? null;

  const filteredRepos = repos.filter((repo) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      repo.name.toLowerCase().includes(q) ||
      (repo.githubRepoName ?? '').toLowerCase().includes(q) ||
      (repo.language ?? '').toLowerCase().includes(q)
    );
  });

  const openGithub = (fullName: string) => {
    window.open(`https://github.com/${fullName}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="integration-container">
      <PageHeader
        title="Integração GitHub"
        description="Estado da conexão, resultado das sincronizações e repositórios importados."
        actions={
          <Button onClick={handleSync} loading={loading} disabled={loading}>
            {loading ? 'Sincronizando…' : 'Sincronizar agora'}
          </Button>
        }
      />

      {loading && (
        <p className="text-muted sync-hint">
          Consultando o GitHub. Isso pode levar alguns segundos.
        </p>
      )}

      <div className="integration-grid">
        <Card className="integration-card">
          <div className="integration-card-header">
            <h2>Conexão</h2>
            <Badge type={connection.type}>{connection.label}</Badge>
          </div>

          {metaLoading && <p className="text-muted">Verificando credenciais…</p>}

          {!metaLoading && !status && (
            <div className="error-banner">
              Não foi possível verificar o status da integração com o backend.
            </div>
          )}

          {status?.account && (
            <div className="account-row">
              {status.account.avatarUrl && (
                <img
                  className="account-avatar"
                  src={status.account.avatarUrl}
                  alt=""
                  width={40}
                  height={40}
                />
              )}
              <div className="account-info">
                <span className="account-login">{status.account.login}</span>
                {status.account.name && (
                  <span className="account-name text-muted">{status.account.name}</span>
                )}
              </div>
              {status.account.htmlUrl && (
                <Button
                  variant="ghost"
                  icon={<IconExternal />}
                  onClick={() => openGithub(status.account!.htmlUrl!)}
                >
                  Ver perfil
                </Button>
              )}
            </div>
          )}

          {status && status.connectionState !== 'CONNECTED' && status.diagnostic && (
            <div className="error-banner">{status.diagnostic}</div>
          )}

          {status?.rateLimit && status.rateLimit.remaining != null && (
            <div className="status-row text-muted">
              Cota da API: {status.rateLimit.remaining}/{status.rateLimit.limit} requisições
              restantes
              {status.rateLimit.reset
                ? ` · renova em ${formatDateTime(
                    new Date(status.rateLimit.reset * 1000).toISOString()
                  )}`
                : ''}
            </div>
          )}

          {status && (
            <div className="status-row text-muted">
              Sincronização automática a cada {Math.round(status.syncIntervalMs / 60000)} min
            </div>
          )}
        </Card>

        <Card className="integration-card">
          <div className="integration-card-header">
            <h2>Última sincronização</h2>
            {lastSync && (
              <Badge type={syncStatusBadgeType(lastSync.status)}>
                {syncStatusLabel(lastSync.status)}
              </Badge>
            )}
          </div>

          {!metaLoading && !lastSync ? (
            <EmptyState
              title="Nenhuma sincronização registrada"
              description="Execute uma sincronização para começar a registrar o histórico."
            />
          ) : (
            lastSync && (
              <>
                <div className="last-sync-date">{formatDateTime(lastSync.syncDate)}</div>
                <div className="sync-stats">
                  <div className="stat-box">
                    <span className="stat-value">{lastSync.repositoriesSynced}</span>
                    <span className="stat-label">Repositórios</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{lastSync.issuesSynced}</span>
                    <span className="stat-label">Issues</span>
                  </div>
                </div>

                {lastSync.errorMessage && (
                  <div className="error-log">
                    <h3>Diagnóstico</h3>
                    <p>{describeSyncError(lastSync.errorMessage)}</p>
                    <details className="error-raw">
                      <summary>Detalhes técnicos</summary>
                      <pre>{lastSync.errorMessage}</pre>
                    </details>
                  </div>
                )}
              </>
            )
          )}
        </Card>
      </div>

      <Card className="integration-card">
        <div className="integration-card-header">
          <h2>Histórico de sincronizações</h2>
        </div>
        {!metaLoading && history.length === 0 ? (
          <EmptyState
            title="Sem histórico"
            description="Cada sincronização (manual ou automática) será registrada aqui."
          />
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Resultado</th>
                  <th>Repos</th>
                  <th>Issues</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.syncDate)}</td>
                    <td>
                      <Badge type={syncStatusBadgeType(entry.status)}>
                        {syncStatusLabel(entry.status)}
                      </Badge>
                    </td>
                    <td>{entry.repositoriesSynced}</td>
                    <td>{entry.issuesSynced}</td>
                    <td
                      className="history-detail"
                      title={entry.errorMessage ?? undefined}
                    >
                      {entry.errorMessage ? describeSyncError(entry.errorMessage) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="integration-card">
        <div className="integration-card-header">
          <h2>Repositórios sincronizados</h2>
          <span className="text-muted">
            {filteredRepos.length} de {repos.length}
          </span>
        </div>

        <div className="integration-search">
          <IconSearch size={16} />
          <input
            type="search"
            placeholder="Filtrar por nome, proprietário ou linguagem..."
            className="integration-search-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {filteredRepos.length === 0 ? (
          <EmptyState
            title="Nenhum repositório"
            description="Sincronize a conta GitHub para importar repositórios."
          />
        ) : (
          <div className="integration-repo-list">
            {filteredRepos.map((repo) => (
              <div key={repo.id} className="integration-repo-item">
                <div className="integration-repo-info">
                  <span className="integration-repo-name">{repo.name}</span>
                  <span className="integration-repo-owner">
                    {repo.githubRepoName || 'Sem vínculo GitHub'}
                  </span>
                </div>
                {repo.language && <span className="language-chip">{repo.language}</span>}
                <span className="integration-repo-date">
                  {formatDate(repo.githubPushedAt ?? repo.createdAt)}
                </span>
                {repo.githubRepoName && (
                  <Button
                    variant="ghost"
                    icon={<IconExternal />}
                    onClick={() => openGithub(repo.githubRepoName!)}
                  >
                    GitHub
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default GitHubIntegration;
