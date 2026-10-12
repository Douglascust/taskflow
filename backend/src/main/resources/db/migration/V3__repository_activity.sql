-- V3__repository_activity.sql
-- Persiste dados técnicos já recebidos da API do GitHub durante a sincronização
-- (aditiva: apenas ADD COLUMN nullable — nenhum dado existente é alterado)

-- Idioma principal e última push real no GitHub (o payload de /user/repos já traz esses campos)
ALTER TABLE projects ADD COLUMN language VARCHAR(100);
ALTER TABLE projects ADD COLUMN github_pushed_at TIMESTAMP WITHOUT TIME ZONE;

-- Datas reais das issues no GitHub (para atividade recente honesta)
ALTER TABLE tasks ADD COLUMN github_updated_at TIMESTAMP WITHOUT TIME ZONE;
ALTER TABLE tasks ADD COLUMN github_closed_at TIMESTAMP WITHOUT TIME ZONE;