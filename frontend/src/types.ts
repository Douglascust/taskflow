export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'PLANNING' | 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string | null;
  githubRepoName: string | null;
  githubRepoId: number | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  startDate?: string | null;
  dueDate?: string | null;
  language?: string | null;
  githubPushedAt?: string | null;
}

export interface DashboardSummary {
  totalTasks: number;
  totalProjects: number;
  completed: number;
  pending: number;
  inProgress: number;
  canceled: number;
  overdue: number;
  percentComplete: number;
}

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  githubIssueUrl?: string | null;
  githubUpdatedAt?: string | null;
  githubClosedAt?: string | null;
}

export type ProjectStatus = Project['status'];

/* ===== Integração GitHub ===== */

export type IntegrationConnectionState = 'CONNECTED' | 'AUTH_FAILED' | 'UNREACHABLE';

export interface SyncLogEntry {
  id: string;
  syncDate: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | string;
  repositoriesSynced: number;
  issuesSynced: number;
  errorMessage: string | null;
}

export interface GitHubAccount {
  login: string;
  name: string | null;
  avatarUrl: string | null;
  htmlUrl: string | null;
}

export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  reset: number | null;
}

export interface IntegrationStatus {
  authenticated: boolean;
  connectionState: IntegrationConnectionState;
  diagnostic: string | null;
  account: GitHubAccount | null;
  rateLimit: RateLimitInfo | null;
  syncIntervalMs: number;
  serverTime?: string;
  lastSync: SyncLogEntry | null;
}
