import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchRepository } from '../api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { IconExternal } from '../components/icons';
import { Repository } from '../types';
import { formatDate, statusBadgeType } from '../status';
import './RepositoryDetail.css';

const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Identificador inválido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRepository(id);
      setRepo(res.data);
    } catch {
      setError('Repositório não encontrado ou indisponível.');
      setRepo(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="detail-container">
        <div className="skeleton detail-title-skeleton" />
        <div className="skeleton detail-panel-skeleton" />
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="detail-container">
        <PageHeader title="Repositório" />
        <ErrorState message={error || 'Repositório não encontrado.'} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="detail-container">
      <PageHeader
        title={repo.name}
        description={repo.githubRepoName || 'Repositório sincronizado'}
        actions={
          <>
            {repo.githubRepoName && (
              <Button
                variant="secondary"
                icon={<IconExternal />}
                onClick={() =>
                  window.open(`https://github.com/${repo.githubRepoName}`, '_blank', 'noopener,noreferrer')
                }
              >
                Abrir no GitHub
              </Button>
            )}
            <Button onClick={() => navigate(`/assistant?repoId=${repo.id}`)}>Analisar com IA</Button>
          </>
        }
      />

      <Card className="detail-panel">
        <div className="detail-status">
          <Badge type={statusBadgeType(repo.status)}>{repo.status || '—'}</Badge>
        </div>
        <p className="detail-description">{repo.description || 'Sem descrição disponível.'}</p>
        <dl className="detail-meta">
          <div>
            <dt>GitHub</dt>
            <dd>{repo.githubRepoName || '—'}</dd>
          </div>
          <div>
            <dt>Criado</dt>
            <dd>{formatDate(repo.createdAt)}</dd>
          </div>
          <div>
            <dt>Atualizado</dt>
            <dd>{formatDate(repo.updatedAt)}</dd>
          </div>
          <div>
            <dt>Início</dt>
            <dd>{formatDate(repo.startDate)}</dd>
          </div>
          <div>
            <dt>Prazo</dt>
            <dd>{formatDate(repo.dueDate)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
};

export default RepositoryDetail;
