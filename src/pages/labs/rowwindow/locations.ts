// Curated rowing-friendly NOAA tide stations + nearby met (wind) stations.
// Each entry pairs a tide station with the closest meteorological station
// (since not every tide station has a wind sensor).

export interface RowLocation {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  tideStationId: string;
  windStationId: string;
}

export const ROW_LOCATIONS: RowLocation[] = [
  // San Francisco Bay
  { id: 'biac-redwood',     name: 'BIAC · Redwood City',        region: 'San Francisco Bay',      lat: 37.5063, lng: -122.2106, tideStationId: '9414523', windStationId: '9414750' },
  { id: 'oakland-estuary',  name: 'Oakland Estuary',            region: 'San Francisco Bay',      lat: 37.7955, lng: -122.2710, tideStationId: '9414750', windStationId: '9414750' },
  { id: 'sf-pier-39',       name: 'San Francisco · Pier 39',    region: 'San Francisco Bay',      lat: 37.8067, lng: -122.4650, tideStationId: '9414290', windStationId: '9414290' },
  { id: 'richmond',         name: 'Richmond Inner Harbor',      region: 'San Francisco Bay',      lat: 37.9233, lng: -122.4000, tideStationId: '9414863', windStationId: '9414750' },

  // Pacific Northwest
  { id: 'seattle',          name: 'Seattle · Lake Union',       region: 'Pacific Northwest',      lat: 47.6442, lng: -122.3370, tideStationId: '9447130', windStationId: '9447130' },
  { id: 'portland-or',      name: 'Portland · Willamette',      region: 'Pacific Northwest',      lat: 45.5230, lng: -122.6750, tideStationId: '9439040', windStationId: '9439040' },

  // Northeast
  { id: 'boston',           name: 'Boston · Charles River',     region: 'Northeast',              lat: 42.3554, lng: -71.0640,  tideStationId: '8443970', windStationId: '8443970' },
  { id: 'nyc-the-narrows',  name: 'New York · The Narrows',     region: 'Northeast',              lat: 40.6066, lng: -74.0440,  tideStationId: '8518750', windStationId: '8518750' },
  { id: 'philadelphia',     name: 'Philadelphia · Schuylkill',  region: 'Northeast',              lat: 39.9522, lng: -75.1810,  tideStationId: '8545240', windStationId: '8545240' },
  { id: 'newport-ri',       name: 'Newport, RI',                region: 'Northeast',              lat: 41.5050, lng: -71.3260,  tideStationId: '8452660', windStationId: '8452660' },

  // Southeast / Gulf
  { id: 'miami',            name: 'Miami · Virginia Key',       region: 'Southeast',              lat: 25.7314, lng: -80.1620,  tideStationId: '8723214', windStationId: '8723214' },
  { id: 'charleston',       name: 'Charleston Harbor',          region: 'Southeast',              lat: 32.7807, lng: -79.9250,  tideStationId: '8665530', windStationId: '8665530' },
  { id: 'galveston',        name: 'Galveston Bay',              region: 'Gulf Coast',             lat: 29.3100, lng: -94.7930,  tideStationId: '8771341', windStationId: '8771341' },

  // Great Lakes (NOAA water level stations — no tide, but levels + wind work)
  { id: 'chicago',          name: 'Chicago · Lake Michigan',    region: 'Great Lakes',            lat: 41.8333, lng: -87.6135,  tideStationId: '9087044', windStationId: '9087044' },
];

// Haversine distance in km between two lat/lng points.
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function findNearestLocation(lat: number, lng: number): RowLocation {
  let nearest = ROW_LOCATIONS[0];
  let best = haversineKm({ lat, lng }, nearest);
  for (const loc of ROW_LOCATIONS) {
    const d = haversineKm({ lat, lng }, loc);
    if (d < best) {
      best = d;
      nearest = loc;
    }
  }
  return nearest;
}

export const DEFAULT_LOCATION: RowLocation = ROW_LOCATIONS[0];
