import { SCHEDULE_ROLES, ScheduleRole } from '@/hooks/useSchedule';
import { cn } from '@/lib/utils';
import { User, Briefcase, Newspaper, GraduationCap, Settings } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: ScheduleRole | null;
  onSelectRole: (role: ScheduleRole) => void;
  isOnboarding?: boolean;
}

const roleIcons: Record<ScheduleRole, React.ReactNode> = {
  hacker: <User className="w-6 h-6" />,
  sponsor: <Briefcase className="w-6 h-6" />,
  press: <Newspaper className="w-6 h-6" />,
  mentor: <GraduationCap className="w-6 h-6" />,
  organizer: <Settings className="w-6 h-6" />,
};

const RoleSelector = ({ selectedRole, onSelectRole, isOnboarding = false }: RoleSelectorProps) => {
  return (
    <div className={cn(
      "grid gap-3",
      isOnboarding ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 sm:grid-cols-5"
    )}>
      {SCHEDULE_ROLES.map((role) => (
        <button
          key={role.value}
          onClick={() => onSelectRole(role.value)}
          className={cn(
            "group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
            "hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20",
            selectedRole === role.value
              ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/30"
              : "border-gray-700 bg-gray-800/50 hover:border-cyan-500/50",
            isOnboarding && "flex-col text-center py-6"
          )}
        >
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
            selectedRole === role.value 
              ? "bg-cyan-500 text-black" 
              : "bg-gray-700 text-cyan-400 group-hover:bg-cyan-500/20"
          )}>
            {roleIcons[role.value]}
          </div>
          <div className={cn(isOnboarding ? "text-center" : "text-left")}>
            <span className={cn(
              "font-semibold text-lg",
              selectedRole === role.value ? "text-cyan-400" : "text-white"
            )}>
              {role.label}
            </span>
            {isOnboarding && (
              <p className="text-gray-400 text-sm mt-1">
                {role.value === 'hacker' && 'Build amazing XR projects'}
                {role.value === 'sponsor' && 'Support the hackers'}
                {role.value === 'press' && 'Cover the event'}
                {role.value === 'mentor' && 'Guide the teams'}
                {role.value === 'organizer' && 'Run the show'}
              </p>
            )}
          </div>
          {selectedRole === role.value && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

export default RoleSelector;
