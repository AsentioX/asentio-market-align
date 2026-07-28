import { ReactNode } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { JonLiProfile } from './JonLiProfile';
import { ChesterMuiProfile } from './ChesterMuiProfile';

type ProfileKey = 'jon' | 'chester';

interface ProfileDialogProps {
  profile: ProfileKey;
  children: ReactNode;
  className?: string;
}

export const ProfileDialog = ({ profile, children, className }: ProfileDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild className={className}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[92vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {profile === 'jon' ? <JonLiProfile compact /> : <ChesterMuiProfile compact />}
      </DialogContent>
    </Dialog>
  );
};
