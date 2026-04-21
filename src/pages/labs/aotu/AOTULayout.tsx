import { Outlet } from "react-router-dom";
import AOTUNav from "./components/AOTUNav";
import AOTUFooter from "./components/AOTUFooter";

const AOTULayout = () => {
  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-[#F4FDFF]"
      style={{
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <AOTUNav />
      <main className="pt-16">
        <Outlet />
      </main>
      <AOTUFooter />
    </div>
  );
};

export default AOTULayout;
