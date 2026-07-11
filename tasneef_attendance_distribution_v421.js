/* TASNEEF V421 - Old attendance behavior, live from unified distribution */
(function(){
  'use strict';
  if(window.__tasneefAttendanceDistributionV421) return;
  window.__tasneefAttendanceDistributionV421 = true;
  const BUILD='V421_ATTENDANCE_OLD_UI_FROM_UNIFIED_DISTRIBUTION';
  const $ = id => document.getElementById(id);
  const A = v => Array.isArray(v)?v:[];
  const S = v => String(v ?? '').trim();
  const E = s => S(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const client = () => window.sb || window.supabaseClient || null;
  const today = () => { const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  const monthOf = d => S(d||today()).slice(0,7);
  const daysInMonth = m => { const y=Number(m.slice(0,4)), mm=Number(m.slice(5,7)); return new Date(y,mm,0).getDate()||31; };
  const dateOf = (m,d) => `${m}-${String(d).padStart(2,'0')}`;
  const msg = (t,typ) => { try{ if(typeof window.msg==='function') window.msg(t,typ||'ok'); else console.log(t); }catch(_){ console.log(t); } };
  const norm = v => S(v).toLowerCase().replace(/[إأآا]/g,'ا').replace(/[ىي]/g,'ي').replace(/ة/g,'ه').replace(/[\u064B-\u0652]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
  const state = {month:'', dist:[], attendance:[], loading:false};
  const labels = {
    present:'حاضر', absent:'غائب', leave:'إجازة', sick:'مرضي', mission:'مأمورية', weekly_off:'راحة أسبوعية', late:'متأخر', early_leave:'خروج مبكر'
  };
  const shorts = {present:'ح', absent:'غ', leave:'إ', sick:'م', mission:'مأ', weekly_off:'ر', late:'ت', early_leave:'خ'};
  function statusClass(st){ st=S(st||'present'); if(st==='absent') return 'att421-absent'; if(st==='present') return 'att421-present'; if(st==='leave'||st==='sick'||st==='mission'||st==='weekly_off') return 'att421-leave'; return 'att421-warn'; }
  function statusLabel(st){ return labels[S(st)] || S(st||'-'); }
  function statusShort(st){ return shorts[S(st)] || '-'; }
  function codeName(code,name){ return [S(code),S(name)].filter(Boolean).join(' - ') || '-'; }
  function rowKey(r){ return [r.supervisor_employee_code||r.supervisor_name||'', r.project_id||r.project_name||'', r.worker_employee_code||r.worker_name||''].map(S).join('||'); }
  function cleanRows(rows){ const map=new Map(); A(rows).forEach(r=>{ if(S(r.status||'active')==='ended') return; const k=rowKey(r); if(!k.includes('||||') && !map.has(k)) map.set(k,r); else if(!map.has(k)) map.set(k,r); }); return [...map.values()].sort((a,b)=>S(a.supervisor_name).localeCompare(S(b.supervisor_name),'ar') || S(a.project_name).localeCompare(S(b.project_name),'ar') || S(a.worker_name).localeCompare(S(b.worker_name),'ar')); }
  async function load(month, force){
    if(state.loading) return;
    if(!force && state.month===month && state.dist.length) return;
    const c=client(); if(!c){ msg('تعذر الاتصال بالسيرفر','err'); return; }
    state.loading=true;
    try{
      const distQ = c.from('monthly_distribution').select('*').eq('month_key',month).order('supervisor_name',{ascending:true}).order('project_name',{ascending:true}).order('worker_name',{ascending:true});
      const attQ = c.from('attendance').select('*').gte('attendance_date',month+'-01').lte('attendance_date',month+'-31').order('attendance_date',{ascending:true});
      const [d,a] = await Promise.all([distQ, attQ]);
      if(d.error) throw d.error;
      state.month=month;
      state.dist=cleanRows(d.data||[]);
      state.attendance=A(a.data||[]);
      if(a.error) console.warn('attendance load warning', a.error.message);
    }catch(e){ console.error(e); msg('خطأ تحميل الحضور من التوزيع: '+(e.message||e),'err'); }
    finally{ state.loading=false; }
  }
  function attendanceFor(date,r){
    const wc=S(r.worker_employee_code), pc=S(r.project_id), sc=S(r.supervisor_employee_code);
    return A(state.attendance).filter(a=>S(a.attendance_date).slice(0,10)===date && S(a.worker_employee_code)===wc && S(a.project_id)===pc && S(a.supervisor_employee_code)===sc).sort((a,b)=>Number(b.id||0)-Number(a.id||0))[0] || null;
  }
  function buildSupervisorOptions(){
    const ids=new Map(); state.dist.forEach(r=>{ const k=S(r.supervisor_employee_code||r.supervisor_name); if(k&&!ids.has(k)) ids.set(k,{code:S(r.supervisor_employee_code),name:S(r.supervisor_name)}); });
    const opts=['<option value="">كل المشرفين</option>'].concat([...ids.values()].map(s=>`<option value="${E(s.code||s.name)}">${E(codeName(s.code,s.name))}</option>`)).join('');
    ['attendanceSupervisor','attendanceFilterSupervisor','attendanceMatrixSupervisor'].forEach(id=>{ const el=$(id); if(el){ const old=el.value; el.innerHTML=opts; if([...el.options].some(o=>o.value===old)) el.value=old; }});
  }
  function installStyle(){
    if($('att421Css')) return;
    const st=document.createElement('style'); st.id='att421Css';
    st.textContent=`
      .att421-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin:10px 0}.att421-toolbar button{border-radius:10px}
      .att421-supervisor{border:1px solid #cfe2dc;border-radius:16px;margin:12px 0;background:#fff;overflow:hidden}.att421-sup-head{background:#eaf6f2;color:#0A4033;font-weight:900;padding:11px 14px;display:flex;justify-content:space-between;gap:10px}.att421-sup-head small{display:block;color:#46635a;font-weight:700;margin-top:2px}
      .att421-grid{display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:10px;padding:10px}.att421-card{border:1px solid #dce6e2;border-radius:14px;background:#fbfdfc;padding:10px}.att421-card b{display:block;color:#052f25}.att421-card small{display:block;color:#60706a;margin:3px 0 8px}.att421-card select,.att421-card input{width:100%;margin-top:6px}.att421-card.att421-absent{background:#fff1f1;border-color:#f2b8b8}.att421-card.att421-leave{background:#fff8e8;border-color:#ead8a1}.att421-card.att421-warn{background:#fff7ed;border-color:#fed7aa}
      .attendance-matrix-v421 th,.attendance-matrix-v421 td{text-align:center;white-space:nowrap}.attendance-matrix-v421 th:first-child,.attendance-matrix-v421 td:first-child{position:sticky;right:0;background:#fff;z-index:4;text-align:right;min-width:160px}.attendance-matrix-v421 .att421-sup-row td{background:#eaf6f2!important;color:#0A4033;font-weight:900;text-align:right}.att421-present-cell{background:#e7f6ef;color:#006747;font-weight:900}.att421-absent-cell{background:#fde8e8;color:#b91c1c;font-weight:900}.att421-leave-cell{background:#fff7db;color:#92400e;font-weight:900}.att421-empty-cell{color:#94a3b8}
      @media(max-width:1100px){.att421-grid{grid-template-columns:repeat(2,minmax(160px,1fr))}}@media(max-width:700px){.att421-grid{grid-template-columns:1fr}}
      @media print{.side,.nav,.actions,.filters,#globalMsg,.att421-toolbar{display:none!important}.attendance-matrix-v421{font-size:10px!important}}
    `;
    document.head.appendChild(st);
  }
  function groupBySupervisor(rows){ const m=new Map(); rows.forEach(r=>{ const k=S(r.supervisor_employee_code||r.supervisor_name||'بدون مشرف'); if(!m.has(k)) m.set(k,[]); m.get(k).push(r); }); return m; }
  async function renderAttendanceWorkersQuick(){
    installStyle();
    const box=$('attendanceQuick'); if(!box) return;
    const date=$('attendanceDate')?.value || today(); if($('attendanceDate') && !$('attendanceDate').value) $('attendanceDate').value=date;
    const month=monthOf(date); await load(month,false); buildSupervisorOptions();
    const selected=S($('attendanceSupervisor')?.value||'');
    const q=norm($('attendanceSearch')?.value || $('attendanceMatrixSearch')?.value || '');
    let rows=state.dist.filter(r=>(!selected || S(r.supervisor_employee_code||r.supervisor_name)===selected));
    if(q) rows=rows.filter(r=>norm([r.worker_employee_code,r.worker_name,r.project_name,r.supervisor_name].join(' ')).includes(q));
    const groups=groupBySupervisor(rows);
    const toolbar=`<div class="att421-toolbar"><button type="button" onclick="tasneefAttendanceDistributionV421.markAll('present')">تحضير الكل حاضر</button><button class="light" type="button" onclick="tasneefAttendanceDistributionV421.markAll('absent')">تحديد الكل غائب</button><button class="light" type="button" onclick="tasneefAttendanceDistributionV421.reload()">تحديث من التوزيع</button><button type="button" onclick="tasneefAttendanceDistributionV421.saveAll()">حفظ الكل</button></div>`;
    if(!rows.length){ box.innerHTML=toolbar+'<div class="msg">لا يوجد عمال في التوزيع لهذا الشهر أو لهذا المشرف.</div>'; return; }
    box.innerHTML=toolbar+[...groups.entries()].map(([k,list])=>{
      const first=list[0]||{};
      return `<div class="att421-supervisor"><div class="att421-sup-head"><div>المشرف: ${E(first.supervisor_name||k)}<small>عدد العمال: ${list.length}</small></div></div><div class="att421-grid">${list.map((r,i)=>{
        const rec=attendanceFor(date,r); const st=S(rec?.status||'present'); const notes=S(rec?.notes||''); const id='att421_'+Math.random().toString(36).slice(2)+i;
        return `<div class="att421-card ${E(statusClass(st))}" data-att421="1" data-worker-code="${E(r.worker_employee_code)}" data-worker-name="${E(r.worker_name)}" data-project-id="${E(r.project_id)}" data-project-name="${E(r.project_name)}" data-supervisor-code="${E(r.supervisor_employee_code)}" data-supervisor-name="${E(r.supervisor_name)}"><b>${E(codeName(r.worker_employee_code,r.worker_name))}</b><small>${E(r.project_name||'-')}</small><select class="att421-status" onchange="tasneefAttendanceDistributionV421.cardChanged(this)">${Object.entries(labels).map(([v,l])=>`<option value="${v}" ${v===st?'selected':''}>${E(l)}</option>`).join('')}</select><input class="att421-notes" placeholder="ملاحظات" value="${E(notes)}"></div>`;
      }).join('')}</div></div>`;
    }).join('');
  }
  async function saveOne(date, card){
    const c=client(); if(!c) throw new Error('لا يوجد اتصال بالسيرفر');
    const row={
      attendance_date:date,
      month_key:monthOf(date),
      worker_employee_code:S(card.dataset.workerCode),
      worker_name:S(card.dataset.workerName),
      project_id:S(card.dataset.projectId),
      project_name:S(card.dataset.projectName),
      supervisor_employee_code:S(card.dataset.supervisorCode),
      supervisor_name:S(card.dataset.supervisorName),
      shift_name:'default',
      status:card.querySelector('.att421-status')?.value || 'present',
      notes:card.querySelector('.att421-notes')?.value || '',
      source:'attendance_v421_old_ui_from_distribution',
      updated_at:new Date().toISOString()
    };
    const q=await c.from('attendance').select('id').eq('attendance_date',date).eq('worker_employee_code',row.worker_employee_code).eq('project_id',row.project_id).eq('supervisor_employee_code',row.supervisor_employee_code).eq('shift_name','default').order('id',{ascending:false}).limit(1);
    if(q.error) throw q.error;
    if(q.data && q.data[0]){
      const u=await c.from('attendance').update(row).eq('id',q.data[0].id); if(u.error) throw u.error;
    }else{
      row.created_at=new Date().toISOString(); const ins=await c.from('attendance').insert(row); if(ins.error) throw ins.error;
    }
  }
  async function saveAll(){
    const date=$('attendanceDate')?.value || today();
    const cards=[...document.querySelectorAll('[data-att421="1"]')];
    if(!cards.length) return msg('لا يوجد عمال لحفظ الحضور','err');
    try{ for(const card of cards) await saveOne(date,card); msg('تم حفظ الحضور حسب التوزيع الحالي'); await load(monthOf(date),true); renderAttendanceWorkersQuick(); renderAttendance(); renderAttendanceMonthly(); }
    catch(e){ console.error(e); msg('خطأ حفظ الحضور: '+(e.message||e),'err'); }
  }
  function markAll(st){ document.querySelectorAll('[data-att421="1"] .att421-status').forEach(sel=>{ sel.value=st; cardChanged(sel); }); }
  function cardChanged(sel){ const card=sel.closest('[data-att421="1"]'); if(card){ card.classList.remove('att421-present','att421-absent','att421-leave','att421-warn'); card.classList.add(statusClass(sel.value)); } }
  async function renderAttendance(){
    const body=$('attendanceBody'); if(!body) return;
    const date=$('attendanceFilterDate')?.value || $('attendanceDate')?.value || today(); if($('attendanceFilterDate') && !$('attendanceFilterDate').value) $('attendanceFilterDate').value=date;
    await load(monthOf(date),false); buildSupervisorOptions();
    const selected=S($('attendanceFilterSupervisor')?.value||''); const q=norm($('attendanceSearch')?.value||'');
    let rows=state.attendance.filter(r=>S(r.attendance_date).slice(0,10)===date && (!selected || S(r.supervisor_employee_code||r.supervisor_id||r.supervisor_name)===selected));
    if(q) rows=rows.filter(r=>norm([r.worker_employee_code,r.worker_name,r.project_name,r.supervisor_name,r.notes].join(' ')).includes(q));
    body.innerHTML=rows.map(r=>`<tr><td>${E(S(r.attendance_date).slice(0,10))}</td><td><b>${E(codeName(r.worker_employee_code,r.worker_name))}</b></td><td>${E(r.supervisor_name||r.supervisor_employee_code||'-')}</td><td>${E(r.project_name||r.project_id||'-')}</td><td><span class="badge ${r.status==='present'?'green':(r.status==='absent'?'red':'amber')}">${E(statusLabel(r.status))}</span></td><td>${E(r.notes||'')}</td><td class="row-actions"><button onclick="tasneefAttendanceDistributionV421.editFromRow('${E(S(r.worker_employee_code))}','${E(S(r.project_id))}','${E(S(r.supervisor_employee_code))}')">تعديل</button></td></tr>`).join('') || '<tr><td colspan="7">لا توجد سجلات حضور لهذا اليوم</td></tr>';
  }
  function editFromRow(w,p,s){ const sel=$('attendanceSupervisor'); if(sel) sel.value=s; renderAttendanceWorkersQuick().then(()=>{ const card=[...document.querySelectorAll('[data-att421="1"]')].find(x=>x.dataset.workerCode===w && x.dataset.projectId===p && x.dataset.supervisorCode===s); if(card){ card.scrollIntoView({behavior:'smooth',block:'center'}); card.style.outline='3px solid #0A4033'; setTimeout(()=>card.style.outline='',1800); }}); }
  async function renderAttendanceMonthly(){
    installStyle();
    const head=$('attendanceMatrixHead'), body=$('attendanceMatrixBody'); if(!head||!body) return;
    const mEl=$('attendanceMatrixMonth'); if(mEl&&!mEl.value) mEl.value=monthOf(today());
    const month=mEl?.value || monthOf(today()); await load(month,false); buildSupervisorOptions();
    const selected=S($('attendanceMatrixSupervisor')?.value||''); const q=norm($('attendanceMatrixSearch')?.value||''); const days=daysInMonth(month);
    let rows=state.dist.filter(r=>(!selected || S(r.supervisor_employee_code||r.supervisor_name)===selected));
    if(q) rows=rows.filter(r=>norm([r.worker_employee_code,r.worker_name,r.project_name,r.supervisor_name].join(' ')).includes(q));
    const groups=groupBySupervisor(rows);
    head.innerHTML='<tr><th>العامل</th>'+Array.from({length:days},(_,i)=>`<th>${String(i+1).padStart(2,'0')}</th>`).join('')+'<th>حضور</th><th>غياب</th></tr>';
    let totalP=0,totalA=0;
    const trs=[];
    [...groups.entries()].forEach(([k,list])=>{
      const first=list[0]||{}; trs.push(`<tr class="att421-sup-row"><td colspan="${days+3}">المشرف: ${E(first.supervisor_name||k)} - عدد العمال: ${list.length}</td></tr>`);
      list.forEach(r=>{
        let p=0,a=0; const cells=[];
        for(let d=1;d<=days;d++){
          const rec=attendanceFor(dateOf(month,d),r); const st=S(rec?.status||'');
          if(st==='present'||st==='late'||st==='early_leave'){p++; cells.push(`<td class="att421-present-cell">${E(statusShort(st||'present'))}</td>`);} 
          else if(st==='absent'){a++; cells.push(`<td class="att421-absent-cell">غ</td>`);} 
          else if(st){cells.push(`<td class="att421-leave-cell">${E(statusShort(st))}</td>`);} 
          else cells.push('<td class="att421-empty-cell">-</td>');
        }
        totalP+=p; totalA+=a;
        trs.push(`<tr><td><b>${E(r.worker_name||'-')}</b><small style="display:block;color:#60706a">${E(r.project_name||'-')}</small></td>${cells.join('')}<td>${p}</td><td>${a}</td></tr>`);
      });
    });
    const table=body.closest('table'); if(table) table.classList.add('attendance-matrix-v421');
    body.innerHTML=trs.join('') || `<tr><td colspan="${days+3}">لا يوجد توزيع لهذا الشهر</td></tr>`;
    const sum=$('attendanceMatrixSummary'); if(sum) sum.innerHTML=`<div class="kpi"><small>عمال من التوزيع</small><b>${rows.length}</b></div><div class="kpi"><small>إجمالي الحضور</small><b>${totalP}</b></div><div class="kpi"><small>إجمالي الغياب</small><b>${totalA}</b></div><div class="kpi"><small>المصدر</small><b>التوزيع الحالي</b></div>`;
  }
  async function reload(){ state.dist=[]; state.attendance=[]; await load(monthOf($('attendanceDate')?.value||today()),true); await renderAttendanceWorkersQuick(); await renderAttendance(); await renderAttendanceMonthly(); msg('تم التحديث من التوزيع الحالي'); }
  function bind(){
    installStyle();
    const d=$('attendanceDate'); if(d && !d.value) d.value=today();
    const fd=$('attendanceFilterDate'); if(fd && !fd.value) fd.value=d?.value||today();
    ['attendanceDate','attendanceSupervisor'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(renderAttendanceWorkersQuick,50)));
    ['attendanceFilterDate','attendanceFilterSupervisor'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(renderAttendance,50)));
    ['attendanceMatrixMonth','attendanceMatrixSupervisor'].forEach(id=>$(id)?.addEventListener('change',()=>setTimeout(renderAttendanceMonthly,50)));
    ['attendanceSearch','attendanceMatrixSearch'].forEach(id=>$(id)?.addEventListener('input',()=>{setTimeout(()=>{renderAttendanceWorkersQuick();renderAttendance();renderAttendanceMonthly();},120)}));
  }
  window.renderAttendanceWorkersQuick=renderAttendanceWorkersQuick;
  window.renderAttendance=renderAttendance;
  window.renderAttendanceMonthly=renderAttendanceMonthly;
  window.saveAttendance=saveAll;
  window.tasneefAttendanceDistributionV421={renderAttendanceWorkersQuick,renderAttendance,renderAttendanceMonthly,saveAll,markAll,cardChanged,reload,editFromRow};
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{bind(); reload();},1200));
  window.addEventListener('load',()=>setTimeout(()=>{bind(); reload();},1600));
  console.log('Tasneef '+BUILD+' loaded');
})();
