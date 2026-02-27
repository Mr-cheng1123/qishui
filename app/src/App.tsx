import { useGame } from '@/hooks/useGame';
import { Lobby, GameRoomLobby, GamePlay } from '@/components/GameBoard';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useEffect } from 'react';

function App() {
  const {
    room,
    playerId,
    error,
    isConnecting,
    isConnected,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    selectCards,
    useActionToken,
    finishGuardActions,
    getMyHand,
    amIBorderGuard
  } = useGame();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // 根据游戏状态渲染不同界面
  const renderContent = () => {
    // 未在房间中 - 显示大厅
    if (!room) {
      return (
        <Lobby
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          isConnecting={isConnecting}
        />
      );
    }

    // 等待阶段 - 显示游戏房间
    if (room.phase === 'waiting') {
      return (
        <GameRoomLobby
          room={room}
          playerId={playerId}
          onStartGame={startGame}
          onLeave={leaveRoom}
        />
      );
    }

    // 游戏进行中
    return (
      <GamePlay
        room={room}
        playerId={playerId}
        getMyHand={getMyHand}
        selectCards={selectCards}
        useActionToken={useActionToken}
        finishGuardActions={finishGuardActions}
        amIBorderGuard={amIBorderGuard}
      />
    );
  };

  return (
    <>
      {/* 连接状态指示器 */}
      <div className="fixed top-2 right-2 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs font-medium text-slate-700">
          {isConnected ? '已连接' : '未连接'}
        </span>
      </div>
      {renderContent()}
      <Toaster position="top-center" />
    </>
  );
}

export default App;
