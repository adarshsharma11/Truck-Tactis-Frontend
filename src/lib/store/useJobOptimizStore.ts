import { JobOptimize } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ✅ Define the store type
interface JobOptimizeStore {
  jobOptimize: JobOptimize | null; // default is null until data is set
  setJobOptimize: (job: JobOptimize) => void;
  clearJobOptimize: () => void;
}

// ✅ Zustand store
export const useJobOptimizeStore = create<JobOptimizeStore>()(
  persist(
    (set) => ({
      jobOptimize: null,

      // ✅ Save the full JobOptimize object
      setJobOptimize: (job: JobOptimize) => {
        set({ jobOptimize: job });
      },

      // ✅ Optional: clear/reset
      clearJobOptimize: () => {
        set({ jobOptimize: null });
      },
    }),
    {
      name: 'JobOptimize-storage', // key in localStorage
    }
  )
);
