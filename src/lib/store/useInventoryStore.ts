import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Savedinventory {
    name: string;
    sku?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    notes?: string;
    is_folder: boolean;
    is_favorited?: boolean;
    children?: any;
    id: string;
}

interface inventoryState {
    inventory: Savedinventory[];
    addinventory: (inventory: Omit<Savedinventory, 'id' | 'last_used'>) => void;
    updateinventory: (id: string) => void;
}

export const useinventoryStore = create<inventoryState>()(
    persist(
        (set, get) => ({
            inventory: [],

            addinventory: (inventory) => {
                const newinventory: Savedinventory = {
                    ...inventory,
                    id: `loc-${Date.now()}`,
                };

                set((state) => {
                    // Check if location with same name already exists
                    const exists = state.inventory.find(l => l.name.toLowerCase() === inventory.name.toLowerCase());
                    if (exists) {
                        return state; // Don't add duplicate
                    }
                    return { inventory: [...state.inventory, newinventory] };
                });
            },

            updateinventory: (id) => {
                set((state) => ({
                    inventory: state.inventory.map(loc =>
                        loc.id === id ? { ...loc, last_used: new Date().toISOString() } : loc
                    ),
                }));
            },
        }),
        {
            name: 'inventory-storage',
        }
    )
);
