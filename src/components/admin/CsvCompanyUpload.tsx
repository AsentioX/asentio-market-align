import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Download, AlertCircle, FileDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCSV, parseBool, parseArray, slugify, downloadCsv, exportRowsCsv, pruneEmpty } from './csvUtils';
import MergeModeToggle from './MergeModeToggle';
import ImportHistory from './ImportHistory';
import { logImport } from './importLog';

const HEADERS = [
  'Name', 'Slug', 'Website', 'Logo URL', 'Description', 'Mission', 'HQ Location',
  'Founded Year', 'Company Size', 'Human Activities', 'Human Capabilities',
  'AI Capabilities', 'Human Interface', 'Industry Focus', 'Ecosystem Roles',
  'Asentio Perspective', 'Editors Note', 'Editors Pick', 'Launch Date', 'End Of Life Date',
];

const SAMPLE = [
  'Figure AI', 'figure-ai', 'https://figure.ai', '', 'Humanoid robotics company building general-purpose robots.',
  'Expand human capability through autonomous robots.', 'Sunnyvale, CA', '2022', '101-500',
  'Operate;Observe', 'Act;Perceive', 'Embody;Spatial;Perceive', 'Embodied',
  'Manufacturing;Logistics', 'Experience',
  'Furthest along on real-world humanoid deployment.', 'One to watch', 'Yes', '2022-01-01', '',
];

const COLUMNS = ['name', 'slug', 'website', 'logo_url', 'description', 'mission', 'hq_location', 'founded_year', 'company_size', 'human_activities', 'human_capabilities', 'ai_capabilities', 'human_interface', 'industry_focus', 'ecosystem_roles', 'asentio_perspective', 'editors_note', 'is_editors_pick', 'launch_date', 'end_of_life_date'];

const CsvCompanyUpload = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mergeMode, setMergeMode] = useState(true);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => downloadCsv('companies_template.csv', HEADERS, [SAMPLE]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.from('xr_companies').select('*').order('name');
      if (error) throw error;
      exportRowsCsv('companies_export.csv', HEADERS, COLUMNS, (data || []) as Record<string, unknown>[]);
      toast({ title: 'Export complete', description: `${data?.length ?? 0} companies exported.` });
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
        .from('xr_companies')
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
        const company: Record<string, any> = {
          name,
          slug: row['slug'] || slugify(name),
          website: row['website'] || null,
          logo_url: row['logo url'] || null,
          description: row['description'] || null,
          mission: row['mission'] || null,
          hq_location: row['hq location'] || null,
          founded_year: row['founded year'] ? parseInt(row['founded year'], 10) || null : null,
          company_size: row['company size'] || null,
          human_activities: parseArray(row['human activities']),
          human_capabilities: parseArray(row['human capabilities']),
          ai_capabilities: parseArray(row['ai capabilities']),
          human_interface: parseArray(row['human interface']),
          industry_focus: parseArray(row['industry focus']),
          ecosystem_roles: parseArray(row['ecosystem roles']),
          asentio_perspective: row['asentio perspective'] || null,
          editors_note: row['editors note'] || null,
          is_editors_pick: parseBool(row['editors pick']) ?? (mergeMode && existingSlugs.has(row['slug'] || slugify(name)) ? null : false),
          launch_date: row['launch date'] || null,
          end_of_life_date: row['end of life date'] || null,
        };

        const payload = mergeMode && existingSlugs.has(company.slug) ? pruneEmpty(company) : company;
        const { error } = await supabase.from('xr_companies').upsert(payload as any, { onConflict: 'slug' });
        if (error) errors.push(`Row ${i + 2} (${name}): ${error.message}`);
        else success++;
      }

      setResult({ success, errors });
      queryClient.invalidateQueries({ queryKey: ['xr-companies'] });
      toast({
        title: 'CSV Import Complete',
        description: `${success} companies imported. ${errors.length} errors.`,
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
        <MergeModeToggle id="merge-companies" checked={mergeMode} onCheckedChange={setMergeMode} disabled={isUploading} />
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

export default CsvCompanyUpload;
