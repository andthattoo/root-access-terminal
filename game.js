// Fictional CLI operations. This simulation never connects to a target.
const command=(text,effort,output,duration=750)=>({text,effort,output,duration});
const node=(name,kind,commands)=>({name,kind,commands});
export const contracts=[
  {id:'wifi',short:'Wi-Fi',target:"Neighbor's Wi-Fi",brief:'Borrowing bandwidth for extremely important cat videos.',host:'neighbor.wifi',reward:75,difficulty:'LOW',nodes:[
    node('ROUTER','gateway',[
      command('ra discover neighbor.wifi',7,['1 gateway found · signal -42 dBm','route: apartment-2b / guest-lan']),
      command('ra link --route guest-lan',8,['session tunnel established','ROUTER // access granted'])
    ]),
    node('HANDSHAKE','cipher',[
      command('ra capture --sample handshake',9,['4 simulated fragments collected','signature: RA-256 / partial']),
      command('ra solve --fragments 4',10,['reconstructing signature ... matched','HANDSHAKE // verified'],950)
    ]),
    node('ADMIN CONSOLE','vault',[
      command('ra open --session reconstructed',9,['guest permissions elevated','admin console mounted']),
      command('ra claim --payload cat-videos',10,['bandwidth voucher extracted','checksum verified / contract delivered'],900)
    ])
  ]},
  {id:'mail',short:'Executive mail',target:'ButtCorp executive mail',brief:"Reading the CEO's emails for some extremely fishy details.",host:'buttcorp.mail',reward:150,difficulty:'MEDIUM',nodes:[
    node('VPN GATEWAY','gateway',[
      command('ra discover buttcorp.mail',9,['corporate gateway located','policy: employees and suspicious interns']),
      command('ra tunnel --alias unpaid-intern',10,['relay identity accepted','VPN GATEWAY // connected'])
    ]),
    node('MAIL FILTER','filter',[
      command('ra inspect --policy mail-filter',10,['3 policy layers found','exception: messages marked VERY URGENT']),
      command('ra unwrap --policy urgent',12,['policy challenge resolved','MAIL FILTER // cleared'],1000)
    ]),
    node('CEO INBOX','vault',[
      command('ra mount --mailbox executive',12,['mailbox mounted read-only','4,812 unread messages. relatable.']),
      command('ra index --tag fishy',12,['6 threads matched','CEO INBOX // indexed'],950)
    ]),
    node('EXPENSE ARCHIVE','archive',[
      command('ra extract --bundle yacht-receipts',13,['yacht-lunch.pdf ... acquired','totally-business-trip.pdf ... acquired']),
      command('ra deliver --verify receipts',14,['archive integrity verified','evidence delivered / contract complete'],1050)
    ])
  ]},
  {id:'stream',short:'Premium streaming',target:'Premium streaming',brief:'Liberating a premium account from another price increase.',host:'couchflix.stream',reward:225,difficulty:'MEDIUM',nodes:[
    node('CDN EDGE','gateway',[
      command('ra locate couchflix.stream',9,['nearest edge: sofa-west','latency: one bowl of popcorn']),
      command('ra link --edge sofa-west',10,['edge session negotiated','CDN EDGE // connected'])
    ]),
    node('SESSION GATE','filter',[
      command('ra inspect --token household',11,['household challenge detected','same sofa, different subscription']),
      command('ra rebuild --token household',12,['session fragments aligned','SESSION GATE // verified'],1000)
    ]),
    node('PREMIUM VAULT','vault',[
      command('ra mount --tier ultra-comfy',13,['premium catalog mounted','buffering excuse removed']),
      command('ra extract --pass weekend',14,['weekend access ticket ready','PREMIUM VAULT // opened'],1050)
    ]),
    node('PLAYBACK LICENSE','archive',[
      command('ra sign --license weekend',13,['license signature verified','ads successfully uninvited']),
      command('ra deliver --pass weekend',14,['playback ticket delivered','contract complete / enjoy the sofa'],950)
    ])
  ]},
  {id:'snack',short:'Snack machine',target:'Office snack machine',brief:'Negotiating with the machine that ate your last coin.',host:'snacks.local',reward:300,difficulty:'HIGH',nodes:[
    node('SERVICE PORT','gateway',[
      command('ra discover snacks.local',10,['service port behind sticker','sticker says DO NOT HACK']),
      command('ra connect --mode maintenance',11,['maintenance session ready','SERVICE PORT // connected'])
    ]),
    node('PAYMENT CHIP','cipher',[
      command('ra inspect --chip coin-ledger',13,['unreturned coin detected','balance: one personal grudge']),
      command('ra reconcile --lost-coin',14,['ledger challenge resolved','PAYMENT CHIP // reconciled'],1100)
    ]),
    node('PRICE TABLE','vault',[
      command('ra mount --table snack-prices',14,['price table loaded','cheese dust costs more than gold']),
      command('ra patch --voucher cheese-dust',15,['voucher staged in simulation','PRICE TABLE // updated'],1050)
    ]),
    node('DISPENSER','archive',[
      command('ra calibrate --spiral B04',15,['spiral controller aligned','bag position: no longer stuck']),
      command('ra release --voucher B04',16,['chips delivered to tray','contract complete / crunch acquired'],1150)
    ])
  ]},
  {id:'memes',short:'Meme vault',target:'Corporate meme vault',brief:"Extracting the memes HR really doesn't want you to see.",host:'hr.memevault',reward:400,difficulty:'HIGH',nodes:[
    node('HR PORTAL','gateway',[
      command('ra discover hr.memevault',11,['portal located','mandatory fun detected']),
      command('ra link --alias team-player',12,['onboarding session simulated','HR PORTAL // connected'])
    ]),
    node('APPROVAL QUEUE','filter',[
      command('ra inspect --queue permissions',13,['approval depth: 7 managers','everyone is on annual leave']),
      command('ra resolve --queue permissions',14,['policy signatures reconstructed','APPROVAL QUEUE // cleared'],1100)
    ]),
    node('MEME CIPHER','cipher',[
      command('ra sample --cipher corporate',14,['3 fragments recovered','key hint: synergy']),
      command('ra solve --cipher corporate',16,['buzzword lattice decoded','MEME CIPHER // solved'],1200)
    ]),
    node('FORBIDDEN FOLDER','vault',[
      command('ra mount --folder do-not-share',15,['vault mounted','the CEO is a reaction image.']),
      command('ra pack --collection all-hands',16,['48 forbidden memes packed','FORBIDDEN FOLDER // extracted'],1100)
    ]),
    node('DEAD DROP','archive',[
      command('ra checksum --bundle all-hands',15,['48/48 images verified','zero jokes approved by legal']),
      command('ra deliver --bundle all-hands',17,['dead drop confirmed','contract complete / morale restored'],1100)
    ])
  ]},
  {id:'sheet',short:'Secret spreadsheet',target:'The secret spreadsheet',brief:'Finding the final version of final_final_REAL_final.xlsx.',host:'finance.archive',reward:500,difficulty:'HARDENED',nodes:[
    node('FINANCE RELAY','gateway',[
      command('ra discover finance.archive',12,['relay found / department asleep','fiscal panic: normal']),
      command('ra tunnel --route quarterly',13,['quarterly tunnel established','FINANCE RELAY // connected'])
    ]),
    node('VERSION MAZE','filter',[
      command('ra inspect --versions final',14,['86 files named final','none are actually final']),
      command('ra resolve --latest actual-final',16,['version lineage reconstructed','VERSION MAZE // resolved'],1100)
    ]),
    node('FORMULA LOCK','cipher',[
      command('ra sample --lock circular-ref',16,['formula loop identified','cell B12 references itself emotionally']),
      command('ra solve --formula circular-ref',18,['dependency cycle repaired','FORMULA LOCK // released'],1300)
    ]),
    node('HIDDEN SHEET','vault',[
      command('ra reveal --sheet very-hidden',17,['hidden tab mounted','the numbers were made up all along']),
      command('ra extract --range secret-budget',18,['budget rows extracted','HIDDEN SHEET // acquired'],1200)
    ]),
    node('AUDIT PACKAGE','archive',[
      command('ra verify --workbook actual-final',18,['integrity check passed','one real final version found']),
      command('ra deliver --package audit',20,['audit package delivered','contract complete / spreadsheet defeated'],1300)
    ])
  ]}
];

function newSession(){return {nodeIndex:0,commandIndex:0,typed:0,phase:'typing',remaining:0,log:[]};}
export class TerminalGame{
  constructor(){this.cash=0;this.completed=0;this.index=0;this.sessions=contracts.map(newSession);this.runs=contracts.map(()=>0);this.beginLog();}
  get contract(){return contracts[this.index];}
  get state(){return this.sessions[this.index];}
  get node(){return this.contract.nodes[this.state.nodeIndex];}
  get command(){return this.node.commands[this.state.commandIndex];}
  get paid(){return this.state.phase==='paid';}
  get reward(){return this.contract.reward;}
  get nodeProgress(){return this.paid||this.state.phase==='milestone'?1:(this.state.commandIndex+this.state.typed/this.command.effort)/this.node.commands.length;}
  get progress(){return this.progressFor(this.index);}
  get visibleCommand(){return this.command.text.slice(0,Math.ceil(this.command.text.length*this.state.typed/this.command.effort));}
  progressFor(index){
    const s=this.sessions[index],nodes=contracts[index].nodes;
    if(s.phase==='paid')return 1;
    const done=nodes.slice(0,s.nodeIndex).reduce((n,nod)=>n+nod.commands.length,0);
    const current=s.phase==='milestone'?nodes[s.nodeIndex].commands.length:s.commandIndex+s.typed/nodes[s.nodeIndex].commands[s.commandIndex].effort;
    return (done+current)/nodes.reduce((n,nod)=>n+nod.commands.length,0);
  }
  log(text,kind='output'){this.state.log.push({text,kind});}
  beginLog(){if(this.state.log.length)return;this.log('ROOT ACCESS / local simulation','dim');this.log('Connecting to '+this.contract.host+' ...','dim');this.log(this.contract.nodes.length+' targets in chain. Start with '+this.node.name+'.','system');}
  select(id){
    const index=contracts.findIndex(c=>c.id===id);if(index<0)return false;
    this.index=index;
    if(this.paid)this.sessions[index]=newSession();
    this.beginLog();return true;
  }
  pulse(){
    const s=this.state;if(s.phase!=='typing')return {type:'waiting'};
    s.typed++;
    if(s.typed>=this.command.effort){s.typed=this.command.effort;s.phase='executing';s.remaining=this.command.duration;this.log('root@'+this.contract.host+':~$ '+this.command.text,'command');return {type:'execute'};}
    return {type:'typing'};
  }
  advance(ms){
    const s=this.state;if(!Number.isFinite(ms)||ms<0||s.phase==='typing')return null;
    s.remaining-=ms;if(s.remaining>0)return null;
    if(s.phase==='paid'){this.next();return {type:'next'};}
    if(s.phase==='milestone'){
      s.nodeIndex++;s.commandIndex=0;s.typed=0;s.phase='typing';
      this.log('NEXT TARGET // '+this.node.name,'system');return {type:'node'};
    }
    for(const line of this.command.output)this.log(line,'output');
    if(s.commandIndex<this.node.commands.length-1){s.commandIndex++;s.typed=0;s.phase='typing';return {type:'command'};}
    const name=this.node.name;this.log('[OK] '+name+' BREACHED','success');
    if(s.nodeIndex<this.contract.nodes.length-1){s.phase='milestone';s.remaining=700;return {type:'milestone',name};}
    s.phase='paid';s.remaining=1800;this.cash+=this.reward;this.completed++;this.runs[this.index]++;
    this.log('PAYMENT RECEIVED // +$'+this.reward,'reward');return {type:'paid',amount:this.reward};
  }
  next(){if(!this.paid)return false;return this.select(contracts[(this.index+1)%contracts.length].id);}
}
