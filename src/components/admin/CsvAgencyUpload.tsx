import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Download, AlertCircle, FileDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCSV, parseBool, parseArray, slugify, downloadCsv, exportRowsCsv, pruneEmpty } from './csvUtils';
import MergeModeToggle from './MergeModeToggle';

const HEADERS = [
  'Name', 'Slug', 'Website', 'Logo URL', 'Cover URL', 'Description',
  'Services', 'Regions', 'Editors Note', 'Editors Pick',
];

const SAMPLE = [
  'Magnopus', 'magnopus', 'https://magnopus.com', '', '',
  'Experience studio building immersive and spatial products.',
  'Spatial & Immersive;AI Development', 'North America;Europe',
  'Strong track record with location-based experiences', 'Yes',
];

const COLUMNS = ["name", "slug", "website", "logo_url", "cover_url", "description", "services", "regions", "editors_note", "is_editors_pick"];

const CsvAgencyUpload = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mergeMode, setMergeMode] = useState(true);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => downloadCsv('agencies_template.csv', HEADERS, [SAMPLE]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.from('xr_agencies').select('*').order('name');
      if (error) throw error;
      exportRowsCsv('agencies_export.csv', HEADERS, COLUMNS, (data || []) as Record<string, unknown>[]);
      toast({ title: 'Export complete', description: `${data?.length ?? 0} agencies exported.` });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
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
      const rows = parseCSV(await file.text());
      if (rows.length === 0) {
        toast({ title: 'Empty file', description: 'No data rows found.', variant: 'destructive' });
        return;
      }
      if (!('name' in rows[0])) {
        toast({ title: 'Missing columns', description: 'Required: Name', variant: 'destructive' });
        return;
      }

      const incomingSlugs = rows
        .map((r) => r['slug'] || slugify(r['name'] || ''))
        .filter(Boolean);
      const { data: existing } = await supabase
        .from('xr_agencies')
        .select('slug')
        .in('slug', incomingSlugs);
      const existingSlugs = new Set((existing || []).map((r: any) => r.slug));

      let success = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = row['name'] || '';
        if (!name) {
          errors.push(`Row ${i + 2}: Missing Name`);
          continue;
        }
        const slug = row['slug'] || slugify(name);
        const agency: Record<string, any> = {
          name,
          slug,
          website: row['website'] || null,
          logo_url: row['logo url'] || null,
          cover_url: row['cover url'] || null,
          description: row['description'] || null,
          services: parseArray(row['services']),
          regions: parseArray(row['regions']),
          editors_note: row['editors note'] || null,
          is_editors_pick: parseBool(row['editors pick']) ?? (mergeMode && existingSlugs.has(slug) ? null : false),
        };

        const payload = mergeMode && existingSlugs.has(slug) ? pruneEmpty(agency) : agency;
        const { error } = await supabase.from('xr_agencies').upsert(payload as any, { onConflict: 'slug' });
        if (error) errors.push(`Row ${i + 2} (${name}): ${error.message}`);
        else success++;
      }

      setResult({ success, errors });
      queryClient.invalidateQueries({ queryKey: ['xr-agencies'] });
      toast({
        title: 'CSV Import Complete',
        description: `${success} agencies imported. ${errors.length} errors.`,
        variant: errors.length > 0 ? 'destructive' : 'default',
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
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {isUploading ? 'Importing...' : 'Import CSV'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
          Export
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Template
        </Button>
        <MergeModeToggle id="merge-agencies" checked={mergeMode} onCheckedChange={setMergeMode} disabled={isUploading} />
      </div>

      {result && result.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-1">{result.success} imported, {result.errors.length} errors:</p>
            <ul className="list-disc pl-4 text-xs space-y-0.5 max-h-32 overflow-y-auto">
              {result.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CsvAgencyUpload;
