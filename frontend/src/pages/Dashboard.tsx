import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchDashboardSummary,
  fetchIntegrationStatus,
  fetchRepositories,
  fetchTasks,
} from '../api';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { DashboardSummary, IntegrationStatus, Repository, SyncLogEntry, Task } from '../types';
import { formatDate, formatDateTime, syncStatusBadgeType, syncStatusLabel } from '../status';
import './Dashboard.css';

const RECENT_REPOS_LIMIT = 6;
const ACTIVITY_LIMIT = 8;

/** Timestamp real (ms) de uma data ISO; 0 quando ausente/inválida. */
const activityTimestamp = (value?: string | null): number => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [integration, setIntegration] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Dados críticos do painel: se falharem, exibimos estado de erro com retry.
    try {
      const [summaryRes, reposRes] = await Promise.all([
        fetchDashboardSummary(),
        fetchRepositories(),
      ]);
      setSummary(summaryRes.data);
      setRepos(reposRes.data);
    } catch {
      setError('Não foi possível carregar o painel. Verifique a conexão com o backend.');
      setLoading(false);
      return;
    }

    // Dados complementares (atividade e última sincronização): falha não
    // impede o painel de renderizar — apenas omite as seções correspondentes.
    const [tasksResult, statusResult] = await Promise.allSettled([
      fetchTasks(),
      fetchIntegrationStatus(),
    ]);
    if (tasksResult.status === 'fulfilled') {
      setTasks(tasksResult.value.data);
    }
    if (statusResult.status === 'fulfilled') {
      setIntegration(statusResult.value.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <PageHeader title="Painel" description="Análise técnica dos repositórios GitHub sincronizados." />
        <div className="dashboard-loading">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton stat-card-skeleton" />
          ))}
        </div>
        <div className="dashboard-main-grid">
          <div className="skeleton panel-skeleton" />
          <div className="skeleton panel-skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <PageHeader title="Painel" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  const openIssues = (summary?.pending ?? 0) + (summary?.inProgress ?? 0);
  const closedIssues = summary?.completed ?? 0;
  const syncedRepos = repos.filter((repo) => repo.githubRepoId != null).length;
  const lastSync: SyncLogEntry | null = integration?.lastSync ?? null;

  // Repositórios ordenados pela última atividade real no GitHub (push),
  // com fallback para a data de importação (rotulada como tal).
  const recentRepos = [...repos]
    .sort(
      (a, b) =>
        activityTimestamp(b.githubPushedAt ?? b.createdAt) -
        activityTimestamp(a.githubPushedAt ?? a.createdAt)
    )
    .slice(0, RECENT_REPOS_LIMIT);

  // Agregação real das linguagens primárias informadas pelo GitHub.
  const languageCounts = new Map<string, number>();
  repos.forEach((repo) => {
    if (repo.language) {
      languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
    }
  });
  const languages = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxLanguageCount = languages.length > 0 ? languages[0][1] : 1;

  // Atividade recente: issues reais ordenadas pela última atualização no GitHub.
  const repoNameById = new Map(repos.map((repo) => [repo.id, repo.name]));
  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        activityTimestamp(b.githubUpdatedAt ?? b.createdAt) -
        activityTimestamp(a.githubUpdatedAt ?? a.createdAt)
    )
    .slice(0, ACTIVITY_LIMIT);

  return (
    <div className="dashboard-container">
      <PageHeader
        title="Painel"
        description="Dados técnicos dos repositórios sincronizados com o GitHub."
      />

      <div className="stat-grid">
        <StatCard title="Repositórios sincronizados" value={syncedRepos} accent="info" />
        <StatCard title="Issues abertas" value={openIssues} accent="warning" />
        <StatCard title="Issues fechadas" value={closedIssues} accent="success" />
        <SyncStatCard lastSync={lastSync} />
      </div>

      <div className="dashboard-main-grid">
        <Card className="panel-card">
          <div className="panel-card-header">
            <h3>Repositórios recentes</h3>
            <Link to="/repositories" className="panel-link">
              Ver todos
            </Link>
          </div>
          {recentRepos.length > 0 ? (
            <div className="repos-list">
              {recentRepos.map((repo) => (
                <button
                  type="button"
                  key={repo.id}
                  className="repo-item"
                  onClick={() => navigate(`/repositories/${repo.id}`)}
                >
                  <div className="repo-info">
                    <span className="repo-name">{repo.name}</span>
                    <span className="repo-detail">
                      {repo.githubRepoName || 'Sem vínculo GitHub'}
                    </span>
                  </div>
                  <div className="repo-item-right">
                    {repo.language && <span className="language-chip">{repo.language}</span>}
                    <span className="repo-date">
                      {formatDate(repo.githubPushedAt ?? repo.createdAt)}
                      <span className="repo-date-label">
                        {repo.githubPushedAt ? 'última push' : 'importado'}
                      </span>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum repositório importado"
              description="Sincronize a conta GitHub na página de Integração."
            />
          )}
        </Card>

        <Card className="panel-card">
          <div className="panel-card-header">
            <h3>Linguagens</h3>
          </div>
          {languages.length > 0 ? (
            <div className="lang-list">
              {languages.map(([language, count]) => (
                <div key={language} className="lang-row">
                  <div className="lang-row-top">
                    <span className="lang-name">{language}</span>
                    <span className="lang-count">
                      {count} {count === 1 ? 'repositório' : 'repositórios'}
                    </span>
                  </div>
                  <div className="lang-bar">
                    <div
                      className="lang-bar-fill"
                      style={{ width: `${Math.round((count / maxLanguageCount) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Linguagens ainda não disponíveis"
              description="Execute uma sincronização na página de Integração para coletar os dados de linguagem dos repositórios."
            />
          )}
        </Card>
      </div>

      <Card className="panel-card">
        <div className="panel-card-header">
          <h3>Atividade recente</h3>
        </div>
        {recentTasks.length > 0 ? (
          <ul className="activity-list">
            {recentTasks.map((task) => (
              <li key={task.id} className="activity-item">
                <span
                  className={`activity-dot ${
                    task.status === 'COMPLETED' ? 'closed' : 'open'
                  }`}
                  aria-hidden="true"
                />
                <div className="activity-info">
                  <span className="activity-title">
                    {task.githubIssueUrl ? (
                      <a href={task.githubIssueUrl} target="_blank" rel="noreferrer">
                        {task.title}
                      </a>
                    ) : (
                      task.title
                    )}
                  </span>
                  <span className="activity-meta">
                    {task.projectId
                      ? repoNameById.get(task.projectId) ?? 'Projeto removido'
                      : 'Sem repositório'}
                  </span>
                </div>
                <Badge type={task.status === 'COMPLETED' ? 'success' : 'info'}>
                  {task.status === 'COMPLETED' ? 'Fechada' : 'Aberta'}
                </Badge>
                <span
                  className="activity-date"
                  title={
                    task.githubUpdatedAt
                      ? 'Atualizada no GitHub'
                      : 'Importada na sincronização'
                  }
                >
                  {formatDateTime(task.githubUpdatedAt ?? task.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Nenhuma atividade registrada"
            description="As issues dos repositórios sincronizados aparecerão aqui."
          />
        )}
      </Card>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; accent: string }> = ({
  title,
  value,
  accent,
}) => (
  <Card className={`stat-card ${accent}`}>
    <span className="stat-title">{title}</span>
    <div className="stat-value">{value}</div>
  </Card>
);

const SyncStatCard: React.FC<{ lastSync: SyncLogEntry | null }> = ({ lastSync }) => (
  <Card className="stat-card sync">
    <span className="stat-title">Última sincronização</span>
    {lastSync ? (
      <>
        <div className="stat-value stat-value-sm">{formatDateTime(lastSync.syncDate)}</div>
        <div className="stat-sub">
          <Badge type={syncStatusBadgeType(lastSync.status)}>
            {syncStatusLabel(lastSync.status)}
          </Badge>
          <span className="text-muted">
            {lastSync.repositoriesSynced} repos · {lastSync.issuesSynced} issues
          </span>
        </div>
      </>
    ) : (
      <div className="stat-value stat-value-sm text-muted">Nunca</div>
    )}
  </Card>
);

export default Dashboard;
