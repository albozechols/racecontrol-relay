'use strict';
// RaceControl HTTP polling relay. Independent of the GTA server; no /pm messages.
// Node.js 20+. Set RC_RELAY_KEY to a long random secret.
const http = require('node:http');
const crypto = require('node:crypto');
const { URL } = require('node:url');
const PORT = Number(process.env.PORT || 8080);
const RELAY_KEY = process.env.RC_RELAY_KEY || '';
const MAX_EVENTS = 12000;
const rooms = new Map();
let seq = 0;
function safeEq(a,b) { const x=Buffer.from(String(a)), y=Buffer.from(String(b)); return x.length===y.length && crypto.timingSafeEqual(x,y); }
function roomEvents(room) { if (!rooms.has(room)) rooms.set(room, []); return rooms.get(room); }
function auth(q) { return !RELAY_KEY || safeEq(q.get('key') || '', RELAY_KEY); }
function validRoom(s) { return /^[a-zA-Z0-9_-]{3,48}$/.test(s || ''); }
function validId(s) { return /^[a-zA-Z0-9_.:-]{1,64}$/.test(s || ''); }
function reply(res, code, body, type='text/plain; charset=utf-8') { res.writeHead(code, {'content-type':type,'cache-control':'no-store','access-control-allow-origin':'*'}); res.end(body); }
const server = http.createServer((req,res)=>{
  const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'OPTIONS') { res.writeHead(204, {'access-control-allow-origin':'*','access-control-allow-methods':'GET,OPTIONS','access-control-allow-headers':'content-type'}); return res.end(); }
  if (u.pathname === '/health') return reply(res,200,JSON.stringify({ok:true,service:'RaceControl HTTP Relay',rooms:rooms.size,events:seq}),'application/json');
  if (u.pathname === '/') return reply(res,200,'RaceControl HTTP Relay is running.\n');
  if (!['/publish','/poll'].includes(u.pathname)) return reply(res,404,'not_found');
  const q=u.searchParams, room=q.get('room')||'', role=q.get('role')||'', clientId=q.get('clientId')||'';
  if (!auth(q)) return reply(res,403,'unauthorized');
  if (!validRoom(room) || !validId(clientId) || !['master','client'].includes(role)) return reply(res,400,'invalid_client');
  if (u.pathname === '/publish') {
    const data=q.get('data')||'', to=q.get('to')||'*';
    if (!/^(?:[0-9a-fA-F]{2}){1,1200}$/.test(data)) return reply(res,400,'invalid_data');
    if (role==='client' && to!=='*' && to!=='master') return reply(res,403,'client_target_forbidden');
    const ev={seq:++seq,room,from:clientId,role,to,data:data.toUpperCase(),at:Date.now()};
    const list=roomEvents(room); list.push(ev); if(list.length>MAX_EVENTS) list.splice(0,list.length-MAX_EVENTS);
    return reply(res,200,'OK|'+ev.seq+'\n');
  }
  const since=Math.max(0,Number(q.get('since')||0)||0), list=roomEvents(room), lines=['NEXT|'+seq];
  for(const ev of list) {
    if(ev.seq<=since) continue;
    if(role==='master') { if(ev.role!=='client') continue; }
    else { if(ev.role!=='master' || (ev.to!=='*' && ev.to!==clientId)) continue; }
    lines.push('EVENT|'+ev.seq+'|'+ev.data);
  }
  return reply(res,200,lines.join('\n')+'\n');
});
server.listen(PORT,'0.0.0.0',()=>console.log(`RaceControl HTTP Relay listening on ${PORT}`));
