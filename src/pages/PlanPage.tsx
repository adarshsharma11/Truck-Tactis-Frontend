import { useState, useMemo, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useDateStore } from '@/lib/store/dateStore';
import { useLocationsStore } from '@/lib/store/locationsStore';
import { useCategoriesWithItems, useCreateJob, useDeleteJob, useInventory, useJobOptimize, useJobOptimizeRoute, useJobs } from '@/lib/api/hooks';
import { InventoryTreePicker } from '@/components/InventoryTreePicker';
import { LocationSelector } from '@/components/LocationSelector';
import { toast } from 'sonner';
import MapComponent from '@/components/ui/MapComponent';
import { Autocomplete } from '@react-google-maps/api';
import { env } from '@/config/env';
import { useJobStore } from '@/lib/store/useJobStore';
import { Location } from '@/types';
import { getPlaceDetails } from '@/components/getPlaceDetails ';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobOptimizeStore } from '@/lib/store/useJobOptimizStore';


export const queryKeys = {
  // jobs: (date?: string) => ['jobs', date] as const,
  jobs: ['jobs'] as const,
  metrics: (from?: string, to?: string) => ['metrics', from, to] as const,
};

export default function PlanPage() {
  const { data: jobs, isLoading: jobsLoading, refetch } = useJobs();
  const { selectedDate } = useDateStore();
  const { job } = useJobStore(state => state);
  // const { data: inventory } = useInventory();
  const { data: inventory, isLoading: inventoryLoading } = useCategoriesWithItems();


  const createJob = useCreateJob();
  const JobDelete = useDeleteJob();
  const optimizeMutation = useJobOptimize();
  const optimizeMutationRoute = useJobOptimizeRoute();
  const { data: JobOptimizeData, isPending } = optimizeMutation;
  const { data: JobOptimizeDataRoute, isPending: routeIsPending } = optimizeMutationRoute;
  const { data, isPending: deletePending } = JobDelete;
  const { addLocation } = useLocationsStore();
  const handleOptimizeClick = () => {
    optimizeMutation.mutate(); // ✅ No payload needed
  };

  const mapCenter = useMemo(() => ({ lat: 37.7749, lng: -122.4194 }), []);
  const mapZoom = useMemo(() => 12, []);

  const LosAngelesBounds = {
    north: 34.5,
    south: 33.5,
    east: -118.0,
    west: -118.8,
  };
  // Form state
  const [address, setAddress] = useState<string>('');
  const [tabsListValue, setTabsListValue] = useState<string>('jobs');
  const [title, setTitle] = useState<string>('');
  const [action, setAction] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [priority, setPriority] = useState<string>('1');
  const [earliest, setEarliest] = useState<string>('');
  const [latest, setLatest] = useState<string>('');
  const [serviceMinutes, setServiceMinutes] = useState<string>('');
  const [location, setLocation] = useState<Location>({
    placeId: "",
    name: "",
    address: "",
    latitude: null,
    longitude: null,
    city: "",
    state: "",
    country: "",
    postalCode: "",
    isSaved: true,
    // createdById: null
  });
  const [notes, setNotes] = useState<string>('');
  const [largeTruckOnly, setLargeTruckOnly] = useState<boolean>(false);
  const [curfewFlag, setCurfewFlag] = useState<boolean>(false);

  const handleLocationSelect = (location: Location) => {
    delete location.id
    setAddress(location.address);
    setLocation(location)
  };

  const handleCreateJob = () => {
    if (!address && selectedItems?.length === 0) {
      toast.error('Please fill in location, address, and select at least one item');
      return;
    } else if (selectedItems?.length === 0) {
      toast.error('Please select at least one item');
      return;
    }
    else if (!address) {
      toast.error('Please fill in address');
      return;
    }

    // // Save location with detailed address
    addLocation({
      ...location
    });
    const today = new Date().toISOString().split('T')[0];
    const defaultEarliest = earliest || "07:00";
    const defaultLatest = latest || "17:00";
    // Create job
    createJob.mutate({
      title: title,
      actionType: action,
      notes: notes || "",
      priority: parseInt(priority) || 1,
      largeTruckOnly: largeTruckOnly,
      // assignedTruckId: null,
      // assignedDriverId: null,
      items: selectedItems,
      // locationId: null,
      location: location,
      earliestTime: new Date(`${today}T${defaultEarliest}:00`).toString(),
      latestTime: new Date(`${today}T${defaultLatest}:00`).toString(),
      serviceMinutes: serviceMinutes ? parseInt(serviceMinutes) : null,
      curfewFlag: curfewFlag,
      // date: selectedDate,
    });

    // Reset form
    setAddress('');
    setTitle('');
    setLocation({
      placeId: "",
      name: "",
      address: "",
      latitude: null,
      longitude: null,
      city: "",
      state: "",
      country: "",
      postalCode: "",
      isSaved: true,
      createdById: null
    });
    setSelectedItems([]);
    setPriority('1');
    setEarliest('');
    setLatest('');
    setServiceMinutes('');
    setNotes('');
    setLargeTruckOnly(false);
    setCurfewFlag(false);
  };
  useEffect(() => {
    optimizeMutationRoute.mutate();
  }, [isPending]);
  const deleteJob = async (id: number) => {
    await JobDelete.mutate(id)
    refetch()
  }
  
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
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="mt-2"
              />
            </div>
            {/* Location Name */}
            <div>
              <Label className="text-sm font-medium">Address</Label>
              <Autocomplete
                onLoad={(autoC) => ((window as any).autocomplete = autoC)}
                onPlaceChanged={async () => {
                  const place = (window as any).autocomplete.getPlace();
                  const getPlaceDetailsData = await getPlaceDetails(env.googleMapsApiKey, place.place_id,);
                  if (place && getPlaceDetailsData.address) {
                    setAddress(getPlaceDetailsData.address)
                    setLocation({
                      placeId: place.place_id,
                      name: getPlaceDetailsData.name,
                      address: getPlaceDetailsData.address,
                      latitude: getPlaceDetailsData.latitude,
                      longitude: getPlaceDetailsData.longitude,
                      city: getPlaceDetailsData.city,
                      state: getPlaceDetailsData.state,
                      country: getPlaceDetailsData.country,
                      postalCode: getPlaceDetailsData.postalCode,
                      isSaved: true,
                      // createdById: null
                    })
                  }
                }}
                options={{
                  bounds: LosAngelesBounds,
                  componentRestrictions: { country: "us" },
                }}
              >
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address (Los Angeles Valley)"
                  className="mt-2"
                />
              </Autocomplete>
            </div>
            {/* Action */}
            <div>
              <Label className="text-sm font-medium">Action</Label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'PICKUP' | 'DROPOFF')}
                className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-sm"
              >
                <option value="PICKUP">Pickup</option>
                <option value="DROPOFF">Dropoff</option>
              </select>
            </div>

            {/* Items Selection */}
            <div>
              <Label className="text-sm font-medium">
                Items ({selectedItems?.length} selected)
              </Label>
              <div className="mt-2">
                {inventory && inventory?.data?.length > 0 ? (
                  <InventoryTreePicker
                    inventory={inventory?.data}
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
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-2 px-3 py-2 bg-input border border-border rounded-md text-sm"
              >
                <option value="1">High</option>
                <option value="2">Medium</option>
                <option value="3">Low</option>
              </select>
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
          <Card className="p-4 h-96 bg-muted/20">
            <MapComponent
              apiKey={env.googleMapsApiKey}
              center={mapCenter}
              zoom={mapZoom}
              jobs={jobs}
              tabsListValue={tabsListValue}
            // trucks={mockTrucks}
            />
          </Card>

          {/* Jobs Table */}
          <Card className="p-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-4">
                Jobs for {selectedDate}
              </h3>
              <Button
                className=""
                onClick={handleOptimizeClick}
                disabled={isPending}
              >
                Optimize Routes
              </Button>
            </div>
            <Tabs onValueChange={(e)=>{
                setTabsListValue(e)
              }} defaultValue="jobs" value={tabsListValue} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="jobs">Job</TabsTrigger>
                <TabsTrigger value="Optimize Routes"> View Assigned Routes</TabsTrigger>
              </TabsList>
              <TabsContent value="jobs" className="space-y-4">

                {jobsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
                ) : !jobs || jobs?.data?.jobs?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No jobs for this day</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">#</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Title</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Location</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Action</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Items</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Time Window</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Priority</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs?.data?.jobs?.map((job, idx) => {
                          const earliest = new Date(job.earliestTime);
                          const earliestTime = earliest.toISOString().split("T")[1].slice(0, 5) === '00:00' ? "-" : earliest.toISOString().split("T")[1].slice(0, 5);
                          const latest = new Date(job.latestTime);
                          const latestTime = latest.toISOString().split("T")[1].slice(0, 5) === '00:00' ? '-' : latest.toISOString().split("T")[1].slice(0, 5);
                          return <tr key={job.id} className="border-b border-border hover:bg-muted/20">
                            <td className="py-3 px-4 text-sm">{idx + 1}</td>
                            <td className="py-3 px-4 text-sm font-medium">{job.title}</td>
                            <td className="py-3 px-4 text-sm font-medium">{job.location.address}</td>
                            {/* <td className="py-3 px-4 text-sm font-medium">{job.location_name}</td> */}
                            <td className="py-3 px-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${job.actionType === 'PICKUP'
                                ? 'bg-accent/20 text-accent'
                                : 'bg-warning/20 text-warning'
                                }`}>
                                {job.actionType}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {job?.items?.length} items
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {earliestTime && latestTime
                                ? `${earliestTime} - ${latestTime}`
                                : earliestTime
                                  ? `From ${earliestTime}`
                                  : latestTime
                                    ? `Until ${latestTime}`
                                    : '—'}
                            </td>
                            <td className="py-3 px-4 text-sm">{job.priority === 1 ? "High" : job.priority === 1 ? "Medium" : "Low"}</td>
                            <td className="py-3 px-4 text-sm"><Button
                              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4" disabled={deletePending} onClick={() => deleteJob(job.id)}>
                              Delete
                            </Button></td>
                            {/* <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${job.status === 'completed'
                            ? 'bg-success/20 text-success'
                            : job.status === 'in_progress'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                            }`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </td> */}
                            {/* <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full bg-primary/20 text-primary w-fit`}>
                            in progress
                          </span>
                        </td> */}
                          </tr>
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="Optimize Routes" className="space-y-4">
                {JobOptimizeDataRoute?.routes?.length > 0 ? <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="-full">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Truck ID</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Truck Name</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Driver</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Total Jobs</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Distance (km)</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Stops</th>
                          <th className="py-2 px-4 text-sm font-medium text-muted-foreground">Route</th>
                        </tr>
                      </thead>
                      <tbody>
                        {JobOptimizeDataRoute?.routes?.map((truck, index) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/20">
                            <td className="py-3 px-4 border-b">{truck.truckId}</td>
                            <td className="py-3 px-4 border-b">{truck.truckName}</td>
                            <td className="py-3 px-4 border-b">{truck.driver}</td>
                            <td className="py-3 px-4 border-b">{truck.totalJobs}</td>
                            <td className="py-3 px-4 border-b">
                              {truck.route.distanceKm.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 border-b">
                              <div className="">
                                {truck.stops.map((stop, stopIndex) => (
                                  <div key={stop.jobId} className="text-sm mb-1">
                                    <span className="font-medium">{stopIndex + 1}</span>: {stop.title}
                                  </div>
                                ))}
                              </div>
                            </td>
                             <td className="py-3 px-4 border-b">
                              <button onClick={() => window.open(truck.googleMapsUrl, "_blank")} className="bg-primary text-white font-bold py-2 px-4 rounded">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div> :
                  <div className="text-center py-8 text-muted-foreground">No jobs for this day</div>}
              </TabsContent>
            </Tabs>
            {/* {isLoading ? ( */}
          </Card>
        </div>
      </div>
    </div>
  );
}