import { useAuth } from '@/hooks/useAuth';
import CPConnectLogin from './CPConnectLogin';
import CPConnectDashboard from './CPConnectDashboard';

const CPConnectLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <CPConnectLogin />;

  return <CPConnectDashboard />;
};

export default CPConnectLayout;
