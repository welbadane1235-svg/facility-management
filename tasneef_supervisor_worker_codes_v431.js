(function(){
  'use strict';
  const BUILD='V431 إظهار كود العامل في نسخة المشرفين';
  const S=v=>String(v??'').trim();
  const norm=s=>S(s).toLowerCase().replace(/[إأآا]/g,'ا').replace(/[ىي]/g,'ي').replace(/ة/g,'ه').replace(/[\u064B-\u0652]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
  const esc=s=>S(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const hasCode=s=>/\bTS\s*-?\s*\d+\b/i.test(S(s));
  const cleanName=s=>S(s).replace(/^\s*TS\s*-?\s*\d+\s*[-–—:|]?\s*/i,'').trim();
  const codeOf=v=>{const m=S(v).match(/\bTS\s*-?\s*(\d+)\b/i); return m ? 'TS-'+String(Number(m[1])).padStart(2,'0') : '';};
  const client=()=>window.sb||window.supabaseClient||null;
  let codeMap=new Map(), idMap=new Map(), loading=false, loaded=false;
  function add(code,name,id){code=codeOf(code)||S(code); name=cleanName(name); if(!code||!name)return; codeMap.set(norm(name),code); codeMap.set(norm(code+' '+name),code); codeMap.set(norm(code+' - '+name),code); if(id!==undefined&&id!==null&&S(id)) idMap.set(S(id),code);}
  async function loadCodes(){
    if(loading||loaded)return; const c=client(); if(!c)return; loading=true;
    try{
      const tables=[
        ['employees_master_v386','employee_code,app_name,name,full_name,employee_name,id'],
        ['workers','id,employee_code,worker_employee_code,code,id_code,name,full_name,worker_name,worker_identity,app_name'],
        ['monthly_distribution','worker_employee_code,worker_code,employee_code,worker_name,worker_display_name,app_name,name,worker_id']
      ];
      for(const [t,cols] of tables){
        try{
          const r=await c.from(t).select(cols).limit(10000);
          if(r.error) continue;
          (r.data||[]).forEach(x=>{
            const code=S(x.employee_code||x.worker_employee_code||x.worker_code||x.code||x.id_code||'')||codeOf(x.worker_name||x.worker_identity||x.app_name||x.name||'');
            const names=[x.app_name,x.name,x.full_name,x.employee_name,x.worker_name,x.worker_identity,x.worker_display_name].map(cleanName).filter(Boolean);
            names.forEach(n=>add(code,n,x.id||x.worker_id));
          });
        }catch(_){ }
      }
      loaded=true;
    }finally{loading=false;}
  }
  function guessCodeFromElement(el){
    const ds=el?.dataset||{};
    const vals=[ds.workerCode,ds.workerEmployeeCode,ds.employeeCode,ds.code,ds.workerIdentity,ds.name,ds.worker,ds.workerId,ds.id];
    for(const v of vals){const c=codeOf(v); if(c)return c;}
    const sel=el?.querySelector?.('select[data-worker],select[data-worker-id],select[data-worker-identity]');
    if(sel){
      const c=codeOf(sel.dataset.workerIdentity||sel.dataset.workerCode||sel.dataset.employeeCode); if(c)return c;
      const id=S(sel.dataset.worker||sel.dataset.workerId); if(idMap.has(id))return idMap.get(id);
    }
    return '';
  }
  function decorate(){
    const root=document.getElementById('supervisorAttendanceList'); if(!root)return;
    const cards=[...root.querySelectorAll('.att-worker,.quick-item,.att-v343-card,.card,.worker-card,div')].filter(el=>el.querySelector&&el.querySelector('b'));
    cards.forEach(card=>{
      const b=card.querySelector('b'); if(!b || b.dataset.codeDecorated==='1')return;
      const original=S(b.textContent); if(!original || /المشرف|عدد العمال|جاهز/.test(original))return;
      const name=cleanName(original);
      let code=guessCodeFromElement(card)||codeMap.get(norm(name))||codeMap.get(norm(original))||codeOf(original);
      if(!code)return;
      b.dataset.codeDecorated='1';
      b.dataset.originalName=name;
      b.innerHTML=`<span class="sup-worker-name-v431">${esc(name)}</span> <span class="sup-worker-code-v431">${esc(code)}</span>`;
    });
  }
  function css(){ if(document.getElementById('supWorkerCodesV431Css'))return; const st=document.createElement('style'); st.id='supWorkerCodesV431Css'; st.textContent=`
    #supervisorAttendanceList .sup-worker-code-v431{display:inline-block;margin-inline-start:6px;background:#eef8f4;color:#07513f;border:1px solid #d3e9df;border-radius:999px;padding:2px 7px;font-size:12px;font-weight:900;direction:ltr}
    #supervisorAttendanceList .sup-worker-name-v431{font-weight:900;color:#063d33}
  `; document.head.appendChild(st); }
  function run(){css(); loadCodes().then(()=>decorate()); setTimeout(decorate,300); setTimeout(decorate,1000); setTimeout(decorate,2500);}
  const oldRender=window.renderSupervisorAttendanceList;
  window.renderSupervisorAttendanceList=function(){ const r=oldRender?oldRender.apply(this,arguments):undefined; setTimeout(run,80); setTimeout(run,500); return r; };
  const oldShow=window.showSupervisorWindow;
  window.showSupervisorWindow=function(id,btn){ const r=oldShow?oldShow.apply(this,arguments):undefined; if(id==='supAttendance') setTimeout(run,150); return r; };
  const oldInit=window.initSupervisor;
  window.initSupervisor=async function(){ if(oldInit) await oldInit.apply(this,arguments); setTimeout(run,500); };
  document.addEventListener('DOMContentLoaded',()=>{run(); try{new MutationObserver(()=>decorate()).observe(document.body,{childList:true,subtree:true});}catch(_){}});
  setTimeout(run,1200); setTimeout(run,3500);
  console.log('Tasneef supervisor worker codes loaded '+BUILD);
})();
