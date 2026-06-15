import { api } from './api';
import { ServiceRequest, Proposal } from '../types/models';

interface CreateRequestData {
  title: string;
  description: string;
  category: string;
  address: string;
  preferredDate?: string;
  urgency?: 'NORMAL' | 'URGENT';
  providerId?: string;
  photos?: string[];
}

interface CreateProposalData {
  price: number;
  estimatedDuration?: string;
  message?: string;
}

/** Extract list from either array or paginated { content: [] } response */
function extractList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
}

export const requestService = {
  create: async (data: CreateRequestData): Promise<ServiceRequest> => {
    const { data: response } = await api.post<ServiceRequest>('/requests', data);
    return response;
  },

  getById: async (id: string): Promise<ServiceRequest> => {
    const { data } = await api.get<ServiceRequest>(`/requests/${id}`);
    return data;
  },

  getMyRequests: async (): Promise<ServiceRequest[]> => {
    const { data } = await api.get<any>('/requests/my');
    return extractList(data);
  },

  getOpenRequests: async (): Promise<ServiceRequest[]> => {
    const { data } = await api.get<any>('/requests', { params: { size: 100 } });
    return extractList(data);
  },

  getReceivedRequests: async (): Promise<ServiceRequest[]> => {
    const { data } = await api.get<any>('/requests/received', { params: { size: 100 } });
    return extractList(data);
  },

  accept: async (id: string): Promise<ServiceRequest> => {
    const { data } = await api.patch<ServiceRequest>(`/requests/${id}/accept`);
    return data;
  },

  cancel: async (id: string): Promise<ServiceRequest> => {
    const { data } = await api.patch<ServiceRequest>(`/requests/${id}/cancel`);
    return data;
  },

  complete: async (id: string): Promise<ServiceRequest> => {
    const { data } = await api.patch<ServiceRequest>(`/requests/${id}/complete`);
    return data;
  },

  getProposals: async (requestId: string): Promise<Proposal[]> => {
    const { data } = await api.get<any>(`/requests/${requestId}/proposals`);
    return extractList(data);
  },

  createProposal: async (requestId: string, data: CreateProposalData): Promise<Proposal> => {
    const { data: response } = await api.post<Proposal>(`/requests/${requestId}/proposals`, data);
    return response;
  },

  acceptProposal: async (requestId: string, proposalId: string): Promise<Proposal> => {
    const { data } = await api.post<Proposal>(`/requests/${requestId}/proposals/${proposalId}/accept`, {});
    return data;
  },
};
