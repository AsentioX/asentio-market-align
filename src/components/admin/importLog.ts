import { supabase } from '@/integrations/supabase/client';

export type ImportEntity = 'products' | 'companies' | 'agencies';

export const ENTITY_TABLE: Record<ImportEntity, 'xr_products' | 'xr_companies' | 'xr_agencies'> = {
  products: 'xr_products',
  companies: 'xr_companies',
  agencies: 'xr_agencies',
};

export const ENTITY_QUERY_KEY: Record<ImportEntity, string> = {
  products: 'xr-products',
  companies: 'xr-companies',
  agencies: 'xr-agencies',
};

export interface ImportLog {
  id: string;
  entity_type: ImportEntity;
  file_name: string | null;
  merge_mode: boolean;
  success_count: number;
  error_count: number;
  errors: string[];
  new_slugs: string[];
  previous_rows: Record<string, unknown>[];
  rolled_back_at: string | null;
  created_at: string;
}

export const logImport = async (params: {
  entityType: ImportEntity;
  fileName: string;
  mergeMode: boolean;
  successCount: number;
  errors: string[];
  newSlugs: string[];
  previousRows: Record<string, unknown>[];
}) => {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('xr_import_logs').insert({
    entity_type: params.entityType,
    file_name: params.fileName,
    merge_mode: params.mergeMode,
    success_count: params.successCount,
    error_count: params.errors.length,
    errors: params.errors,
    new_slugs: params.newSlugs,
    previous_rows: params.previousRows as any,
    imported_by: userData?.user?.id ?? null,
  } as any);
  if (error) console.error('Failed to write import log', error);
};

/**
 * Restores the database to the state captured before the given import:
 * deletes rows created by that import and re-writes the snapshotted rows.
 */
export const rollbackImport = async (log: ImportLog) => {
  const table = ENTITY_TABLE[log.entity_type];

  if (log.new_slugs?.length) {
    const { error } = await supabase.from(table).delete().in('slug', log.new_slugs);
    if (error) throw error;
  }

  for (const row of log.previous_rows || []) {
    const { error } = await supabase
      .from(table)
      .upsert(row as any, { onConflict: 'slug' });
    if (error) throw error;
  }

  const { error: markError } = await supabase
    .from('xr_import_logs')
    .update({ rolled_back_at: new Date().toISOString() })
    .eq('id', log.id);
  if (markError) throw markError;
};
