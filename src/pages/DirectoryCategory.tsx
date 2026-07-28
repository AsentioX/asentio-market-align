import { useEffect, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { useXRCompanies, CompanyFilters } from '@/hooks/useXRCompanies';
import CompanyGrid from '@/components/directory/CompanyGrid';
import CompanyFilterBar from '@/components/directory/CompanyFilterBar';
import TopographicPattern from '@/components/TopographicPattern';
import { useSeo } from '@/hooks/useSeo';
import { TAXONOMY, groupFromSlug, categorySeo } from '@/lib/xrTaxonomy';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { trackPageView, trackEvent } from '@/lib/analytics';

const DirectoryCategory = () => {
  const { groupSlug } = useParams<{ groupSlug: string }>();
  const group = groupSlug ? groupFromSlug(groupSlug) : undefined;

  const [filters, setFilters] = useState<CompanyFilters>({ group: groupSlug });

  useEffect(() => {
    setFilters({ group: groupSlug });
  }, [groupSlug]);

  const { data: companies, isLoading } = useXRCompanies(filters);

  const seo = group
    ? categorySeo(group.label)
    : { title: 'HAI Directory | Asentio', description: undefined };

  useSeo({
    title: seo.title,
    description: group ? `${group.blurb} Browse ${group.label.toLowerCase()} companies in the Asentio HAI Directory.` : seo.description,
    canonicalPath: group ? `/hai-directory/category/${group.slug}` : '/hai-directory',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (group) {
      trackPageView(`/hai-directory/category/${group.slug}`);
      trackEvent('directory_category_view', { category: group.label }, `/hai-directory/category/${group.slug}`);
    }
  }, [group]);

  if (groupSlug && !group) return <Navigate to="/hai-directory" replace />;
  if (!group) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative pt-28 md:pt-36 pb-8 md:pb-10 bg-muted">
        <TopographicPattern className="opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link to="/hai-directory" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5">
            <ArrowLeft className="w-4 h-4" /> All of the HAI Directory
          </Link>

          <div className="w-12 h-1 bg-asentio-red mb-4" />
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3">{group.label}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-5">
            {group.blurb}
          </p>

          <div className="flex flex-wrap gap-2">
            {group.children.map((child) => {
              const active = filters.category === child;
              return (
                <Badge
                  key={child}
                  onClick={() => setFilters((f) => ({ ...f, category: active ? undefined : child }))}
                  className={`cursor-pointer transition-colors ${
                    active
                      ? 'bg-asentio-red text-white hover:bg-asentio-red/90'
                      : 'bg-background text-muted-foreground border border-border hover:text-asentio-red hover:border-asentio-red/50'
                  }`}
                >
                  {child}
                </Badge>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filters + results */}
      <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <CompanyFilterBar filters={filters} onChange={setFilters} lockedGroup={group.slug} />

        <div className="mt-8">
          <CompanyGrid companies={companies} isLoading={isLoading} />
        </div>
      </section>

      {/* Sibling categories */}
      <section className="bg-muted py-10 relative">
        <TopographicPattern className="opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h2 className="text-sm uppercase tracking-wide text-muted-foreground mb-4">Other layers of the stack</h2>
          <div className="flex flex-wrap gap-3">
            {TAXONOMY.filter((g) => g.slug !== group.slug).map((g) => (
              <Link
                key={g.slug}
                to={`/hai-directory/category/${g.slug}`}
                className="px-4 py-2 rounded-full text-sm bg-background border border-border hover:border-asentio-red/50 hover:text-asentio-red transition-colors"
              >
                {g.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DirectoryCategory;
