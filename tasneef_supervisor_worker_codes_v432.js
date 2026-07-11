(function(){
  'use strict';
  const BUILD='V432 كود العامل في تحضير المشرف';
  const S=v=>String(v??'').trim();
  const norm=s=>S(s).toLowerCase().replace(/[إأآا]/g,'ا').replace(/[ىي]/g,'ي').replace(/ة/g,'ه').replace(/[\u064B-\u0652]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
  const esc=s=>S(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const codeOf=v=>{const m=S(v).match(/\bTS\s*-?\s*(\d+)\b/i); return m ? 'TS-'+String(Number(m[1])).padStart(2,'0') : '';};
  const cleanName=s=>S(s).replace(/\bTS\s*-?\s*\d+\b/ig,'').replace(/[-–—|:]+$/,'').trim();
  const client=()=>window.sb||window.supabaseClient||null;
  let byId=new Map(), byName=new Map(), byProjectName=new Map(), loaded=false, loading=false;
  function add(code,name,id,project){
    code=codeOf(code)||S(code); name=cleanName(name);
    if(!code) return;
    if(id!==undefined&&id!==null&&S(id)) byId.set(S(id),code);
    if(name){ byName.set(norm(name),code); byName.set(norm(code+' '+name),code); }
    if(project&&name) byProjectName.set(norm(project)+'|'+norm(name),code);
  }
  async function safeSelect(table,cols){
    const c=client(); if(!c) return [];
    try{ const r=await c.from(table).select(cols).limit(20000); return r.error?[]:(r.data||[]); }catch(_){ return []; }
  }
  async function loadCodes(force){
    if((loaded&&!force)||loading) return; loading=true;
    try{
      const [emp,workers,dist,projects]=await Promise.all([
        safeSelect('employees_master_v386','id,employee_code,app_name,name,full_name,employee_name'),
        safeSelect('workers','id,employee_code,worker_employee_code,code,id_code,name,full_name,worker_name,worker_identity,app_name,project_id,current_project_id'),
        safeSelect('monthly_distribution','worker_id,worker_employee_code,worker_code,employee_code,worker_name,worker_display_name,app_name,name,project_id,project_name'),
        safeSelect('projects','id,name,project_name,title')
      ]);
      const projectName=id=>{const p=(projects||[]).find(x=>S(x.id)===S(id)); return S(p?.name||p?.project_name||p?.title||id||'');};
      (emp||[]).forEach(x=>{const code=S(x.employee_code)||codeOf(x.app_name||x.name); [x.app_name,x.name,x.full_name,x.employee_name].forEach(n=>add(code,n,x.id));});
      (workers||[]).forEach(x=>{const code=S(x.employee_code||x.worker_employee_code||x.code||x.id_code)||codeOf(x.name||x.worker_name||x.app_name); [x.app_name,x.name,x.full_name,x.worker_name,x.worker_identity].forEach(n=>add(code,n,x.id,projectName(x.project_id||x.current_project_id)));});
      (dist||[]).forEach(x=>{const code=S(x.worker_employee_code||x.worker_code||x.employee_code)||codeOf(x.worker_name||x.worker_display_name||x.app_name||x.name); [x.worker_name,x.worker_display_name,x.app_name,x.name].forEach(n=>add(code,n,x.worker_id, x.project_name||projectName(x.project_id)));});
      loaded=true;
    }finally{loading=false;}
  }
  function codeForCard(card,nameEl){
    const name=cleanName(nameEl?.textContent||'');
    const wid=S(card?.dataset?.worker||card?.querySelector?.('[data-worker]')?.dataset?.worker||'');
    const project=cleanName(card?.querySelector?.('.att-v343-meta b, small, .meta b')?.textContent||'');
    return codeOf(name)||byId.get(wid)||byProjectName.get(norm(project)+'|'+norm(name))||byName.get(norm(name))||'';
  }
  function decorate(){
    const root=document.getElementById('supervisorAttendanceList'); if(!root) return;
    // الشكل الجديد في نسخة المشرف: .att-v343-card وفيه .att-v343-name، وليس <b> لذلك النسخة السابقة لم تمسك الأسماء.
    root.querySelectorAll('.att-v343-card,.quick-item,.att-worker,.worker-card').forEach(card=>{
      const nameEl=card.querySelector('.att-v343-name') || card.querySelector('b');
      if(!nameEl) return;
      const original=cleanName(nameEl.textContent);
      if(!original || /المشرف|عدد العمال|جاهز|لا توجد/.test(original)) return;
      const code=codeForCard(card,nameEl);
      if(!code) return;
      nameEl.innerHTML=`<span class="sup-worker-name-v432">${esc(original)}</span> <span class="sup-worker-code-v432">${esc(code)}</span>`;
      card.dataset.workerCode=code;
      const sel=card.querySelector('select[data-worker],select.att-status-v343');
      if(sel) sel.dataset.workerCode=code;
    });
  }
  function css(){
    if(document.getElementById('supWorkerCodesV432Css')) return;
    const st=document.createElement('style'); st.id='supWorkerCodesV432Css'; st.textContent=`
      #supervisorAttendanceList .sup-worker-code-v432{display:inline-block;margin-inline-start:6px;background:#eef8f4;color:#07513f;border:1px solid #d3e9df;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:900;direction:ltr;unicode-bidi:isolate}
      #supervisorAttendanceList .sup-worker-name-v432{font-weight:900;color:#063d33}
      .att-v343-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important;align-items:center!important;margin:10px 0!important}
      .att-v343-actions button{width:auto!important;min-width:120px!important;min-height:42px!important;height:auto!important;padding:8px 14px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;writing-mode:horizontal-tb!important;white-space:nowrap!important}
    `; document.head.appendChild(st);
  }
  function run(force){ css(); loadCodes(force).then(()=>{decorate(); setTimeout(decorate,200); setTimeout(decorate,800);}); }
  const wrap=(fnName)=>{ const old=window[fnName]; window[fnName]=function(){ const r=old?old.apply(this,arguments):undefined; setTimeout(()=>run(false),50); setTimeout(()=>run(false),400); setTimeout(()=>run(true),1200); return r; }; };
  wrap('renderSupervisorAttendanceList');
  const oldShow=window.showSupervisorWindow; window.showSupervisorWindow=function(id,btn){ const r=oldShow?oldShow.apply(this,arguments):undefined; if(id==='supAttendance') setTimeout(()=>run(true),100); return r; };
  const oldInit=window.initSupervisor; window.initSupervisor=async function(){ if(oldInit) await oldInit.apply(this,arguments); setTimeout(()=>run(true),500); };
  document.addEventListener('DOMContentLoaded',()=>{run(true); try{new MutationObserver(()=>decorate()).observe(document.body,{childList:true,subtree:true});}catch(_){} });
  setTimeout(()=>run(true),1000); setTimeout(()=>run(true),3000);
  console.log('Tasneef supervisor worker codes loaded '+BUILD);
})();
