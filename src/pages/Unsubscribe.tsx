import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Status = 'validating' | 'ready' | 'already' | 'invalid' | 'submitting' | 'success' | 'error';

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('validating');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } }
        );
        const data = await res.json();
        if (res.ok && data.valid) setStatus('ready');
        else if (data.reason === 'already_unsubscribed') setStatus('already');
        else setStatus('invalid');
      } catch {
        setStatus('invalid');
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setStatus('submitting');
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok && data.success) setStatus('success');
      else if (data.reason === 'already_unsubscribed') setStatus('already');
      else {
        setError(data.error || 'Could not process request');
        setStatus('error');
      }
    } catch (e: any) {
      setError(e?.message || 'Network error');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-black/10 rounded-2xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-black mb-3">Email preferences</h1>
        {status === 'validating' && <p className="text-neutral-600">Checking your link…</p>}
        {status === 'invalid' && (
          <p className="text-neutral-600">This unsubscribe link is invalid or expired.</p>
        )}
        {status === 'already' && (
          <p className="text-neutral-600">You've already been unsubscribed. No further action needed.</p>
        )}
        {status === 'ready' && (
          <>
            <p className="text-neutral-600 mb-6">
              Click below to confirm you'd like to stop receiving emails from us.
            </p>
            <button
              onClick={confirm}
              className="px-6 py-3 rounded-lg bg-[#A31F34] text-white font-black hover:bg-[#FF000D] transition"
            >
              Confirm unsubscribe
            </button>
          </>
        )}
        {status === 'submitting' && <p className="text-neutral-600">Processing…</p>}
        {status === 'success' && (
          <p className="text-neutral-600">You've been unsubscribed. We're sorry to see you go.</p>
        )}
        {status === 'error' && <p className="text-[#A31F34]">{error}</p>}
      </div>
    </div>
  );
};

export default Unsubscribe;
