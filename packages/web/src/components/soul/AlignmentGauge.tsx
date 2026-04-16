'use client';

interface AlignmentGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

export function AlignmentGauge({
  value,
  size = 80,
  strokeWidth = 6,
}: AlignmentGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.max(0, Math.min(100, value));
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (v: number) => {
    if (v >= 80) return '#10b981';
    if (v >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(progress);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/30"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Genesis Alignment</span>
    </div>
  );
}
