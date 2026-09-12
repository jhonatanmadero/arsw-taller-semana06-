import {BoardApiClient} from './api/board-api-client.js';
import {createBoardState} from './state/board-state.js';
import {createBoardView} from './ui/board-view.js';

const state=createBoardState();
const view=createBoardView(document.querySelector('#boardCanvas'));
const $=id=>document.getElementById(id);
let connecting=false;

function refresh(message=''){
  const s=state.snapshot(); view.render(s); $('remoteStatus').textContent=s.remote.status; $('message').textContent=message || s.remote.error?.message || ''; $('retryBtn').hidden=!s.remote.lastAction || s.remote.status!=='error'; $('boardId').value=s.board.id??$('boardId').value; $('boardName').value=s.board.name;
}

async function remote(label,action){
  // TODO LAB-05: prevent incompatible actions while loading/saving and keep retry semantics explicit.
  state.setRemote('loading',action,null); refresh(`${label}...`);
  try{ const result=await action(); state.setRemote('success',null,null); refresh(`${label} OK`); return result; }
  catch(error){ state.setRemote('error',action,error); refresh(); throw error; }
}

view.on({
 select(id){ state.select(id); refresh(); },
 move(id,x,y){ state.select(id); state.moveSelected(x,y); refresh(); },
 connectTarget(id){ if(connecting){ state.completeConnect(id); connecting=false; refresh('Connector created locally. Save to persist.'); } }
});

$('newBoardBtn').onclick=async()=>{ const b=await remote('Creating',()=>BoardApiClient.create($('boardName').value.trim())); state.setBoard(b); refresh('Board created'); };
$('loadBtn').onclick=async()=>{ const id=$('boardId').value.trim(); const b=await remote('Loading',()=>BoardApiClient.load(id)); state.setBoard(b); refresh('Board loaded'); };
$('saveBtn').onclick=async()=>{ state.setName($('boardName').value.trim()); const b=await remote('Saving',()=>BoardApiClient.save(state.toPersistedBoard())); state.setBoard(b); refresh('Board saved'); };
$('retryBtn').onclick=async()=>{ const action=state.snapshot().remote.lastAction; if(action) await remote('Retrying',action); };
$('addRectBtn').onclick=()=>{state.addRectangle();refresh('Rectangle added locally');};
$('addTextBtn').onclick=()=>{state.addText();refresh('Text added locally');};
$('connectBtn').onclick=()=>{ state.beginConnect(); connecting=true; refresh('Select the target element'); };
$('deleteBtn').onclick=()=>{state.removeSelected();refresh('Element removed locally');};
refresh();
