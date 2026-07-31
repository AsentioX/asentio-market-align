export const parseCSV = (text: string): Record<string, string>[] => {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(current.trim());
      current = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else {
      current += char;
    }
  }
  row.push(current.trim());
  if (row.some((v) => v !== '')) rows.push(row);

  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((values) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? '';
    });
    return obj;
  });
};

export const parseBool = (val: string): boolean | null => {
  if (!val) return null;
  const lower = val.toLowerCase();
  if (['yes', 'true', '1'].includes(lower)) return true;
  if (['no', 'false', '0'].includes(lower)) return false;
  return null;
};

export const parseArray = (val: string): string[] | null => {
  if (!val) return null;
  return val.split(';').map((s) => s.trim()).filter(Boolean);
};

export const slugify = (val: string): string =>
  val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const escapeCell = (val: string) => (/[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val);

export const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [headers, ...rows].map((r) => r.map(escapeCell).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const csvValue = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (Array.isArray(val)) return val.join(';');
  return String(val);
};

export const exportRowsCsv = (
  filename: string,
  headers: string[],
  columns: string[],
  rows: Record<string, unknown>[]
) => {
  downloadCsv(
    filename,
    headers,
    rows.map((r) => columns.map((c) => csvValue(r[c])))
  );
};
