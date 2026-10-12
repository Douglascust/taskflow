-- V2__github_integration.sql
-- Add GitHub metadata to projects and tasks to support synchronization

ALTER TABLE projects ADD COLUMN github_repo_id BIGINT;
ALTER TABLE projects ADD COLUMN github_repo_name VARCHAR(255);

ALTER TABLE tasks ADD COLUMN github_issue_id BIGINT;
ALTER TABLE tasks ADD COLUMN github_issue_url TEXT;

-- Unique constraints to prevent duplicate imports from GitHub
CREATE UNIQUE INDEX idx_github_repo_unique ON projects(github_repo_id) WHERE github_repo_id IS NOT NULL;
CREATE UNIQUE INDEX idx_github_issue_unique ON tasks(github_issue_id) WHERE github_issue_id IS NOT NULL;

-- Table for tracking synchronization history
CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED', 'PARTIAL'
    repositories_synced INT DEFAULT 0,
    issues_synced INT DEFAULT 0,
    error_message TEXT
);
