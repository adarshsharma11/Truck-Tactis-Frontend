import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

export const AddressSearch = async (
  apiKey: string,
  inputElement: HTMLInputElement,
  callback: (addressComponents: google.maps.GeocoderAddressComponent[]) => void
) => {
  setOptions({
    key: apiKey,
    libraries: ["places"],
  });

  const placesLib = (await importLibrary("places")) as google.maps.PlacesLibrary;

  const autocomplete = new placesLib.Autocomplete(inputElement, {
    types: ["geocode"],
    componentRestrictions: { country: "in" },
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();

    if (place && place.address_components) {
      callback(place.address_components);
    } else {
      callback([]); // Empty array if no data
    }
  });
};
