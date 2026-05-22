// Ensure Leaflet CSS + default icon paths resolve from CDN (Vite-friendly).
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default marker icons fail under bundlers because Leaflet expects file paths
// relative to its CSS. Wire them to the unpkg CDN so they render correctly.
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export default L;
