/**
 * Public-safe profile configuration.
 * Never populate mapLatitude/mapLongitude with an exact address or
 * device GPS reading — city-level coordinates only. See docs/PRIVACY_REVIEW.md.
 */
export interface ProfileConfig {
  name: string;
  professionalTitle: string;
  country: string;
  state: string;
  city: string;
  publicLocationLabel: string;
  /** City-level centroid, not an exact address. */
  mapLatitude: number;
  mapLongitude: number;
}

export const profileConfig: ProfileConfig = {
  name: "C.R. Maari (Marimuthu)",
  professionalTitle: "Senior Embedded Firmware Engineer",
  country: "India",
  state: "Tamil Nadu",
  city: "Coimbatore",
  publicLocationLabel: "Coimbatore, Tamil Nadu, India",
  mapLatitude: 11.0168,
  mapLongitude: 76.9558,
};
