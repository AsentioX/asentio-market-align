import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MergeModeToggleProps {
  id: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}

const MergeModeToggle = ({ id, checked, onCheckedChange, disabled }: MergeModeToggleProps) => (
  <div className="flex items-center gap-2">
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    <Label htmlFor={id} className="text-xs font-medium cursor-pointer">
      Merge mode
    </Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-muted-foreground" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">
          On: blank cells in the CSV are ignored for existing records, so current values are kept.
          Off: an import overwrites every field, blanking anything left empty.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

export default MergeModeToggle;
