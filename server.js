const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const path     = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors:{ origin:'*', methods:['GET','POST'] } });
app.use(express.static(path.join(__dirname, 'public')));

const MAX = 20;
const players = {};
const chatLog = [];

function safe(s,n=20){ return String(s||'').trim().slice(0,n); }

/* 방별 안전 스폰 위치 */
const SPAWNS = {
  1: [{x:300,y:260},{x:400,y:300},{x:500,y:250},{x:350,y:350},{x:450,y:400}],
  2: [{x:300,y:260},{x:420,y:320},{x:510,y:270},{x:340,y:370},{x:460,y:420}],
  3: [{x:280,y:270},{x:400,y:320},{x:530,y:280},{x:360,y:390},{x:480,y:430}],
};
function spawnPos(room){
  const list = SPAWNS[room] || SPAWNS[1];
  const p = list[Math.floor(Math.random()*list.length)];
  return { x: p.x+Math.floor(Math.random()*60-30), y: p.y+Math.floor(Math.random()*40-20) };
}

io.on('connection', socket => {
  console.log('[접속]', socket.id);

  socket.on('join', ({name,avatar}) => {
    if(Object.keys(players).length >= MAX){ socket.emit('error_msg','방이 가득 찼어요 (최대 20명)'); return; }
    const {x,y} = spawnPos(1);
    players[socket.id] = { id:socket.id, name:safe(name,12)||'익명', avatar:Math.max(0,Math.min(7,Number(avatar)||0)), x,y, dir:'down', room:1, missions:[] };
    socket.join('room-1');
    socket.emit('init', {
      self: players[socket.id],
      players: Object.values(players).filter(p=>p.id!==socket.id&&p.room===1),
      chatLog,
    });
    socket.to('room-1').emit('player_joined', players[socket.id]);
    io.emit('room_count', Object.keys(players).length);
    console.log(`[입장] ${players[socket.id].name} 방1 — 총 ${Object.keys(players).length}명`);
  });

  socket.on('move', ({x,y,dir}) => {
    const p = players[socket.id]; if(!p) return;
    p.x=Math.round(Number(x)||0); p.y=Math.round(Number(y)||0); p.dir=safe(dir,5)||'down';
    socket.to(`room-${p.room}`).emit('player_moved', {id:socket.id,x:p.x,y:p.y,dir:p.dir});
  });

  /* 방 이동 */
  socket.on('change_room', ({toRoom}) => {
    const p = players[socket.id]; if(!p) return;
    const oldRoom = p.room;
    socket.to(`room-${oldRoom}`).emit('player_left', socket.id);
    socket.leave(`room-${oldRoom}`);
    const {x,y} = spawnPos(toRoom);
    p.room=toRoom; p.x=x; p.y=y; p.dir='down';
    socket.join(`room-${toRoom}`);
    const roommates = Object.values(players).filter(q=>q.id!==socket.id&&q.room===toRoom);
    socket.emit('room_changed', { room:toRoom, x:p.x, y:p.y, players:roommates });
    socket.to(`room-${toRoom}`).emit('player_joined', p);
  });

  socket.on('mission_done', ({missionId}) => {
    const p = players[socket.id]; if(!p) return;
    const mid = safe(missionId,25);
    if(!p.missions.includes(mid)){
      p.missions.push(mid);
      io.emit('mission_update', {id:socket.id, missions:p.missions});
      console.log(`[미션] ${p.name} ✅ ${mid}`);
    }
  });

  socket.on('chat', ({msg}) => {
    const p = players[socket.id]; if(!p) return;
    const text = safe(msg,40); if(!text) return;
    const entry = {id:socket.id, name:p.name, avatar:p.avatar, msg:text, ts:Date.now()};
    chatLog.push(entry); if(chatLog.length>50) chatLog.shift();
    io.to(`room-${p.room}`).emit('chat_msg', entry);
  });

  socket.on('emote', ({emote}) => {
    const p = players[socket.id]; if(!p) return;
    const OK=['👍','❤️','😊','🎉','🤔','😮','👋','⭐'];
    io.to(`room-${p.room}`).emit('emote_msg', {id:socket.id, emote:OK.includes(emote)?emote:'👋'});
  });

  socket.on('disconnect', () => {
    const p = players[socket.id];
    if(p){ console.log(`[퇴장] ${p.name}`); delete players[socket.id]; io.emit('player_left',socket.id); io.emit('room_count',Object.keys(players).length); }
  });
});

app.get('/api/status', (_,res) => res.json({players:Object.keys(players).length,maxPlayers:MAX,list:Object.values(players).map(p=>({name:p.name,room:p.room,missions:p.missions.length}))}));

function startServer(port){
  server.listen(port,()=>{
    console.log('\n====================================');
    console.log('  🎮 인터넷 안전 탈출 작전 멀티플레이');
    console.log('====================================');
    console.log(`  주소: http://localhost:${port}`);
    console.log(`  최대: ${MAX}명 / 3개 방`);
    console.log('====================================\n');
  }).on('error',err=>{ if(err.code==='EADDRINUSE'){console.log(`포트 ${port} 사용 중 → ${port+1} 시도`);startServer(port+1);}else{console.error(err);process.exit(1);} });
}
startServer(parseInt(process.env.PORT)||3000);
