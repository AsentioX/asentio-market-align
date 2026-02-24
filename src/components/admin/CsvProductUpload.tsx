import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EXPECTED_HEADERS = [
  'company name', 'product name', 'company hq', 'region', 'shipping status',
  'price', 'category', 'product url', 'description', 'image url',
  'editors note', 'editors pick',
  // Platform & Software
  'operating system', 'standalone or tethered', 'sdk availability',
  'developer docs url', 'openxr compatible', 'app store availability',
  'sideloading allowed',
  // Display & Optics
  'optics type', 'field of view', 'resolution per eye', 'refresh rate',
  'brightness nits',
  // Sensors & Tracking
  'tracking type', 'slam support', 'hand tracking', 'eye tracking',
  'camera access for devs',
  // AI & Compute
  'soc processor', 'ram', 'on device ai', 'voice assistant', 'cloud dependency',
  // Hardware & Connectivity
  'battery life', 'weight', 'wifi bluetooth version', 'cellular 5g',
  // Scores
  'open ecosystem score', 'ai access score', 'spatial capability score',
  'monetization score', 'platform viability score',
  // Other
  'developer resources url', 'key features', 'additional images',
];

const parseCSV = (text: string): Record<string, string>[] => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  
  return lines.slice(1).map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    return row;
  });
};

const parseBool = (val: string): boolean | null => {
  if (!val) return null;
  const lower = val.toLowerCase();
  if (['yes', 'true', '1'].includes(lower)) return true;
  if (['no', 'false', '0'].includes(lower)) return false;
  return null;
};

const parseScore = (val: string): number | null => {
  if (!val) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
};

const parseArray = (val: string): string[] | null => {
  if (!val) return null;
  return val.split(';').map(s => s.trim()).filter(Boolean);
};

const CsvProductUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const csv = EXPECTED_HEADERS.map(h =>
      h.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ).join(',') + '\n' +
      'XREAL,One Pro,"San Francisco, CA",Global,Shipping,$299,AR Glasses,https://example.com,Great AR glasses,https://example.com/img.jpg,' +
      'Top pick,Yes,' +
      'Android,Standalone,Full SDK,https://docs.example.com,Yes,Own Store,Yes,' +
      'Waveguide,52°,1920x1080,120Hz,1000,' +
      '6DoF,Yes,Yes,Yes,Yes,' +
      'Snapdragon XR2,8GB,Yes,Built-in,Hybrid,' +
      '3 hours,80g,WiFi 6E / BT 5.3,No,' +
      '8,7,9,6,8,' +
      'https://dev.example.com,Spatial mapping;Hand gestures;Voice control,https://img1.jpg;https://img2.jpg';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({ title: 'Invalid file', description: 'Please upload a CSV file.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length === 0) {
        toast({ title: 'Empty file', description: 'No data rows found in the CSV.', variant: 'destructive' });
        setIsUploading(false);
        return;
      }

      const firstRow = rows[0];
      const missingHeaders = ['product name', 'company name', 'category', 'shipping status', 'region']
        .filter(h => !(h in firstRow));
      
      if (missingHeaders.length > 0) {
        toast({ title: 'Missing columns', description: `Required: ${missingHeaders.join(', ')}`, variant: 'destructive' });
        setIsUploading(false);
        return;
      }

      let success = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          const name = row['product name'] || '';
          const company = row['company name'] || '';
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          if (!name || !company) {
            errors.push(`Row ${i + 2}: Missing product name or company name`);
            continue;
          }

          const product: Record<string, any> = {
            name,
            slug,
            company,
            company_hq: row['company hq'] || null,
            category: row['category'] || '',
            ai_integration: 'No',
            price_range: row['price'] || null,
            shipping_status: row['shipping status'] || '',
            region: row['region'] || '',
            description: row['description'] || null,
            link: row['product url'] || null,
            image_url: row['image url'] || null,
            editors_note: row['editors note'] || null,
            is_editors_pick: parseBool(row['editors pick']) ?? false,
            // Platform & Software
            operating_system: row['operating system'] || null,
            standalone_or_tethered: row['standalone or tethered'] || null,
            sdk_availability: row['sdk availability'] || null,
            developer_docs_url: row['developer docs url'] || null,
            openxr_compatible: parseBool(row['openxr compatible']),
            app_store_availability: row['app store availability'] || null,
            sideloading_allowed: parseBool(row['sideloading allowed']),
            // Display & Optics
            optics_type: row['optics type'] || null,
            field_of_view: row['field of view'] || null,
            resolution_per_eye: row['resolution per eye'] || null,
            refresh_rate: row['refresh rate'] || null,
            brightness_nits: row['brightness nits'] || null,
            // Sensors & Tracking
            tracking_type: row['tracking type'] || null,
            slam_support: parseBool(row['slam support']),
            hand_tracking: parseBool(row['hand tracking']),
            eye_tracking: parseBool(row['eye tracking']),
            camera_access_for_devs: parseBool(row['camera access for devs']),
            // AI & Compute
            soc_processor: row['soc processor'] || null,
            ram: row['ram'] || null,
            on_device_ai: parseBool(row['on device ai']),
            voice_assistant: row['voice assistant'] || null,
            cloud_dependency: row['cloud dependency'] || null,
            // Hardware & Connectivity
            battery_life: row['battery life'] || null,
            weight: row['weight'] || null,
            wifi_bluetooth_version: row['wifi bluetooth version'] || null,
            cellular_5g: parseBool(row['cellular 5g']),
            // Scores
            open_ecosystem_score: parseScore(row['open ecosystem score']),
            ai_access_score: parseScore(row['ai access score']),
            spatial_capability_score: parseScore(row['spatial capability score']),
            monetization_score: parseScore(row['monetization score']),
            platform_viability_score: parseScore(row['platform viability score']),
            // Other
            developer_resources_url: row['developer resources url'] || null,
            key_features: parseArray(row['key features']),
            additional_images: parseArray(row['additional images']),
          };

          const { error } = await supabase
            .from('xr_products')
            .upsert(product as any, { onConflict: 'slug' });

          if (error) {
            errors.push(`Row ${i + 2} (${name}): ${error.message}`);
          } else {
            success++;
          }
        } catch (err: any) {
          errors.push(`Row ${i + 2}: ${err.message}`);
        }
      }

      setResult({ success, errors });
      queryClient.invalidateQueries({ queryKey: ['xr-products'] });

      toast({
        title: 'CSV Import Complete',
        description: `${success} products imported. ${errors.length} errors.`,
        variant: errors.length > 0 ? 'destructive' : 'default'
      });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {isUploading ? 'Importing...' : 'Import CSV'}
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Template
        </Button>
      </div>

      {result && result.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">{result.success} imported, {result.errors.length} errors:</p>
            <ul className="list-disc pl-4 text-xs space-y-0.5 max-h-32 overflow-y-auto">
              {result.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CsvProductUpload;
