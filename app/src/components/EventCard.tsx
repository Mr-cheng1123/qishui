import { cn } from '@/lib/utils';
import type { EventCard as EventCardType } from '@/types/game';

interface EventCardProps {
  event: EventCardType;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const eventIcons: Record<string, string> = {
  night_shift: '🌙',
  holiday_season: '🎄',
  temptation: '🍎',
  birthday: '🎂',
  sniffer_dog: '🐕',
  superior_officer: '👮',
  tip_off: '📞',
  breakage: '💥'
};

const eventColors: Record<string, string> = {
  night_shift: 'from-indigo-600 to-purple-800',
  holiday_season: 'from-green-600 to-red-700',
  temptation: 'from-pink-600 to-rose-800',
  birthday: 'from-yellow-500 to-orange-600',
  sniffer_dog: 'from-amber-600 to-yellow-700',
  superior_officer: 'from-blue-700 to-indigo-900',
  tip_off: 'from-emerald-600 to-teal-800',
  breakage: 'from-red-600 to-orange-700'
};

export function EventCardComponent({
  event,
  showDescription = true,
  size = 'md'
}: EventCardProps) {
  const sizeClasses = {
    sm: 'w-48 h-32 text-sm',
    md: 'w-64 h-44 text-base',
    lg: 'w-80 h-56 text-lg'
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl border-4 border-white/30 shadow-2xl overflow-hidden',
        'flex flex-col items-center justify-center text-white',
        'bg-gradient-to-br',
        eventColors[event.effect] || 'from-slate-600 to-slate-800',
        sizeClasses[size]
      )}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 right-2 text-6xl">{eventIcons[event.effect]}</div>
        <div className="absolute bottom-2 left-2 text-4xl opacity-50">{eventIcons[event.effect]}</div>
      </div>
      
      {/* 内容 */}
      <div className="relative z-10 text-center px-4">
        <div className="text-3xl mb-1">{eventIcons[event.effect]}</div>
        <h3 className="font-bold text-lg mb-1">{event.name}</h3>
        <p className="text-xs opacity-80 mb-2">{event.nameEn}</p>
        {showDescription && (
          <p className="text-sm leading-tight opacity-90">{event.description}</p>
        )}
      </div>
      
      {/* 闪光效果 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-pulse" />
    </div>
  );
}

export function EventCardMini({ event }: { event: EventCardType }) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-100 to-amber-50 rounded-lg p-3 border-2 border-amber-300">
      <span className="text-2xl">{eventIcons[event.effect]}</span>
      <div>
        <p className="font-bold text-amber-900">{event.name}</p>
        <p className="text-xs text-amber-700">{event.description}</p>
      </div>
    </div>
  );
}
