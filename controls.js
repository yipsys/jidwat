// UI controls operate on the prototype's existing project state.
const games={sm64:{name:'Super Mario 64',forest:false,assets:{Scenes:['Castle Grounds','Bob-omb Battlefield','Whomp’s Fortress'],Models:['Mario','Goomba','Castle'],Textures:['Grass','Brick','Water'],Audio:['Castle theme','Level theme']}},oot:{name:'Ocarina of Time',forest:true,assets:{Scenes:['Kokiri Forest','Hyrule Field','Market'],Models:['Village house','Wooden bridge','Tree'],Textures:['Grass','Stone','Wood'],Audio:['Forest ambience','Village theme']}}};
Object.assign(state,{baseGame:'sm64',sourceGame:'oot',editing:null,undo:null,target:'PC (planned)'});
const originalRender=render;
render=function(){
  originalRender();
  document.querySelectorAll('aside nav [data-page]').forEach(b=>{if(b.dataset.page===state.page)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  document.getElementById('page-crumb').textContent=state.page==='workspace'?state.name+' / '+state.tab:({projects:'Projects',library:'Game library',build:state.name+' / Build & Test',settings:'Settings'}[state.page]);
  if(state.page==='projects'){
    main.querySelectorAll('.cards>div').forEach((col,i)=>{const role=i?'source':'base',game=games[state[role+'Game']];col.querySelector('.game-card').outerHTML=card(game.name,game.forest,i?'Source game':'Base game');const field=document.createElement('div');field.className='field game-select';field.innerHTML=`<label for="${role}-game">${i?'Source':'Base'} game</label><select id="${role}-game" data-game-role="${role}">${Object.entries(games).map(([id,g])=>`<option value="${id}" ${state[role+'Game']===id?'selected':''}>${g.name}</option>`).join('')}</select>`;col.prepend(field);col.querySelector(`label[for="${role}"]`).textContent=game.name+' decomp folder';});
    const name=main.querySelector('#name');name.parentElement.classList.add('project-name-field');name.maxLength=80;
  }
  if(state.page==='workspace'){
    const source=games[state.sourceGame],base=games[state.baseGame],assets=source.assets[state.tab];if(!assets.includes(state.asset))state.asset=assets[0];
    main.querySelector('.tree-title').textContent='▾ ▰ '+source.name;
    main.querySelectorAll('.tree-title')[1].textContent='▸ '+base.name;
    const tree=main.querySelector('.tree');tree.querySelectorAll('.asset').forEach(a=>a.remove());const anchor=tree.querySelectorAll('.tree-title')[1];assets.forEach(a=>{const b=document.createElement('button');b.className='asset'+(a===state.asset?' selected':'');b.dataset.asset=a;b.textContent='▧ '+a;tree.insertBefore(b,anchor);});
    main.querySelector('.viewport>svg').outerHTML=terrain(source.forest,true);main.querySelector('.view-caption').textContent=state.asset+' · Illustrative preview';
    main.querySelectorAll('tbody tr').forEach((row,i)=>{row.children[2].textContent=source.name;const edit=document.createElement('button');edit.className='secondary row-edit';edit.dataset.edit=i;edit.textContent='Edit';row.lastElementChild.prepend(edit);});
    if(state.editing!==null&&state.staged[state.editing]){const item=state.staged[state.editing];main.querySelector('#scale').value=item.scale;main.querySelector('#collision').value=item.collision;main.querySelector('#materials').value=item.materials;item.spawn.split(',').forEach((n,i)=>document.getElementById('spawn-'+['x','y','z'][i]).value=n.trim());main.querySelector('[data-action="add"]').textContent='Save changes';}
    const clear=main.querySelector('[data-action="clear"]');clear.disabled=!state.staged.length;
    if(state.undo){const undo=document.createElement('button');undo.className='secondary';undo.dataset.action='undo';undo.textContent='Undo removal';clear.before(undo);}
  }
  if(state.page==='workspace'||state.page==='build'){
    const title=main.querySelector('.heading');const edit=document.createElement('button');edit.className='secondary rename';edit.dataset.action='rename';edit.textContent='Rename project';title.append(edit);
  }
  if(state.page==='build'){
    main.querySelector('.project-summary small').textContent=games[state.baseGame].name+' ← '+games[state.sourceGame].name;
    main.querySelectorAll('.mini-game').forEach((el,i)=>{const game=games[state[i?'sourceGame':'baseGame']];el.querySelector('b').textContent=game.name;el.querySelector('.mini-art').innerHTML=terrain(game.forest);});
    main.querySelector('.preview-detail small').textContent='Source: '+games[state.sourceGame].name;
    main.querySelector('[data-action="build"]').disabled=state.busy||!state.staged.length;
  }
  if(state.page==='settings')main.querySelector('#target').value=state.target;
};
function stop(e){e.preventDefault();e.stopImmediatePropagation();}
function renameProject(){const dialog=document.createElement('dialog');dialog.className='rename-dialog';dialog.innerHTML=`<form><h2>Rename project</h2><label for="rename-input">Project name</label><input id="rename-input" maxlength="80" required value="${esc(state.name)}"><div class="dialog-actions"><button type="button" class="secondary">Cancel</button><button class="primary">Save name</button></div></form>`;document.body.append(dialog);dialog.querySelector('button[type="button"]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const value=dialog.querySelector('input').value.trim();if(!value){dialog.querySelector('input').setCustomValidity('Enter a project name.');dialog.querySelector('input').reportValidity();return;}state.name=value;dialog.close();render();toast('Project renamed');};dialog.querySelector('input').oninput=e=>e.target.setCustomValidity('');dialog.showModal();dialog.querySelector('input').select();}
document.addEventListener('change',e=>{if(e.target.dataset.gameRole){const role=e.target.dataset.gameRole,other=role==='base'?'source':'base';state[role+'Game']=e.target.value;if(state[other+'Game']===e.target.value)state[other+'Game']=e.target.value==='sm64'?'oot':'sm64';state.staged=[];state.editing=null;state.undo=null;state.built=false;state.asset=games[state.sourceGame].assets[state.tab][0];render();toast('Game pairing updated; staging cleared.');}if(e.target.id==='target')state.target=e.target.value;});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(state.busy&&b.dataset.action!=='clear-log'){stop(e);return toast('Wait for the simulation to finish.');}
  if(b.dataset.edit!==undefined){stop(e);state.editing=Number(b.dataset.edit);const item=state.staged[state.editing];state.tab=item.type;state.asset=item.name;render();return;}
  if(b.dataset.remove!==undefined){state.undo=structuredClone(state.staged);state.editing=null;}
  if(b.dataset.asset||b.dataset.tab)state.editing=null;
  switch(b.dataset.action){
    case 'rename':stop(e);renameProject();break;
    case 'undo':stop(e);state.staged=state.undo;state.undo=null;state.editing=null;state.built=false;render();toast('Staging restored');break;
    case 'clear':state.undo=structuredClone(state.staged);state.editing=null;break;
    case 'folder':{stop(e);const role=b.dataset.target;const input=document.createElement('input');input.type='file';input.webkitdirectory=true;input.multiple=true;input.hidden=true;document.body.append(input);input.onchange=()=>{const first=input.files[0];if(first){state[role]=first.webkitRelativePath.split('/')[0];render();toast('Folder selected. Browsers expose its name, not its full path.');}input.remove();};input.oncancel=()=>input.remove();input.click();break;}
    case 'create':if(!state.name.trim()){stop(e);main.querySelector('#name').focus();toast('Enter a project name.');}break;
    case 'add':{stop(e);const scale=Number(main.querySelector('#scale').value),coords=['x','y','z'].map(axis=>document.getElementById('spawn-'+axis).value);if(!Number.isFinite(scale)||scale<=0||coords.some(n=>n===''||!Number.isFinite(Number(n))))return toast('Enter a positive scale and valid spawn coordinates.');const item={name:state.asset,type:state.tab,scale,collision:main.querySelector('#collision').value,materials:main.querySelector('#materials').value,spawn:coords.join(', ')};if(state.editing!==null)state.staged[state.editing]=item;else if(state.staged.some(a=>a.name===item.name&&a.type===item.type))return toast('Already staged. Use Edit to change its settings.');else state.staged.push(item);state.editing=null;state.undo=null;state.built=false;render();toast('Staging updated');break;}
    case 'export':{stop(e);const blob=new Blob([JSON.stringify({prototype:true,project:state.name,baseGame:games[state.baseGame].name,sourceGame:games[state.sourceGame].name,basePath:state.base,sourcePath:state.source,target:state.target,items:state.staged},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='jidwat-plan.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Project plan exported');break;}
    case 'reset':state.editing=null;state.undo=null;state.baseGame='sm64';state.sourceGame='oot';break;
  }
},true);
render();
const search=document.getElementById('content-search'),results=document.getElementById('search-results');
search.addEventListener('input',()=>{const query=search.value.trim().toLowerCase();results.replaceChildren();results.hidden=!query;if(!query)return;const matches=Object.entries(games[state.sourceGame].assets).flatMap(([type,names])=>names.map(name=>({type,name}))).filter(a=>a.name.toLowerCase().includes(query));if(!matches.length){const empty=document.createElement('div');empty.className='search-empty';empty.textContent='No matching content';results.append(empty);}matches.forEach(item=>{const b=document.createElement('button');b.type='button';b.className='search-result';b.innerHTML=`<span>${esc(item.name)}</span><small>${item.type}</small>`;b.onclick=()=>{if(state.busy)return toast('Wait for the simulation to finish.');state.page='workspace';state.tab=item.type;state.asset=item.name;state.editing=null;search.value='';results.hidden=true;render();};results.append(b);});});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();}if(e.key==='Escape'){results.hidden=true;search.blur();}if(e.key==='ArrowDown'&&document.activeElement===search&&!results.hidden){e.preventDefault();results.querySelector('button')?.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.search-box'))results.hidden=true;});
const sidebarToggle=document.getElementById('sidebar-toggle');
sidebarToggle.addEventListener('click',()=>{const collapsed=document.body.classList.toggle('sidebar-collapsed');sidebarToggle.setAttribute('aria-expanded',String(!collapsed));sidebarToggle.setAttribute('aria-label',collapsed?'Expand sidebar':'Collapse sidebar');sidebarToggle.title=collapsed?'Expand sidebar':'Collapse sidebar';sidebarToggle.textContent=collapsed?'›':'‹';});


