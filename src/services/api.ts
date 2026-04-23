import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  getAll: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getBySlug: async (slug: string) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/admin/products', data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/admin/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  bulkDelete: async (ids: string[]) => {
    const response = await api.post('/products/bulk-delete', { ids });
    return response.data;
  },
};

export const brandService = {
  getAll: async () => {
    const response = await api.get('/brands');
    return response.data;
  },
};

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

export const blogService = {
  getAll: async () => {
    const response = await api.get('/blogs');
    return response.data;
  },
};

export const pageService = {
  getBySlug: async (slug: string) => {
    const response = await api.get(`/pages/${slug}`);
    return response.data;
  },
};

export const settingService = {
  getByKey: async (key: string) => {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },
};

export default api;
