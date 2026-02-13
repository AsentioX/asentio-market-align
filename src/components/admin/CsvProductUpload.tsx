import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EXPECTED_HEADERS = [
  'name', 'slug', 'company', 'category', 'ai_integration',
  'price_range', 'shipping_status', 'region', 'description',
  'key_features', 'link', 'image_url', 'is_editors_pick', 'editors_note'
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

const CsvProductUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => {
    const csv = EXPECTED_HEADERS.join(',') + '\n' +
      'XREAL One Pro,xreal-one-pro,XREAL,AR Glasses,No,$299,Available,Global,Great AR glasses,"Feature 1|Feature 2",https://example.com,https://example.com/img.jpg,false,';
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

      // Validate required headers
      const firstRow = rows[0];
      const missingHeaders = ['name', 'slug', 'company', 'category', 'shipping_status', 'region']
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
          const product = {
            name: row.name,
            slug: row.slug,
            company: row.company,
            category: row.category,
            ai_integration: row.ai_integration || 'No',
            price_range: row.price_range || null,
            shipping_status: row.shipping_status,
            region: row.region,
            description: row.description || null,
            key_features: row.key_features ? row.key_features.split('|').map(f => f.trim()).filter(Boolean) : null,
            link: row.link || null,
            image_url: row.image_url || null,
            is_editors_pick: row.is_editors_pick === 'true',
            editors_note: row.editors_note || null,
          };

          if (!product.name || !product.slug || !product.company) {
            errors.push(`Row ${i + 2}: Missing name, slug, or company`);
            continue;
          }

          // Upsert by slug
          const { error } = await supabase
            .from('xr_products')
            .upsert(product, { onConflict: 'slug' });

          if (error) {
            errors.push(`Row ${i + 2} (${row.name}): ${error.message}`);
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
