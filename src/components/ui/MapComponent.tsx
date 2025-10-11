import React, { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// Define the type for the props (in case you want to pass dynamic data like the map center or zoom level)
interface MapProps {
  apiKey: string;
  center: google.maps.LatLngLiteral; // LatLngLiteral is a type provided by Google Maps API
  zoom: number;
}

const MapComponent: React.FC<MapProps> = ({ apiKey, center, zoom }) => {
  const mapRef = useRef<HTMLDivElement | null>(null); // Create a reference for the map container

  useEffect(() => {
    // Load the Google Maps API and initialize the map
    loadMap();
  }, [apiKey, center, zoom]); // Dependencies for re-rendering the effect

  const loadMap = async () => {
    if (!mapRef.current) return; // Early return if the ref is not set

    // Set the API options with your key
    setOptions({ key: apiKey });

    // Load the Google Maps API
    await importLibrary("maps");

    // Once the map container is available, create a new map
    new google.maps.Map(mapRef.current, {
      center,
      zoom,
    });
  };

  return (
    <div
      ref={mapRef} // Assign the map container to the div using the ref
      style={{ width: "100%", height: "400px" }} // Adjust the size as needed
    />
  );
};

export default MapComponent;
