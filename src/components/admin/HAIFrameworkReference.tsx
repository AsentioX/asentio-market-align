import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { HAI_DIMENSIONS, haiValueLabel } from '@/lib/haiFramework';
import { downloadCsv } from '@/components/admin/csvUtils';

const HAIFrameworkReference = () => {
  const handleExport = () => {
    const rows = HAI_DIMENSIONS.flatMap((d) =>
      d.values.map((v) => [d.label, d.key, d.question, v, haiValueLabel(d.key, v)])
    );
    downloadCsv(
      'hai-directory-fields.csv',
      ['Field', 'Field Key', 'Question', 'Option Value', 'Option Label'],
      rows
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Human-AI Framework Reference</h2>
          <p className="text-sm text-muted-foreground">
            Every HAI Directory field, its options and their full labels. Use these exact option
            values in CSV imports.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {HAI_DIMENSIONS.map((d) => (
        <Card key={d.key}>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-lg">{d.label}</CardTitle>
              <Badge variant="secondary" className="font-mono text-xs">{d.key}</Badge>
              <Badge variant="outline">{d.values.length} options</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{d.question} — {d.blurb}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium w-56">Option Value</th>
                    <th className="py-2 font-medium">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {d.values.map((v) => {
                    const label = haiValueLabel(d.key, v);
                    return (
                      <tr key={v} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono text-xs align-top">{v}</td>
                        <td className="py-2 align-top">
                          {label === v ? <span className="text-muted-foreground">—</span> : label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HAIFrameworkReference;
