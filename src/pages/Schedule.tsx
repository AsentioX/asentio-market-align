import { useState } from 'react';
import { 
  useScheduleItems, 
  ScheduleRole, 
  EVENT_DATES,
  ScheduleItem 
} from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import RoleSelector from '@/components/schedule/RoleSelector';
import ScheduleCard from '@/components/schedule/ScheduleCard';
import ScheduleDetail from '@/components/schedule/ScheduleDetail';
import ScheduleAdmin from '@/components/schedule/ScheduleAdmin';
import GeometricBackground from '@/components/schedule/GeometricBackground';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Settings, ArrowLeft, Loader2 } from 'lucide-react';

const Schedule = () => {
  const { isAdmin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<ScheduleRole | null>(() => {
    const savedRole = localStorage.getItem('schedule-role');
    return savedRole ? (savedRole as ScheduleRole) : null;
  });
  const [selectedDate, setSelectedDate] = useState(EVENT_DATES[0].value);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByRole, setFilterByRole] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: items, isLoading } = useScheduleItems(
    selectedDate,
    filterByRole ? selectedRole : null,
    searchTerm
  );

  const handleRoleSelect = (role: ScheduleRole) => {
    setSelectedRole(role);
    localStorage.setItem('schedule-role', role);
  };

  const handleCardClick = (item: ScheduleItem) => {
    setSelectedItem(item);
    setDetailOpen(true);
  };

  // Admin view
  if (showAdmin && isAdmin) {
    return (
      <div className="min-h-screen bg-[#1a0a2e] pt-20">
        <GeometricBackground />
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Button
            variant="ghost"
            onClick={() => setShowAdmin(false)}
            className="text-rh-pink hover:text-rh-pink-hot hover:bg-rh-pink/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Schedule
          </Button>
          <ScheduleAdmin />
        </div>
      </div>
    );
  }

  // Main schedule view
  return (
    <div className="min-h-screen bg-[#1a0a2e]">
      <GeometricBackground />

      <div className="container mx-auto px-4 py-8 pt-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          {/* Logo/Title area */}
          <div className="relative mb-2">
            {/* Yellow play button triangle */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-14 h-14 hidden md:block">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path 
                  d="M 10,90 L 10,10 L 90,50 Z" 
                  stroke="#FFD700" 
                  strokeWidth="6" 
                  fill="none"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-rh-pink font-black italic">REALITY</span>
            </h1>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-[#9333ea] via-[#00d4ff] to-[#22c55e] bg-clip-text text-transparent leading-none">
              HACK
            </h1>
            <p className="text-rh-cyan text-sm md:text-base tracking-[0.3em] mt-1">
              MIT XR HACKATHON
            </p>
          </div>
          
          <p className="text-white/70 text-sm md:text-base mt-4">
            January 22-26, 2026 • Cambridge, MA
          </p>

          {isAdmin && (
            <Button
              onClick={() => setShowAdmin(true)}
              className="mt-4 bg-rh-pink hover:bg-rh-pink-hot text-white border-0"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rh-pink/70" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-rh-purple-light/30 text-white placeholder:text-white/40 focus:border-rh-pink focus:ring-rh-pink/20"
            />
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-2 border border-rh-purple-light/30">
            <span className="text-sm text-white/70">My Role Only</span>
            <Switch
              checked={filterByRole}
              onCheckedChange={setFilterByRole}
              className="data-[state=checked]:bg-rh-pink"
            />
          </div>
        </div>

        {/* Current Role */}
        <div className="mb-8 max-w-4xl mx-auto">
          <RoleSelector 
            selectedRole={selectedRole} 
            onSelectRole={handleRoleSelect}
          />
        </div>

        {/* Date Tabs */}
        <Tabs value={selectedDate} onValueChange={setSelectedDate} className="w-full max-w-4xl mx-auto">
          <TabsList className="w-full bg-white/5 border border-rh-purple-light/20 p-1.5 rounded-2xl mb-8 flex">
            {EVENT_DATES.map((date) => (
              <TabsTrigger
                key={date.value}
                value={date.value}
                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rh-pink data-[state=active]:to-rh-purple data-[state=active]:text-white text-white/60 rounded-xl py-3 transition-all"
              >
                <div className="text-center">
                  <div className="font-bold text-sm md:text-base">{date.label}</div>
                  <div className="text-xs opacity-80">{date.day}</div>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {EVENT_DATES.map((date) => (
            <TabsContent key={date.value} value={date.value} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-rh-pink" />
                </div>
              ) : items && items.length > 0 ? (
                <div className="grid gap-3">
                  {items.map((item) => (
                    <ScheduleCard
                      key={item.id}
                      item={item}
                      onClick={() => handleCardClick(item)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-rh-purple/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-rh-pink/50" />
                  </div>
                  <p className="text-white/70 text-lg">No events found</p>
                  <p className="text-white/40 text-sm mt-1">
                    Try adjusting your filters or search term
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <ScheduleDetail
        item={selectedItem}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};

export default Schedule;
