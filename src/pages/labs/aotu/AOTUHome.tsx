import { useEffect } from "react";
import Hero from "./components/Hero";
import ProductStack from "./components/ProductStack";
import SolutionPackages from "./components/SolutionPackages";
import SeeItInAction from "./components/SeeItInAction";
import Partners from "./components/Partners";
import AudiencePathways from "./components/AudiencePathways";
import CTASection from "./components/CTASection";

const AOTUHome = () => {
  useEffect(() => {
    document.title = "AOTU.ai — Replace manual monitoring with AI operators";
    const meta = document.querySelector('meta[name="description"]');
    const desc =
      "BrainFrame powers real-time AI operators at the edge. VisionCapsules deliver specialized intelligence for every camera, site, and environment.";
    if (meta) meta.setAttribute("content", desc);
  }, []);

  return (
    <>
      <Hero />
      <ProductStack />
      <SolutionPackages />
      <SeeItInAction />
      <Partners />
      <AudiencePathways />
      <CTASection />
    </>
  );
};

export default AOTUHome;
