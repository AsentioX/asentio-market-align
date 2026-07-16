// Race Companion - 2026 Solar Car Challenge schedule
// Parsed from official Where-to-Be / What-to-Do document.

export type EventCategory =
  | 'meeting'
  | 'inspection'
  | 'race'
  | 'food'
  | 'travel'
  | 'media'
  | 'ceremony'
  | 'rest_stop'
  | 'display'
  | 'awards'
  | 'other';

export type Role =
  | 'all'
  | 'driver'
  | 'safety_officer'
  | 'crew'
  | 'strategy'
  | 'media'
  | 'adviser'
  | 'volunteer'
  | 'parent'
  | 'judge';

export interface RaceEvent {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM (24h)
  end?: string;
  title: string;
  location?: string;
  address?: string;
  category: EventCategory;
  required?: boolean;
  roles: Role[];
  notes?: string;
  checklist?: string[];
}

export interface RaceDay {
  date: string;
  label: string; // Mon
  full: string;  // Monday, July 13
  title?: string; // e.g. "Race Day 1"
  events: RaceEvent[];
}

// Category visual metadata (Tailwind color tokens)
export const CATEGORY_META: Record<EventCategory, {
  label: string;
  gradient: string;
  ring: string;
  text: string;
  glow: string;
  icon: string;
}> = {
  race:       { label: 'Race',       gradient: 'from-orange-500 to-amber-500',    ring: 'ring-orange-500/40',    text: 'text-orange-300',    glow: 'shadow-[0_0_40px_-10px_hsl(25_95%_55%/0.6)]',  icon: '🏁' },
  meeting:    { label: 'Meeting',    gradient: 'from-sky-500 to-blue-600',        ring: 'ring-sky-500/40',       text: 'text-sky-300',       glow: 'shadow-[0_0_40px_-10px_hsl(210_95%_55%/0.6)]', icon: '🎤' },
  inspection: { label: 'Inspection', gradient: 'from-violet-500 to-purple-600',   ring: 'ring-violet-500/40',    text: 'text-violet-300',    glow: 'shadow-[0_0_40px_-10px_hsl(270_95%_60%/0.6)]', icon: '🔍' },
  food:       { label: 'Food',       gradient: 'from-emerald-500 to-green-600',   ring: 'ring-emerald-500/40',   text: 'text-emerald-300',   glow: 'shadow-[0_0_40px_-10px_hsl(150_80%_45%/0.6)]', icon: '🍽️' },
  travel:     { label: 'Travel',     gradient: 'from-slate-500 to-zinc-600',      ring: 'ring-slate-500/40',     text: 'text-slate-300',     glow: 'shadow-[0_0_40px_-10px_hsl(220_10%_50%/0.6)]', icon: '🚚' },
  media:      { label: 'Media',      gradient: 'from-pink-500 to-rose-600',       ring: 'ring-pink-500/40',      text: 'text-pink-300',      glow: 'shadow-[0_0_40px_-10px_hsl(340_90%_60%/0.6)]', icon: '📸' },
  ceremony:   { label: 'Ceremony',   gradient: 'from-amber-400 to-yellow-500',    ring: 'ring-amber-400/40',     text: 'text-amber-300',     glow: 'shadow-[0_0_40px_-10px_hsl(45_100%_60%/0.6)]', icon: '🎉' },
  rest_stop:  { label: 'Rest Stop',  gradient: 'from-teal-500 to-cyan-600',       ring: 'ring-teal-500/40',      text: 'text-teal-300',      glow: 'shadow-[0_0_40px_-10px_hsl(180_80%_50%/0.6)]', icon: '⛽' },
  display:    { label: 'Display',    gradient: 'from-indigo-500 to-blue-700',     ring: 'ring-indigo-500/40',    text: 'text-indigo-300',    glow: 'shadow-[0_0_40px_-10px_hsl(240_90%_60%/0.6)]', icon: '🚗' },
  awards:     { label: 'Awards',     gradient: 'from-yellow-400 to-amber-500',    ring: 'ring-yellow-400/40',    text: 'text-yellow-300',    glow: 'shadow-[0_0_40px_-10px_hsl(50_100%_55%/0.6)]', icon: '🏆' },
  other:      { label: 'Event',      gradient: 'from-slate-500 to-slate-700',     ring: 'ring-slate-500/40',     text: 'text-slate-300',     glow: 'shadow-[0_0_40px_-10px_hsl(220_10%_40%/0.6)]', icon: '📌' },
};

export const ROLE_LABELS: Record<Role, string> = {
  all: 'All Participants',
  driver: 'Driver',
  safety_officer: 'Safety Officer',
  crew: 'Crew',
  strategy: 'Strategy',
  media: 'Media',
  adviser: 'Faculty Adviser',
  volunteer: 'Volunteer',
  parent: 'Parent',
  judge: 'Judge',
};

const HOTEL = 'DFW Marriott & Golf Club';
const TMS = 'Texas Motor Speedway';

// Helper to build IDs
const id = (d: string, t: string, n: string) =>
  `${d}-${t.replace(':', '')}-${n.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`;

const mk = (
  date: string,
  start: string,
  title: string,
  category: EventCategory,
  extra: Partial<Omit<RaceEvent, 'id' | 'date' | 'start' | 'title' | 'category'>> = {}
): RaceEvent => ({
  id: id(date, start, title),
  date, start, title, category,
  roles: extra.roles ?? ['all'],
  ...extra,
});

export const SCHEDULE: RaceDay[] = [
  {
    date: '2026-07-13', label: 'Mon', full: 'Monday, July 13', title: 'Intern Arrival',
    events: [
      mk('2026-07-13', '17:00', 'Interns Arrive for Training', 'meeting', {
        location: 'San Marcos/Pecos Rooms', address: HOTEL, roles: ['volunteer', 'adviser'],
      }),
    ],
  },
  {
    date: '2026-07-14', label: 'Tue', full: 'Tuesday, July 14', title: 'Judges Arrive',
    events: [
      mk('2026-07-14', '07:00', 'Intern Training Continues', 'meeting', { location: 'San Marcos/Pecos Rooms', address: HOTEL, roles: ['volunteer'] }),
      mk('2026-07-14', '16:00', 'Judges Check-In', 'meeting', { end: '18:00', location: 'San Marcos/Pecos Rooms', address: HOTEL, roles: ['judge'] }),
      mk('2026-07-14', '18:00', 'Dinner for Judges', 'food', { location: 'Creekside', address: HOTEL, roles: ['judge'] }),
      mk('2026-07-14', '19:00', 'Judges Training', 'meeting', { location: 'San Marcos/Pecos Rooms', address: HOTEL, roles: ['judge'], notes: 'Designed to support Lockheed Martin Volunteers.' }),
    ],
  },
  {
    date: '2026-07-15', label: 'Wed', full: 'Wednesday, July 15', title: 'Team Check-In',
    events: [
      mk('2026-07-15', '09:00', 'Judges Training Workshop', 'meeting', { end: '13:00', location: 'San Marcos/Pecos Rooms', address: HOTEL, roles: ['judge'], notes: 'Lunch provided.' }),
      mk('2026-07-15', '09:00', 'Team Check-In', 'inspection', {
        end: '17:00',
        location: 'Guadalupe/Brazos/Colorado Rooms', address: HOTEL,
        required: true,
        roles: ['all'],
        notes: 'Teams assigned an arrival time based on the Team Profiles Page. Wristbands awarded when driver completes Scrutineering Station 4.',
        checklist: [
          'SCC Release of Liability Form (signed by parents)',
          'TMS Release of Liability Forms (adult and minors)',
          'Signed Guidelines for Photographing/Filming',
          'Hard copy of all drivers\' licenses',
          'Payment for Opening & Awards Banquet tickets ($70/person)',
          'Extra Person Fee payment (see Event Update 2026-1)',
          'Final Race Registration packet documents',
          'Radio you plan to use (to coordinate channels)',
        ],
      }),
      mk('2026-07-15', '19:00', 'Required All-Teams Meeting', 'meeting', {
        location: 'Trinity Ballroom', address: HOTEL, required: true, roles: ['all'],
        notes: 'All race participants must attend.',
      }),
      mk('2026-07-15', '19:45', 'Drivers Meeting', 'meeting', {
        location: 'Guadalupe/Brazos Rooms', address: HOTEL, required: true,
        roles: ['driver', 'adviser'], notes: 'Team Adviser and Drivers must attend.',
      }),
      mk('2026-07-15', '19:45', 'Safety Officers Meeting', 'meeting', {
        location: 'Trinity Ballroom', address: HOTEL, required: true,
        roles: ['safety_officer', 'adviser'],
      }),
    ],
  },
  {
    date: '2026-07-16', label: 'Thu', full: 'Thursday, July 16', title: 'Scrutineering Day 1',
    events: [
      mk('2026-07-16', '06:00', 'Staff Enters TMS Infield & CUP Garage', 'travel', { address: TMS, roles: ['volunteer'] }),
      mk('2026-07-16', '06:30', 'Judges Meet at Garages for Scrutineering', 'inspection', {
        address: TMS, roles: ['judge'], notes: 'Judges\' Breakfast in Media Center.',
      }),
      mk('2026-07-16', '07:00', 'Scrutineering Day One Begins', 'inspection', {
        address: TMS, roles: ['all'], notes: 'Teams get access to Texas Motor Speedway. Staff will show teams their designated garage.',
      }),
      mk('2026-07-16', '08:00', 'Scrutineering Session No. 1', 'inspection', {
        end: '18:00', address: TMS, required: true, roles: ['all'],
      }),
      mk('2026-07-16', '08:30', 'Team Oral Presentations Begin', 'meeting', {
        location: 'Media Center', address: TMS, roles: ['all'],
        notes: 'Teams meet with Judges for a 5-minute discussion about their Solar Car Project. Details in Event Updates.',
      }),
      mk('2026-07-16', '18:00', 'Scrutineering Session No. 1 Ends', 'inspection', {
        address: TMS, roles: ['all'], notes: 'Garages remain open until 9:00 PM for teams to continue working.',
      }),
      mk('2026-07-16', '19:30', 'Opening Banquet', 'ceremony', {
        location: 'Trinity Ballroom', address: HOTEL, required: true, roles: ['all'],
        notes: 'Team Captains introduce their teams and guests. Guest Speaker: Will Jones, SpaceX / Univ. of Michigan Solar Car Team. Honored Guest: Bob Jameson, Visit Fort Worth.',
      }),
      mk('2026-07-16', '21:00', 'Garage Closes', 'other', { address: TMS, roles: ['all'] }),
    ],
  },
  {
    date: '2026-07-17', label: 'Fri', full: 'Friday, July 17', title: 'Scrutineering Day 2',
    events: [
      mk('2026-07-17', '06:30', 'Judges Meet at Garages for Scrutineering', 'inspection', { address: TMS, roles: ['judge'] }),
      mk('2026-07-17', '07:00', 'Scrutineering Day Two Begins', 'inspection', { address: TMS, roles: ['all'] }),
      mk('2026-07-17', '08:00', 'Scrutineering Session No. 2', 'inspection', { end: '19:00', address: TMS, required: true, roles: ['all'] }),
      mk('2026-07-17', '09:30', 'Dallas Brass Band Presentation', 'media', { end: '10:30', address: TMS, roles: ['all'] }),
      mk('2026-07-17', '10:00', 'Media Morning Activities', 'media', {
        end: '11:30', location: 'Next to Media Center', address: TMS, roles: ['all', 'media'],
        notes: 'Official Race Photo, recognize Race Sponsors. Ice cream provided. Music by Dallas Brass Band.',
      }),
      mk('2026-07-17', '18:00', 'Judges Meeting / Dinner', 'meeting', { location: 'Media Center', address: TMS, roles: ['judge'] }),
      mk('2026-07-17', '19:00', 'Scrutineering Session No. 2 Ends', 'inspection', { address: TMS, roles: ['all'], notes: 'Garages remain open until 9:00 PM.' }),
      mk('2026-07-17', '21:00', 'Garage Closes', 'other', { address: TMS, roles: ['all'], notes: 'Teams are free to take solar car elsewhere to continue work.' }),
    ],
  },
  {
    date: '2026-07-18', label: 'Sat', full: 'Saturday, July 18', title: 'Scrutineering Day 3',
    events: [
      mk('2026-07-18', '06:30', 'Judges Meet at Garages for Scrutineering', 'inspection', { address: TMS, roles: ['judge'] }),
      mk('2026-07-18', '07:00', 'Scrutineering Day Three Begins', 'inspection', { address: TMS, roles: ['all'] }),
      mk('2026-07-18', '08:00', 'Scrutineering Session No. 3', 'inspection', {
        end: '19:00', address: TMS, required: true, roles: ['all'],
        notes: 'Teams not qualifying by 7:00 PM will NOT be able to take part in the 2026 Solar Car Challenge.',
      }),
      mk('2026-07-18', '10:00', 'Forever Miles Posted', 'media', { location: 'Media Center Front Door', address: TMS, roles: ['all'] }),
      mk('2026-07-18', '19:00', 'Chuckwagon Dinner for Race Participants', 'food', { location: 'Basketball Court', address: HOTEL, roles: ['all'] }),
      mk('2026-07-18', '19:00', 'Official Scrutineering Ends', 'inspection', { address: TMS, roles: ['all'] }),
      mk('2026-07-18', '21:00', 'Garages Close', 'other', { address: TMS, roles: ['all'], notes: 'Teams must be out of the garage with solar cars stored overnight in trailers. Teams can keep trailers at the DFW Marriott.' }),
    ],
  },
  {
    date: '2026-07-19', label: 'Sun', full: 'Sunday, July 19', title: 'Race Day 1',
    events: [
      mk('2026-07-19', '06:30', 'Teams Line Up at NW ISD Admin Building', 'travel', {
        address: 'NW ISD Administration Building Parking Lot', required: true, roles: ['all'],
        notes: 'Teams meet Day One\'s Judge at the NW ISD Parking Lot.',
      }),
      mk('2026-07-19', '07:00', 'Breakfast for Staff', 'food', { address: 'NW ISD Administration Building', roles: ['volunteer', 'judge'] }),
      mk('2026-07-19', '08:00', 'Required Teams Meeting', 'meeting', {
        location: 'Solar Car Challenge Trailer at Race Start', address: '2001 Texan Drive, Justin, TX 76247',
        required: true, roles: ['all'],
      }),
      mk('2026-07-19', '08:45', 'Solar Cars Lined Up for Race Start', 'race', {
        address: '2001 Texan Drive, Justin, TX 76247', required: true, roles: ['all'],
        notes: 'Starting order based on Station Six Scrutineering performance. Teams start racing every minute. Late teams take the end of the line.',
      }),
      mk('2026-07-19', '08:50', 'Opening Ceremonies', 'ceremony', { end: '09:00', roles: ['all'], notes: 'Music by Dallas Brass Band.' }),
      mk('2026-07-19', '09:00', 'FIRST RACE DAY BEGINS', 'race', {
        required: true, roles: ['all'],
        notes: 'Flag Wave: Morgan Rush, Oncor; Jake Caraway, Oncor.',
      }),
      mk('2026-07-19', '11:00', 'Rest Stop – Godley HS & MS', 'rest_stop', {
        address: 'Godley High School & Middle School, TX', required: true, roles: ['all'],
        notes: 'Required 15-minute stop. Solar cars trailer into the HS parking lot and unload to begin driving.',
      }),
      mk('2026-07-19', '13:00', 'Lunch Stop – Hill County Courthouse', 'food', {
        address: 'Hill County Courthouse, Hillsboro, TX', required: true, roles: ['all'],
        notes: 'Required 30-minute stop.',
      }),
      mk('2026-07-19', '14:30', 'Trailer Solar Cars – Navarro County Hospital', 'travel', {
        address: 'Navarro County Hospital Parking Lot, Corsicana, TX', roles: ['all'],
      }),
      mk('2026-07-19', '15:00', 'Un-trailer at Mildred HS', 'travel', {
        address: 'Mildred High School, TX', roles: ['all'],
        notes: 'Continue driving to Race Day End, then trailer solar cars to Palestine HS Parking Lot.',
      }),
      mk('2026-07-19', '16:00', 'Display Begins – Palestine HS', 'display', {
        address: 'Palestine High School Parking Lot, Palestine, TX', roles: ['all'],
      }),
      mk('2026-07-19', '19:00', 'Layne\'s Chicken Finger Dinner', 'food', {
        address: 'Palestine HS Parking Lot', roles: ['all'],
        notes: 'Speaker: Anderson County Judge Carey McKinney and Mayor Mitchell Jordan.',
      }),
      mk('2026-07-19', '20:00', 'Judges Meeting at Event Hotel', 'meeting', { roles: ['judge'] }),
      mk('2026-07-19', '21:00', 'Solar Cars Impounded – Palestine HS', 'other', {
        address: 'Palestine HS Parking Lot', roles: ['all'], notes: 'Everyone must leave the Palestine HS Parking Lot.',
      }),
    ],
  },
  {
    date: '2026-07-20', label: 'Mon', full: 'Monday, July 20', title: 'Race Day 2',
    events: [
      mk('2026-07-20', '06:30', 'Access to Solar Cars', 'other', {
        address: 'Palestine HS Parking Lot', roles: ['all'],
        notes: 'Judges will meet teams at the parking lot. Teams cannot access their solar car without a Judge.',
      }),
      mk('2026-07-20', '07:30', 'Required Teams Meeting', 'meeting', {
        location: 'Solar Car Challenge Trailer', address: 'Palestine HS Parking Lot',
        required: true, roles: ['all'],
      }),
      mk('2026-07-20', '08:15', 'Trailer Solar Cars to U.S. 79 Parking Area', 'travel', {
        address: 'U.S. 79 Parking Area', roles: ['all'],
        notes: 'Each solar car will begin the race when they arrive at this parking area.',
      }),
      mk('2026-07-20', '09:00', 'SECOND RACE DAY BEGINS', 'race', { required: true, roles: ['all'] }),
      mk('2026-07-20', '11:00', 'Rest Stop – Leon ISD Jr & Sr High', 'rest_stop', {
        address: 'Leon ISD Junior & Senior High, Jewett, TX', required: true, roles: ['all'],
        notes: 'Required 15-minute stop. Drive in / drive out of parking lot.',
      }),
      mk('2026-07-20', '13:00', 'Lunch Stop – City of Hearne', 'food', {
        address: 'Hearne, TX', required: true, roles: ['all'], notes: 'Required 30-minute stop.',
      }),
      mk('2026-07-20', '14:30', 'Rest Stop – Tractor Supply Rockdale', 'rest_stop', {
        address: 'Tractor Supply Parking Lot, Rockdale, TX', required: true, roles: ['all'],
        notes: 'Required 15-minute stop.',
      }),
      mk('2026-07-20', '15:30', 'City of Hutto – Trailer & Travel to Dell Diamond', 'travel', {
        address: 'Hutto, TX → Dell Diamond West Parking Lot', roles: ['all'],
      }),
      mk('2026-07-20', '16:00', 'Solar Car Display – Dell Diamond', 'display', {
        address: 'Dell Diamond West Parking Lot, Round Rock, TX', roles: ['all'],
      }),
      mk('2026-07-20', '19:00', 'Dinner at Dell Diamond', 'food', {
        address: 'Dell Diamond Parking Lot', roles: ['all'],
        notes: 'Hosted by Dell Technologies. Catered by Smokey Mo\'s BBQ. Special Guests: Dell Executives, Kaki Leyens (Texas Governor\'s Office Workforce Council).',
      }),
    ],
  },
  {
    date: '2026-07-21', label: 'Tue', full: 'Tuesday, July 21', title: 'Race Day 3',
    events: [
      mk('2026-07-21', '07:00', 'Access to Solar Cars', 'other', { address: 'Dell Diamond Parking Lot', roles: ['all'] }),
      mk('2026-07-21', '07:30', 'Team Meeting at Solar Car Challenge Trailer', 'meeting', { required: true, roles: ['all'] }),
      mk('2026-07-21', '07:45', 'Trailer Solar Cars to H.E.B. Georgetown', 'travel', {
        address: 'H.E.B. Parking Lot, Georgetown, TX', roles: ['all'],
        notes: 'Unload solar cars in H.E.B. parking lot and prepare to drive.',
      }),
      mk('2026-07-21', '08:45', 'Solar Cars Lined Up for Race Start', 'race', { required: true, roles: ['all'] }),
      mk('2026-07-21', '09:00', 'THIRD RACE DAY BEGINS', 'race', {
        required: true, roles: ['all'], notes: 'Flag: Pete Parsons, TXSES.',
      }),
      mk('2026-07-21', '11:00', 'Rest Stop – Lakes Squadron CAF, Burnet', 'rest_stop', {
        address: 'Lakes Squadron Commemorative Air Force, Burnet, TX', required: true, roles: ['all'],
        notes: 'Required 15-minute stop. Solar cars trailered.',
      }),
      mk('2026-07-21', '13:00', 'Lunch Stop – Science Mill, Johnson City', 'food', {
        address: 'Science Mill, Johnson City, TX', required: true, roles: ['all'],
        notes: 'Required 30-minute stop. Solar cars drive out of Johnson City on the way to Fredericksburg.',
      }),
      mk('2026-07-21', '14:00', 'Solar Car Display – Marktplatz Park', 'display', {
        address: 'Marktplatz Park, Fredericksburg, TX', roles: ['all'],
        notes: 'Major solar car display until 9:00 PM.',
      }),
      mk('2026-07-21', '17:00', 'Box Meals in Marktplatz Park', 'food', {
        address: 'Marktplatz Park, Fredericksburg, TX', roles: ['all'],
        notes: 'Provided by H.E.B. Guests: Hattie Heiner (Rotary), Gillespie County Judge Daniel Jones, Mayor Randy Briley.',
      }),
      mk('2026-07-21', '20:00', 'Judges Meeting at Event Hotel', 'meeting', { roles: ['judge'] }),
      mk('2026-07-21', '21:00', 'Solar Cars Impounded', 'other', { roles: ['all'], notes: 'Store solar cars in trailer overnight in parking area.' }),
    ],
  },
  {
    date: '2026-07-22', label: 'Wed', full: 'Wednesday, July 22', title: 'Race Day 4',
    events: [
      mk('2026-07-22', '06:30', 'Access to Solar Cars', 'other', { roles: ['all'], notes: 'Teams cannot access solar cars without a Judge. Confirm your Judge on Tuesday night.' }),
      mk('2026-07-22', '07:30', 'Team Meeting at Solar Car Challenge Trailer', 'meeting', { required: true, roles: ['all'] }),
      mk('2026-07-22', '08:45', 'Solar Cars Lined Up for Race Start', 'race', { required: true, roles: ['all'] }),
      mk('2026-07-22', '09:00', 'FOURTH RACE DAY BEGINS', 'race', {
        required: true, roles: ['all'],
        notes: 'Solar Cars parade through Fredericksburg escorted by Police. Flag Wave: Jim Mikula, President Chamber Commerce.',
      }),
      mk('2026-07-22', '11:00', 'Rest Stop – Mason County Courthouse', 'rest_stop', {
        address: 'Mason County Courthouse, Mason, TX', required: true, roles: ['all'], notes: 'Required 15-minute stop.',
      }),
      mk('2026-07-22', '13:00', 'Lunch Stop – Walmart, Brady', 'food', {
        address: 'Walmart, Brady, TX', required: true, roles: ['all'], notes: 'Required 30-minute stop.',
      }),
      mk('2026-07-22', '14:30', 'Rest Stop – Eden, TX', 'rest_stop', {
        address: 'Rest Area (left side), Eden, TX', required: true, roles: ['all'], notes: 'Required 15-minute stop.',
      }),
      mk('2026-07-22', '16:00', 'Solar Car Display – Home Depot San Angelo', 'display', {
        address: 'Home Depot, San Angelo, TX', roles: ['all'],
      }),
      mk('2026-07-22', '19:00', 'Steak Express Hamburgers', 'food', { address: 'Home Depot Parking Lot, San Angelo, TX', roles: ['all'] }),
      mk('2026-07-22', '20:00', 'Judges Meeting at Event Hotel', 'meeting', { roles: ['judge'] }),
      mk('2026-07-22', '21:00', 'Solar Cars Impounded – Home Depot', 'other', { address: 'Home Depot Parking Lot, San Angelo, TX', roles: ['all'] }),
    ],
  },
  {
    date: '2026-07-23', label: 'Thu', full: 'Thursday, July 23', title: 'Final Race Day',
    events: [
      mk('2026-07-23', '06:30', 'Access to Solar Cars', 'other', { roles: ['all'], notes: 'Teams meet Judges on Parking Lot. Bring your own lunch — no lunch stops today.' }),
      mk('2026-07-23', '07:00', 'Team Meeting at Solar Car Challenge Trailer', 'meeting', { required: true, roles: ['all'] }),
      mk('2026-07-23', '07:30', 'Trailer Solar Cars to Mertzon for Race Start', 'travel', {
        address: 'Community Center, Mertzon, TX', roles: ['all'],
        notes: 'Unload at Community Center and begin driving on arrival.',
      }),
      mk('2026-07-23', '11:00', 'Rest Stop – Sunoco, Big Lake, TX', 'rest_stop', {
        address: 'Sunoco Station, Big Lake, TX', required: true, roles: ['all'], notes: 'Required 15-minute stop.',
      }),
      mk('2026-07-23', '13:30', 'Rest Stop – US 385 & US 67, McCamey', 'rest_stop', {
        address: 'Corner US 385 & US 67, McCamey, TX', required: true, roles: ['all'], notes: 'Required 15-minute stop.',
      }),
      mk('2026-07-23', '16:00', 'Teams Arrive Fort Stockton', 'travel', {
        address: 'Fort Stockton Convention Center, TX', roles: ['all'],
        notes: 'Take solar car trailers to Fort Stockton Convention Center. Overnight security provided.',
      }),
      mk('2026-07-23', '16:00', 'Solar Car Display – Convention Center', 'display', {
        end: '18:00', address: 'Fort Stockton Convention Center, TX', roles: ['all'],
      }),
      mk('2026-07-23', '19:30', 'AWARDS BANQUET', 'awards', {
        address: 'Fort Stockton Convention Center, TX', required: true, roles: ['all'],
        notes: 'Team Captains have one minute to share thoughts about this year\'s Solar Car Challenge and to thank their teams / advisers.',
      }),
    ],
  },
  {
    date: '2026-07-24', label: 'Fri', full: 'Friday, July 24', title: 'Return Travel',
    events: [
      mk('2026-07-24', '07:00', 'Race Staff Leaves for Fort Worth', 'travel', { roles: ['volunteer', 'judge'], notes: 'Six-hour trip plus lunch time.' }),
      mk('2026-07-24', '15:00', 'Race Staff Arrives DFW Marriott', 'travel', { address: HOTEL, roles: ['volunteer', 'judge'] }),
    ],
  },
];

// Flatten helper
export const ALL_EVENTS: RaceEvent[] = SCHEDULE.flatMap(d => d.events);

export const RACE_START_ISO = '2026-07-13T17:00:00-05:00';
export const RACE_END_ISO = '2026-07-24T15:00:00-05:00';
