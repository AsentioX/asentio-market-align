import { ScheduleItem, SCHEDULE_ROLES, ScheduleRole } from '@/hooks/useSchedule';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Calendar, ClipboardCheck, GraduationCap, Sparkles, Utensils, 
  Megaphone, Users, Coffee, HardDrive, Code, Handshake, 
  Gamepad2, Pencil, Trophy, PartyPopper, Award, Presentation,
  MapPin, Clock, CalendarDays
} from 'lucide-react';

interface ScheduleDetailProps {
  item: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  'calendar': Calendar,
  'clipboard-check': ClipboardCheck,
  'graduation-cap': GraduationCap,
  'sparkles': Sparkles,
  'utensils': Utensils,
  'megaphone': Megaphone,
  'users': Users,
  'coffee': Coffee,
  'hard-drive': HardDrive,
  'code': Code,
  'handshake': Handshake,
  'gamepad-2': Gamepad2,
  'pencil': Pencil,
  'trophy': Trophy,
  'party-popper': PartyPopper,
  'award': Award,
  'presentation': Presentation,
};

const getRoleBadgeColor = (role: ScheduleRole) => {
  const roleConfig = SCHEDULE_ROLES.find(r => r.value === role);
  return roleConfig?.color || 'bg-gray-500';
};

const ScheduleDetail = ({ item, open, onClose }: ScheduleDetailProps) => {
  if (!item) return null;
  
  const IconComponent = iconMap[item.icon_name || 'calendar'] || Calendar;
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-cyan-500/50">
              <IconComponent className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {item.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Time & Date */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-3 flex-1">
              <Clock className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-white font-medium">
                  {item.start_time}
                  {item.end_time && ` - ${item.end_time}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-3 flex-1">
              <CalendarDays className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-white font-medium">{formatDate(item.event_date)}</p>
              </div>
            </div>
          </div>
          
          {/* Location */}
          {item.location && (
            <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-3">
              <MapPin className="w-5 h-5 text-pink-400" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-white font-medium">{item.location}</p>
              </div>
            </div>
          )}
          
          {/* Description */}
          {item.description && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <DialogDescription className="text-gray-300 leading-relaxed">
                {item.description}
              </DialogDescription>
            </div>
          )}
          
          {/* Roles */}
          <div>
            <p className="text-sm text-gray-400 mb-2">Who can attend:</p>
            <div className="flex flex-wrap gap-2">
              {item.allowed_roles.map((role) => (
                <Badge 
                  key={role} 
                  className={cn(
                    "text-sm px-3 py-1 text-white border-0 capitalize",
                    getRoleBadgeColor(role)
                  )}
                >
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleDetail;
