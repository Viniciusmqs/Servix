import { api } from './api';
import { Provider } from '../types/models';

/** Normalise API response → app Provider model */
function normalise(p: any): Provider {
  return {
    id:          p.id,
    userId:      p.userId,
    name:        p.userName  ?? p.name  ?? 'Prestador',
    specialty:   p.category  ?? p.specialty ?? '',
    bio:         p.description ?? p.bio,
    description: p.description,
    rating:      p.rating       ?? 0,
    reviewCount: p.totalReviews ?? p.reviewCount ?? 0,
    city:        p.city         ?? '',
    available:   p.available    ?? false,
    hourlyRate:  p.hourlyRate,
    avatarUrl:   p.avatarUrl,
    services:    p.services     ?? [],
    portfolio:   p.portfolio    ?? [],
  };
}

export const providerService = {
  getFeatured: async (): Promise<Provider[]> => {
    const { data } = await api.get<any>('/providers/featured');
    const list: any[] = Array.isArray(data) ? data : data?.content ?? [];
    return list.map(normalise);
  },

  search: async (query?: string, category?: string, city?: string): Promise<Provider[]> => {
    // category = filtro exato de categoria (ex: "Elétrica")
    // query = busca textual livre (nome, categoria, descrição)
    // Nunca manda os dois juntos — category tem precedência
    const params: Record<string, string> = {};
    if (category) params.category = category;
    else if (query) params.query = query;
    if (city) params.city = city;

    const { data } = await api.get<any>('/providers', { params });
    const list: any[] = Array.isArray(data) ? data : data?.content ?? [];
    return list.map(normalise);
  },

  getById: async (id: string): Promise<Provider> => {
    const { data } = await api.get<any>(`/providers/${id}`);
    return normalise(data);
  },
};
