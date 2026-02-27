import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SuitcaseCardComponent } from './SuitcaseCard';
import { EventCardComponent, EventCardMini } from './EventCard';
import { PlayerAvatar, PlayerList } from './PlayerAvatar';
import { useGame } from '@/hooks/useGame';
import type { SuitcaseCard } from '@/types/game';
import { toast } from 'sonner';

// 创建/加入房间界面
export function Lobby({
  onCreateRoom,
  onJoinRoom,
  isConnecting
}: {
  onCreateRoom: (name: string, avatar: string) => void;
  onJoinRoom: (code: string, name: string, avatar: string) => void;
  isConnecting: boolean;
}) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🥤');

  const avatars = ['🥤', '🧃', '🍾', '🧋', '🍺', '🥃', '🍷', '🍸'];

  const handleCreate = () => {
    if (name.trim()) {
      onCreateRoom(name.trim(), selectedAvatar);
    }
  };

  const handleJoin = () => {
    if (name.trim() && code.trim()) {
      onJoinRoom(code.trim().toUpperCase(), name.trim(), selectedAvatar);
    }
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">🥤</div>
            <CardTitle className="text-3xl font-bold text-slate-800">汽水走私者</CardTitle>
            <p className="text-slate-500">Soda Smugglers</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              创建房间
            </Button>
            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full h-16 text-lg"
            >
              加入房间
            </Button>
            <div className="text-center text-sm text-slate-500 mt-4">
              <p>3-8人游戏 | 约20分钟</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button variant="ghost" onClick={() => setMode('select')} className="mb-2">
            ← 返回
          </Button>
          <CardTitle>{mode === 'create' ? '创建房间' : '加入房间'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">你的名字</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入昵称"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              maxLength={12}
            />
          </div>

          {mode === 'join' && (
            <div>
              <label className="block text-sm font-medium mb-2">房间代码</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="输入6位代码"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
                maxLength={6}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">选择头像</label>
            <div className="flex flex-wrap gap-2">
              {avatars.map(avatar => (
                <button
                  key={avatar}
                  onClick={() => setSelectedAvatar(avatar)}
                  className={cn(
                    'w-12 h-12 text-2xl rounded-lg border-2 transition-all',
                    selectedAvatar === avatar
                      ? 'border-blue-500 bg-blue-100 scale-110'
                      : 'border-slate-200 hover:border-blue-300'
                  )}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={mode === 'create' ? handleCreate : handleJoin}
            disabled={!name.trim() || (mode === 'join' && !code.trim()) || isConnecting}
            className="w-full h-12"
          >
            {isConnecting ? '连接中...' : mode === 'create' ? '创建房间' : '加入房间'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// 游戏大厅
export function GameRoomLobby({
  room,
  playerId,
  onStartGame,
  onLeave
}: {
  room: ReturnType<typeof useGame>['room'];
  playerId: string;
  onStartGame: () => void;
  onLeave: () => void;
}) {
  if (!room) return null;

  const isHost = room.players[0]?.id === playerId;
  const canStart = room.players.length >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">游戏大厅</CardTitle>
            <div className="text-4xl font-mono font-bold text-blue-600 tracking-widest">
              {room.code}
            </div>
            <p className="text-slate-500">分享此代码让其他玩家加入</p>
          </CardHeader>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>玩家列表 ({room.players.length}/8)</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerList players={room.players} currentPlayerId={playerId} />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          {isHost && (
            <Button
              onClick={onStartGame}
              disabled={!canStart}
              className="flex-1 h-16 text-lg bg-gradient-to-r from-green-500 to-emerald-600"
            >
              {canStart ? '开始游戏' : '至少需要3名玩家'}
            </Button>
          )}
          <Button onClick={onLeave} variant="outline" className="h-16 px-8">
            离开
          </Button>
        </div>
      </div>
    </div>
  );
}

// 游戏主界面
export function GamePlay({
  room,
  playerId,
  getMyHand,
  selectCards,
  useActionToken,
  finishGuardActions,
  amIBorderGuard
}: {
  room: ReturnType<typeof useGame>['room'];
  playerId: string;
  getMyHand: () => SuitcaseCard[];
  selectCards: (luggage: string[], bribe: string) => boolean;
  useActionToken: (index: number, target?: string) => boolean;
  finishGuardActions: () => boolean;
  amIBorderGuard: () => boolean;
}) {
  if (!room) return null;

  const [selectedLuggage, setSelectedLuggage] = useState<string[]>([]);
  const [selectedBribe, setSelectedBribe] = useState<string | null>(null);
  const [showEvent, setShowEvent] = useState(true);
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const myHand = getMyHand();
  const isBorderGuard = amIBorderGuard();
  const myState = room.travelerStates.get(playerId);
  const travelers = room.players.filter(p => !p.isBorderGuard);

  // 自动显示事件卡3秒后关闭
  useEffect(() => {
    if (room.phase === 'event' && room.eventCard) {
      setShowEvent(true);
      const timer = setTimeout(() => setShowEvent(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [room.phase, room.eventCard]);

  // 旅行者选择卡片
  const handleCardSelect = (cardId: string) => {
    if (room.phase !== 'selecting') return;

    if (selectedLuggage.includes(cardId)) {
      setSelectedLuggage(prev => prev.filter(id => id !== cardId));
    } else if (selectedLuggage.length < 2) {
      setSelectedLuggage(prev => [...prev, cardId]);
    } else if (selectedBribe === cardId) {
      setSelectedBribe(null);
    } else if (!selectedBribe) {
      setSelectedBribe(cardId);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedLuggage.length === 2 && selectedBribe) {
      const success = selectCards(selectedLuggage, selectedBribe);
      if (success) {
        toast.success('选择已提交！');
      }
    }
  };

  // 边境守卫使用行动令牌
  const handleUseToken = (tokenIndex: number) => {
    const token = room.actionTokens[tokenIndex];
    if (!token || token.used) return;

    if (token.type === 'accept_bribe') {
      if (!actionTarget) {
        toast.info('请先选择一个旅行者');
        return;
      }
      const success = useActionToken(tokenIndex, actionTarget);
      if (success) {
        toast.success('已接受贿赂！');
        setActionTarget(null);
      }
    } else if (token.type === 'inspect_suitcase') {
      if (!actionTarget) {
        toast.info('请先选择一个旅行者');
        return;
      }
      const success = useActionToken(tokenIndex, actionTarget);
      if (success) {
        toast.success('已检查行李箱！');
        setActionTarget(null);
      }
    } else if (token.type === 'arrest') {
      if (!actionTarget) {
        toast.info('请先选择一个旅行者');
        return;
      }
      const success = useActionToken(tokenIndex, actionTarget);
      if (success) {
        toast.success('已执行逮捕！');
        setActionTarget(null);
      }
    }
  };

  // 渲染不同阶段
  const renderPhase = () => {
    switch (room.phase) {
      case 'event':
        return (
          <Dialog open={showEvent} onOpenChange={setShowEvent}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">本回合事件</DialogTitle>
              </DialogHeader>
              {room.eventCard ? (
                <div className="flex justify-center">
                  <EventCardComponent event={room.eventCard} size="lg" />
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <p className="text-xl">本回合无特殊事件</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        );

      case 'selecting':
        if (isBorderGuard) {
          return (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👮</div>
              <h2 className="text-2xl font-bold mb-4">你是边境守卫</h2>
              <p className="text-slate-600">等待旅行者选择行李和贿赂...</p>
              <div className="mt-8">
                <PlayerList players={travelers} currentPlayerId={playerId} />
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">选择你的行李和贿赂</h2>
              <p className="text-slate-600">
                选择2张作为行李，1张作为贿赂，弃掉2张
              </p>
            </div>

            <div className="grid grid-cols-5 gap-4 justify-items-center">
              {myHand.map(card => {
                const isLuggage = selectedLuggage.includes(card.id);
                const isBribe = selectedBribe === card.id;
                return (
                  <div key={card.id} className="relative">
                    <SuitcaseCardComponent
                      bottles={card.bottles}
                      isSelected={isLuggage || isBribe}
                      onClick={() => handleCardSelect(card.id)}
                    />
                    {isLuggage && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        行李
                      </div>
                    )}
                    {isBribe && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        贿赂
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4">
              <div className="bg-blue-100 rounded-lg px-4 py-2">
                已选行李: {selectedLuggage.length}/2
              </div>
              <div className="bg-green-100 rounded-lg px-4 py-2">
                已选贿赂: {selectedBribe ? '1' : '0'}/1
              </div>
            </div>

            <Button
              onClick={handleConfirmSelection}
              disabled={selectedLuggage.length !== 2 || !selectedBribe}
              className="w-full h-14 text-lg"
            >
              确认选择
            </Button>
          </div>
        );

      case 'bribe_reveal':
      case 'guard_action':
        if (isBorderGuard) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">边境守卫行动</h2>
                <p className="text-slate-600">按顺序使用行动令牌</p>
              </div>

              {/* 行动令牌 */}
              <div className="flex justify-center gap-4 flex-wrap">
                {room.actionTokens.map((token, index) => {
                  const isUsed = token.used;
                  const canUse = !isUsed && room.phase === 'guard_action';
                  
                  return (
                    <button
                      key={index}
                      onClick={() => canUse && handleUseToken(index)}
                      disabled={!canUse}
                      className={cn(
                        'relative w-24 h-32 rounded-xl border-4 flex flex-col items-center justify-center transition-all',
                        token.type === 'accept_bribe' && 'bg-green-100 border-green-500',
                        token.type === 'inspect_suitcase' && 'bg-blue-100 border-blue-500',
                        token.type === 'arrest' && 'bg-red-100 border-red-500',
                        isUsed && 'opacity-50 grayscale',
                        canUse && 'hover:scale-105 cursor-pointer'
                      )}
                    >
                      <span className="text-3xl mb-2">
                        {token.type === 'accept_bribe' && '💰'}
                        {token.type === 'inspect_suitcase' && '🔍'}
                        {token.type === 'arrest' && '👮'}
                      </span>
                      <span className="text-xs font-bold text-center">
                        {token.type === 'accept_bribe' && '接受贿赂'}
                        {token.type === 'inspect_suitcase' && '检查行李'}
                        {token.type === 'arrest' && '逮捕'}
                      </span>
                      {isUsed && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                          <span className="text-4xl">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 选择目标 */}
              {room.actionTokens.some(t => !t.used) && (
                <div className="bg-slate-100 rounded-lg p-4">
                  <p className="text-center font-medium mb-3">选择目标旅行者</p>
                  <div className="flex justify-center gap-4">
                    {travelers.map(traveler => {
                      const tState = room.travelerStates.get(traveler.id);
                      const isTarget = actionTarget === traveler.id;
                      const isProcessed = tState?.isBribeAccepted || tState?.isArrested || tState?.isWavedThrough;
                      
                      return (
                        <button
                          key={traveler.id}
                          onClick={() => !isProcessed && setActionTarget(traveler.id)}
                          disabled={isProcessed}
                          className={cn(
                            'p-3 rounded-lg border-2 transition-all',
                            isTarget && 'border-blue-500 bg-blue-100',
                            isProcessed && 'opacity-50 cursor-not-allowed',
                            !isProcessed && !isTarget && 'hover:border-blue-300'
                          )}
                        >
                          <PlayerAvatar player={traveler} size="sm" showCaps={false} />
                          {tState?.isBribeAccepted && <span className="text-xs text-green-600">已通过</span>}
                          {tState?.isArrested && <span className="text-xs text-red-600">已逮捕</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                onClick={finishGuardActions}
                variant="outline"
                className="w-full h-12"
              >
                结束行动，放行剩余旅行者
              </Button>
            </div>
          );
        }

        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧳</div>
            <h2 className="text-2xl font-bold mb-4">等待边境守卫行动</h2>
            
            {/* 显示已揭示的信息 */}
            {myState && myState.revealedLuggage.length > 0 && (
              <div className="mt-8">
                <p className="text-slate-600 mb-4">你的行李已被检查:</p>
                <div className="flex justify-center gap-4">
                  {myState.revealedLuggage.map(card => (
                    <SuitcaseCardComponent
                      key={card.id}
                      bottles={card.bottles}
                      isRevealed={true}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            )}

            {myState?.isBribeAccepted && (
              <div className="mt-8 text-green-600">
                <p className="text-xl">✓ 你已被放行</p>
              </div>
            )}

            {myState?.isArrested && (
              <div className="mt-8 text-red-600">
                <p className="text-xl">👮 你已被逮捕</p>
              </div>
            )}
          </div>
        );

      case 'scoring':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-4">回合结算</h2>
            <p className="text-slate-600">正在计算得分...</p>
            
            <div className="mt-8">
              <PlayerList players={room.players} currentPlayerId={playerId} />
            </div>
          </div>
        );

      case 'game_end':
        const sortedPlayers = [...room.players].sort((a, b) => b.bottleCaps - a.bottleCaps);
        const winner = sortedPlayers[0];
        
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold mb-4">游戏结束</h2>
            
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-6 mb-8">
              <p className="text-white text-lg mb-2">获胜者</p>
              <p className="text-white text-3xl font-bold">{winner.name}</p>
              <p className="text-white text-xl">🍺 {winner.bottleCaps} 瓶盖</p>
            </div>
            
            <div className="space-y-2">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg',
                    index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-slate-100'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</span>
                    <PlayerAvatar player={player} size="sm" showCaps={false} />
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <span className="font-bold text-amber-700">🍺 {player.bottleCaps}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 顶部信息栏 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-slate-500">回合</p>
                  <p className="text-xl font-bold">{room.round}/{room.maxRounds}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">当前守卫</p>
                  <p className="text-xl font-bold">
                    {room.players.find(p => p.id === room.currentBorderGuardId)?.name}
                  </p>
                </div>
              </div>
              
              {room.eventCard && (
                <EventCardMini event={room.eventCard} />
              )}
              
              <div>
                <p className="text-sm text-slate-500">库存瓶盖</p>
                <p className="text-xl font-bold">🍺 {room.generalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 玩家列表 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <PlayerList players={room.players} currentPlayerId={playerId} />
          </CardContent>
        </Card>

        {/* 游戏主区域 */}
        <Card>
          <CardContent className="p-6">
            {renderPhase()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
