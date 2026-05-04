import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  votes: number;
  totalVotes: number;
  isSelected: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ votes, totalVotes, isSelected }) => {
  const targetPercentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    // 숫자가 부드럽게 올라가는 애니메이션
    const duration = 1000;
    const steps = 30;
    const stepValue = targetPercentage / steps;
    let current = 0;
    
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= targetPercentage) {
        setDisplayPercentage(targetPercentage);
        clearInterval(interval);
      } else {
        setDisplayPercentage(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [targetPercentage]);

  return (
    <div className="w-full mb-3 group cursor-pointer">
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span className={`${isSelected ? 'text-[#e60000]' : 'text-stone-600'} font-bold tabular-nums`}>
          {displayPercentage}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${isSelected ? 'bg-[#e60000]' : 'bg-stone-400 group-hover:bg-stone-500'}`}
          style={{ width: `${targetPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
