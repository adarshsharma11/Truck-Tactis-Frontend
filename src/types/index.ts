export type JobAction = 'pickup' | 'dropoff';
export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'deferred';
export type TruckStatus = 'on_route' | 'idle' | 'at_yard' | 'offline';
export type TruckType = 'large' | 'small';

export interface Job {
  id: number;
  title: string;
  actionType: string; // PICKUP, etc.
  locationId: number;
  priority: number; // 1: High, 2: Medium, 3: Low, etc.
  earliestTime: string | null;
  latestTime: string | null;
  serviceMinutes: number | null;
  notes: string | null;
  largeTruckOnly: boolean;
  curfewFlag: boolean;
  assignedTruckId: number | null;
  assignedDriverId: number | null;
  isCompleted: boolean;
  isFiction: boolean;
  datePublished: string;
  createdAt: string;
  updatedAt: string;
  location: Location;
  items: Item[];
  assignedTruck?: AssignedTruck | null;
  assignedDriver: string | null;
}
export interface AssignedTruck {
  id: number;
  truckName: string;
  capacityCuFt: number;
  maxWeightLbs: number;
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  truckType: string; // Add other possible values as needed
  color: string;
  yearOfManufacture: number;
  isActive: boolean;
  currentStatus:  string; // Expand as needed
  restrictedLoadTypes: string[];
  gpsEnabled: boolean;
  lastKnownLat: number;
  lastKnownLng: number;
  driverId: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  driver: any | null; // You can replace `any` with a `Driver` interface if you have it
}

export interface JobResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    jobs: Job[];
  };
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  items: Item[];
}

// Main Response Interface
export interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export interface TruckApi {
  id?: number;
  truckName?: string;
  capacityCuFt?: number;
  maxWeightLbs?: string | number;
  lengthFt?: number;
  widthFt?: number;
  heightFt?: number;
  truckType?: string;
  color?: string;
  yearOfManufacture?: number;
  isActive?: boolean;
  currentStatus?: string;
  restrictedLoadTypes?: string[]; // Array of load types
  gpsEnabled?: boolean;
  lastKnownLat?: number | null;
  lastKnownLng?: number | null;
  driverId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  driver?: string | null;


}
export interface TruckData {
  success: boolean;
  data: TruckApi[];
}
export interface Truck {
  id: string;
  name: string;
  type: TruckType;
  capacity: number; // cubic units
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  curfew_flags?: string[];
  status: TruckStatus;
  notes?: string;
  current_location?: {
    lat: number;
    lng: number;
  };
}

export interface addCategory {
  name: string;
  description: string;
}
export interface Category {
  success: boolean;
  data: CategoryItem[];
}

export interface CategoryItem {
  id: number;
  name: string;
  description: string;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
}

export interface InventoryItemData {
  success: boolean;
  data: Item[];
}

// One stop in the truck's route
export interface Stop {
  jobId: number;
  title: string;
  lat: number;
  lng: number;
}

// Route metadata for distance, duration, etc.
export interface RouteDetails {
  distanceKm: number;
  durationMin: number | null;
  polyline: string | null;
  decoded: any; // You can define a type here if decoded is a list of coordinates
}

// A single truck's full route and job details
export interface TruckRoute {
  truckId: number;
  truckName: string;
  driver: string;
  totalJobs: number;
  stops: Stop[];
  route: RouteDetails;
  googleMapsUrl: string;
}

// Full API response
export interface RouteResponse {
  success: boolean;
  totalTrucks: number;
  routes: TruckRoute[];
}

export interface Location {
  id?: string; // Optional
  is_starred?: boolean; // Optional
  last_used?: string; // Optional
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isSaved?: boolean;
  createdById?: string | null;
}

export interface createJob {
  title: string;
  actionType: "PICKUP" | "DROPOFF";  // Action type can be either PICKUP or DELIVERY
  notes: string;
  priority: number;
  curfewFlag: boolean;
  largeTruckOnly: boolean;
  assignedTruckId: number | null;
  assignedDriverId: number | null;
  items: number[];  // Array of item IDs
  serviceMinutes: number | null;
  locationId: number | null;  // Location ID can be null if not assigned
  earliestTime: string | null ;
  latestTime: string | null;
  location: Location;  // Location is required and contains detailed information
}

export interface Item {
  id: number;
  name: string;
  sku: string | null;
  weightLbs: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  notes: string | null;
  requiresLargeTruck: boolean;
  categoryId: number | null;
  createdAt: string;  // ISO date string
  updatedAt: string;  // ISO date string
  category?: CategoryItem | null;  // Can be null or a Category object
}
export interface InventoryItem {
  id?: number;
  name: string;
  size?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  is_favorited?: boolean;
  parent_id?: string; // for tree structure
  is_folder?: boolean;
  children?: InventoryItem[];
  sku?: string | null;
  weightLbs?: number | null;
  lengthIn?: number | null;
  widthIn?: number | null;
  heightIn?: number | null;
  notes?: string | null,
  requiresLargeTruck?: boolean,
  categoryId?: number | null
}
interface JobAssignment {
  jobId: number;
  jobTitle: string;
  assignedTruck: string;
  driver: string;
  score: string;
}

export interface JobOptimize {
  success: boolean;
  totalJobs: number;
  assigned: number;
  assignments: JobAssignment[];
}
export interface InventoryNode extends InventoryItem {
  children: InventoryNode[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'edit' | 'defer' | 'reassign' | 'complete' | 'delete';
  entity_type: 'job' | 'truck' | 'inventory';
  entity_id: string;
  details: string;
  user?: string;
}

export interface Metrics {
  date_range: {
    from: string;
    to: string;
  };
  utilization_by_truck: {
    truck_name: string;
    utilization: number; // percentage
  }[];
  jobs_completed: number;
  jobs_deferred: number;
  on_time_percentage: number;
  avg_service_time_minutes: number;
  avg_drive_time_minutes: number;
  heatmap_data?: {
    lat: number;
    lng: number;
    weight: number;
  }[];
}

export interface StopGroup {
  group_number: number;
  stops: Job[];
  is_current: boolean;
  is_completed: boolean;
}
