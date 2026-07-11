(function(){
  'use strict';
  if(window.__tasneefCoreSalaryTabV436) return;
  window.__tasneefCoreSalaryTabV436=true;
  const $=id=>document.getElementById(id);
  function msg(t){const el=$('cu413Msg'); if(el){el.textContent=t; el.style.display='block';}}
  function ensureTab(){
    const root=$('coreUnified'); if(!root) return false;
    const tabs=root.querySelector('.cu413-tabs'); if(!tabs) return false;
    if(!root.querySelector('[data-tab="salaries"]')){
      const b=document.createElement('button'); b.type='button'; b.dataset.tab='salaries'; b.textContent='الرواتب'; tabs.appendChild(b);
    }
    if(!$('cu413SalariesTab')){
      const d=document.createElement('div'); d.id='cu413SalariesTab'; d.className='hidden'; root.appendChild(d);
    }
    root.querySelectorAll('[data-tab]').forEach(b=>{
      if(b.__salaryV436Bound) return;
      b.__salaryV436Bound=true;
      b.addEventListener('click',()=>{
        if(b.dataset.tab==='salaries') setTimeout(showSalary,40);
        else hideSalary();
      });
    });
    return true;
  }
  function hideSalary(){
    const tab=$('cu413SalariesTab'); if(tab) tab.classList.add('hidden');
  }
  function showSalary(){
    if(!ensureTab()) return;
    const root=$('coreUnified');
    root.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active', b.dataset.tab==='salaries'));
    ['Workers','Projects','Distribution','Attendance'].forEach(x=>$('cu413'+x+'Tab')?.classList.add('hidden'));
    const tab=$('cu413SalariesTab'); tab.classList.remove('hidden');
    tab.innerHTML='<div class="cu413-card"><div id="cu413SalaryMount"></div></div>';
    const mount=$('cu413SalaryMount');
    if(!window.tasneefSalariesUnifiedV435){ mount.innerHTML='<div class="cu413-msg">ملف الرواتب لم يتم تحميله بعد. حدّث الصفحة.</div>'; return; }
    try{
      window.tasneefSalariesUnifiedV435.inject();
      const sal=$('salaries');
      if(sal){
        sal.classList.add('hidden');
        // انقل محتوى قسم الرواتب داخل تبويب النظام الموحد حتى تظهر هنا وليس كصفحة منفصلة.
        mount.innerHTML='';
        while(sal.firstChild) mount.appendChild(sal.firstChild);
      }
      setTimeout(()=>window.tasneefSalariesUnifiedV435.load(),80);
      msg('تم فتح الرواتب من مصدر النظام الموحد.');
    }catch(e){ mount.innerHTML='<div class="cu413-msg" style="background:#fee;color:#922">تعذر فتح الرواتب: '+(e.message||e)+'</div>'; }
  }
  function patch(){
    if(!ensureTab()) return;
    // لو المستخدم كان داخل تبويب الرواتب قبل إعادة رسم النظام الموحد، ثبته.
    const active=document.querySelector('#coreUnified .cu413-tabs [data-tab="salaries"].active');
    if(active) showSalary();
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,1300));
  window.addEventListener('load',()=>setTimeout(patch,1600));
  setInterval(patch,1800);
  window.tasneefCoreSalaryTabV436={show:showSalary,patch};
})();
