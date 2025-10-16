import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Job, Truck, InventoryItem, Metrics, TruckData, TruckApi, Category, addCategory, InventoryItemData, createJob, JobResponse, CategoryResponse, JobOptimize, RouteResponse } from '@/types';
import { toast } from 'sonner';

// Query keys
export const queryKeys = {
  // jobs: (date?: string) => ['jobs', date] as const,
  jobs: ['jobs'] as const,
  trucks: ['trucks'] as const,
  inventory: ['inventory'] as const,
  Category: ['Category'] as const,
  metrics: (from?: string, to?: string) => ['metrics', from, to] as const,
};

// Jobs hooks
export function useJobs() {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: () => apiClient.get<JobResponse>(`api/jobs`),
  });
}
// export function useJobOptimize() {
//   return useQuery<JobOptimize>({
//     queryKey: queryKeys.jobs,
//     queryFn: () => apiClient.get<JobOptimize>('api/jobs/optimize'),
//     enabled: false,
//   });
// }
export function useJobOptimize() {
  const queryClient = useQueryClient();

  return useMutation<JobOptimize, Error, void>({
    mutationFn: () => apiClient.post<JobOptimize>('api/jobs/optimize'),
    onSuccess: (data: JobOptimize) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      
      // Check if no jobs in response
      if (!data.assignments || data.assignments.length === 0) {
        toast.info('No jobs for this day');
      } else {
        toast.success(`Optimized ${data?.assignments?.length} jobs successfully`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to optimize jobs: ${error.message}`);
    },
  });
}
export function useJobOptimizeRoute() {
  const queryClient = useQueryClient();
  return useMutation<RouteResponse, Error, void>({
    mutationFn: () => apiClient.post<RouteResponse>('api/jobs/routes'),
    onSuccess: (data: RouteResponse) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      
      // Check if no jobs in response
      if (!data.routes || data.routes.length === 0) {
        toast.info('No jobs for this day');
      } else {
        toast.success(`Optimized ${data?.routes?.length} jobs successfully`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to optimize jobs: ${error.message}`);
    },
  });
}
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<createJob>) => apiClient.post<createJob>('api/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success('Job created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      apiClient.patch<Job>(`/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success('Job updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success('Job deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete job: ${error.message}`);
    },
  });
}

export function useDeferJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, new_priority }: { id: string; new_priority: number }) =>
      apiClient.post<Job>(`/jobs/${id}/defer`, { new_priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success('Job deferred');
    },
    onError: (error: Error) => {
      toast.error(`Failed to defer job: ${error.message}`);
    },
  });
}

// Trucks hooks
export function useTrucks() {
  return useQuery({
    queryKey: queryKeys.trucks,
    queryFn: () => apiClient.get<TruckData>('api/trucks'),
  });
}

export function useUpdateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Truck> }) =>
      apiClient.patch<Truck>(`/trucks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trucks });
      toast.success('Truck updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update truck: ${error.message}`);
    },
  });
}

export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TruckApi>) =>
      apiClient.post<TruckApi>('api/trucks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trucks });
      toast.success('Truck added');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add truck: ${error.message}`);
    },
  });
}

// Inventory hooks
export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => apiClient.get<InventoryItemData>('api/items'),
  });
}

// categories hook
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.Category,
    queryFn: () => apiClient.get<Category>('api/categories'),
  });
}
//categories With Items
export function useCategoriesWithItems() {
  return useQuery({
    queryKey: queryKeys.Category,
    queryFn: () => apiClient.get<CategoryResponse>('api/items/categoriesWithItems'),
  });
}

export function useCategori() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<addCategory>) =>
      apiClient.post<addCategory>('api/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.Category });
      // toast.success('Item created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<InventoryItem>) =>
      apiClient.post<InventoryItem>('api/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      toast.success('Item created');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create item: ${error.message}`);
    },
  });
}


export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      apiClient.patch<InventoryItem>(`/inventory/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      toast.success('Item updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update item: ${error.message}`);
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      toast.success('Item deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete item: ${error.message}`);
    },
  });
}

// Operations hooks
export function useMark3Complete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (truck_id: number|string) =>
      apiClient.post<{ completed: number }>('/ops/mark-3-complete', { truck_id }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success(`Marked ${data.completed} stops as complete`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark stops: ${error.message}`);
    },
  });
}

export function useSendNext3() {
  return useMutation({
    mutationFn: ({ truck_id, webhook }: { truck_id: number; webhook?: string }) =>
      apiClient.post<{ success: boolean; message: string }>('/ops/send-next-3', { truck_id, webhook }),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(`Failed to send: ${error.message}`);
    },
  });
}

// Metrics hooks
export function useMetrics(from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.metrics(from, to),
    queryFn: () => {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      return apiClient.get<Metrics>(`/metrics/summary?${params.toString()}`);
    },
  });
}
