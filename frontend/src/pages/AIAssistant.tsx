import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { analyzeRepository, fetchRepositories } from '../api';
import './AIAssistant.css';

interface Message {
  role: 'user' | 'ai' | 'error';
  text: string;
}

const EXAMPLE_QUERIES = [
  'Explique a arquitetura deste projeto.',
  'Quais tecnologias são usadas aqui?',
  'Como o backend se comunica com o banco de dados?',
];

const AIAssistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [repos, setRepos] = useState<{ id: string; name: string }[]>([]);
  const [reposError, setReposError] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRepositories()
      .then((res) => {
        const data = res.data.map((r: { id: string; name: string }) => ({ id: r.id, name: r.name }));
        setRepos(data);
        const fromQuery = searchParams.get('repoId');
        if (fromQuery && data.some((r: { id: string }) => r.id === fromQuery)) {
          setSelectedRepo(fromQuery);
        }
      })
      .catch(() => setReposError('Não foi possível carregar os repositórios.'));
  }, [searchParams]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const prompt = (text ?? query).trim();
    if (!selectedRepo || !prompt || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: prompt }]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await analyzeRepository(selectedRepo, prompt);
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.response }]);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } | string } };
      const errorMessage =
        (typeof axiosErr.response?.data === 'object' && axiosErr.response?.data?.message) ||
        (typeof axiosErr.response?.data === 'string' ? axiosErr.response.data : null) ||
        'Falha ao conectar com o assistente de IA.';
      setMessages((prev) => [...prev, { role: 'error', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      <Card className="ai-header">
        <div>
          <h2>Assistente técnico</h2>
          <p className="text-muted">Pergunte sobre a arquitetura e o código do repositório selecionado.</p>
        </div>
        <div className="repo-selector">
          <label htmlFor="repo-select">Repositório</label>
          <select
            id="repo-select"
            className="input"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            disabled={repos.length === 0}
          >
            <option value="">Escolha um repositório</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {reposError && <div className="error-banner">{reposError}</div>}

      <div className="chat-window" ref={chatRef}>
        {messages.length === 0 && !isLoading && (
          <EmptyState
            title="Comece uma análise"
            description="Selecione um repositório e envie uma pergunta técnica sobre o código."
            action={
              <div className="example-queries">
                {EXAMPLE_QUERIES.map((example) => (
                  <Badge key={example} type="muted" onClick={() => setQuery(example)}>
                    {example}
                  </Badge>
                ))}
              </div>
            }
          />
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="message-bubble loading">Analisando o código…</div>
          </div>
        )}
      </div>

      <div className="input-area">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Faça uma pergunta técnica..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={() => handleSend()} disabled={isLoading || !selectedRepo || !query.trim()} loading={isLoading}>
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default AIAssistant;
