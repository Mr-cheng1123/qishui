const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());

const clientDistPath = path.resolve(__dirname, '../app/dist');
const hasClientBuild = fs.existsSync(path.join(clientDistPath, 'index.html'));

if (hasClientBuild) {
  app.use(express.static(clientDistPath));
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 游戏配置
const GAME_CONFIG = {
  minPlayers: 3,
  maxPlayers: 8,
  initialBottleCaps: 10,
  suitcasesPerTraveler: 5,
  actionTokensByPlayerCount: {
    3: { acceptBribe: 1, inspect: 1, arrest: 1 },
    4: { acceptBribe: 1, inspect: 1, arrest: 1 },
    5: { acceptBribe: 1, inspect: 1, arrest: 2 },
    6: { acceptBribe: 1, inspect: 2, arrest: 2 },
    7: { acceptBribe: 2, inspect: 2, arrest: 2 },
    8: { acceptBribe: 2, inspect: 2, arrest: 3 },
  }
};

// 8张事件卡
const EVENT_CARDS = [
  {
    id: 'night_shift',
    name: '夜班',
    nameEn: 'Night Shift',
    description: '边境守卫在本回合获得一个额外的"接受贿赂"行动令牌',
    effect: 'night_shift'
  },
  {
    id: 'holiday_season',
    name: '假日季节',
    nameEn: 'Holiday Season',
    description: '每个旅行者打包3个行李箱而不是2个（但仍只允许携带1瓶过境）',
    effect: 'holiday_season'
  },
  {
    id: 'temptation',
    name: '诱惑',
    nameEn: 'Temptation',
    description: '边境守卫可以接受所有旅行者的贿赂（不限数量）',
    effect: 'temptation'
  },
  {
    id: 'birthday',
    name: '生日',
    nameEn: 'Birthday',
    description: '边境守卫获得2个瓶盖。本回合每位旅行者可以合法携带2瓶汽水过境',
    effect: 'birthday'
  },
  {
    id: 'sniffer_dog',
    name: '嗅探犬',
    nameEn: 'Sniffer Dog',
    description: '边境守卫选择一名旅行者，该旅行者必须展示装有最多瓶子的行李箱',
    effect: 'sniffer_dog'
  },
  {
    id: 'superior_officer',
    name: '上级警官',
    nameEn: 'Superior Officer',
    description: '边境守卫获得一个额外的"检查行李箱"令牌，可以用于已经检查过的旅行者',
    effect: 'superior_officer'
  },
  {
    id: 'tip_off',
    name: '线报',
    nameEn: 'Tip-Off',
    description: '边境守卫获得一个额外的"逮捕"令牌，且错误逮捕时没有惩罚',
    effect: 'tip_off'
  },
  {
    id: 'breakage',
    name: '破损',
    nameEn: 'Breakage',
    description: '边境守卫失去1个"逮捕"令牌。本回合合法携带限制变为0瓶',
    effect: 'breakage'
  }
];

// 行李箱卡组配置
const SUITCASE_DECK_CONFIG = {
  zeroBottles: 5,
  oneBottle: 12,
  twoBottles: 12,
  threeBottles: 7
};

// 存储所有房间
const rooms = new Map();

// 生成房间代码
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 生成行李箱卡组
function generateSuitcaseDeck() {
  const deck = [];
  let id = 0;
  
  for (let i = 0; i < SUITCASE_DECK_CONFIG.zeroBottles; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 0 });
  }
  for (let i = 0; i < SUITCASE_DECK_CONFIG.oneBottle; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 1 });
  }
  for (let i = 0; i < SUITCASE_DECK_CONFIG.twoBottles; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 2 });
  }
  for (let i = 0; i < SUITCASE_DECK_CONFIG.threeBottles; i++) {
    deck.push({ id: `suitcase_${id++}`, bottles: 3 });
  }
  
  return shuffleDeck(deck);
}

// 洗牌
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 广播房间状态给所有玩家
function broadcastRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  
  // 将 Map 转换为普通对象以便 JSON 序列化
  const roomData = {
    ...room,
    travelerStates: Object.fromEntries(room.travelerStates)
  };
  
  // 为每个玩家准备数据（隐藏其他玩家的手牌）
  room.players.forEach(player => {
    const playerSocket = io.sockets.sockets.get(player.socketId);
    if (playerSocket) {
      const playerData = {
        ...roomData,
        players: room.players.map(p => ({
          ...p,
          hand: p.id === player.id ? (p.hand || []) : undefined
        }))
      };
      playerSocket.emit('room_update', playerData);
    }
  });
}

// 开始新回合
function startNewRound(room) {
  room.phase = 'event';
  room.travelerStates = new Map();
  room.actionTokens = [];
  
  // 重置玩家状态
  room.players.forEach(p => {
    p.isBorderGuard = p.id === room.currentBorderGuardId;
    p.isReady = false;
    delete p.selectedLuggage;
    delete p.selectedBribe;
  });
  
  // 抽取事件卡
  if (room.round > 1 || Math.random() > 0.3) {
    room.eventCard = EVENT_CARDS[Math.floor(Math.random() * EVENT_CARDS.length)];
  } else {
    room.eventCard = null;
  }
  
  // 应用事件卡效果
  applyEventCardEffect(room);
  
  // 为旅行者发牌
  const travelers = room.players.filter(p => !p.isBorderGuard);
  travelers.forEach(traveler => {
    const hand = [];
    for (let i = 0; i < GAME_CONFIG.suitcasesPerTraveler; i++) {
      if (room.suitcaseDeck.length === 0) {
        room.suitcaseDeck = shuffleDeck(room.discardPile);
        room.discardPile = [];
      }
      if (room.suitcaseDeck.length > 0) {
        hand.push(room.suitcaseDeck.pop());
      }
    }
    
    traveler.hand = hand;
    
    room.travelerStates.set(traveler.id, {
      playerId: traveler.id,
      luggage: [],
      bribe: null,
      revealedLuggage: [],
      isBribeAccepted: false,
      isArrested: false,
      isWavedThrough: false
    });
  });
  
  room.phase = 'selecting';
}

// 应用事件卡效果
function applyEventCardEffect(room) {
  const playerCount = room.players.length;
  const baseTokens = GAME_CONFIG.actionTokensByPlayerCount[playerCount] || 
    { acceptBribe: 1, inspect: 1, arrest: 1 };
  
  let acceptBribe = baseTokens.acceptBribe;
  let inspect = baseTokens.inspect;
  let arrest = baseTokens.arrest;
  
  if (room.eventCard) {
    switch (room.eventCard.effect) {
      case 'night_shift':
        acceptBribe++;
        break;
      case 'superior_officer':
        inspect++;
        break;
      case 'tip_off':
        arrest++;
        break;
      case 'breakage':
        arrest = Math.max(0, arrest - 1);
        room.legalLimit = 0;
        break;
      case 'birthday':
        room.legalLimit = 2;
        const guard = room.players.find(p => p.id === room.currentBorderGuardId);
        if (guard) {
          guard.bottleCaps += 2;
          room.generalStock -= 2;
        }
        break;
    }
  }
  
  room.actionTokens = [
    ...Array(acceptBribe).fill(null).map(() => ({ type: 'accept_bribe', used: false })),
    ...Array(inspect).fill(null).map(() => ({ type: 'inspect_suitcase', used: false })),
    ...Array(arrest).fill(null).map(() => ({ type: 'arrest', used: false }))
  ];
}

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  // 创建房间
  socket.on('create_room', ({ playerName, avatar }) => {
    const code = generateRoomCode();
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const room = {
      id: `room_${Date.now()}`,
      code,
      players: [{
        id: playerId,
        socketId: socket.id,
        name: playerName,
        avatar,
        bottleCaps: 0,
        isBorderGuard: false,
        isReady: false,
        isConnected: true
      }],
      phase: 'waiting',
      round: 0,
      maxRounds: 0,
      currentBorderGuardId: '',
      eventCard: null,
      suitcaseDeck: [],
      discardPile: [],
      travelerStates: new Map(),
      actionTokens: [],
      generalStock: 80,
      legalLimit: 1
    };
    
    rooms.set(code, room);
    socket.join(code);
    socket.playerId = playerId;
    socket.roomCode = code;
    
    socket.emit('room_created', { code, playerId });
    broadcastRoom(code);
    console.log(`Room created: ${code} by ${playerName}`);
  });
  
  // 加入房间
  socket.on('join_room', ({ code, playerName, avatar }) => {
    const room = rooms.get(code.toUpperCase());
    
    if (!room) {
      socket.emit('error', { message: '房间不存在' });
      return;
    }
    
    if (room.players.length >= GAME_CONFIG.maxPlayers) {
      socket.emit('error', { message: '房间已满' });
      return;
    }
    
    if (room.phase !== 'waiting') {
      socket.emit('error', { message: '游戏已开始' });
      return;
    }
    
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    room.players.push({
      id: playerId,
      socketId: socket.id,
      name: playerName,
      avatar,
      bottleCaps: 0,
      isBorderGuard: false,
      isReady: false,
      isConnected: true
    });
    
    socket.join(code);
    socket.playerId = playerId;
    socket.roomCode = code;
    
    socket.emit('room_joined', { code, playerId });
    broadcastRoom(code);
    console.log(`${playerName} joined room: ${code}`);
  });
  
  // 开始游戏
  socket.on('start_game', () => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    
    // 只有房主可以开始游戏
    if (room.players[0].socketId !== socket.id) {
      socket.emit('error', { message: '只有房主可以开始游戏' });
      return;
    }
    
    if (room.players.length < GAME_CONFIG.minPlayers) {
      socket.emit('error', { message: `至少需要${GAME_CONFIG.minPlayers}名玩家` });
      return;
    }
    
    room.phase = 'setup';
    room.round = 1;
    room.maxRounds = room.players.length <= 4 ? room.players.length * 2 : room.players.length;
    room.suitcaseDeck = generateSuitcaseDeck();
    room.discardPile = [];
    room.legalLimit = 1;
    
    // 初始化玩家瓶盖
    room.players.forEach(player => {
      player.bottleCaps = GAME_CONFIG.initialBottleCaps;
    });
    
    // 设置第一个边境守卫
    room.currentBorderGuardId = room.players[0].id;
    room.players[0].isBorderGuard = true;
    
    startNewRound(room);
    broadcastRoom(room.code);
    console.log(`Game started in room: ${room.code}`);
  });
  
  // 旅行者选择卡片
  socket.on('select_cards', ({ luggageIds, bribeId }) => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'selecting') return;
    
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player || player.isBorderGuard) return;
    
    const hand = player.hand || [];
    const luggage = hand.filter(c => luggageIds.includes(c.id));
    const bribe = hand.find(c => c.id === bribeId);
    
    if (luggage.length !== 2 || !bribe) {
      socket.emit('error', { message: '无效的卡片选择' });
      return;
    }
    
    const travelerState = room.travelerStates.get(player.id);
    if (!travelerState) return;
    
    travelerState.luggage = luggage;
    travelerState.bribe = bribe;
    
    // 弃掉剩余牌
    const usedIds = [...luggageIds, bribeId];
    const discarded = hand.filter(c => !usedIds.includes(c.id));
    room.discardPile.push(...discarded);
    
    player.isReady = true;
    
    // 检查是否所有旅行者都准备好了
    const travelers = room.players.filter(p => !p.isBorderGuard);
    if (travelers.every(t => t.isReady)) {
      room.phase = 'bribe_reveal';
    }
    
    broadcastRoom(room.code);
  });
  
  // 边境守卫使用行动令牌
  socket.on('use_action_token', ({ tokenIndex, targetPlayerId }) => {
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    if (room.phase !== 'guard_action' && room.phase !== 'bribe_reveal') return;
    
    const guard = room.players.find(p => p.socketId === socket.id);
    if (!guard || !guard.isBorderGuard) return;
    
    if (room.phase === 'bribe_reveal') {
      room.phase = 'guard_action';
    }
    
    const token = room.actionTokens[tokenIndex];
    if (!token || token.used) return;
    
    token.used = true;
    token.targetPlayerId = targetPlayerId;
    
    const travelerState = targetPlayerId ? room.travelerStates.get(targetPlayerId) : null;
    
    switch (token.type) {
      case 'accept_bribe':
        if (travelerState && travelerState.bribe && !travelerState.isBribeAccepted) {
          const traveler = room.players.find(p => p.id === targetPlayerId);
          if (traveler) {
            traveler.bottleCaps -= travelerState.bribe.bottles;
            guard.bottleCaps += travelerState.bribe.bottles;
          }
          travelerState.isBribeAccepted = true;
          travelerState.isWavedThrough = true;
          
          const luggageBottles = travelerState.luggage.reduce((sum, c) => sum + c.bottles, 0);
          traveler.bottleCaps += luggageBottles;
          room.generalStock -= luggageBottles;
          
          room.discardPile.push(...travelerState.luggage, travelerState.bribe);
        }
        break;
        
      case 'inspect_suitcase':
        if (travelerState && !travelerState.isArrested) {
          const unrevealed = travelerState.luggage.filter(c => 
            !travelerState.revealedLuggage.find(r => r.id === c.id)
          );
          if (unrevealed.length > 0) {
            travelerState.revealedLuggage.push(unrevealed[0]);
          }
        }
        break;
        
      case 'arrest':
        if (travelerState && !travelerState.isArrested) {
          travelerState.isArrested = true;
          travelerState.revealedLuggage = [...travelerState.luggage];
          
          const totalBottles = travelerState.luggage.reduce((sum, c) => sum + c.bottles, 0);
          const traveler = room.players.find(p => p.id === targetPlayerId);
          
          if (totalBottles > room.legalLimit) {
            guard.bottleCaps += totalBottles;
            room.generalStock -= totalBottles;
          } else {
            const penalty = room.eventCard?.effect === 'tip_off' ? 0 : 2;
            guard.bottleCaps -= penalty;
            traveler.bottleCaps += penalty;
            
            if (totalBottles === 1) {
              traveler.bottleCaps += 1;
              room.generalStock -= 1;
            }
          }
          
          if (travelerState.bribe) {
            room.discardPile.push(travelerState.bribe);
          }
          room.discardPile.push(...travelerState.luggage);
        }
        break;
    }
    
    broadcastRoom(room.code);
  });
  
  // 结束守卫行动
  socket.on('finish_guard_actions', () => {
    const room = rooms.get(socket.roomCode);
    if (!room || room.phase !== 'guard_action') return;
    
    const guard = room.players.find(p => p.socketId === socket.id);
    if (!guard || !guard.isBorderGuard) return;
    
    // 让剩余旅行者通过
    room.travelerStates.forEach((state, playerId) => {
      if (!state.isBribeAccepted && !state.isArrested) {
        state.isWavedThrough = true;
        const traveler = room.players.find(p => p.id === playerId);
        if (traveler) {
          const bottles = state.luggage.reduce((sum, c) => sum + c.bottles, 0);
          traveler.bottleCaps += bottles;
          room.generalStock -= bottles;
        }
        
        if (state.bribe) {
          room.discardPile.push(state.bribe);
        }
        room.discardPile.push(...state.luggage);
      }
    });
    
    room.phase = 'scoring';
    broadcastRoom(room.code);
    
    // 延迟后开始下一轮
    setTimeout(() => {
      const guardIndex = room.players.findIndex(p => p.id === room.currentBorderGuardId);
      const nextGuardIndex = (guardIndex + 1) % room.players.length;
      room.currentBorderGuardId = room.players[nextGuardIndex].id;
      
      room.round++;
      
      if (room.round > room.maxRounds) {
        room.phase = 'game_end';
      } else {
        startNewRound(room);
      }
      
      broadcastRoom(room.code);
    }, 3000);
  });
  
  // 断开连接
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    const room = rooms.get(socket.roomCode);
    if (!room) return;
    
    const player = room.players.find(p => p.socketId === socket.id);
    if (player) {
      player.isConnected = false;
      
      // 如果游戏还没开始，移除玩家
      if (room.phase === 'waiting') {
        room.players = room.players.filter(p => p.socketId !== socket.id);
        
        if (room.players.length === 0) {
          rooms.delete(socket.roomCode);
        }
      }
      
      broadcastRoom(socket.roomCode);
    }
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

if (hasClientBuild) {
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Soda Smugglers Server running on port ${PORT}`);
});
