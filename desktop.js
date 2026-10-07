if(window.__TAURI__){
  const {invoke}=window.__TAURI__.core,win=window.__TAURI__.window.getCurrentWindow();
  document.querySelector('.frame-label').textContent='Desktop';
  const buttons=document.querySelectorAll('.window-controls button');
  buttons.forEach((b,i)=>{b.disabled=false;b.title=['Minimize','Maximize / restore','Close'][i];b.setAttribute('aria-label',b.title);b.onclick=()=>[()=>win.minimize(),()=>win.toggleMaximize(),()=>win.close()][i]().catch(e=>toast(String(e)));});
  document.querySelector('.titlebar').addEventListener('mousedown',e=>{if(e.button===0&&!e.target.closest('button'))win.startDragging();});
  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    const action=b.dataset.projectAction;
    if(b.dataset.action!=='folder'&&!action)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(state.busy)return toast('Wait for the simulation to finish.');
    try{
      if(b.dataset.action==='folder'){const path=await invoke('pick_folder');if(path){state[b.dataset.target]=path;render();saveProject();toast('Folder selected');}}
      else if(action==='open'){const content=await invoke('open_project');if(content){restoreProject(JSON.parse(content));toast('Project opened');}}
      else if(action==='download'){if(await invoke('save_project',{content:JSON.stringify(snapshot(),null,2)})){saveProject();toast('Project file saved');}}
    }catch(err){toast('Desktop action failed: '+String(err));}
  },true);
}
