import { create } from 'zustand';

export interface PendingOrder {
  id: string;
  customerName: string;
  items: any[];
  priceLevel: string;
  createdAt: string;
}

interface OrderStore {
  orders: PendingOrder[];
  addOrder: (order: Omit<PendingOrder, 'id' | 'createdAt'>) => void;
  removeOrder: (id: string) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  addOrder: (order) => set((state) => ({
    orders: [
      ...state.orders,
      {
        ...order,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      },
    ],
  })),
  removeOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id),
  })),
}));
