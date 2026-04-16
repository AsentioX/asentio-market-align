import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { MOCK_PROJECTS, STATUS_CONFIG, calcProjectCost, Project } from './mockData';
import ProjectView from './ProjectView';
import { ChevronLeft, Plus, Home, FolderOpen, Settings, LogOut, Search, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CPConnectDashboard = () => {
  const { signOut } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PROJECTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  if (selectedProject) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col">
        <ProjectView project={selectedProject} onBack={() => setSelectedProject(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 p-4">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-gray-900">
            CasaPro<span className="text-amber-600">Connect</span>
          </h1>
        </div>
        <nav className="space-y-1 flex-1">
          <SidebarItem icon={Home} label="Dashboard" active />
          <SidebarItem icon={FolderOpen} label="Projects" />
          <SidebarItem icon={Settings} label="Settings" />
        </nav>
        <div className="pt-4 border-t border-gray-100">
          <Link to="/labs" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Labs
          </Link>
          <button onClick={signOut} className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-gray-900">CasaPro<span className="text-amber-600">Connect</span></h1>
          <div className="flex items-center gap-2">
            <Link to="/labs" className="text-xs text-gray-400">← Labs</Link>
            <button onClick={signOut} className="text-xs text-gray-400"><LogOut className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="text-sm text-gray-400">{MOCK_PROJECTS.length} active projects</p>
          </div>
          <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-amber-300 bg-white"
            />
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-amber-50 text-amber-600' : 'text-gray-400'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-amber-50 text-amber-600' : 'text-gray-400'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project) => {
              const costs = calcProjectCost(project, project.tier);
              const status = STATUS_CONFIG[project.status];
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="text-left bg-white rounded-2xl border border-gray-100 p-5 hover:border-amber-200 hover:shadow-md transition-all group"
                >
                  {/* Render preview */}
                  <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4">
                    <img src={project.image} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">{project.name}</h3>
                    <Badge className={`${status.color} text-[10px]`}>{status.label}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{project.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{fmt(costs.total)}</span>
                    {project.homeowner && (
                      <span className="text-[10px] text-gray-400">{project.homeowner}</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* New project CTA */}
            <button className="rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 hover:border-amber-300 transition-colors min-h-[260px]">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                <Plus className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-sm font-medium text-gray-500">Start New Project</span>
              <span className="text-[10px] text-gray-400">Upload plans or use a template</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {filtered.map((project) => {
              const costs = calcProjectCost(project, project.tier);
              const status = STATUS_CONFIG[project.status];
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-amber-50/30 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={project.image} alt={project.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{project.name}</p>
                    <p className="text-xs text-gray-400">{project.address}</p>
                  </div>
                  <Badge className={`${status.color} text-[10px]`}>{status.label}</Badge>
                  <span className="text-sm font-bold text-gray-700">{fmt(costs.total)}</span>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) => (
  <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
    <Icon className="w-[18px] h-[18px]" />
    <span>{label}</span>
  </div>
);

export default CPConnectDashboard;
