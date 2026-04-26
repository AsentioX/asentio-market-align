import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { usePerkPathAuth } from '@/hooks/usePerkPathAuth';
import { Input } from '@/components/ui/input';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

type CardType = 'credit' | 'membership' | 'loyalty' | 'other';

const CARD_TYPES: { value: CardType; label: string; emoji: string }[] = [
  { value: 'credit', label: 'Credit Card', emoji: '💳' },
  { value: 'membership', label: 'Membership', emoji: '🪪' },
  { value: 'loyalty', label: 'Loyalty', emoji: '⭐' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

const BRAND_COLORS = ['#1F2937', '#1565C0', '#D32F2F', '#1A237E', '#37474F', '#10b981', '#7C3AED', '#F59E0B'];

const AddCardModal = ({ open, onClose, onAdded }: Props) => {
  const { user } = usePerkPathAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'capture' | 'details'>('capture');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tier, setTier] = useState('');
  const [cardType, setCardType] = useState<CardType>('membership');
  const [brandColor, setBrandColor] = useState(BRAND_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setStep('capture');
    setImageFile(null);
    setImagePreview(null);
    setName(''); setTier('');
    setCardType('membership');
    setBrandColor(BRAND_COLORS[0]);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be under 8MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setStep('details');
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { toast.error('Card name is required'); return; }

    setSaving(true);
    try {
      let cardImageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('pp-cards')
          .upload(path, imageFile, { contentType: imageFile.type, upsert: false });
        if (upErr) throw upErr;
        const { data: signed } = await supabase.storage.from('pp-cards').createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
        cardImageUrl = signed?.signedUrl ?? null;
      }

      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;

      const { error } = await supabase.from('pp_memberships').insert({
        user_id: user.id,
        slug,
        name: name.trim(),
        tier: tier.trim() || null,
        category: cardType === 'credit' ? 'financial' : 'lifestyle',
        pillar: 'home',
        brand_color: brandColor,
        logo: CARD_TYPES.find(c => c.value === cardType)?.emoji ?? '✨',
        card_type: cardType,
        card_image_url: cardImageUrl,
        perk_tags: [],
      });
      if (error) throw error;

      toast.success('Card added to wallet');
      onAdded();
      handleClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[430px] bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-lg px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between z-10">
              <h2 className="text-base font-bold text-slate-900">
                {step === 'capture' ? 'Add a Card' : 'Card Details'}
              </h2>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 'capture' ? (
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-500">
                  Snap a photo of your card or upload an image. We'll store it securely so you can pull it up at checkout.
                </p>

                <button
                  onClick={() => cameraRef.current?.click()}
                  className="w-full h-32 rounded-2xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center gap-2 text-emerald-700 hover:bg-emerald-100 transition-colors"
                >
                  <Camera className="w-7 h-7" />
                  <span className="text-sm font-semibold">Take Photo</span>
                </button>

                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-24 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-semibold">Upload from Library</span>
                </button>

                <button
                  onClick={() => setStep('details')}
                  className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-2"
                >
                  Skip — add manually
                </button>

                <input
                  ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <input
                  ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {imagePreview && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[1.6/1]">
                    <img src={imagePreview} alt="Card preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setImageFile(null); setImagePreview(null); setStep('capture'); }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Card Type</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CARD_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setCardType(t.value)}
                        className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all ${
                          cardType === t.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-lg">{t.emoji}</span>
                        <span className="text-[10px] font-semibold">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Card Name</label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Chase Sapphire, Costco, AAA"
                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Tier <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span></label>
                  <Input
                    value={tier}
                    onChange={e => setTier(e.target.value)}
                    placeholder="Reserve, Platinum, Gold…"
                    className="h-11 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Card Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {BRAND_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setBrandColor(c)}
                        className={`w-9 h-9 rounded-full border-2 transition-transform ${brandColor === c ? 'border-slate-900 scale-110' : 'border-white'}`}
                        style={{ backgroundColor: c, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim()}
                  className="w-full h-12 rounded-2xl bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 transition-colors mt-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Add to Wallet'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddCardModal;
