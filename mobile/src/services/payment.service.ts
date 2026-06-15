import { api } from './api';

export interface PaymentPreference {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

export const paymentService = {
  createPreference: async (requestId: string, title: string, amount: number): Promise<PaymentPreference> => {
    const { data } = await api.post<PaymentPreference>('/payments/preference', {
      requestId,
      title,
      amount,
    });
    return data;
  },
};
