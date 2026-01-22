import { ScheduleItem, SCHEDULE_ROLES, ScheduleRole } from '@/hooks/useSchedule';
import { cn } from '@/lib/utils';
import { 
  Calendar, ClipboardCheck, GraduationCap, Sparkles, Utensils, 
  Megaphone, Users, Coffee, HardDrive, Code, Handshake, 
  Gamepad2, Pencil, Trophy, PartyPopper, Award, Presentation,
  MapPin, Clock, AlertCircle, ClipboardList, DoorClosed, 
  Lightbulb, Mic, Package, BookOpen, Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScheduleCardProps {
  item: ScheduleItem;
  onClick: () => void;
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
    hacker: 'bg-cyan-500/80 text-white',
    sponsor: 'bg-purple-500/80 text-white',
    press: 'bg-pink-500/80 text-white',
    mentor: 'bg-green-500/80 text-white',
    organizer: 'bg-orange-500/80 text-white',
  };
  return styles[role] || 'bg-gray-500/80 text-white';
};

const ScheduleCard = ({ item, onClick }: ScheduleCardProps) => {
  const IconComponent = iconMap[item.icon_name || 'calendar'] || Calendar;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative bg-white/5 backdrop-blur-sm border border-rh-purple-light/20 rounded-xl p-4 hover:border-rh-pink/50 hover:bg-white/10 transition-all duration-300"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rh-pink/0 via-rh-purple/0 to-rh-cyan/0 group-hover:from-rh-pink/5 group-hover:via-rh-purple/5 group-hover:to-rh-cyan/5 transition-all duration-300 pointer-events-none" />
      
      <div className="relative flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rh-pink/20 to-rh-purple/20 rounded-xl flex items-center justify-center border border-rh-pink/30 group-hover:border-rh-pink/50 transition-colors">
          <IconComponent className="w-6 h-6 text-rh-pink" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg group-hover:text-rh-pink transition-colors line-clamp-1">
            {item.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-white/60">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-rh-yellow" />
              <span>
                {item.start_time}
                {item.end_time && ` - ${item.end_time}`}
              </span>
            </div>
            {item.location && (
              <div className="flex items-center gap-1.5 max-w-[200px]">
                <MapPin className="w-4 h-4 text-rh-cyan flex-shrink-0" />
                <span className="truncate">{item.location.split(' - ')[0]}</span>
              </div>
            )}
          </div>
          
          {/* Role badges */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.allowed_roles.slice(0, 3).map((role) => (
              <Badge 
                key={role} 
                variant="secondary" 
                className={cn(
                  "text-xs px-2 py-0.5 border-0 capitalize",
                  getRoleBadgeStyle(role)
                )}
              >
                {role}
              </Badge>
            ))}
            {item.allowed_roles.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-white/20 text-white/80">
                +{item.allowed_roles.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Arrow indicator */}
        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-rh-pink/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-rh-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ScheduleCard;
