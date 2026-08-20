import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SingleSelectColumn, MultiSelectColumn } from '@/components/directory/FinderColumns';
import { optionByValue } from '@/lib/partnerFinder';
import {
  INDUSTRY_OPTIONS,
  JOB_OPTIONS,
  UseCaseQuery,
  rolesForIndustry,
} from '@/lib/useCaseFinder';

interface Props {
  onSubmit: (query: UseCaseQuery) => void;
  onReset: () => void;
}

const UseCaseFinderWidget = ({ onSubmit, onReset }: Props) => {
  const [industry, setIndustry] = useState<string>();
  const [role, setRole] = useState<string>();
  const [jobs, setJobs] = useState<string[]>([]);

  const roleOptions = useMemo(() => rolesForIndustry(industry), [industry]);

  // Roles are industry-specific — drop a selection that no longer exists.
  useEffect(() => {
    if (role && !roleOptions.some((r) => r.value === role)) setRole(undefined);
  }, [roleOptions, role]);

  const industryOpt = optionByValue(INDUSTRY_OPTIONS, industry);
  const roleOpt = optionByValue(roleOptions, role);

  const hasAny = !!industry || !!role || jobs.length > 0;

  const reset = () => {
    setIndustry(undefined);
    setRole(undefined);
    setJobs([]);
    onReset();
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
        <SingleSelectColumn
          index={1}
          label="Industry"
          question="What industry are you in?"
          placeholder="Select your industry"
          options={INDUSTRY_OPTIONS}
          value={industry}
          onChange={setIndustry}
        />
        <SingleSelectColumn
          index={2}
          label="Role"
          question="What best describes your role?"
          placeholder={industry ? 'Select your role' : 'Select a role'}
          options={roleOptions}
          context={[industryOpt]}
          value={role}
          onChange={setRole}
        />
        <MultiSelectColumn
          index={3}
          label="I need to…"
          question="What are you trying to accomplish?"
          placeholder="Select what you need to do"
          options={JOB_OPTIONS}
          context={[roleOpt, industryOpt]}
          values={jobs}
          onChange={setJobs}
        />
      </div>

      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
        <Button
          type="button"
          disabled={!hasAny}
          onClick={() => onSubmit({ industry, role, jobs })}
          className="bg-asentio-red hover:bg-asentio-red/90 text-white px-6"
        >
          <Search className="w-4 h-4 mr-2" />
          Find Use Cases
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default UseCaseFinderWidget;
