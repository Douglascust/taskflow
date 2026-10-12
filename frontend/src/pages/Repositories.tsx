import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRepositories } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { IconExternal, IconSearch } from '../components/icons';
import { Repository } from '../types';
import { statusBadgeType } from '../status';
import './Repositories.css';

const Repositories: React.FC = () => {
  const navigate = useNavigate();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRepositories();
      setRepos(res.data);
    } catch {
      setError('Não foi possível carregar os repositórios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRepos = repos.filter((repo) => {
    const q = filter.toLowerCase();
    return (
      repo.name.toLowerCase().includes(q) ||
      repo.githubRepoName?.toLowerCase().includes(q)
    );
  });

  const openGithub = (e: React.MouseEvent, repo: Repository) => {
    e.stopPropagation();
    if (repo.githubRepoName) {
      window.open(`https://github.com/${repo.githubRepoName}`, '_blank', 'noopener,noreferrer');
    }
  };

  const analyze = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigate(`/assistant?repoId=${id}`);
  };

  if (loading) {
    return (
      <div className="repositories-container">
        <PageHeader title="Repositórios" description="Exploração técnica dos projetos GitHub sincronizados." />
        <div className="repos-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton repo-card-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="repositories-container">
        <PageHeader title="Repositórios" />
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="repositories-container">
      <PageHeader
        title="Repositórios"
        description="Exploração técnica dos projetos GitHub sincronizados."
        actions={
          <div className="search-field">
            <IconSearch size={16} />
            <input
              type="search"
              placeholder="Pesquisar repositório..."
              className="search-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        }
      />

      {filteredRepos.length > 0 ? (
        <div className="repos-grid">
          {filteredRepos.map((repo) => (
            <Card
              key={repo.id}
              className="repo-card"
              onClick={() => navigate(`/repositories/${repo.id}`)}
            >
              <div className="repo-card-header">
                <h3>{repo.name}</h3>
                <Badge type={statusBadgeType(repo.status)}>{repo.status || '—'}</Badge>
              </div>
              <p className="repo-description">{repo.description || 'Sem descrição disponível.'}</p>
              <div className="repo-meta">
                {repo.githubRepoName || 'Sem vínculo GitHub'}
              </div>
              <div className="repo-actions" onClick={(e) => e.stopPropagation()}>
                {repo.githubRepoName && (
                  <Button variant="secondary" onClick={(e) => openGithub(e, repo)} icon={<IconExternal />}>
                    GitHub
                  </Button>
                )}
                <Button onClick={(e) => analyze(e, repo.id)}>Analisar</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={filter ? 'Nenhum repositório encontrado' : 'Nenhum repositório sincronizado'}
          description={
            filter
              ? 'Tente outro termo de busca.'
              : 'Use a página de Integração para importar repositórios do GitHub.'
          }
        />
      )}
    </div>
  );
};

export default Repositories;
