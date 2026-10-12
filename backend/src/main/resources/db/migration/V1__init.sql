-- V1__init.sql
-- Create tables for TaskFlow application

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    start_date DATE,
    due_date DATE,
    status VARCHAR(20) NOT NULL,
    color VARCHAR(20),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    due_date DATE,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
