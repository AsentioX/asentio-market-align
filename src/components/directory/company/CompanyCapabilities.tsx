import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { XRCompany, companyValues } from '@/hooks/useXRCompanies';
import { HAI_DIMENSIONS } from '@/lib/haiFramework';

/** Progressive disclosure of the full taxonomy for people who want the detail. */
const CompanyCapabilities = ({ company }: { company: XRCompany }) => {
  const dimensions = HAI_DIMENSIONS.filter((d) => companyValues(company, d.key).length > 0);
  if (dimensions.length === 0) return null;

  return (
    <section className="border-t border-border bg-muted/20">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-6">
          Detailed capabilities &amp; taxonomy
        </h2>

        <Accordion type="multiple" className="max-w-4xl">
          {dimensions.map((dimension) => {
            const values = companyValues(company, dimension.key);
            return (
              <AccordionItem key={dimension.key} value={dimension.key}>
                <AccordionTrigger className="text-left">
                  <span className="flex items-baseline gap-3">
                    <span className="font-medium text-foreground">{dimension.label}</span>
                    <span className="text-xs text-muted-foreground">{values.length}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-xs text-muted-foreground mb-3">{dimension.question}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {values.map((v) => (
                      <Link key={v} to={`/hai-directory?${dimension.key}=${encodeURIComponent(v)}`}>
                        <Badge
                          variant="secondary"
                          className="text-xs hover:bg-asentio-red hover:text-primary-foreground transition-colors"
                        >
                          {v}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
};

export default CompanyCapabilities;
