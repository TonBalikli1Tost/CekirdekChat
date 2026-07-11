const WebSocket = require('ws');

function delay(ms){return new Promise(r=>setTimeout(r,ms));}

async function run(){
  const url = process.env.SIGNAL_URL || 'ws://localhost:9003';
  const a = new WebSocket(url);
  const b = new WebSocket(url);

  a.on('open', ()=>{ console.log('A open'); a.send(JSON.stringify({type:'join', room:'testroom'})); });
  b.on('open', ()=>{ console.log('B open'); b.send(JSON.stringify({type:'join', room:'testroom'})); });

  a.on('message', (m)=>{ console.log('A recv', m.toString()); });
  b.on('message', (m)=>{ console.log('B recv', m.toString()); });

  await delay(2000);
  console.log('Sending signal from A to room (broadcast)');
  a.send(JSON.stringify({type:'signal', payload:{sdp:'fake-offer'}}));

  await delay(2000);
  console.log('Done test');
  process.exit(0);
}

run();
