import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EXPECTED_HEADERS = [
  'company name', 'product name', 'company hq', 'region', 'shipping status',
  'price', 'category', 'product url', 'description', 'image url'
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
    const csv = EXPECTED_HEADERS.map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(',') + '\n' +
      'XREAL,One Pro,"San Francisco, CA",Global,Shipping,$299,AR Glasses,https://example.com,Great AR glasses,https://example.com/img.jpg';
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

          const product = {
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
          };

          if (!product.name || !product.company) {
            errors.push(`Row ${i + 2}: Missing product name or company name`);
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
