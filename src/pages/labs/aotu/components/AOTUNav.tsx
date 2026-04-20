import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Platform", path: "/labs/aotu/platform" },
  { label: "Solutions", path: "/labs/aotu/solutions" },
  { label: "Marketplace", path: "/labs/aotu/marketplace" },
  { label: "Developers", path: "/labs/aotu/developers" },
  { label: "Partners", path: "/labs/aotu/partners" },
  { label: "Resources", path: "/labs/aotu/resources" },
  { label: "Company", path: "/labs/aotu/company" },
];

const AOTUNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F4F5F7]/85 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/labs/aotu" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-md bg-[#0A0F1C] flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#C9F24A] rounded-sm" />
          </div>
          <span
            className="text-[17px] font-semibold tracking-tight text-[#0A0F1C]"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            aotu<span className="text-[#1E40FF]">.ai</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[13.5px] font-medium transition-colors ${
                  active
                    ? "text-[#0A0F1C]"
                    : "text-[#0A0F1C]/65 hover:text-[#0A0F1C]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <button className="text-[13.5px] font-medium text-[#0A0F1C]/70 hover:text-[#0A0F1C] px-3 py-2">
            Sign in
          </button>
          <button className="text-[13.5px] font-semibold bg-[#0A0F1C] text-white px-4 py-2 rounded-md hover:bg-[#1E40FF] transition-colors">
            Request demo
          </button>
        </div>

        <button
          className="lg:hidden p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[#E5E7EB] bg-[#F4F5F7]">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className="py-2.5 text-[15px] font-medium text-[#0A0F1C]"
              >
                {item.label}
              </Link>
            ))}
            <button className="mt-3 text-[14px] font-semibold bg-[#0A0F1C] text-white px-4 py-3 rounded-md">
              Request demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AOTUNav;
