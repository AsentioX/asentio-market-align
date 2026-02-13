import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CaseStudyCard from "./CaseStudyCard";

interface CaseStudy {
  company: string;
  description: string;
  image: string;
  imageZoom?: number;
  imagePosition?: string;
  challenge?: string;
  whatWeDid?: string;
}

interface CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

const CaseStudyCarousel = ({ caseStudies }: CaseStudyCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const newIndex = direction === "left"
      ? Math.max(0, activeIndex - 1)
      : Math.min(caseStudies.length - 1, activeIndex + 1);
    setActiveIndex(newIndex);
    setTimeout(() => {
      scrollRef.current?.children[newIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, 50);
  };

  return (
    <div className="relative group/carousel">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-8 w-8 bg-gradient-to-r from-muted to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-8 w-8 bg-gradient-to-l from-muted to-transparent z-10 pointer-events-none" />

      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-asentio-blue/30 transition-all opacity-0 group-hover/carousel:opacity-100"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-asentio-blue/30 transition-all opacity-0 group-hover/carousel:opacity-100"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {caseStudies.map((study, index) => (
          <div
            key={index}
            className="snap-center flex-shrink-0 w-full min-w-full"
          >
            <CaseStudyCard
              {...study}
              expanded={true}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {caseStudies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index);
              scrollRef.current?.children[index]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeIndex === index ? "bg-asentio-blue w-6" : "bg-border hover:bg-muted-foreground"
            }`}
            aria-label={`View ${caseStudies[index].company}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CaseStudyCarousel;
