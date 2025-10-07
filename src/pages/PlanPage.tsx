import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDateStore } from '@/lib/store/dateStore';
import { useJobs } from '@/lib/api/hooks';

export default function PlanPage() {
  const { selectedDate } = useDateStore();
  const { data: jobs, isLoading } = useJobs(selectedDate);
  const [showJobForm, setShowJobForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Day Planner</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowJobForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Form Sidebar */}
        <Card className="lg:col-span-1 p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">Add New Job</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Location Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-md text-sm"
                placeholder="e.g., Downtown Depot"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-md text-sm"
                placeholder="123 Main St, City, State"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Action</label>
              <select className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-md text-sm">
                <option value="pickup">Pickup</option>
                <option value="dropoff">Dropoff</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 bg-input border border-border rounded-md text-sm"
                placeholder="1"
                min="1"
              />
            </div>
            <Button className="w-full">Create Job</Button>
          </div>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Panel */}
          <Card className="p-4 h-96 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-sm text-muted-foreground">
                Google Maps will appear here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Configure VITE_GOOGLE_MAPS_API_KEY in .env
              </p>
            </div>
          </Card>

          {/* Jobs Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Jobs for {selectedDate}
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
            ) : !jobs || jobs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No jobs for this day</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="py-2 px-4 text-sm font-medium text-muted-foreground">#</th>
                      <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Action</th>
                      <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Items</th>
                      <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                      <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job, idx) => (
                      <tr key={job.id} className="border-b border-border hover:bg-muted/20">
                        <td className="py-3 px-4 text-sm">{idx + 1}</td>
                        <td className="py-3 px-4 text-sm font-medium">{job.location_name}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            job.action === 'pickup' 
                              ? 'bg-accent/20 text-accent' 
                              : 'bg-warning/20 text-warning'
                          }`}>
                            {job.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {job.items.length} items
                        </td>
                        <td className="py-3 px-4 text-sm">{job.priority}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            job.status === 'completed' 
                              ? 'bg-success/20 text-success' 
                              : job.status === 'in_progress'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
