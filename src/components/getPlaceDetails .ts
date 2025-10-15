import { Location } from "@/types";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export const getPlaceDetails = async (
  apiKey: string,
  placeId: string
): Promise<Location | null> => {
  setOptions({
    key: apiKey,
    libraries: ["places"],
  });

  const { PlacesService } = (await importLibrary("places")) as google.maps.PlacesLibrary;

  // Dummy map element required by Google PlacesService
  const map = document.createElement("div");
  const service = new PlacesService(map);

  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry", "address_components"],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          const locationDetails = {
            placeId: place.place_id,
            name: place.name || place.formatted_address,
            address: place.formatted_address || '',
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            city: getAddressComponent(place, "locality"),
            state: getAddressComponent(place, "administrative_area_level_1"),
            country: getAddressComponent(place, "country"),
            postalCode: getAddressComponent(place, "postal_code"),
          };

          resolve(locationDetails);
          // resolve(place);
        } else {
          resolve(null);
        }
      }
    );
  });
};
// Helper function to extract address components
function getAddressComponent(place, type) {
  const component = place.address_components.find((component) =>
    component.types.includes(type)
  );
  return component ? component.long_name : '';
}

