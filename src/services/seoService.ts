import axios from 'axios';
import { SEOEntity, SEOEntityType, SEOMetadata } from '../types';

export const seoService = {
  getEntities: async (type?: SEOEntityType, search?: string) => {
    const response = await axios.get<SEOEntity[]>('/api/seo/entities', {
      params: { type, search }
    });
    return response.data;
  },

  getEntitySEO: async (type: SEOEntityType, id: string) => {
    const response = await axios.get<SEOEntity | null>(`/api/seo/entities/${type}/${id}`);
    return response.data;
  },

  updateEntitySEO: async (type: SEOEntityType, id: string, data: Partial<SEOEntity>) => {
    const response = await axios.put<SEOEntity>(`/api/seo/entities/${type}/${id}`, data);
    return response.data;
  },

  getGlobalSEO: async () => {
    const response = await axios.get('/api/seo/global');
    return response.data;
  },

  updateGlobalSEO: async (value: any) => {
    const response = await axios.post('/api/seo/global', { value });
    return response.data;
  },

  syncSEO: async () => {
    const response = await axios.post('/api/seo/sync');
    return response.data;
  },

  generateSuggestions: async (entityType: SEOEntityType, entityData: any) => {
    const response = await axios.post('/api/seo/generate', { entityType, entityData });
    return response.data;
  }
};
