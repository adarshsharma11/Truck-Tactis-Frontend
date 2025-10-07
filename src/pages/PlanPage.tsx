import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useDateStore } from '@/lib/store/dateStore';
import { useLocationsStore } from '@/lib/store/locationsStore';
import { useJobs, useInventory, useCreateJob } from '@/lib/api/hooks';
import { InventoryTreePicker } from '@/components/InventoryTreePicker';
import { LocationSelector } from '@/components/LocationSelector';
import { toast } from 'sonner';

export default function PlanPage() {
  const { selectedDate } = useDateStore();
  const { data: jobs, isLoading } = useJobs(selectedDate);
  const { data: inventory } = useInventory();
  const createJob = useCreateJob();
  const { addLocation } = useLocationsStore();

  // Form state
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [action, setAction] = useState<'pickup' | 'dropoff'>('pickup');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [priority, setPriority] = useState('1');
  const [earliest, setEarliest] = useState('');
  const [latest, setLatest] = useState('');
  const [serviceMinutes, setServiceMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [largeTruckOnly, setLargeTruckOnly] = useState(false);
  const [curfewFlag, setCurfewFlag] = useState(false);

  const handleLocationSelect = (name: string, addr: string) => {
    setLocationName(name);
    setAddress(addr);
  };

  const handleCreateJob = () => {
    if (!locationName || !address || selectedItems.length === 0) {
      toast.error('Please fill in location, address, and select at least one item');
      return;
    }

    // Save location
    addLocation({
      name: locationName,
      address,
      is_starred: false,
    });

    // Create job
    createJob.mutate({
      location_name: locationName,
      address,
      action,
      items: selectedItems,
      priority: parseInt(priority) || 1,
      earliest: earliest || undefined,
      latest: latest || undefined,
      service_minutes_override: serviceMinutes ? parseInt(serviceMinutes) : undefined,
      notes: notes || undefined,
      large_truck_only: largeTruckOnly,
      curfew_flag: curfewFlag,
      date: selectedDate,
    });

    // Reset form
    setLocationName('');
    setAddress('');
    setSelectedItems([]);
    setPriority('1');
    setEarliest('');
    setLatest('');
    setServiceMinutes('');
    setNotes('');
    setLargeTruckOnly(false);
    setCurfewFlag(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Day Planner</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Form Sidebar */}
        <Card className="lg:col-span-1 p-6 h-fit">
          <h3 className="text-lg font-semibold mb-4">Add New Job</h3>
          <div className="space-y-4">
            {/* Location Selector */}
            <div>
              <Label className="text-sm font-medium">Saved Locations</Label>
              <div className="mt-2">
                <LocationSelector onSelect={handleLocationSelect} />
              </div>
            </div>

            {/* Location Name */}
            <div>
              <Label className="text-sm font-medium">Location Name</Label>
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Downtown Depot"
                className="mt-2"
              />
            </div>

            {/* Address */}
            <div>
              <Label className="text-sm font-medium">Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
                className="mt-2"
              />
            </div>

            {/* Action */}
            <div>
              <Label className="text-sm font-medium">Action</Label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'pickup' | 'dropoff')}
                className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-sm"
              >
                <option value="pickup">Pickup</option>
                <option value="dropoff">Dropoff</option>
              </select>
            </div>

            {/* Items Selection */}
            <div>
              <Label className="text-sm font-medium">
                Items ({selectedItems.length} selected)
              </Label>
              <div className="mt-2">
                {inventory && inventory.length > 0 ? (
                  <InventoryTreePicker
                    inventory={inventory}
                    selectedIds={selectedItems}
                    onSelectionChange={setSelectedItems}
                  />
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4 border border-border rounded-md">
                    No inventory available
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label className="text-sm font-medium">Priority</Label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="1"
                min="1"
                className="mt-2"
              />
            </div>

            {/* Time Constraints */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Earliest (time)</Label>
                <Input
                  type="time"
                  value={earliest}
                  onChange={(e) => setEarliest(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Latest (time)</Label>
                <Input
                  type="time"
                  value={latest}
                  onChange={(e) => setLatest(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Service Minutes Override */}
            <div>
              <Label className="text-sm font-medium">Service Minutes (optional)</Label>
              <Input
                type="number"
                value={serviceMinutes}
                onChange={(e) => setServiceMinutes(e.target.value)}
                placeholder="e.g., 30"
                className="mt-2"
              />
            </div>

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions..."
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Truck Constraints */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Large Truck Only</Label>
                <Switch
                  checked={largeTruckOnly}
                  onCheckedChange={setLargeTruckOnly}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Curfew Flag</Label>
                <Switch
                  checked={curfewFlag}
                  onCheckedChange={setCurfewFlag}
                />
              </div>
            </div>

            {/* Create Button */}
            <Button
              className="w-full"
              onClick={handleCreateJob}
              disabled={createJob.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              {createJob.isPending ? 'Creating...' : 'Create Job'}
            </Button>
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
                      <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Time Window</th>
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
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {job.earliest && job.latest
                            ? `${job.earliest} - ${job.latest}`
                            : job.earliest
                            ? `From ${job.earliest}`
                            : job.latest
                            ? `Until ${job.latest}`
                            : '—'}
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
