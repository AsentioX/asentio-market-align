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
  const [expandedStudy, setExpandedStudy] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    setExpandedStudy(null);
    const scrollAmount = scrollRef.current.offsetWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/carousel">
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
            className="snap-start flex-shrink-0"
            style={{
              width: expandedStudy === index ? "100%" : "min(340px, 85vw)",
              minWidth: expandedStudy === index ? "100%" : "min(340px, 85vw)",
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <CaseStudyCard
              {...study}
              expanded={expandedStudy === index}
              onToggle={() => setExpandedStudy(expandedStudy === index ? null : index)}
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
              setExpandedStudy(expandedStudy === index ? null : index);
              scrollRef.current?.children[index]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              expandedStudy === index ? "bg-asentio-blue w-6" : "bg-border hover:bg-muted-foreground"
            }`}
            aria-label={`View ${caseStudies[index].company}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CaseStudyCarousel;
