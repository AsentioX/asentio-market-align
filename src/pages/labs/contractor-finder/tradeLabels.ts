// CSLB classification code → human-readable trade name.
// Used across the Contractor Finder for cards, filters, drawers, and the legend modal.

export const TRADE_LABELS: Record<string, string> = {
  'A': 'General Engineering',
  'B': 'General Building Contractor',
  'B-2': 'Residential Remodeling',
  'C-2': 'Insulation / Acoustical',
  'C-4': 'Boiler / Hot Water Heating',
  'C-5': 'Framing / Rough Carpentry',
  'C-6': 'Cabinet / Millwork / Finish Carpentry',
  'C-7': 'Low Voltage Systems',
  'C-8': 'Concrete',
  'C-9': 'Drywall',
  'C-10': 'Electrical',
  'C-11': 'Elevator Installation',
  'C-12': 'Earthwork & Paving',
  'C-13': 'Fencing',
  'C-15': 'Flooring & Floor Covering',
  'C-16': 'Fire Protection',
  'C-17': 'Glazing',
  'C-20': 'HVAC (Warm-Air Heating, Ventilating & A/C)',
  'C-21': 'Building Moving / Demolition',
  'C-22': 'Asbestos Abatement',
  'C-23': 'Ornamental Metals',
  'C-27': 'Landscaping',
  'C-28': 'Lock & Security Equipment',
  'C-29': 'Masonry',
  'C-31': 'Construction Zone Traffic Control',
  'C-32': 'Parking & Highway Improvement',
  'C-33': 'Painting & Decorating',
  'C-34': 'Pipeline',
  'C-35': 'Lathing & Plastering',
  'C-36': 'Plumbing',
  'C-38': 'Refrigeration',
  'C-39': 'Roofing',
  'C-42': 'Sanitation System',
  'C-43': 'Sheet Metal',
  'C-45': 'Sign',
  'C-46': 'Solar',
  'C-47': 'General Manufactured Housing',
  'C-49': 'Tree & Palm',
  'C-50': 'Reinforcing Steel',
  'C-51': 'Structural Steel',
  'C-53': 'Swimming Pool',
  'C-54': 'Ceramic & Mosaic Tile',
  'C-55': 'Water Conditioning',
  'C-57': 'Well Drilling (Water)',
  'C-60': 'Welding',
  'C-61': 'Limited Specialty',
  'D-03': 'Awnings',
  'D-04': 'Central Vacuum Systems',
  'D-06': 'Concrete Related Services',
  'D-09': 'Drilling, Blasting & Oil Field Work',
  'D-10': 'Elevated Floors',
  'D-12': 'Synthetic Products',
  'D-16': 'Hardware, Locks & Safes',
  'D-21': 'Machinery & Pumps',
  'D-24': 'Metal Products',
  'D-28': 'Doors, Gates & Activating Devices',
  'D-29': 'Paperhanging',
  'D-30': 'Pile Driving & Pressure Foundation Jacking',
  'D-31': 'Pole Installation & Maintenance',
  'D-34': 'Prefabricated Equipment',
  'D-35': 'Pool & Spa Maintenance',
  'D-38': 'Sand & Water Blasting',
  'D-39': 'Scaffolding',
  'D-40': 'Service Station Equipment & Maintenance',
  'D-41': 'Siding & Decking',
  'D-42': 'Sign Installation',
  'D-49': 'Tree Service',
  'D-50': 'Suspended Ceilings',
  'D-52': 'Window Coverings',
  'D-53': 'Wood Tanks',
  'D-56': 'Trenching Only',
  'D-59': 'Hydroseed Spraying',
  'D-62': 'Air & Water Balancing',
  'D-63': 'Construction Clean-up',
  'D-64': 'Non-Specialized',
  'D-65': 'Weatherization & Energy Conservation',
  'HAZ': 'Hazardous Substance Removal',
  'ASB': 'Asbestos Certification',
};

/** Returns the friendly trade name for a CSLB code, or the code itself if unknown. */
export function tradeLabel(code: string | null | undefined): string {
  if (!code) return '';
  const upper = code.trim().toUpperCase();
  if (TRADE_LABELS[upper]) return TRADE_LABELS[upper];
  // Tolerate codes without dashes (e.g., "C10" → "C-10", "D03" → "D-03")
  const dashed = upper.replace(/^([A-Z]+)(\d+)$/, '$1-$2');
  if (TRADE_LABELS[dashed]) return TRADE_LABELS[dashed];
  // Try padded variant for D-codes (D-3 → D-03)
  const padded = dashed.replace(/^([A-Z]+)-(\d)$/, '$1-0$2');
  return TRADE_LABELS[padded] ?? code;
}

/** Returns "C-10 · Electrical" or the friendly label alone if no code is provided. */
export function formatTrade(code: string | null | undefined): string {
  if (!code) return '';
  const label = tradeLabel(code);
  return label === code ? code : `${code} · ${label}`;
}

/** Sorted list of all known classifications, useful for legends and filter UIs. */
export function listTrades(): Array<{ code: string; label: string }> {
  return Object.entries(TRADE_LABELS)
    .map(([code, label]) => ({ code, label }))
    .sort((a, b) => {
      // Sort by letter prefix then numeric portion (A, B, B-2, C-2, C-4, ...)
      const [, aPrefix = '', aNum = '0'] = a.code.match(/^([A-Z]+)-?(\d+)?/) ?? [];
      const [, bPrefix = '', bNum = '0'] = b.code.match(/^([A-Z]+)-?(\d+)?/) ?? [];
      if (aPrefix !== bPrefix) return aPrefix.localeCompare(bPrefix);
      return parseInt(aNum || '0', 10) - parseInt(bNum || '0', 10);
    });
}
