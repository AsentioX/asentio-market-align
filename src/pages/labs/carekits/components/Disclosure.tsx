export function AffiliateDisclosure({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-stone-500 leading-relaxed ${className}`}>
      We may earn commissions from partner links. Recommendations are based on your assessment
      answers and product attributes, not on commission amounts.
    </p>
  );
}

export function MedicalDisclaimer({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs text-stone-500 leading-relaxed ${className}`}>
      This site does not provide medical advice and is not a substitute for professional care,
      emergency services, or clinical monitoring.
    </p>
  );
}
