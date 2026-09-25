import { cn } from "@/lib/utils";

interface NexusScoreGaugeProps {
  score: number;
  className?: string;
}

export function NexusScoreGauge({ score, className }: NexusScoreGaugeProps) {
  // Determine color and label based on score
  let color = "text-semantic-bear"; // < 40
  let label = "Bearish";
  let gradientFrom = "from-semantic-bear/50";
  let strokeColor = "#F43F5E";

  if (score >= 70) {
    color = "text-semantic-bull";
    label = "Strong Bullish";
    gradientFrom = "from-semantic-bull/50";
    strokeColor = "#10B981";
  } else if (score >= 50) {
    color = "text-brand-500";
    label = "Neutral / Bullish";
    gradientFrom = "from-brand-500/50";
    strokeColor = "#FF7A00";
  } else if (score >= 40) {
    color = "text-yellow-500";
    label = "Neutral";
    gradientFrom = "from-yellow-500/50";
    strokeColor = "#EAB308";
  }

  // Calculate SVG stroke dash array for the gauge
  // SVG circle circumference for r=45 is ~282.7
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // We want a semi-circle, so we only use half of the circumference.
  const semiCircumference = circumference / 2;
  const strokeDasharray = `${semiCircumference} ${circumference}`;
  // Map score (0-100) to stroke offset. 
  // Offset of semiCircumference means 0%. Offset of 0 means 100%.
  const strokeDashoffset = semiCircumference - (score / 100) * semiCircumference;

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative w-48 h-28 overflow-hidden">
        {/* Background Track */}
        <svg viewBox="0 0 100 50" className="w-full h-full drop-shadow-xl">
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#27272A"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Active Track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Ambient Glow */}
        <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-12 bg-gradient-to-t to-transparent blur-xl", gradientFrom)}></div>
        
        {/* Score Number */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className={cn("text-4xl font-black tracking-tighter leading-none", color)}>
            {score}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Nexus Score</div>
        <div className={cn("text-sm font-semibold mt-0.5", color)}>{label}</div>
      </div>
    </div>
  );
}
