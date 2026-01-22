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
  MapPin, Clock, CalendarDays, AlertCircle, ClipboardList, 
  DoorClosed, Lightbulb, Mic, Package, BookOpen, Globe
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
  'alert-circle': AlertCircle,
  'clipboard-list': ClipboardList,
  'door-closed': DoorClosed,
  'lightbulb': Lightbulb,
  'mic': Mic,
  'package': Package,
  'book-open': BookOpen,
  'globe': Globe,
};

const getRoleBadgeStyle = (role: ScheduleRole) => {
  const styles: Record<ScheduleRole, string> = {
    hacker: 'bg-cyan-500 text-white',
    sponsor: 'bg-purple-500 text-white',
    press: 'bg-pink-500 text-white',
    mentor: 'bg-green-500 text-white',
    organizer: 'bg-orange-500 text-white',
  };
  return styles[role] || 'bg-gray-500 text-white';
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
      <DialogContent className="bg-gradient-to-br from-[#1a0a2e] to-[#2d1b4e] border-rh-purple-light/30 text-white max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-rh-pink/30 to-rh-purple/30 rounded-xl flex items-center justify-center border border-rh-pink/50">
              <IconComponent className="w-7 h-7 text-rh-pink" />
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
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 flex-1 border border-white/10">
              <Clock className="w-5 h-5 text-rh-yellow" />
              <div>
                <p className="text-xs text-white/50">Time</p>
                <p className="text-white font-medium">
                  {item.start_time}
                  {item.end_time && ` - ${item.end_time}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 flex-1 border border-white/10">
              <CalendarDays className="w-5 h-5 text-rh-cyan" />
              <div>
                <p className="text-xs text-white/50">Date</p>
                <p className="text-white font-medium">{formatDate(item.event_date)}</p>
              </div>
            </div>
          </div>
          
          {/* Location */}
          {item.location && (
            <div className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/10">
              <MapPin className="w-5 h-5 text-rh-pink mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/50">Location</p>
                <p className="text-white font-medium">{item.location}</p>
              </div>
            </div>
          )}
          
          {/* Description */}
          {item.description && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <DialogDescription className="text-white/80 leading-relaxed">
                {item.description}
              </DialogDescription>
            </div>
          )}
          
          {/* Roles */}
          <div>
            <p className="text-sm text-white/50 mb-2">Who can attend:</p>
            <div className="flex flex-wrap gap-2">
              {item.allowed_roles.map((role) => (
                <Badge 
                  key={role} 
                  className={cn(
                    "text-sm px-3 py-1 border-0 capitalize",
                    getRoleBadgeStyle(role)
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
