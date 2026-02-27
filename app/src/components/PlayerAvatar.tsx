import { cn } from '@/lib/utils';
import type { Player } from '@/types/game';

interface PlayerAvatarProps {
  player: Player;
  isCurrentPlayer?: boolean;
  showCaps?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

const avatars = ['🥤', '🧃', '🍾', '🧋', '🍺', '🥃', '🍷', '🍸'];

export function PlayerAvatar({
  player,
  isCurrentPlayer = false,
  showCaps = true,
  size = 'md',
  isActive = false
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const avatarIndex = player.name.charCodeAt(0) % avatars.length;

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative rounded-full border-4 flex items-center justify-center transition-all',
          sizeClasses[size],
          player.isBorderGuard
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-700'
            : 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-700',
          isCurrentPlayer && 'ring-4 ring-green-400 ring-offset-2',
          isActive && 'animate-bounce',
          !player.isConnected && 'opacity-50 grayscale'
        )}
      >
        <span>{player.avatar || avatars[avatarIndex]}</span>
        
        {/* 边境守卫徽章 */}
        {player.isBorderGuard && (
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
            👮
          </div>
        )}
        
        {/* 就绪标记 */}
        {player.isReady && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            ✓
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <p className={cn(
          'font-bold text-sm',
          isCurrentPlayer ? 'text-green-600' : 'text-slate-700'
        )}>
          {player.name}
          {isCurrentPlayer && ' (你)'}
        </p>
        
        {showCaps && (
          <div className="flex items-center justify-center gap-1 mt-1 bg-amber-100 rounded-full px-2 py-0.5">
            <span className="text-sm">🍺</span>
            <span className="font-bold text-amber-800 text-sm">{player.bottleCaps}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlayerList({
  players,
  currentPlayerId,
  activePlayerId
}: {
  players: Player[];
  currentPlayerId: string;
  activePlayerId?: string;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {players.map(player => (
        <PlayerAvatar
          key={player.id}
          player={player}
          isCurrentPlayer={player.id === currentPlayerId}
          isActive={player.id === activePlayerId}
        />
      ))}
    </div>
  );
}
