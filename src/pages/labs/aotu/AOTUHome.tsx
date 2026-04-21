import { useEffect } from "react";
import Hero from "./components/Hero";
import SeeItInAction from "./components/SeeItInAction";
import WhatYouGet from "./components/WhatYouGet";
import SolutionPackages from "./components/SolutionPackages";
import MarketplaceTeaser from "./components/MarketplaceTeaser";
import Partners from "./components/Partners";
import AudiencePathways from "./components/AudiencePathways";
import CTASection from "./components/CTASection";

const AOTUHome = () => {
  useEffect(() => {
    document.title = "AOTU.ai — Replace manual monitoring with AI operators";
    const meta = document.querySelector('meta[name="description"]');
    const desc =
      "Deploy real-time AI operators across your cameras and sites in minutes.";
    if (meta) meta.setAttribute("content", desc);
  }, []);

  return (
    <>
      <Hero />
      <SeeItInAction />
      <WhatYouGet />
      <SolutionPackages />
      <MarketplaceTeaser />
      <Partners />
      <AudiencePathways />
      <CTASection />
    </>
  );
};

export default AOTUHome;
