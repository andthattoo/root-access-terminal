import {TerminalGame,contracts} from './game.js?v=2';
const game=new TerminalGame();
const elements=new Map();
const $=id=>{if(!elements.has(id))elements.set(id,document.getElementById(id));return elements.get(id);};
const money=n=>'$'+Math.round(n).toLocaleString('en-US');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const heldKeys=new Set();
let pointerHeld=false,holding=false,repeatStart=0,repeatTimer=0,lastPulse=-Infinity,lastInput=-Infinity,audio;
let displayedJob=-1,logKey='',nodeViews=[],jobViews=[],lastFrame=performance.now();
let displayCash=0,cashFrom=0,cashTo=0,cashAt=0;

function tone(hz,duration=.035,gain=.017,delay=0){
  if(!audio)return;
  const start=audio.currentTime+delay,osc=audio.createOscillator(),amp=audio.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(hz,start);amp.gain.setValueAtTime(0,start);
  amp.gain.linearRampToValueAtTime(gain,start+.004);amp.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(amp);amp.connect(audio.destination);osc.start(start);osc.stop(start+duration+.01);
  osc.onended=()=>{osc.disconnect();amp.disconnect();};
}
function enableAudio(){try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function setupJobs(){
  const fragment=document.createDocumentFragment();
  jobViews=contracts.map((job,index)=>{
    const button=element('button','job');button.type='button';
    button.setAttribute('aria-label','Select job: '+job.target);
    const top=element('span','job-top'),number=element('span','',String(index+1).padStart(2,'0')),price=element('span','job-price',money(job.reward));
    top.append(number,price);
    const title=element('span','job-title',job.short),bottom=element('span','job-bottom');
    const count=element('span','',job.nodes.length+' TARGETS'),state=element('span','','READY');
    bottom.append(count,state);
    const meter=element('span','job-meter'),fill=element('i');meter.append(fill);
    button.append(top,title,bottom,meter);
    button.addEventListener('click',()=>{
      releaseAll();enableAudio();game.select(job.id);displayedJob=-1;logKey='';
      feed('Connected to '+job.host+'. Unfinished work is kept.');render();$('hack').focus({preventScroll:true});
    });
    fragment.append(button);return {button,state,fill};
  });
  $('jobs').replaceChildren(fragment);
}
function buildNodes(){
  const fragment=document.createDocumentFragment();
  nodeViews=game.contract.nodes.map((node,index)=>{
    const li=element('li','node'),art=element('pre');art.setAttribute('aria-hidden','true');
    li.append(art);
    if(index<game.contract.nodes.length-1)li.append(element('div','node-wire','│'));
    fragment.append(li);return {li,art};
  });
  $('nodes').replaceChildren(fragment);
}
function frame(lines){return '┌'+'─'.repeat(24)+'┐\n'+lines.map(line=>'│ '+line.padEnd(22,' ').slice(0,22)+' │').join('\n')+'\n└'+'─'.repeat(24)+'┘';}
function renderLog(force=false){
  const key=game.index+':'+game.runs[game.index]+':'+game.state.log.length;
  if(!force&&logKey===key)return;
  logKey=key;
  const fragment=document.createDocumentFragment();
  // Keep the newest outputs that fit, including wrapped lines on narrow screens.
  for(const line of game.state.log.slice(-12))fragment.append(element('div','log-line '+line.kind,line.text));
  const code=$('code'),window=$('code-window');
  code.replaceChildren(fragment);
  const style=getComputedStyle(window);
  const height=window.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
  while(code.children.length>1&&code.scrollHeight>height)code.firstElementChild.remove();
}
function render(){
  const s=game.state,c=game.contract,paid=game.paid,milestone=s.phase==='milestone';
  if(displayedJob!==game.index){displayedJob=game.index;buildNodes();}
  $('session-path').textContent='ra://'+c.host;
  $('job-id').textContent='CONTRACT '+String(game.index+1).padStart(3,'0')+' / RUN '+(game.runs[game.index]+(paid?0:1));
  $('target').textContent=c.target;$('brief').textContent=c.brief;$('difficulty').textContent=c.difficulty;
  $('target-count').textContent=c.nodes.length+' TARGETS';$('file').textContent='root@'+c.host+':~';
  $('completed').textContent=game.completed+' JOB'+(game.completed===1?'':'S')+' COMPLETE';
  $('reward').textContent='+'+money(game.reward);
  const percent=Math.floor(game.progress*100);
  $('percent').textContent=percent+'% COMPLETE';$('progress').setAttribute('aria-valuenow',String(percent));
  $('progress-fill').style.transform='scaleX('+game.progress+')';
  const filled=Math.round(game.progress*32);$('ascii-bar').textContent='['+'█'.repeat(filled)+'·'.repeat(32-filled)+']';
  $('operation').textContent=paid?'ALL TARGETS BREACHED':game.node.name+' / COMMAND '+(s.commandIndex+1)+' OF '+game.node.commands.length;
  $('route-status').textContent=(paid?c.nodes.length:s.nodeIndex+(milestone?1:0))+' / '+c.nodes.length;
  nodeViews.forEach(({li,art},index)=>{
    const done=paid||index<s.nodeIndex||(index===s.nodeIndex&&milestone),active=!done&&index===s.nodeIndex;
    li.className='node'+(done?' done':'')+(active?' active':'')+(index===s.nodeIndex&&milestone?' breached':'');
    if(active)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
    const progress=active?game.nodeProgress:done?1:0,blocks=Math.floor(progress*6);
    const status=done?'BREACHED / ACCESS OK':active?'['+'█'.repeat(blocks)+'·'.repeat(6-blocks)+'] '+Math.floor(progress*100)+'%':'LOCKED / IN SEQUENCE';
    art.textContent=frame([String(index+1).padStart(2,'0')+' '+c.nodes[index].name,status]);
    li.setAttribute('aria-label',c.nodes[index].name+': '+(done?'breached':active?'active, '+Math.floor(progress*100)+' percent':'locked'));
  });
  $('node-hint').textContent=paid?'Chain complete. Payment received.':milestone?'Access granted. Opening next target.':'Breach each target in order.';
  const executing=s.phase==='executing';
  $('command-text').textContent=paid?'All targets secured. Payment received.':milestone?'Access granted. Routing to next target...':executing?'Executing '+game.command.text:game.visibleCommand;
  $('cursor').hidden=s.phase!=='typing';$('execution').hidden=!executing;
  $('command-count').textContent=paid?'COMPLETE':'CMD '+(s.commandIndex+1)+' / '+game.node.commands.length;
  $('command-hint').textContent=executing?'Running command. Input resumes when it finishes.':paid?'Next contract opens automatically.':milestone?'Target secured. Next node unlocking.':'Type any key. Hold to keep writing.';
  $('status').textContent=paid?'PAYMENT RECEIVED':milestone?'ACCESS GRANTED':executing?'EXECUTING':performance.now()-lastInput<350?'COMPOSING':'AWAITING INPUT';
  $('hack').classList.toggle('busy',s.phase!=='typing');
  $('hack-label').textContent=paid?'PAID':milestone?'BREACHED':executing?'EXECUTING':'HACK';
  $('hack').setAttribute('aria-busy',String(executing));
  $('payout').classList.toggle('show',paid);$('milestone').classList.toggle('show',milestone);
  $('payout-amount').textContent='+'+money(game.reward);$('milestone-name').textContent=game.node.name;
  document.querySelector('.terminal').classList.toggle('paid',paid);
  jobViews.forEach(({button,state,fill},index)=>{
    const p=game.progressFor(index),session=game.sessions[index],selected=index===game.index;
    button.setAttribute('aria-pressed',String(selected));fill.style.transform='scaleX('+p+')';
    state.textContent=session.phase==='paid'?'REPLAY':p>0?(selected?'ACTIVE ':'PAUSED ')+Math.floor(p*100)+'%':game.runs[index]?'RUN '+(game.runs[index]+1):contracts[index].difficulty;
  });
  renderLog();
}
function feed(text){$('feed').textContent='❯ '+text;}
function handle(event){
  if(!event)return;
  if(event.type==='paid'){
    cashFrom=displayCash;cashTo=game.cash;cashAt=performance.now();
    $('cash-float').textContent=reduced?'':'+'+money(event.amount);
    $('cash-float').style.animation='none';void $('cash-float').offsetWidth;$('cash-float').style.animation='cashup .8s ease-out forwards';
    feed('All targets breached. '+money(event.amount)+' received. Next contract incoming.');
    $('announcer').textContent=game.contract.target+' complete. Earned '+money(event.amount)+'.';
    tone(523,.13,.025);tone(659,.16,.025,.09);tone(784,.25,.024,.18);
  }else if(event.type==='milestone'){
    feed(event.name+' breached. Establishing the next link.');
    $('announcer').textContent=event.name+' breached.';tone(440,.1,.018);tone(660,.15,.02,.08);
  }else if(event.type==='next'){
    displayedJob=-1;logKey='';feed('Next contract loaded. Keep typing, or choose a job.');
  }else if(event.type==='node'){
    feed('Now targeting '+game.node.name+'. Compose the next command.');
    if($('nodes').scrollWidth>$('nodes').clientWidth){
      const current=nodeViews[game.state.nodeIndex].li;
      $('nodes').scrollTo({left:current.offsetLeft-$('nodes').offsetLeft-10,behavior:reduced?'instant':'smooth'});
    }
  }else if(event.type==='command')feed('Command finished. Next operation ready.');
  render();
}
function write(){
  const now=performance.now();if(now-lastPulse<50||game.state.phase!=='typing')return;
  lastPulse=now;lastInput=now;
  const event=game.pulse();$('hack').classList.add('pressed');
  tone(190+Math.random()*100,.027,.012);
  if(event.type==='execute')feed('Executing against '+game.node.name+'...');
  render();
}
function stop(){holding=false;clearTimeout(repeatStart);clearInterval(repeatTimer);$('hack').classList.remove('pressed');}
function start(){if(holding)return;holding=true;enableAudio();write();repeatStart=setTimeout(()=>{repeatTimer=setInterval(write,125);},250);}
function releaseAll(){heldKeys.clear();pointerHeld=false;stop();}
function releasePointer(){pointerHeld=false;if(!heldKeys.size)stop();}
function isHackKey(event){
  if(event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return false;
  // Enter/Space should activate focused job buttons normally.
  if(event.target.closest?.('button')&&event.target.closest('button')!==$('hack')&&(event.key==='Enter'||event.key===' '))return false;
  return event.key.length===1||['Enter','Backspace','Delete','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key);
}
window.addEventListener('keydown',event=>{
  if(!isHackKey(event))return;event.preventDefault();if(event.repeat)return;
  heldKeys.add(event.code||event.key);if(holding)write();else start();
});
window.addEventListener('keyup',event=>{heldKeys.delete(event.code||event.key);if(!heldKeys.size&&!pointerHeld)stop();});
$('hack').addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();$('hack').setPointerCapture(event.pointerId);pointerHeld=true;start();});
$('hack').addEventListener('pointerup',releasePointer);$('hack').addEventListener('pointercancel',releasePointer);$('hack').addEventListener('lostpointercapture',releasePointer);
$('hack').addEventListener('click',event=>{if(event.detail===0){enableAudio();write();}});
window.addEventListener('blur',releaseAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();lastFrame=performance.now();});
function tick(now){
  const elapsed=Math.min(100,Math.max(0,now-lastFrame));lastFrame=now;
  if(!document.hidden)handle(game.advance(elapsed));
  if(game.state.phase==='executing')$('execution-fill').style.width=(100*(1-game.state.remaining/game.command.duration))+'%';
  if(displayCash!==cashTo){
    const t=Math.min(1,(now-cashAt)/620);displayCash=t===1?cashTo:cashFrom+(cashTo-cashFrom)*(1-Math.pow(1-t,3));$('cash').textContent=money(displayCash);
  }
  if(game.state.phase==='typing'&&now-lastInput>350)$('status').textContent='AWAITING INPUT';
  if(!holding&&now-lastInput>90)$('hack').classList.remove('pressed');
  requestAnimationFrame(tick);
}
setupJobs();render();
new ResizeObserver(()=>renderLog(true)).observe($('code-window'));
requestAnimationFrame(tick);
