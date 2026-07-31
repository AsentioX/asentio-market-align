import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Loader2, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseCSV, parseBool, parseArray, slugify, downloadCsv } from './csvUtils';

const HEADERS = [
  'Name', 'Slug', 'Website', 'Logo URL', 'Description', 'Mission', 'HQ Location',
  'Founded Year', 'Company Size', 'Company Type', 'Status', 'Funding Stage',
  'Primary Category', 'Subcategories', 'Human Activities', 'Human Capabilities',
  'AI Capabilities', 'Human Interface', 'Industry Focus', 'Ecosystem Roles',
  'Technologies', 'Target Markets', 'Products Summary', 'Key Investors',
  'Key Partnerships', 'Leadership', 'Asentio Perspective', 'Editors Note',
  'Editors Pick', 'Launch Date', 'End Of Life Date',
];

const SAMPLE = [
  'Figure AI', 'figure-ai', 'https://figure.ai', '', 'Humanoid robotics company building general-purpose robots.',
  'Expand human capability through autonomous robots.', 'Sunnyvale, CA', '2022', '101-500', 'Startup', 'Active', 'Series C',
  'Embodied AI', 'Humanoid Robots;Industrial Automation', 'Operate;Observe', 'Act;Perceive',
  'Embody;Spatial;Perceive', 'Embodied', 'Manufacturing;Logistics', 'Experience',
  'Vision-language-action models', 'Enterprise;Manufacturing', 'Figure 02 humanoid robot.',
  'OpenAI;Microsoft', 'BMW;UPS', 'Brett Adcock - CEO',
  'Furthest along on real-world humanoid deployment.', 'One to watch', 'Yes', '2022-01-01', '',
];

const CsvCompanyUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadTemplate = () => downloadCsv('companies_template.csv', HEADERS, [SAMPLE]);

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
          company_type: row['company type'] || null,
          status: row['status'] || null,
          funding_stage: row['funding stage'] || null,
          primary_category: row['primary category'] || null,
          subcategories: parseArray(row['subcategories']),
          human_activities: parseArray(row['human activities']),
          human_capabilities: parseArray(row['human capabilities']),
          ai_capabilities: parseArray(row['ai capabilities']),
          human_interface: parseArray(row['human interface']),
          industry_focus: parseArray(row['industry focus']),
          ecosystem_roles: parseArray(row['ecosystem roles']),
          technologies: parseArray(row['technologies']),
          target_markets: parseArray(row['target markets']),
          products_summary: row['products summary'] || null,
          key_investors: parseArray(row['key investors']),
          key_partnerships: parseArray(row['key partnerships']),
          leadership: parseArray(row['leadership']),
          asentio_perspective: row['asentio perspective'] || null,
          editors_note: row['editors note'] || null,
          is_editors_pick: parseBool(row['editors pick']) ?? false,
          launch_date: row['launch date'] || null,
          end_of_life_date: row['end of life date'] || null,
        };

        const { error } = await supabase.from('xr_companies').upsert(company as any, { onConflict: 'slug' });
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
              {result.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CsvCompanyUpload;
