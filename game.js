export const contracts = [
  {target:"Neighbor's Wi-Fi", brief:'Cracking a Wi-Fi password for extremely important cat videos.',file:'wifi_handshake.ra',host:'neighbor.wifi',reward:75,steps:16,payload:'cat_video_bandwidth'},
  {target:'ButtCorp executive mail',brief:"Reading the CEO's emails for some extremely fishy details.",file:'executive_mail.ra',host:'buttcorp.mail',reward:150,steps:22,payload:'suspicious_expense_reports'},
  {target:'Premium streaming',brief:"Borrowing a streaming account. The password was still password.",file:'stream_access.ra',host:'couchflix.stream',reward:225,steps:24,payload:'premium_couch_privileges'},
  {target:'Office snack machine',brief:'Rewriting the price of the last bag of chips.',file:'snack_protocol.ra',host:'snacks.local',reward:300,steps:26,payload:'unlimited_cheese_dust'},
  {target:'Corporate meme vault',brief:"Extracting the memes HR really doesn't want you to see.",file:'meme_archive.ra',host:'hr.memevault',reward:400,steps:28,payload:'forbidden_office_memes'},
  {target:'The secret spreadsheet',brief:'Decrypting a spreadsheet named final_final_REAL_final.xlsx.',file:'sheet_decrypt.ra',host:'finance.archive',reward:500,steps:30,payload:'the_actual_final_version'}
];

// A fictional, input-only loop: no network activity and no passive earnings.
export class TerminalGame {
  constructor(){this.cash=0;this.completed=0;this.index=0;this.prepare();}
  prepare(){
    this.contract=contracts[this.index%contracts.length];
    this.reward=this.contract.reward+Math.floor(this.index/contracts.length)*100;
    this.steps=0;this.paid=false;this.source=this.buildSource();
  }
  get progress(){return this.steps/this.contract.steps;}
  get written(){return Math.floor(this.source.length*this.progress);}
  get visibleCode(){return this.source.slice(0,this.written);}
  pulse(){
    if(this.paid)return {type:'waiting'};
    this.steps++;
    if(this.steps>=this.contract.steps){
      this.steps=this.contract.steps;this.paid=true;this.cash+=this.reward;this.completed++;
      return {type:'paid',amount:this.reward,cash:this.cash};
    }
    return {type:'writing',progress:this.progress};
  }
  next(){if(!this.paid)return false;this.index++;this.prepare();return true;}
  buildSource(){
    const c=this.contract;
    return [
      '// ROOT ACCESS / simulated terminal session',
      `const target = "${c.host}";`,
      'const session = new GhostLink({ silent: true });',
      '',
      'session.open(target);',
      '> uplink established ..................... OK',
      '> routing through local relay ........... OK',
      '',
      'const fragments = memory.scan(0x0A00, 0xFFFF);',
      'for (const block of fragments) {',
      '  packet.read(block.address);',
      '  buffer.push(block.decode("RA-256"));',
      '  relay.flush({ checksum: block.signature });',
      '}',
      '',
      '> assembling session signature .......... OK',
      `payload.select("${c.payload}");`,
      'stream.pipe(payload, session.channel);',
      'const receipt = transfer.verify();',
      '',
      'if (receipt.valid) {',
      '  session.access = "ROOT";',
      '  wallet.credit(contract.reward);',
      '  session.disconnect({ leaveTrace: false });',
      '}',
      '',
      '> ACCESS GRANTED',
      `> CONTRACT COMPLETE / +$${this.reward}`,
      '> connection closed. payment received.'
    ].join('\n');
  }
}
