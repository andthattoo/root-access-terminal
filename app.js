import {TerminalGame} from './game.js';
const game=new TerminalGame();
const $=id=>document.getElementById(id);
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let holding=false,repeatStart=0,repeatTimer=0,nextTimer=0,lastPulse=0,lastInput=0,displayCash=0,audio;
let cashFrom=0,cashTo=0,cashAt=0,idle=true;
const heldKeys=new Set();
let pointerHeld=false;
const stages=['ESTABLISH UPLINK','READ MEMORY','EXTRACT PAYLOAD','VERIFY TRANSFER'];

function tone(hz,duration=.035,gain=.017,delay=0){
  if(!audio)return;
  const start=audio.currentTime+delay,osc=audio.createOscillator(),amp=audio.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(hz,start);amp.gain.setValueAtTime(0,start);
  amp.gain.linearRampToValueAtTime(gain,start+.004);amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(amp);amp.connect(audio.destination);osc.start(start);osc.stop(start+duration+.01);
  osc.onended=()=>{osc.disconnect();amp.disconnect();};
}
function enableAudio(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function renderCode(){
  const text=game.visibleCode||'// waiting for operator input...';
  const lines=text.split('\n');
  const available=Math.max(1,Math.floor(($('code-window').clientHeight-34)/21));
  const first=Math.max(0,lines.length-available);const fragment=document.createDocumentFragment();
  for(let i=first;i<lines.length;i++){
    const line=document.createElement('div');line.className='code-line';
    const address=document.createElement('span');address.className='address';address.textContent=(0xA00+i*16).toString(16).toUpperCase();
    const source=document.createElement('span');source.className='source'+(lines[i].startsWith('//')?' comment':lines[i].startsWith('>')?' success':'')+(lines[i].includes('CONTRACT COMPLETE')?' final':'');source.textContent=lines[i];
    if(i===lines.length-1&&!game.paid){const cursor=document.createElement('span');cursor.className='typing-cursor';source.append(cursor);}
    line.append(address,source);fragment.append(line);
  }
  $('code').replaceChildren(fragment);
}
function render(){
  const p=game.progress,percent=Math.round(p*100),stage=Math.min(3,Math.floor(p*4));
  $('job-id').textContent='CONTRACT '+String(game.index+1).padStart(3,'0');
  $('target').textContent=game.contract.target;$('brief').textContent=game.contract.brief;
  $('file').textContent=game.contract.file;$('reward').textContent='+'+money(game.reward);
  $('completed').textContent=game.completed+' JOB'+(game.completed===1?'':'S')+' COMPLETE';
  $('percent').textContent=percent+'%';$('progress').setAttribute('aria-valuenow',String(percent));
  $('progress-fill').style.transform=`scaleX(${p})`;
  const filled=Math.round(p*32);$('ascii-bar').textContent='['+'█'.repeat(filled)+'·'.repeat(32-filled)+']';
  $('operation').textContent=game.paid?'CONTRACT COMPLETE':stages[stage];
  $('offset').textContent='OFFSET 0x'+game.written.toString(16).toUpperCase().padStart(4,'0');
  $('bytes').textContent=game.written.toLocaleString()+' BYTES WRITTEN';
  $('idle-prompt').hidden=game.steps>0;
  document.querySelectorAll('[data-node]').forEach((node,i)=>{node.classList.toggle('active',i<=stage);node.classList.toggle('done',game.paid);});
  document.querySelectorAll('[data-wire]').forEach((wire,i)=>wire.classList.toggle('lit',!idle&&i<stage));
  renderCode();
}
function feed(text){$('feed').textContent='> '+text;}
function write(){
  const now=performance.now();if(now-lastPulse<45||game.paid)return;lastPulse=now;lastInput=now;idle=false;
  const event=game.pulse();$('hack').classList.add('pressed');
  $('status').textContent='WRITING';$('route-status').textContent='LIVE';
  render();
  const hex=Array.from({length:18},()=>Math.floor(Math.random()*256).toString(16).toUpperCase().padStart(2,'0'));
  $('stream').textContent=[hex.slice(0,6),hex.slice(6,12),hex.slice(12,18)].map(row=>row.join(' ')).join('\n');
  if(event.type==='paid'){
    document.querySelector('.terminal').classList.add('paid');$('payout-amount').textContent='+'+money(event.amount);
    $('payout').classList.remove('show');void $('payout').offsetWidth;$('payout').classList.add('show');
    $('cash-float').textContent='+'+money(event.amount);$('cash-float').style.animation='none';void $('cash-float').offsetWidth;
    $('cash-float').style.animation=reduced?'none':'cashup .8s ease-out forwards';
    if(reduced)$('cash-float').textContent='';
    cashFrom=displayCash;cashTo=game.cash;cashAt=now;
    $('status').textContent='ACCESS GRANTED';$('route-status').textContent='PAID';
    feed(money(event.amount)+' received. Connecting to the next target...');
    $('announcer').textContent=game.contract.target+' complete. Earned '+money(event.amount)+'. Total '+money(game.cash)+'.';
    tone(523,.13,.025);tone(659,.16,.025,.09);tone(784,.25,.024,.18);
    nextTimer=setTimeout(()=>{
      if(!game.next())return;
      document.querySelector('.terminal').classList.remove('paid');$('payout').classList.remove('show');
      $('status').textContent='READY';$('route-status').textContent='LINKED';idle=true;
      feed('New target acquired. Keep writing.');render();
    },940);
  }else{
    tone(190+Math.random()*100,.027,.012);
    const messages=['Uplink connected. Keep writing.','Memory fragments found. Reading blocks...','Payload acquired. Routing through relay...','Transfer checksums verified. Almost there.'];
    feed(messages[Math.min(3,Math.floor(game.progress*4))]);
  }
}
function stop(){holding=false;clearTimeout(repeatStart);clearInterval(repeatTimer);$('hack').classList.remove('pressed');}
function start(){if(holding)return;holding=true;enableAudio();write();repeatStart=setTimeout(()=>{repeatTimer=setInterval(write,85);},230);}
function isHackKey(event){
  // Keep browser shortcuts, focus navigation and IME composition available.
  return !event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.isComposing&&
    (event.key.length===1||['Enter','Backspace','Delete','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key));
}
window.addEventListener('keydown',event=>{
  if(!isHackKey(event))return;
  event.preventDefault();
  if(event.repeat)return;
  heldKeys.add(event.code||event.key);
  // A new key still writes immediately when another key is held.
  if(holding)write();else start();
});
window.addEventListener('keyup',event=>{
  heldKeys.delete(event.code||event.key);
  if(!heldKeys.size&&!pointerHeld)stop();
});
function releasePointer(){pointerHeld=false;if(!heldKeys.size)stop();}
function releaseAll(){heldKeys.clear();pointerHeld=false;stop();}
$('hack').addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();$('hack').setPointerCapture(event.pointerId);pointerHeld=true;start();});
$('hack').addEventListener('pointerup',releasePointer);$('hack').addEventListener('pointercancel',releasePointer);$('hack').addEventListener('lostpointercapture',releasePointer);
// Assistive-technology clicks also perform the same single action; pointer clicks already fired above.
$('hack').addEventListener('click',event=>{if(event.detail===0){enableAudio();write();}});
window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});
new ResizeObserver(renderCode).observe($('code-window'));
function tick(now){
  if(displayCash!==cashTo){const t=Math.min(1,(now-cashAt)/620);displayCash=t===1?cashTo:cashFrom+(cashTo-cashFrom)*(1-Math.pow(1-t,3));$('cash').textContent=money(displayCash);}
  if(!game.paid&&!idle&&now-lastInput>350){idle=true;$('status').textContent='AWAITING INPUT';$('route-status').textContent='LINKED';document.querySelectorAll('.wire').forEach(w=>w.classList.remove('lit'));}
  if(!holding&&now-lastInput>90)$('hack').classList.remove('pressed');
  requestAnimationFrame(tick);
}
render();requestAnimationFrame(tick);
