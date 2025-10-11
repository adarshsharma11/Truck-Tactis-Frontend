import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  lat?: number;
  lng?: number;
  is_starred: boolean;
  last_used: string;
}

interface LocationsState {
  locations: SavedLocation[];
  addLocation: (location: Omit<SavedLocation, 'id' | 'last_used'>) => void;
  toggleStar: (id: string) => void;
  updateLastUsed: (id: string) => void;
  getSortedLocations: () => SavedLocation[];
}

export const useLocationsStore = create<LocationsState>()(
  persist(
    (set, get) => ({
      locations: [],
      
      addLocation: (location) => {
        const newLocation: SavedLocation = {
          ...location,
          id: `loc-${Date.now()}`,
          last_used: new Date().toISOString(),
        };
        
        set((state) => {
          // Check if location with same name already exists
          const exists = state.locations.find(l => l.name.toLowerCase() === location.name.toLowerCase());
          if (exists) {
            return state; // Don't add duplicate
          }
          return { locations: [...state.locations, newLocation] };
        });
      },
      
      toggleStar: (id) => {
        set((state) => ({
          locations: state.locations.map(loc =>
            loc.id === id ? { ...loc, is_starred: !loc.is_starred } : loc
          ),
        }));
      },
      
      updateLastUsed: (id) => {
        set((state) => ({
          locations: state.locations.map(loc =>
            loc.id === id ? { ...loc, last_used: new Date().toISOString() } : loc
          ),
        }));
      },
      
      getSortedLocations: () => {
        const { locations } = get();
        
        // Split into starred and non-starred
        const starred = locations.filter(l => l.is_starred);
        const nonStarred = locations.filter(l => !l.is_starred);
        
        // Sort each group alphabetically by name
        const sortAlpha = (a: SavedLocation, b: SavedLocation) => 
          a.name.localeCompare(b.name);
        
        starred.sort(sortAlpha);
        nonStarred.sort(sortAlpha);
        
        // Return starred first, then non-starred
        return [...starred, ...nonStarred];
      },
    }),
    {
      name: 'locations-storage',
    }
  )
);
