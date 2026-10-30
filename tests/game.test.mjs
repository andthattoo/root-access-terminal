import test from 'node:test';
import assert from 'node:assert/strict';
import {TerminalGame,contracts} from '../game.js';

const effort=c=>c.nodes.flatMap(n=>n.commands).reduce((sum,cmd)=>sum+cmd.effort,0);
function finish(g){
  const events=[];
  for(let i=0;!g.paid&&i<1000;i++)events.push(g.pulse());
  assert.equal(g.paid,true);
  return events;
}

test('final keystroke executes immediately and the next input writes the next command',()=>{
  const g=new TerminalGame(),first=g.command;
  for(let i=0;i<first.effort-1;i++)assert.equal(g.pulse().type,'typing');
  assert.equal(g.state.commandIndex,0);
  assert.equal(g.pulse().type,'command');
  assert.equal(g.state.phase,'typing');
  assert.equal(g.state.commandIndex,1);
  assert.ok(g.state.log.some(l=>l.text===first.output[0]));
  assert.equal(g.cash,0);
  g.pulse();assert.equal(g.state.typed,1);
});

test('every node advances in order with no consumed wait inputs or duplicate payout',()=>{
  const g=new TerminalGame();let total=0;
  for(const c of contracts){
    g.select(c.id);const events=finish(g);
    assert.equal(events.length,effort(c));
    assert.deepEqual(events.filter(e=>e.type==='node').map(e=>e.name),c.nodes.slice(0,-1).map(n=>n.name));
    assert.equal(events.filter(e=>e.type==='paid').length,1);
    total+=c.reward;assert.equal(g.cash,total);assert.equal(g.progress,1);
    assert.ok(events.every(e=>['typing','command','node','paid'].includes(e.type)));
  }
  assert.equal(g.completed,contracts.length);
  assert.equal(g.cash,1650);
});

test('input after payout starts the next contract on that same input',()=>{
  const g=new TerminalGame();finish(g);assert.equal(g.cash,75);
  assert.equal(g.pulse().type,'typing');
  assert.equal(g.contract.id,'mail');assert.equal(g.state.typed,1);
  assert.equal(g.cash,75);assert.equal(g.completed,1);
});

test('switching jobs retains partial code patches and next job resumes its progress',()=>{
  const g=new TerminalGame();g.select('mail');
  while(g.command.kind!=='injection')g.pulse();
  for(let i=0;i<5;i++)g.pulse();
  const code=g.visibleCommand,progress=g.progress,typed=g.state.typed;
  g.select('wifi');g.pulse();g.select('mail');
  assert.equal(g.visibleCommand,code);assert.equal(g.progress,progress);
  g.select('wifi');finish(g);g.pulse();
  assert.equal(g.contract.id,'mail');assert.equal(g.state.typed,typed+1);
});

test('replaying a completed job requires the whole chain before paying again',()=>{
  const g=new TerminalGame();finish(g);g.select('wifi');
  assert.equal(g.progress,0);assert.equal(g.runs[0],1);
  for(let i=0;i<effort(g.contract)-1;i++)g.pulse();
  assert.equal(g.cash,75);assert.equal(g.completed,1);
  g.pulse();assert.equal(g.cash,150);assert.equal(g.runs[0],2);
});

test('each target has four operations and an inert multiline code injection',()=>{
  const g=new TerminalGame();
  assert.equal(new Set(contracts.map(c=>c.nodes.map(n=>n.name).join('/'))).size,6);
  for(const c of contracts){
    for(const n of c.nodes){
      assert.equal(n.commands.length,4);
      assert.ok(n.commands.every(cmd=>Number.isInteger(cmd.effort)&&cmd.effort>0&&!('duration' in cmd)));
      assert.ok(n.commands.every(cmd=>['command','injection'].includes(cmd.kind)));
      const patch=n.commands.find(cmd=>cmd.kind==='injection');
      assert.ok(patch.text.includes('sim.node('));assert.ok(patch.text.includes('\n'));
    }
    g.select(c.id);finish(g);
    assert.ok(g.state.log.some(l=>l.kind==='injection'&&l.text.startsWith('const link')));
    assert.ok(g.state.log.every(l=>!l.text.includes('\n')));
  }
});

test('invalid job selection cannot erase progress',()=>{
  const g=new TerminalGame();g.pulse();const progress=g.progress;
  assert.equal(g.select('missing'),false);assert.equal(g.next(),false);
  assert.equal(g.progress,progress);
});
