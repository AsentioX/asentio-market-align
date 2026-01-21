import { ScheduleItem, SCHEDULE_ROLES, ScheduleRole } from '@/hooks/useSchedule';
import { cn } from '@/lib/utils';
import { 
  Calendar, ClipboardCheck, GraduationCap, Sparkles, Utensils, 
  Megaphone, Users, Coffee, HardDrive, Code, Handshake, 
  Gamepad2, Pencil, Trophy, PartyPopper, Award, Presentation,
  MapPin, Clock
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
};

const ScheduleCard = ({ item, onClick }: ScheduleCardProps) => {
  const IconComponent = iconMap[item.icon_name || 'calendar'] || Calendar;
  
  const getRoleBadgeColor = (role: ScheduleRole) => {
    const roleConfig = SCHEDULE_ROLES.find(r => r.value === role);
    return roleConfig?.color || 'bg-gray-500';
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-xl p-4 hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />
      
      <div className="relative flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30 group-hover:border-cyan-400/50 transition-colors">
          <IconComponent className="w-6 h-6 text-cyan-400" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-lg group-hover:text-cyan-300 transition-colors truncate">
            {item.title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-cyan-500/70" />
              <span>
                {item.start_time}
                {item.end_time && ` - ${item.end_time}`}
              </span>
            </div>
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-purple-500/70" />
                <span className="truncate">{item.location}</span>
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
                  "text-xs px-2 py-0.5 text-white border-0",
                  getRoleBadgeColor(role)
                )}
              >
                {role}
              </Badge>
            ))}
            {item.allowed_roles.length > 3 && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300">
                +{item.allowed_roles.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Arrow indicator */}
        <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ScheduleCard;
