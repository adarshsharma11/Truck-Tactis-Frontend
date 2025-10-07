import { http, HttpResponse } from 'msw';
import jobsData from './seeds/jobs.json';
import trucksData from './seeds/trucks.json';
import inventoryData from './seeds/inventory.json';
import metricsData from './seeds/metrics.json';
import type { Job, Truck, InventoryItem, Metrics } from '@/types';

// In-memory stores
let jobs: Job[] = jobsData as Job[];
let trucks: Truck[] = trucksData as Truck[];
let inventory: InventoryItem[] = inventoryData as InventoryItem[];

export const handlers = [
  // Jobs endpoints
  http.get('/mock/jobs', ({ request }) => {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    
    const filtered = date 
      ? jobs.filter(j => j.date === date)
      : jobs;
    
    return HttpResponse.json(filtered);
  }),

  http.post('/mock/jobs', async ({ request }) => {
    const newJob = await request.json() as Partial<Job>;
    const job: Job = {
      id: `job-${Date.now()}`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...newJob,
    } as Job;
    
    jobs.push(job);
    return HttpResponse.json(job, { status: 201 });
  }),

  http.patch('/mock/jobs/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Job>;
    
    const index = jobs.findIndex(j => j.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    jobs[index] = { ...jobs[index], ...updates, updated_at: new Date().toISOString() };
    return HttpResponse.json(jobs[index]);
  }),

  http.delete('/mock/jobs/:id', ({ params }) => {
    const { id } = params;
    const initialLength = jobs.length;
    jobs = jobs.filter(j => j.id !== id);
    
    if (jobs.length === initialLength) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true });
  }),

  http.post('/mock/jobs/:id/defer', async ({ params, request }) => {
    const { id } = params;
    const { new_priority } = await request.json() as { new_priority: number };
    
    const job = jobs.find(j => j.id === id);
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    job.priority = new_priority;
    job.status = 'deferred';
    job.updated_at = new Date().toISOString();
    
    return HttpResponse.json(job);
  }),

  // Trucks endpoints
  http.get('/mock/trucks', () => {
    return HttpResponse.json(trucks);
  }),

  http.patch('/mock/trucks/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<Truck>;
    
    const index = trucks.findIndex(t => t.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Truck not found' }, { status: 404 });
    }
    
    trucks[index] = { ...trucks[index], ...updates };
    return HttpResponse.json(trucks[index]);
  }),

  // Inventory endpoints
  http.get('/mock/inventory', () => {
    return HttpResponse.json(inventory);
  }),

  http.post('/mock/inventory', async ({ request }) => {
    const newItem = await request.json() as Partial<InventoryItem>;
    const item: InventoryItem = {
      id: `item-${Date.now()}`,
      is_folder: false,
      ...newItem,
    } as InventoryItem;
    
    inventory.push(item);
    return HttpResponse.json(item, { status: 201 });
  }),

  http.patch('/mock/inventory/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as Partial<InventoryItem>;
    
    const index = inventory.findIndex(i => i.id === id);
    if (index === -1) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    inventory[index] = { ...inventory[index], ...updates };
    return HttpResponse.json(inventory[index]);
  }),

  http.delete('/mock/inventory/:id', ({ params }) => {
    const { id } = params;
    const initialLength = inventory.length;
    inventory = inventory.filter(i => i.id !== id);
    
    if (inventory.length === initialLength) {
      return HttpResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true });
  }),

  // Operations endpoints
  http.post('/mock/ops/mark-3-complete', async ({ request }) => {
    const { truck_id } = await request.json() as { truck_id: string };
    
    // Simulate marking 3 stops as complete
    const truckJobs = jobs
      .filter(j => j.truck_id === truck_id && j.status === 'in_progress')
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
      .slice(0, 3);
    
    truckJobs.forEach(job => {
      job.status = 'completed';
      job.updated_at = new Date().toISOString();
    });
    
    return HttpResponse.json({ completed: truckJobs.length });
  }),

  http.post('/mock/ops/send-next-3', async ({ request }) => {
    const { truck_id, webhook } = await request.json() as { truck_id: string; webhook?: string };
    
    // Simulate sending webhook
    console.log(`[MSW] Sending next 3 stops for truck ${truck_id} to webhook:`, webhook);
    
    return HttpResponse.json({ success: true, message: 'Webhook triggered (mocked)' });
  }),

  // Metrics endpoints
  http.get('/mock/metrics/summary', () => {
    return HttpResponse.json(metricsData as Metrics);
  }),
];
