import axios from 'axios';
import { RoleConfig } from '../types';

const API_URL = '/api/roles';

export const rbacService = {
  getRoles: async (): Promise<RoleConfig[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  createRole: async (role: Omit<RoleConfig, 'id' | 'isSystem'>): Promise<RoleConfig> => {
    const response = await axios.post(API_URL, role);
    return response.data;
  },

  updateRole: async (id: string, role: Partial<RoleConfig>, adminId?: string): Promise<RoleConfig> => {
    const response = await axios.patch(`${API_URL}/${id}`, { ...role, adminId });
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  }
};
