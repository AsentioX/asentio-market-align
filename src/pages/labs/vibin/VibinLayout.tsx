import { Outlet } from 'react-router-dom';
import { VibinProvider } from './useVibinStore';
import { BottomNav } from './components/BottomNav';

const VibinLayout = () => {
  return (
    <VibinProvider>
      <div className="min-h-screen w-full bg-[hsl(240_15%_94%)] flex justify-center font-inter">
        <div className="relative w-full max-w-md min-h-screen bg-[hsl(20_30%_98%)] pb-24 shadow-2xl">
          <Outlet />
          <BottomNav />
        </div>
      </div>
    </VibinProvider>
  );
};

export default VibinLayout;
