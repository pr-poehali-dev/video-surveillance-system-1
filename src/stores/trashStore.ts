import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TrashItem {
  id: number;
  type: 'role' | 'user' | 'camera' | 'cameraGroup';
  data: any;
  deletedAt: string;
}

interface TrashStore {
  items: TrashItem[];
  addToTrash: (type: TrashItem['type'], data: any) => void;
  restoreFromTrash: (id: number) => TrashItem | null;
  deleteForever: (id: number) => void;
  getItemsByType: (type: TrashItem['type']) => TrashItem[];
}

export const useTrashStore = create<TrashStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToTrash: (type, data) => {
        const newItem: TrashItem = {
          id: Date.now(),
          type,
          data,
          deletedAt: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },
      
      restoreFromTrash: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (item) {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
          return item;
        }
        return null;
      },
      
      deleteForever: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
      
      getItemsByType: (type) => {
        return get().items.filter((i) => i.type === type);
      },
    }),
    {
      name: 'trash-storage',
    }
  )
);
