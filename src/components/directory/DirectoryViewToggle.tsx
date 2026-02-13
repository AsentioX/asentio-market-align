import { LayoutGrid, List, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'card' | 'list' | 'graph';

interface DirectoryViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const views: { value: ViewMode; icon: React.ElementType; label: string }[] = [
  { value: 'card', icon: LayoutGrid, label: 'Card' },
  { value: 'list', icon: List, label: 'List' },
  { value: 'graph', icon: BarChart3, label: 'Graph' },
];

const DirectoryViewToggle = ({ view, onViewChange }: DirectoryViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {views.map(({ value, icon: Icon, label }) => (
        <Button
          key={value}
          variant={view === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(value)}
          className={`gap-1.5 text-xs ${view === value ? '' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
};

export default DirectoryViewToggle;
