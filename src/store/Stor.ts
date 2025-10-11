import { create } from 'zustand';

// Type define karein
interface CounterState {
  data: any;
  getData: () => void;

}

// Store banayein
export const useCounterStore = create<CounterState>((set) => ({
  data: [],
  getData: () => set((state) => ({ data: state.data  })),
}));
