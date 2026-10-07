const projectStorage='jidwat.projects.v1';
let projectId=crypto.randomUUID(),recentProjects=[],saveTimer;
function snapshot(){return {version:1,id:projectId,updatedAt:new Date().toISOString(),project:state.name,baseGame:state.baseGame,sourceGame:state.sourceGame,basePath:state.base,sourcePath:state.source,target:state.target,tab:state.tab,asset:state.asset,items:structuredClone(state.staged)};}
function validateProject(p){
  if(!p||p.version!==1||typeof p.project!=='string'||!p.project.trim()||p.project.length>80)throw Error('Invalid project name or unsupported project version.');
  if(!games[p.baseGame]||!games[p.sourceGame]||p.baseGame===p.sourceGame)throw Error('Choose two different supported games.');
  if(typeof p.basePath!=='string'||typeof p.sourcePath!=='string'||!Array.isArray(p.items)||p.items.length>1000)throw Error('Invalid project paths or staging list.');
  for(const item of p.items){if(!item||!games[p.sourceGame].assets[item.type]?.includes(item.name)||!Number.isFinite(item.scale)||item.scale<=0||!['Generate','Use source collision','None'].includes(item.collision)||!['Convert to base format','Keep references'].includes(item.materials)||typeof item.spawn!=='string'||item.spawn.split(',').length!==3||item.spawn.split(',').some(v=>!v.trim()||!Number.isFinite(Number(v))))throw Error('Invalid staged content or import settings.');}
  return p;
}
function saveProject(){try{const p=snapshot();recentProjects=recentProjects.filter(r=>r.id!==projectId);recentProjects.unshift(p);recentProjects=recentProjects.slice(0,12);localStorage.setItem(projectStorage,JSON.stringify({active:projectId,projects:recentProjects}));document.getElementById('save-state')?.replaceChildren(document.createTextNode('Saved locally'));}catch{document.getElementById('save-state')?.replaceChildren(document.createTextNode('Local save unavailable — download a project file'));}}
function restoreProject(p){validateProject(p);projectId=typeof p.id==='string'?p.id:crypto.randomUUID();Object.assign(state,{name:p.project,baseGame:p.baseGame,sourceGame:p.sourceGame,base:p.basePath,source:p.sourcePath,target:['PC (planned)','N64 (planned)'].includes(p.target)?p.target:'PC (planned)',tab:games[p.sourceGame].assets[p.tab]?p.tab:'Scenes',asset:p.asset,staged:structuredClone(p.items),editing:null,undo:null,built:false,busy:false,page:'workspace'});render();saveProject();}
try{const stored=JSON.parse(localStorage.getItem(projectStorage)||localStorage.getItem('game-mixer.projects.v1')||'null');if(stored&&Array.isArray(stored.projects)){recentProjects=stored.projects.filter(p=>{try{validateProject(p);return true;}catch{return false;}});const active=recentProjects.find(p=>p.id===stored.active);if(active)restoreProject(active);}}catch{}
const controlsRender=render;
render=function(){controlsRender();const actions=document.createElement('div');actions.className='project-file-actions';actions.innerHTML='<span id="save-state">Autosave enabled</span><button class="secondary" data-project-action="open">Open project</button><button class="secondary" data-project-action="download">Download project</button>';main.append(actions);
  if(state.page==='projects'&&recentProjects.length){const panel=document.createElement('section');panel.className='panel recent-projects';panel.innerHTML='<h2>Recent projects</h2>';recentProjects.forEach(p=>{const b=document.createElement('button');b.className='recent-project';b.innerHTML=`<span><b>${esc(p.project)}</b><small>${games[p.baseGame].name} ← ${games[p.sourceGame].name} · ${p.items.length} items</small></span><span class="muted">Open →</span>`;b.onclick=()=>restoreProject(p);panel.append(b);});main.append(panel);}
};
document.addEventListener('input',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(saveProject,400);});
document.addEventListener('change',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(saveProject,100);});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const action=b.dataset.projectAction;if(action){e.preventDefault();e.stopImmediatePropagation();if(state.busy)return toast('Wait for the simulation to finish.');if(action==='download'){saveProject();const url=URL.createObjectURL(new Blob([JSON.stringify(snapshot(),null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=state.name.replace(/[^a-z0-9 _-]/gi,'_')+'.jidwat.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}else{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const file=input.files[0];if(!file)return;if(file.size>2000000)return toast('Project file is too large.');try{restoreProject(JSON.parse(await file.text()));toast('Project opened');}catch(err){toast('Cannot open project: '+err.message);}};input.click();}return;}
  if(b.dataset.action==='create'){projectId=crypto.randomUUID();}
  clearTimeout(saveTimer);saveTimer=setTimeout(saveProject,100);
},true);
window.addEventListener('pagehide',saveProject);
render();



