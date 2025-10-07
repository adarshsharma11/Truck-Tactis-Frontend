import { create } from 'zustand';
import { format } from 'date-fns';

interface DateState {
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  goToToday: () => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  goToToday: () => set({ selectedDate: format(new Date(), 'yyyy-MM-dd') }),
  
  goToPrevDay: () => set((state) => {
    const current = new Date(state.selectedDate);
    current.setDate(current.getDate() - 1);
    return { selectedDate: format(current, 'yyyy-MM-dd') };
  }),
  
  goToNextDay: () => set((state) => {
    const current = new Date(state.selectedDate);
    current.setDate(current.getDate() + 1);
    return { selectedDate: format(current, 'yyyy-MM-dd') };
  }),
}));
