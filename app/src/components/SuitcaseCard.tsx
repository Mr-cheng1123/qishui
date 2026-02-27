import { cn } from '@/lib/utils';

interface SuitcaseCardProps {
  bottles: number;
  isFaceDown?: boolean;
  isSelected?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function SuitcaseCardComponent({
  bottles,
  isFaceDown = false,
  isSelected = false,
  isRevealed = false,
  onClick,
  size = 'md',
  disabled = false
}: SuitcaseCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-24 text-lg',
    md: 'w-24 h-36 text-2xl',
    lg: 'w-32 h-48 text-3xl'
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={cn(
        'relative rounded-xl border-4 transition-all duration-300 cursor-pointer',
        'flex items-center justify-center font-bold',
        sizeClasses[size],
        isFaceDown && !isRevealed
          ? 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-800'
          : 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300',
        isSelected && 'ring-4 ring-blue-500 scale-105 border-blue-500',
        disabled && 'cursor-not-allowed opacity-60',
        !disabled && 'hover:scale-105 hover:shadow-xl'
      )}
    >
      {isFaceDown && !isRevealed ? (
        <div className="flex flex-col items-center justify-center text-amber-100">
          <svg className="w-8 h-8 mb-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span className="text-xs">行李</span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <span className={cn(
            'text-4xl mb-2',
            bottles === 0 && 'text-slate-400',
            bottles === 1 && 'text-green-600',
            bottles === 2 && 'text-blue-600',
            bottles === 3 && 'text-purple-600'
          )}>
            {bottles}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: bottles }).map((_, i) => (
              <svg
                key={i}
                className={cn(
                  'w-4 h-4',
                  bottles === 1 && 'text-green-500',
                  bottles === 2 && 'text-blue-500',
                  bottles === 3 && 'text-purple-500'
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.761 2.165 17.5 4.8 17.5h10.4c2.635 0 3.983-2.74 2.093-4.621l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
              </svg>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
