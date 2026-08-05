import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Camera, Loader2, X } from 'lucide-react';

const BUCKET = 'scrm-team-photos';
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export async function uploadTeamPhoto(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) { toast.error('Please choose an image file'); return null; }
  if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return null; }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) { toast.error(error.message); return null; }
  const { data, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, TEN_YEARS);
  if (signErr || !data?.signedUrl) { toast.error(signErr?.message ?? 'Could not read uploaded photo'); return null; }
  return data.signedUrl;
}

export function PhotoUpload({
  value, onChange, size = 'md', label,
}: { value: string | null; onChange: (url: string | null) => void; size?: 'sm' | 'md'; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const dim = size === 'sm' ? 'w-9 h-9' : 'w-16 h-16';

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    const url = await uploadTeamPhoto(file);
    setBusy(false);
    if (url) { onChange(url); toast.success('Photo uploaded'); }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        title={label ?? 'Upload photo'}
        className={`${dim} rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 hover:border-slate-400 transition-colors relative`}
      >
        {value ? <img src={value} alt="Member photo" className="w-full h-full object-cover" /> : <Camera className="w-4 h-4" />}
        {busy && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
          </span>
        )}
      </button>
      {value && (
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-rose-600" onClick={() => onChange(null)}>
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { pick(e.target.files?.[0]); e.target.value = ''; }}
      />
    </div>
  );
}
