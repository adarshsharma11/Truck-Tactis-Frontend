import React, { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { JobResponse } from "@/types";

// Truck type definition matching your project
type TruckType = 'large' | 'small';
type TruckStatus = 'on_route' | 'idle' | 'at_yard' | 'offline';

interface Truck {
  id: string;
  name: string;
  type: TruckType;
  capacity: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  status: TruckStatus;
  current_location?: {
    lat: number;
    lng: number;
  };
}

interface MapProps {
  apiKey: string;
  center: google.maps.LatLngLiteral;
  zoom: number;
  trucks?: Truck[];
  jobs?: JobResponse;
}

// Mock truck data with different types and colors
const createMockTrucks = (): Truck[] => [
  {
    id: 'truck-1',
    name: 'Large Hauler #1',
    type: 'large',
    capacity: 5000,
    dimensions: { length: 12, width: 3, height: 4 },
    status: 'on_route',
    current_location: { lat: 37.7849, lng: -122.4094 }
  },
  {
    id: 'truck-2',
    name: 'Small Delivery #1',
    type: 'small',
    capacity: 1000,
    dimensions: { length: 6, width: 2.5, height: 3 },
    status: 'idle',
    current_location: { lat: 37.7649, lng: -122.4294 }
  },
  {
    id: 'truck-3',
    name: 'Large Cargo #2',
    type: 'large',
    capacity: 4500,
    dimensions: { length: 11, width: 3, height: 3.5 },
    status: 'idle',
    current_location: { lat: 37.7749, lng: -122.4394 }
  },
  {
    id: 'truck-4',
    name: 'Small Van #2',
    type: 'small',
    capacity: 800,
    dimensions: { length: 5, width: 2.2, height: 2.8 },
    status: 'at_yard',
    current_location: { lat: 37.7549, lng: -122.4194 }
  }
];

const MapComponent: React.FC<MapProps> = ({ apiKey, center, zoom, trucks, jobs }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Truck color mapping
  const getTruckColor = (type: TruckType, status: string): string => {
    const statusColors = {
      'UNAVAILABLE': { large: '#ef4444', small: '#f97316' }, // Red/Orange for active
      'AVAILABLE': { large: '#10b981', small: '#06b6d4' },     // Green/Cyan for available
      'IN_TRANSIT': { large: '#8b5cf6', small: '#a855f7' },  // Purple for at yard
      'MAINTENANCE': { large: '#6b7280', small: '#9ca3af' }  // Gray for offline
    };
    return statusColors[status][type];
  };

  // Truck icon SVG
  const getTruckIcon = (type: TruckType, status: string): google.maps.Symbol => {
    const color = getTruckColor(type, status);
    const scale = type === 'large' ? 1.2 : 1.0;
    
    return {
      path: 'M18.92,6.01C18.72,5.42 18.16,5 17.5,5H15V7H17.5L18.92,6.01M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M6.5,5C5.84,5 5.28,5.42 5.08,6.01L6.5,7H9V5H6.5M20.5,18.5C20.5,19.6 19.6,20.5 18.5,20.5S16.5,19.6 16.5,18.5C16.5,17.4 17.4,16.5 18.5,16.5S20.5,17.4 20.5,18.5M7.5,18.5C7.5,19.6 6.6,20.5 5.5,20.5S3.5,19.6 3.5,18.5C3.5,17.4 4.4,16.5 5.5,16.5S7.5,17.4 7.5,18.5M20,8H4V16H20V8M12,11.5C10.62,11.5 9.5,10.38 9.5,9S10.62,6.5 12,6.5S14.5,7.62 14.5,9S13.38,11.5 12,11.5Z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: scale,
      anchor: new google.maps.Point(12, 12)
    };
  };

  useEffect(() => {
    loadMap();
  }, [apiKey, center, zoom]);

  useEffect(() => {
    if (mapInstance.current) {
      updateMarkers();
    }
  }, [trucks, jobs]);

  const loadMap = async () => {
    if (!mapRef.current) return;

    try {
      setOptions({ key: apiKey });
      await importLibrary("maps");
      await importLibrary("marker");

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      updateMarkers();
    } catch (error) {
      console.error('Failed to load map:', error);
    }
  };

  const updateMarkers = () => {    
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const trucksToDisplay = trucks || createMockTrucks();

    // trucksToDisplay.forEach(truck => {
    jobs?.data?.jobs?.forEach(truck => {
      if (truck.assignedTruck) {
        const type =truck.largeTruckOnly?"large":"small"
        const truckName =truck.assignedTruck.truckName
        const marker = new google.maps.Marker({
          position: { lat: truck.assignedTruck.lastKnownLat, lng: truck.assignedTruck.lastKnownLat },
          map: mapInstance.current!,
          icon: getTruckIcon(type, truck.assignedTruck.currentStatus),
          title: `${truck.assignedTruck.truckName} (${type.toUpperCase()})`
        });

        // Info window content
        const infoContent = `
          <div style="padding: 12px; min-width: 200px; font-family: Arial, sans-serif;color: black;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <div style="width: 16px; height: 16px; background-color: ${getTruckColor(type, truck.assignedTruck.currentStatus)}; border-radius: 50%; margin-right: 8px;"></div>
              <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #333;">${truckName}</h3>
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Type:</strong> ${type.toUpperCase()} Truck
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Job:</strong> ${truck.title} Truck
            </div>
            <div style="margin-bottom: 6px;">
              <strong>address:</strong> ${truck.location.address} Truck
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Status:</strong> ${truck.assignedTruck.currentStatus.replace('_', ' ').toUpperCase()}
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Capacity:</strong> ${truck.assignedTruck.capacityCuFt.toLocaleString()} cubic units
            </div>
            <div style="margin-bottom: 6px;">
              <strong>Dimensions:</strong> ${truck.assignedTruck.lengthFt}m × ${truck.assignedTruck.widthFt}m × ${truck.assignedTruck.heightFt}m
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              Click for more details
            </div>
          </div>
        `;

        const infoWindow = new google.maps.InfoWindow({
          content: infoContent
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current!, marker);
        });

        markersRef.current.push(marker);
      }
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", position: 'relative' }}>
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", borderRadius: "8px" }}
      />
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '12px',
        zIndex: 1000,
        color:"black"
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Truck Types</div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px', marginRight: '6px' }}></span>
          Large Truck (Active)
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px', marginRight: '6px' }}></span>
          Large Truck (Idle)
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '2px', marginRight: '6px' }}></span>
          Small Truck (Active)
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#06b6d4', borderRadius: '2px', marginRight: '6px' }}></span>
          Small Truck (Idle)
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
