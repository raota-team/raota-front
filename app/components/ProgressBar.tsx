interface ProgressBarProps {
  votes: number;
  totalVotes: number;
  isSelected: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ votes, totalVotes, isSelected }) => {
  const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
  return (
    <div className="w-full mb-3 group cursor-pointer">
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span className={`${isSelected ? 'text-red-500' : 'text-stone-600'}`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${isSelected ? 'bg-red-600' : 'bg-stone-400 group-hover:bg-stone-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
