import { useMemo } from 'react';
import { ScheduleItem, ScheduleRole } from '@/hooks/useSchedule';
import { cn } from '@/lib/utils';
import { 
  Calendar, ClipboardCheck, GraduationCap, Sparkles, Utensils, 
  Megaphone, Users, Coffee, HardDrive, Code, Handshake, 
  Gamepad2, Pencil, Trophy, PartyPopper, Award, Presentation,
  MapPin, AlertCircle, ClipboardList, DoorClosed, 
  Lightbulb, Mic, Package, BookOpen, Globe
} from 'lucide-react';

interface ScheduleTimelineProps {
  items: ScheduleItem[];
  onItemClick: (item: ScheduleItem) => void;
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

// Color palette for event cards
const eventColors = [
  { bg: 'bg-purple-400/30', border: 'border-purple-400/50', text: 'text-purple-100' },
  { bg: 'bg-cyan-400/30', border: 'border-cyan-400/50', text: 'text-cyan-100' },
  { bg: 'bg-pink-400/30', border: 'border-pink-400/50', text: 'text-pink-100' },
  { bg: 'bg-yellow-400/30', border: 'border-yellow-400/50', text: 'text-yellow-100' },
  { bg: 'bg-green-400/30', border: 'border-green-400/50', text: 'text-green-100' },
  { bg: 'bg-orange-400/30', border: 'border-orange-400/50', text: 'text-orange-100' },
  { bg: 'bg-blue-400/30', border: 'border-blue-400/50', text: 'text-blue-100' },
  { bg: 'bg-rose-400/30', border: 'border-rose-400/50', text: 'text-rose-100' },
];

// Parse time string like "09:00" or "9:00 AM" to minutes from midnight
const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  // Handle "HH:MM" format
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }
  
  // Handle "H:MM AM/PM" format
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  }
  
  return 0;
};

// Format minutes to display time
const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const ScheduleTimeline = ({ items, onItemClick }: ScheduleTimelineProps) => {
  // Calculate timeline bounds based on events
  const { startHour, endHour, timelineItems, locations } = useMemo(() => {
    if (!items.length) {
      return { startHour: 8, endHour: 22, timelineItems: [], locations: [] };
    }

    // Get unique locations
    const uniqueLocations = [...new Set(items.map(item => item.location || 'TBD'))].sort();
    
    // Calculate min/max hours
    let minMinutes = Infinity;
    let maxMinutes = 0;
    
    const processedItems = items.map((item, index) => {
      const startMinutes = parseTimeToMinutes(item.start_time);
      const endMinutes = item.end_time ? parseTimeToMinutes(item.end_time) : startMinutes + 60;
      
      minMinutes = Math.min(minMinutes, startMinutes);
      maxMinutes = Math.max(maxMinutes, endMinutes);
      
      const locationIndex = uniqueLocations.indexOf(item.location || 'TBD');
      const colorIndex = index % eventColors.length;
      
      return {
        ...item,
        startMinutes,
        endMinutes,
        durationMinutes: endMinutes - startMinutes,
        locationIndex,
        color: eventColors[colorIndex],
      };
    });
    
    // Round to nearest hour
    const start = Math.floor(minMinutes / 60);
    const end = Math.ceil(maxMinutes / 60);
    
    return {
      startHour: Math.max(0, start - 1),
      endHour: Math.min(24, end + 1),
      timelineItems: processedItems,
      locations: uniqueLocations,
    };
  }, [items]);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const hourHeight = 80; // pixels per hour
  const totalHeight = hours.length * hourHeight;

  // Group items by location for column layout
  const itemsByLocation = useMemo(() => {
    const grouped: Record<string, typeof timelineItems> = {};
    locations.forEach(loc => {
      grouped[loc] = timelineItems.filter(item => (item.location || 'TBD') === loc);
    });
    return grouped;
  }, [timelineItems, locations]);

  if (!items.length) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Location headers */}
        <div className="flex border-b border-white/10 mb-2 sticky top-0 bg-[#1a0a2e]/95 backdrop-blur-sm z-10">
          <div className="w-16 flex-shrink-0" /> {/* Time column spacer */}
          <div className="flex-1 flex">
            {locations.map((location, idx) => (
              <div 
                key={location}
                className="flex-1 px-2 py-3 text-center"
                style={{ minWidth: `${100 / Math.max(locations.length, 1)}%` }}
              >
                <div className="flex items-center justify-center gap-1.5 text-white/70 text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rh-pink" />
                  <span className="truncate max-w-[120px]">{location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline grid */}
        <div className="flex relative" style={{ height: totalHeight }}>
          {/* Time labels */}
          <div className="w-16 flex-shrink-0 relative">
            {hours.map((hour, idx) => (
              <div
                key={hour}
                className="absolute left-0 right-0 text-white/50 text-xs font-medium pr-2 text-right"
                style={{ top: idx * hourHeight - 6 }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Grid and events */}
          <div className="flex-1 relative">
            {/* Hour lines */}
            {hours.map((hour, idx) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-white/10"
                style={{ top: idx * hourHeight }}
              />
            ))}

            {/* Location columns */}
            <div className="absolute inset-0 flex">
              {locations.map((location, locIdx) => (
                <div 
                  key={location}
                  className={cn(
                    "flex-1 relative",
                    locIdx > 0 && "border-l border-white/5"
                  )}
                  style={{ minWidth: `${100 / Math.max(locations.length, 1)}%` }}
                >
                  {/* Events for this location */}
                  {itemsByLocation[location]?.map((item) => {
                    const IconComponent = iconMap[item.icon_name || 'calendar'] || Calendar;
                    const topOffset = ((item.startMinutes - startHour * 60) / 60) * hourHeight;
                    const height = Math.max((item.durationMinutes / 60) * hourHeight, 50);
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => onItemClick(item)}
                        className={cn(
                          "absolute left-1 right-1 rounded-xl border backdrop-blur-sm p-3 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg overflow-hidden group",
                          item.color.bg,
                          item.color.border
                        )}
                        style={{
                          top: topOffset,
                          height: height,
                          zIndex: 1,
                        }}
                      >
                        <div className="flex items-start gap-2 h-full">
                          <IconComponent className={cn("w-4 h-4 flex-shrink-0 mt-0.5", item.color.text)} />
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <h4 className={cn(
                              "font-semibold text-sm leading-tight line-clamp-2 group-hover:text-white transition-colors",
                              item.color.text
                            )}>
                              {item.title}
                            </h4>
                            <p className="text-white/60 text-xs mt-1">
                              {item.start_time}
                              {item.end_time && ` - ${item.end_time}`}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimeline;
