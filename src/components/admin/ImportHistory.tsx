import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { History, Loader2, Undo2 } from 'lucide-react';
import { ImportEntity, ImportLog, ENTITY_QUERY_KEY, rollbackImport } from './importLog';

interface Props {
  entityType: ImportEntity;
}

const ImportHistory = ({ entityType }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['import-logs', entityType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xr_import_logs')
        .select('*')
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as unknown as ImportLog[];
    },
  });

  const handleRollback = async (log: ImportLog) => {
    setRollingBackId(log.id);
    try {
      await rollbackImport(log);
      queryClient.invalidateQueries({ queryKey: ['import-logs', entityType] });
      queryClient.invalidateQueries({ queryKey: [ENTITY_QUERY_KEY[entityType]] });
      toast({ title: 'Rollback complete', description: 'That import has been reverted.' });
    } catch (err: any) {
      toast({ title: 'Rollback failed', description: err.message, variant: 'destructive' });
    } finally {
      setRollingBackId(null);
    }
  };

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading import history…
      </p>
    );
  }

  if (!logs || logs.length === 0) {
    return <p className="text-xs text-muted-foreground">No imports recorded yet.</p>;
  }

  return (
    <div className="border rounded-md divide-y">
      <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <History className="w-3.5 h-3.5" />
        Import history
      </div>
      {logs.map((log) => (
        <div key={log.id} className="px-3 py-2 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-medium truncate">
              {log.file_name || 'Untitled file'}
              <span className="ml-2 font-normal text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </span>
            </p>
            <p className="text-muted-foreground">
              {log.success_count} imported · {log.new_slugs?.length ?? 0} new ·{' '}
              {log.previous_rows?.length ?? 0} updated · {log.error_count} errors ·{' '}
              {log.merge_mode ? 'merge' : 'overwrite'}
            </p>
          </div>
          {log.rolled_back_at ? (
            <span className="shrink-0 text-muted-foreground">
              Rolled back {new Date(log.rolled_back_at).toLocaleDateString()}
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-7"
              disabled={rollingBackId === log.id}
              onClick={() => handleRollback(log)}
            >
              {rollingBackId === log.id ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Undo2 className="w-3 h-3 mr-1" />
              )}
              Rollback
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImportHistory;
