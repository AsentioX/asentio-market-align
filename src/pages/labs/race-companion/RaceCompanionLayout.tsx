import { Outlet } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';

const RaceCompanionLayout = () => {
  return (
    <div className="min-h-screen w-full bg-[#05070f] flex justify-center font-sans text-white antialiased overflow-hidden">
      {/* ambient gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-orange-600/20 blur-[140px]" />
        <div className="absolute top-[30%] -right-40 w-[420px] h-[420px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute bottom-[-100px] left-[10%] w-[520px] h-[520px] rounded-full bg-violet-700/15 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md min-h-screen pb-32">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
};

export default RaceCompanionLayout;
