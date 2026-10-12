export type BadgeKind = 'success' | 'warning' | 'error' | 'info' | 'muted';

export function statusBadgeType(status?: string): BadgeKind {
  const value = (status || '').toUpperCase();
  if (value === 'COMPLETED' || value === 'ACTIVE' || value === 'IN_PROGRESS') return 'success';
  if (value === 'ON_HOLD' || value === 'PENDING' || value === 'PLANNED' || value === 'PLANNING') return 'warning';
  if (value === 'ARCHIVED' || value === 'CANCELED') return 'muted';
  if (value === 'ERROR') return 'error';
  return 'info';
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Data + hora, ex.: "12 out 2026, 03:40" */
export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Badge de resultado de sincronização. */
export function syncStatusBadgeType(status?: string): BadgeKind {
  if (status === 'SUCCESS') return 'success';
  if (status === 'PARTIAL') return 'warning';
  if (status === 'FAILED') return 'error';
  return 'muted';
}

/** Rótulo em pt-BR do resultado de uma sincronização. */
export function syncStatusLabel(status?: string): string {
  if (status === 'SUCCESS') return 'Sucesso';
  if (status === 'PARTIAL') return 'Parcial';
  if (status === 'FAILED') return 'Falha';
  return status || '—';
}

/** Traduz mensagens técnicas do backend em textos claros para diagnóstico. */
export function describeSyncError(errorLog?: string | null): string | null {
  if (!errorLog) return null;
  if (errorLog.includes('Authentication failed')) {
    return 'Autenticação falhou: o token do GitHub é inválido ou expirou.';
  }
  if (errorLog.includes('Rate Limit')) {
    return 'Limite de requisições do GitHub atingido. Aguarde a data/hora indicada para tentar de novo.';
  }
  if (errorLog.includes('Forbidden') || errorLog.includes('permissions')) {
    return 'Acesso negado: o token não tem permissão para ler alguns recursos.';
  }
  if (errorLog.includes('Resource not found')) {
    return 'Algum repositório ou issue não foi encontrado (pode ter sido removido ou ficou privado).';
  }
  if (errorLog.includes('Server Error')) {
    return 'O GitHub retornou erro interno. Tente novamente em instantes.';
  }
  if (errorLog.includes('Falha na comunicação') || errorLog.includes('unexpected error')) {
    return 'Falha de comunicação com o GitHub. Verifique a conectividade do servidor.';
  }
  return errorLog;
}
