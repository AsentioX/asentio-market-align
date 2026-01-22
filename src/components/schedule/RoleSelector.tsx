import { SCHEDULE_ROLES, ScheduleRole } from '@/hooks/useSchedule';
import { cn } from '@/lib/utils';
import { User, Briefcase, Newspaper, GraduationCap, Settings } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: ScheduleRole | null;
  onSelectRole: (role: ScheduleRole | null) => void;
  isOnboarding?: boolean;
}

const roleIcons: Record<ScheduleRole, React.ReactNode> = {
  hacker: <User className="w-5 h-5" />,
  sponsor: <Briefcase className="w-5 h-5" />,
  press: <Newspaper className="w-5 h-5" />,
  mentor: <GraduationCap className="w-5 h-5" />,
  organizer: <Settings className="w-5 h-5" />,
};

const roleColors: Record<ScheduleRole, { bg: string; border: string; text: string }> = {
  hacker: { 
    bg: 'bg-cyan-500/20', 
    border: 'border-cyan-500/50 hover:border-cyan-400', 
    text: 'text-cyan-400' 
  },
  sponsor: { 
    bg: 'bg-purple-500/20', 
    border: 'border-purple-500/50 hover:border-purple-400', 
    text: 'text-purple-400' 
  },
  press: { 
    bg: 'bg-pink-500/20', 
    border: 'border-pink-500/50 hover:border-pink-400', 
    text: 'text-pink-400' 
  },
  mentor: { 
    bg: 'bg-green-500/20', 
    border: 'border-green-500/50 hover:border-green-400', 
    text: 'text-green-400' 
  },
  organizer: { 
    bg: 'bg-orange-500/20', 
    border: 'border-orange-500/50 hover:border-orange-400', 
    text: 'text-orange-400' 
  },
};

const RoleSelector = ({ selectedRole, onSelectRole, isOnboarding = false }: RoleSelectorProps) => {
  return (
    <div className={cn(
      "grid gap-2",
      isOnboarding ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-5"
    )}>
      {SCHEDULE_ROLES.map((role) => {
        const colors = roleColors[role.value];
        const isSelected = selectedRole === role.value;
        
        return (
          <button
            key={role.value}
            onClick={() => onSelectRole(isSelected ? null : role.value)}
            className={cn(
              "group relative flex items-center gap-2 p-3 rounded-xl border transition-all duration-200",
              isSelected
                ? `${colors.bg} ${colors.border} shadow-lg`
                : `bg-white/5 border-white/10 hover:bg-white/10 ${colors.border}`,
              isOnboarding && "flex-col text-center py-5"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
              isSelected 
                ? `${colors.bg} ${colors.text}` 
                : `bg-white/10 text-white/60 group-hover:${colors.text}`
            )}>
              {roleIcons[role.value]}
            </div>
            <div className={cn(isOnboarding ? "text-center" : "text-left")}>
              <span className={cn(
                "font-semibold text-sm",
                isSelected ? colors.text : "text-white/80"
              )}>
                {role.label}
              </span>
              {isOnboarding && (
                <p className="text-white/50 text-xs mt-1">
                  {role.value === 'hacker' && 'Build amazing XR projects'}
                  {role.value === 'sponsor' && 'Support the hackers'}
                  {role.value === 'press' && 'Cover the event'}
                  {role.value === 'mentor' && 'Guide the teams'}
                  {role.value === 'organizer' && 'Run the show'}
                </p>
              )}
            </div>
            {isSelected && (
              <div className={cn(
                "absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse",
                role.value === 'hacker' && 'bg-cyan-400',
                role.value === 'sponsor' && 'bg-purple-400',
                role.value === 'press' && 'bg-pink-400',
                role.value === 'mentor' && 'bg-green-400',
                role.value === 'organizer' && 'bg-orange-400'
              )} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
