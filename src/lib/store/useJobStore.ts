import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedJob {
    id: string;
    name: string;
    address: string;
    lat?: number;
    lng?: number;
    last_used: string;
    action: string;
    priority: number;
    notes: string;
    large_truck_only: boolean;
    curfew_flag: boolean;
    service_minutes_override: number;
    items: string[];  // Array of strings for items
    earliest: string; // Earliest time as a string (e.g., "10:00")
    latest: string;   // Latest time as a string (e.g., "22:00")
    date: string;
    //   earliest:da
    //   items:A;
}

interface JobState {
    job: SavedJob[];
    addJob: (location: Omit<SavedJob, 'id' | 'last_used'>) => void;
    updateJob: (id: string) => void;
}

export const useJobStore = create<JobState>()(
    persist(
        (set, get) => ({
            job: [],

            addJob: (job) => {
                const newJob: SavedJob = {
                    ...job,
                    id: `loc-${Date.now()}`,
                    last_used: new Date().toISOString(),
                };

                set((state) => {
                    // Check if location with same name already exists
                    const exists = state.job.find(l => l.name.toLowerCase() === job.name.toLowerCase());
                    if (exists) {
                        return state; // Don't add duplicate
                    }
                    return { job: [...state.job, newJob] };
                });
            },

            updateJob: (id) => {
                set((state) => ({
                    job: state.job.map(loc =>
                        loc.id === id ? { ...loc, last_used: new Date().toISOString() } : loc
                    ),
                }));
            },
        }),
        {
            name: 'job-storage',
        }
    )
);
