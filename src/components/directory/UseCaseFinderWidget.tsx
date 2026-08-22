import { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { SingleSelectColumn, MultiSelectColumn } from '@/components/directory/FinderColumns';
import { optionByValue } from '@/lib/partnerFinder';
import {
  INDUSTRY_OPTIONS,
  JOB_OPTIONS,
  UseCaseQuery,
  rolesForIndustry,
} from '@/lib/useCaseFinder';

interface Props {
  /** Fires live as the user picks Industry / Role / Jobs. */
  onChange: (query: UseCaseQuery) => void;
}

const UseCaseFinderWidget = ({ onChange }: Props) => {
  const [industry, setIndustry] = useState<string>();
  const [role, setRole] = useState<string>();
  const [jobs, setJobs] = useState<string[]>([]);

  const roleOptions = useMemo(() => rolesForIndustry(industry), [industry]);

  // Roles are industry-specific — drop a selection that no longer exists.
  useEffect(() => {
    if (role && !roleOptions.some((r) => r.value === role)) setRole(undefined);
  }, [roleOptions, role]);

  // Live filtering — counts update as each option is picked.
  useEffect(() => {
    onChange({ industry, role, jobs });
  }, [industry, role, jobs, onChange]);

  const industryOpt = optionByValue(INDUSTRY_OPTIONS, industry);
  const roleOpt = optionByValue(roleOptions, role);

  const hasAny = !!industry || !!role || jobs.length > 0;

  const reset = () => {
    setIndustry(undefined);
    setRole(undefined);
    setJobs([]);
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
          placeholder="Select a role"
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
        <p className="text-xs text-muted-foreground">
          {hasAny
            ? 'Use cases below update as you refine your selection.'
            : 'Pick any option to narrow the use cases below.'}
        </p>
        <button
          type="button"
          onClick={reset}
          disabled={!hasAny}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
    </div>
  );
};

export default UseCaseFinderWidget;
