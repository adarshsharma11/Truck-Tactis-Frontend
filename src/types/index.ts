export type JobAction = 'pickup' | 'dropoff';
export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'deferred';
export type TruckStatus = 'on_route' | 'idle' | 'at_yard' | 'offline';
export type TruckType = 'large' | 'small';

export interface Job {
  id: string;
  location_name: string;
  address: string;
  lat?: number;
  lng?: number;
  action: JobAction;
  items: string[]; // Item IDs
  priority: number;
  earliest?: string; // ISO time or null
  latest?: string; // ISO time or null
  service_minutes_override?: number;
  notes?: string;
  large_truck_only?: boolean;
  capacity_hint?: number;
  curfew_flag?: boolean;
  truck_id?: string;
  status: JobStatus;
  date: string; // YYYY-MM-DD
  estimated_arrival?: string;
  sequence?: number; // order in the day
  created_at: string;
  updated_at: string;
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
export interface Location {
  placeId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isSaved: boolean;
  createdById: string;
}

export interface createJob {
  title: string;
  actionType: "PICKUP" | "DELIVERY";  // Action type can be either PICKUP or DELIVERY
  notes: string;
  priority: number;
  largeTruckOnly: boolean;
  assignedTruckId: number;
  assignedDriverId: number;
  items: number[];  // Array of item IDs
  locationId: number | null;  // Location ID can be null if not assigned
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
  category: CategoryItem | null;  // Can be null or a Category object
}
export interface InventoryItem {
  id?: string;
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
