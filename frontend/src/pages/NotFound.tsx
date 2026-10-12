import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <PageHeader
        title="Página não encontrada"
        description="O endereço acessado não existe ou foi movido."
      />
      <div className="notfound-panel">
        <span className="notfound-code">404</span>
        <p className="text-muted">
          Verifique a URL ou volte ao painel para continuar explorando os repositórios.
        </p>
        <div className="notfound-actions">
          <Button onClick={() => navigate('/')}>Voltar ao Painel</Button>
          <Button variant="secondary" onClick={() => navigate('/repositories')}>
            Ver repositórios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;