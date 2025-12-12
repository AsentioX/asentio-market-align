interface TopographicPatternProps {
  className?: string;
  variant?: 'light' | 'dark';
}

const TopographicPattern = ({ className = '', variant = 'light' }: TopographicPatternProps) => {
  const strokeColor = variant === 'light' ? 'stroke-foreground/5' : 'stroke-background/10';
  
  return (
    <svg
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* Outer contour lines */}
      <path
        d="M-50 150 Q100 100 200 180 T400 120 T600 200 T850 150"
        className={`${strokeColor} animate-undulate-1`}
        strokeWidth="1.5"
      />
      <path
        d="M-50 200 Q150 150 250 220 T450 160 T650 240 T850 190"
        className={`${strokeColor} animate-undulate-2`}
        strokeWidth="1"
      />
      <path
        d="M-50 250 Q100 200 200 280 T400 220 T600 300 T850 250"
        className={`${strokeColor} animate-undulate-3`}
        strokeWidth="1.5"
      />
      
      {/* Middle contour lines */}
      <path
        d="M-50 350 Q200 300 300 380 T500 320 T700 400 T850 350"
        className={`${strokeColor} animate-undulate-2`}
        strokeWidth="1"
      />
      <path
        d="M-50 400 Q150 350 250 420 T450 360 T650 440 T850 390"
        className={`${strokeColor} animate-undulate-1`}
        strokeWidth="1.5"
      />
      <path
        d="M-50 450 Q100 400 200 480 T400 420 T600 500 T850 450"
        className={`${strokeColor} animate-undulate-3`}
        strokeWidth="1"
      />
      
      {/* Inner detail lines */}
      <path
        d="M100 300 Q200 280 300 320 T500 290"
        className={`${strokeColor} animate-undulate-3`}
        strokeWidth="0.75"
      />
      <path
        d="M300 500 Q400 470 500 520 T700 490"
        className={`${strokeColor} animate-undulate-1`}
        strokeWidth="0.75"
      />
      
      {/* Circular contours */}
      <ellipse
        cx="650"
        cy="150"
        rx="80"
        ry="60"
        className={`${strokeColor} animate-undulate-2`}
        strokeWidth="1"
      />
      <ellipse
        cx="650"
        cy="150"
        rx="50"
        ry="35"
        className={`${strokeColor} animate-undulate-3`}
        strokeWidth="0.75"
      />
      
      <ellipse
        cx="150"
        cy="450"
        rx="100"
        ry="70"
        className={`${strokeColor} animate-undulate-1`}
        strokeWidth="1"
      />
      <ellipse
        cx="150"
        cy="450"
        rx="60"
        ry="40"
        className={`${strokeColor} animate-undulate-2`}
        strokeWidth="0.75"
      />
    </svg>
  );
};

export default TopographicPattern;
