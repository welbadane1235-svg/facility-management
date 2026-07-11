(function(){
  'use strict';
  const BUILD='V426 اعتماد V10233 من التوزيع';
  const S=v=>String(v??'').trim();
  const N=v=>Number(v)||0;
  const $=id=>document.getElementById(id);
  const esc=s=>S(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>S(s).toLowerCase().replace(/[إأآا]/g,'ا').replace(/[ىي]/g,'ي').replace(/ة/g,'ه').replace(/[\u064B-\u0652]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
  const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
  const monthNow=()=>today().slice(0,7);
  const daysOfMonth=m=>{const y=N(m.slice(0,4)),mo=N(m.slice(5,7));return Array.from({length:new Date(y,mo,0).getDate()||31},(_,i)=>String(i+1).padStart(2,'0'));};
  const statusCode=v=>{const x=norm(v); if(['absent','غائب','غياب','غ','a'].includes(x))return 'absent'; if(['present','حاضر','حضور','ح','p'].includes(x))return 'present'; return x||'present';};
  function client(){return window.sb || window.supabaseClient || null;}
  async function q(label,p){try{const r=await p; if(r?.error){console.warn(label,r.error);return {data:[],error:r.error};} return r;}catch(e){console.warn(label,e);return {data:[],error:e};}}
  function msg(t,bad){const e=$('cu426Msg')||$('cu413Msg'); if(e){e.textContent=t;e.classList.toggle('err',!!bad);} try{if(window.msg) window.msg(t,bad?'err':'ok');}catch(_){}}
  function installCss(){
    if($('cu426Css'))return;
    const st=document.createElement('style'); st.id='cu426Css';
    st.textContent=`
      #cu413AttendanceTab .cu426-card{background:#fff;border:1px solid #dce6e2;border-radius:22px;padding:18px;margin:12px 0}
      #cu413AttendanceTab .cu426-head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}
      #cu413AttendanceTab .cu426-head h2{color:#07513f;margin:0;font-size:22px}
      #cu413AttendanceTab .cu426-msg{background:#eef8f4;border:1px solid #d3e9df;border-radius:12px;padding:10px;margin:10px 0;color:#07513f;font-weight:800}
      #cu413AttendanceTab .cu426-msg.err{background:#fdeaea;color:#9d2222;border-color:#efc3c3}
      #cu413AttendanceTab .cu426-controls{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px;margin:12px 0}
      #cu413AttendanceTab .cu426-controls label{font-size:12px;color:#07513f;font-weight:900}
      #cu413AttendanceTab .cu426-controls input,#cu413AttendanceTab .cu426-controls select{width:100%;border:1px solid #dce6e2;border-radius:12px;padding:10px;background:#fff}
      #cu413AttendanceTab .cu426-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
      #cu413AttendanceTab .cu426-actions button{border:0;border-radius:12px;background:#07513f;color:#fff;padding:10px 14px;font-weight:900;cursor:pointer}
      #cu413AttendanceTab .cu426-actions button.light{background:#eef8f4;color:#07513f;border:1px solid #d3e9df}
      #cu413AttendanceTab .cu426-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0}
      #cu413AttendanceTab .cu426-kpis div{border:1px solid #dce6e2;border-radius:14px;padding:12px;text-align:center;background:#fff}
      #cu413AttendanceTab .cu426-kpis b{display:block;font-size:26px;color:#07513f}
      #cu413AttendanceTab .cu426-workers{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;align-items:start}
      #cu413AttendanceTab .cu426-worker{border:1px solid #dce9e3;border-radius:14px;background:#fbfefc;padding:10px;min-height:106px}
      #cu413AttendanceTab .cu426-worker b{display:block;color:#063d33;font-size:15px}
      #cu413AttendanceTab .cu426-worker small{display:block;color:#60706a;margin:4px 0;line-height:1.5}
      #cu413AttendanceTab .cu426-worker select,#cu413AttendanceTab .cu426-worker input{width:100%;margin-top:6px;border:1px solid #dce6e2;border-radius:10px;padding:8px;background:#fff}
      #cu413AttendanceTab .cu426-worker.absent{background:#fff1f1;border-color:#efb4b4}
      #cu413AttendanceTab .cu426-super{grid-column:1/-1;background:#e9f5f1!important;color:#063d33;font-weight:900;min-height:auto;display:flex;justify-content:space-between;gap:10px}
      #cu413AttendanceTab .cu426-table-wrap{max-height:55vh;overflow:auto;border:1px solid #dce9e3;border-radius:14px;margin-top:10px}
      #cu413AttendanceTab .cu426-table{width:100%;border-collapse:collapse;background:#fff}
      #cu413AttendanceTab .cu426-table th{background:#07513f;color:#fff;position:sticky;top:0;z-index:1}
      #cu413AttendanceTab .cu426-table th,#cu413AttendanceTab .cu426-table td{border:1px solid #dce9e3;padding:7px;text-align:center;white-space:nowrap}
      #cu413AttendanceTab .cu426-table th:first-child,#cu413AttendanceTab .cu426-table td:first-child{position:sticky;right:0;background:#fff;text-align:right;font-weight:900;z-index:2}
      #cu413AttendanceTab .cu426-table th:first-child{background:#07513f;color:#fff;z-index:3}
      #cu413AttendanceTab .cu426-p{background:#e8f4ee;color:#08784d;font-weight:900}
      #cu413AttendanceTab .cu426-a{background:#fdeaea;color:#a22;font-weight:900}
      #cu413AttendanceTab .cu426-e{color:#8a9993}
      @media(max-width:900px){#cu413AttendanceTab .cu426-controls{grid-template-columns:1fr 1fr}#cu413AttendanceTab .cu426-kpis{grid-template-columns:repeat(2,1fr)}}
      @media print{#cu413AttendanceTab .cu426-controls,#cu413AttendanceTab .cu426-actions,#cu413AttendanceTab .cu426-msg{display:none!important}#cu413AttendanceTab .cu426-table-wrap{max-height:none;overflow:visible}}
    `;
    document.head.appendChild(st);
  }
  let state={dist:[],att:[],loadedKey:''};
  function distCode(r){return S(r.worker_employee_code||r.worker_code||r.employee_code||r.worker_id||'');}
  function distName(r){return S(r.worker_name||r.worker_display_name||r.app_name||r.name||distCode(r));}
  function distProjectId(r){return S(r.project_id||'');}
  function distProject(r){return S(r.project_name||r.project||r.project_title||distProjectId(r)||'-');}
  function distSupCode(r){return S(r.supervisor_employee_code||r.supervisor_code||r.supervisor_id||'');}
  function distSupName(r){return S(r.supervisor_name||r.supervisor_full_name||distSupCode(r)||'بدون مشرف');}
  function attKey(a){return [S(a.worker_employee_code||a.worker_code||a.employee_code||a.worker_identity),S(a.project_id||''),S(a.attendance_date||a.date||'').slice(0,10),S(a.shift_name||'default')].join('|');}
  function rowKey(r,date){return [distCode(r),distProjectId(r),date,S(r.shift_name||'default')].join('|');}
  function dedupeDist(rows){
    const seen=new Set();
    return (rows||[]).filter(r=>{
      if(!distCode(r))return false;
      const k=[distCode(r),distProjectId(r),distSupCode(r),S(r.shift_name||'default')].join('|');
      if(seen.has(k))return false; seen.add(k); return true;
    });
  }
  async function load(month,date,force){
    const c=client(); if(!c){msg('Supabase غير جاهز',true); return;}
    const key=month+'|'+date;
    if(!force && state.loadedKey===key)return;
    const dr=await q('monthly_distribution', c.from('monthly_distribution').select('*').eq('month_key',month).limit(20000));
    let dist=dr.data||[];
    if(!dist.length){
      const dr2=await q('monthly_distribution date fallback', c.from('monthly_distribution').select('*').lte('start_date',date).or('end_date.is.null,end_date.gte.'+date).limit(20000));
      dist=dr2.data||[];
    }
    dist=dist.filter(r=>!['ended','inactive','deleted','منتهي','موقوف','محذوف'].includes(norm(r.status)));
    const ar=await q('attendance', c.from('attendance').select('*').eq('attendance_date',date).limit(20000));
    state={dist:dedupeDist(dist),att:ar.data||[],loadedKey:key};
  }
  function filters(){
    const month=$('cu426Month')?.value||monthNow();
    const date=$('cu426Date')?.value||today();
    const sup=$('cu426Sup')?.value||'';
    const project=$('cu426Project')?.value||'';
    const search=norm($('cu426Search')?.value||'');
    return {month,date,sup,project,search};
  }
  function currentRows(){
    const f=filters();
    return state.dist.filter(r=>(!f.sup||distSupCode(r)===f.sup||distSupName(r)===f.sup)&&(!f.project||distProjectId(r)===f.project)&&(!f.search||norm(distName(r)).includes(f.search)||norm(distCode(r)).includes(f.search)||norm(distProject(r)).includes(f.search)));
  }
  function fillSelects(){
    const f=filters();
    const sups=[...new Map(state.dist.map(r=>[distSupCode(r)||distSupName(r),distSupName(r)]).filter(x=>x[0])).entries()];
    const prs=[...new Map(state.dist.map(r=>[distProjectId(r),distProject(r)]).filter(x=>x[0])).entries()];
    const sup=$('cu426Sup'), pr=$('cu426Project');
    if(sup){sup.innerHTML='<option value="">كل المشرفين</option>'+sups.map(([v,n])=>`<option value="${esc(v)}">${esc(n)}</option>`).join(''); sup.value=sups.some(x=>x[0]===f.sup)?f.sup:'';}
    if(pr){pr.innerHTML='<option value="">كل المشاريع</option>'+prs.map(([v,n])=>`<option value="${esc(v)}">${esc(n)}</option>`).join(''); pr.value=prs.some(x=>x[0]===f.project)?f.project:'';}
  }
  function attMap(){const m=new Map(); state.att.forEach(a=>m.set(attKey(a),a)); return m;}
  function render(){
    const root=$('cu426Root'); if(!root)return;
    const f=filters(); fillSelects();
    const rows=currentRows(), amap=attMap();
    let present=0, absent=0, other=0;
    rows.forEach(r=>{const st=statusCode(amap.get(rowKey(r,f.date))?.status||'present'); if(st==='present')present++; else if(st==='absent')absent++; else other++;});
    $('cu426Kpis').innerHTML=`<div><small>الموزعين</small><b>${rows.length}</b></div><div><small>حاضر</small><b>${present}</b></div><div><small>غائب</small><b>${absent}</b></div><div><small>إجازات/أخرى</small><b>${other}</b></div>`;
    const groups=new Map();
    rows.forEach(r=>{const k=distSupCode(r)||distSupName(r)||'بدون مشرف'; if(!groups.has(k))groups.set(k,{name:distSupName(r),items:[]}); groups.get(k).items.push(r);});
    $('cu426Workers').innerHTML=[...groups.values()].map(g=>`<div class="cu426-worker cu426-super"><span>المشرف: ${esc(g.name)}</span><span>عدد العمال: ${g.items.length}</span></div>`+g.items.map(r=>{
      const a=amap.get(rowKey(r,f.date)); const st=statusCode(a?.status||'present');
      return `<div class="cu426-worker ${st==='absent'?'absent':''}" data-key="${esc(rowKey(r,f.date))}" data-code="${esc(distCode(r))}" data-project="${esc(distProjectId(r))}"><b>${esc(distName(r))}</b><small>${esc(distCode(r))}${distCode(r)?' | ':''}${esc(distProject(r))}</small><select><option value="present" ${st==='present'?'selected':''}>حاضر</option><option value="absent" ${st==='absent'?'selected':''}>غائب</option><option value="leave" ${st==='leave'?'selected':''}>إجازة</option><option value="sick" ${st==='sick'?'selected':''}>مرضي</option><option value="mission" ${st==='mission'?'selected':''}>مأمورية</option><option value="weekly_off" ${st==='weekly_off'?'selected':''}>راحة أسبوعية</option></select><input placeholder="ملاحظات" value="${esc(a?.notes||'')}"></div>`;
    }).join('')).join('') || '<div class="cu426-worker">لا يوجد عمال في التوزيع لهذا الشهر. اربطهم من تبويب التوزيع أولًا.</div>';
    renderMonthTable(rows,amap,f.month,f.date);
  }
  function renderMonthTable(rows,amap,month,date){
    const days=daysOfMonth(month); const head=$('cu426Head'), body=$('cu426Body'); if(!head||!body)return;
    head.innerHTML='<tr><th>العامل</th>'+days.map(d=>`<th>${d}</th>`).join('')+'<th>حضور</th><th>غياب</th></tr>';
    const groups=new Map(); rows.forEach(r=>{const k=distSupCode(r)||distSupName(r)||'بدون مشرف'; if(!groups.has(k))groups.set(k,{name:distSupName(r),items:[]}); groups.get(k).items.push(r);});
    body.innerHTML=[...groups.values()].map(g=>`<tr><td colspan="${days.length+3}" class="cu426-super">المشرف: ${esc(g.name)} - عدد العمال: ${g.items.length}</td></tr>`+g.items.map(r=>{let p=0,a=0; const cells=days.map(day=>{const dk=month+'-'+day; const k=[distCode(r),distProjectId(r),dk,S(r.shift_name||'default')].join('|'); const rec=state.att.find(x=>attKey(x)===k); const st=statusCode(rec?.status||''); if(st==='present'){p++;return '<td class="cu426-p">ح</td>';} if(st==='absent'){a++;return '<td class="cu426-a">غ</td>';} return '<td class="cu426-e">-</td>';}).join(''); return `<tr><td>${esc(distName(r))}<small style="display:block;color:#60706a">${esc(distProject(r))}</small></td>${cells}<td>${p}</td><td>${a}</td></tr>`;}).join('')).join('');
  }
  function renderShell(){
    installCss(); const tab=$('cu413AttendanceTab'); if(!tab)return;
    if($('cu426Root'))return;
    tab.innerHTML=`<div class="cu426-card" id="cu426Root"><div class="cu426-head"><h2>الحضور والغياب</h2><b>${BUILD}</b></div><div id="cu426Msg" class="cu426-msg">يعرض نفس أداء الحضور القديم، لكن مصدر العمال من التوزيع الحالي.</div><div class="cu426-controls"><label>التاريخ<input type="date" id="cu426Date" value="${today()}"></label><label>الشهر<input type="month" id="cu426Month" value="${monthNow()}"></label><label>المشرف<select id="cu426Sup"><option value="">كل المشرفين</option></select></label><label>المشروع<select id="cu426Project"><option value="">كل المشاريع</option></select></label><label>بحث<input id="cu426Search" placeholder="اسم العامل أو الكود أو المشروع"></label></div><div class="cu426-actions"><button id="cu426Refresh">تحديث مباشر</button><button id="cu426AllP" class="light">اعتماد الكل حاضر</button><button id="cu426AllA" class="light">اعتماد الكل غائب</button><button id="cu426Save">حفظ التحضير</button><button id="cu426Print" class="light">طباعة</button></div><div id="cu426Kpis" class="cu426-kpis"></div><h3>تحضير اليوم</h3><div id="cu426Workers" class="cu426-workers"></div><h3>كشف الشهر من التوزيع</h3><div class="cu426-table-wrap"><table class="cu426-table"><thead id="cu426Head"></thead><tbody id="cu426Body"></tbody></table></div></div>`;
    $('cu426Date').addEventListener('change',()=>{const d=$('cu426Date').value; if(d) $('cu426Month').value=d.slice(0,7); refresh(true);});
    $('cu426Month').addEventListener('change',()=>refresh(true));
    $('cu426Sup').addEventListener('change',render);
    $('cu426Project').addEventListener('change',render);
    $('cu426Search').addEventListener('input',render);
    $('cu426Refresh').onclick=()=>refresh(true);
    $('cu426AllP').onclick=()=>{document.querySelectorAll('#cu426Workers .cu426-worker[data-key] select').forEach(s=>s.value='present');};
    $('cu426AllA').onclick=()=>{document.querySelectorAll('#cu426Workers .cu426-worker[data-key] select').forEach(s=>s.value='absent');};
    $('cu426Print').onclick=()=>window.print();
    $('cu426Save').onclick=save;
  }
  async function refresh(force){renderShell(); const f=filters(); msg('جاري تحميل بيانات التوزيع والحضور...'); await load(f.month,f.date,force); render(); msg('تم تحميل '+state.dist.length+' عامل/توزيع من التوزيع الحالي.');}
  async function save(){
    try{
      const c=client(); if(!c)return msg('Supabase غير جاهز',true);
      const f=filters(); const rows=currentRows(); if(!rows.length)return msg('لا يوجد عمال للحفظ.',true);
      const cardMap=new Map([...document.querySelectorAll('#cu426Workers .cu426-worker[data-key]')].map(el=>[el.dataset.key,el]));
      let saved=0;
      for(const r of rows){
        const key=rowKey(r,f.date); const el=cardMap.get(key); if(!el)continue;
        const row={attendance_date:f.date, month_key:f.date.slice(0,7), worker_employee_code:distCode(r), worker_name:distName(r), project_id:distProjectId(r), project_name:distProject(r), supervisor_employee_code:distSupCode(r), supervisor_name:distSupName(r), shift_name:S(r.shift_name||'default'), status:S(el.querySelector('select')?.value||'present'), notes:S(el.querySelector('input')?.value||''), source:'core_unified_v426_v10233_distribution'};
        const found=await q('attendance-find', c.from('attendance').select('id').eq('attendance_date',row.attendance_date).eq('worker_employee_code',row.worker_employee_code).eq('project_id',row.project_id).eq('shift_name',row.shift_name).limit(1));
        let res;
        if((found.data||[])[0]?.id) res=await c.from('attendance').update(row).eq('id',found.data[0].id).select('id');
        else res=await c.from('attendance').insert(row).select('id');
        if(res?.error) throw res.error;
        saved++;
      }
      msg('تم حفظ '+saved+' سجل حضور.'); await load(f.month,f.date,true); render();
    }catch(e){msg('فشل الحفظ: '+(e.message||e),true);}
  }
  function isVisible(){const tab=$('cu413AttendanceTab'); return !!tab && !tab.classList.contains('hidden') && getComputedStyle(tab).display!=='none';}
  function activate(){if(!isVisible())return; if(!$('cu426Root')) renderShell(); refresh(false);}
  document.addEventListener('click',e=>{const b=e.target.closest('#coreUnified [data-tab="attendance"]'); if(b) setTimeout(activate,120);});
  document.addEventListener('DOMContentLoaded',()=>{setTimeout(activate,1800);});
  try{new MutationObserver(()=>{if(isVisible()&&!$('cu426Root')) setTimeout(activate,80);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){ }
  window.tasneefCoreAttendanceV426={refresh,save,activate};
  console.log('Tasneef core unified attendance V426 loaded');
})();
