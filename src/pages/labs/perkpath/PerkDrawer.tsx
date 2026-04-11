import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import type { Perk } from './perkData';

interface Props {
  perk: Perk | null;
  open: boolean;
  onClose: () => void;
}

const PerkDrawer = ({ perk, open, onClose }: Props) => {
  if (!perk) return null;

  return (
    <Drawer open={open} onOpenChange={v => !v && onClose()}>
      <DrawerContent className="max-w-[430px] mx-auto rounded-t-3xl">
        <DrawerHeader className="text-left px-6 pt-6 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: perk.brandColor }}>
              {perk.membershipName}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              {perk.distance === '—' ? 'Nationwide' : `${perk.distance} away`}
            </span>
          </div>
          <DrawerTitle className="text-xl font-bold text-slate-900">{perk.title}</DrawerTitle>
          <DrawerDescription className="text-slate-500 text-sm mt-1">{perk.venue}</DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-8 space-y-5">
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold">
            {perk.value}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">How to Redeem</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{perk.howToRedeem}</p>
          </div>
          <button
            onClick={() => toast.success('Member ID shown to cashier ✓')}
            className="w-full h-12 rounded-2xl bg-slate-900 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <CreditCard className="w-4 h-4" />
            Show Member ID
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PerkDrawer;
