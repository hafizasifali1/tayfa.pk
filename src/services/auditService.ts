import { AuditLog } from '../types';

const LOGS_KEY = 'tayfa_audit_logs';

export const auditService = {
  getLogs: (): AuditLog[] => {
    const logs = localStorage.getItem(LOGS_KEY);
    return logs ? JSON.parse(logs) : [];
  },

  getSellerLogs: (sellerId: string): AuditLog[] => {
    const logs = auditService.getLogs();
    return logs.filter(log => log.userId === sellerId);
  },

  addLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const logs = auditService.getLogs();
    const newLog: AuditLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 1000))); // Keep last 1000 logs
  },

  logAction: (
    user: { id: string; name: string; role: string },
    action: string,
    entityType: AuditLog['entityType'],
    details: string,
    type: AuditLog['type'] = 'info',
    entityId?: string
  ) => {
    auditService.addLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entityType,
      entityId,
      details,
      type,
    });
  }
};
