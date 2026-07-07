const $ = (s)=>document.querySelector(s);

let currentSection = 'البريد الوارد';
let dashboardTab = 'pnl';

const navData = [
  {id:'start',label:'ابدأ الآن',icon:'🚀'},
  {id:'inbox',label:'البريد الوارد',icon:'✉'},
  {id:'dashboard',label:'لوحة البيانات',icon:'▦'},
  {id:'reports',label:'التقارير',icon:'▥'},
  {group:true,label:'المبيعات',icon:'＄',open:true,children:[
    'عروض أسعار و فواتير مبدئية',
    'فواتير بيع',
    'سندات العملاء',
    'فواتير مجدولة',
    'إشعارات دائنة',
    'فواتير نقدية',
    'إشعارات تسليم',
    'فواتير بيع من الـ API'
  ]},
  {group:true,label:'المشتريات',icon:'🛒',children:['طلبات الشراء','فواتير الموردين','سندات الصرف','اعتمادات الشراء']},
  {group:true,label:'العملاء والموردين',icon:'👥',children:['العملاء','الموردين','جهات الاتصال','الأرصدة']},
  {group:true,label:'الرواتب والموظفين',icon:'♙',children:['الموظفين','الحضور','مسير الرواتب','الأوفر تايم']},
  {group:true,label:'منتجات، خدمات، مخزون',icon:'▣',children:['الأصناف','طلبات الصرف','العهد','الجرد','التحويلات','طلبات الشراء']},
  {divider:true},
  {group:true,label:'للمحاسب',icon:'▧',children:['القيود اليومية','دليل الحسابات','ميزان المراجعة','قفل الفترات']},
  {id:'banks',label:'الحسابات البنكية',icon:'🏦'},
  {id:'assets',label:'الأصول الثابتة',icon:'▤'},
  {id:'costcenters',label:'مراكز التكلفة',icon:'◇'},
  {id:'projects',label:'المشاريع',icon:'▰'},
  {id:'branches',label:'الفروع',icon:'⌘'},
  {divider:true},
  {group:true,label:'للمطورين',icon:'⌨',children:['API','Webhooks','سجل النظام']},
  {id:'integrations',label:'التكاملات',icon:'⇄'},
  {id:'templates',label:'القوالب',icon:'□'},
  {id:'help',label:'مركز المساعدة',icon:'?'}
];

function renderNav(){
  $('#nav').innerHTML = navData.map((n)=>{
    if(n.divider) return '<div class="nav-divider"></div>';
    if(n.group) return `<div class="nav-group ${n.open?'open':''}">
      <button class="nav-group-btn" onclick="toggleGroup(this)">
        <span class="nav-ico">${n.icon}</span><span>${n.label}</span><span class="chev">‹</span>
      </button>
      <div class="sub-menu">${n.children.map(c=>`<button onclick="openSection('${c}')">${c}</button>`).join('')}</div>
    </div>`;
    return `<button class="nav-item ${currentSection===n.label?'active':''}" onclick="openSection('${n.label}')">
      <span class="nav-ico">${n.icon||''}</span><span>${n.label}</span><span></span>
    </button>`;
  }).join('');
}

function toggleGroup(btn){
  btn.parentElement.classList.toggle('open');
}

function openSection(name){
  currentSection = name;
  renderNav();
  closeModal();

  if(name === 'البريد الوارد') return renderInbox();
  if(name === 'لوحة البيانات') return renderDashboard(dashboardTab || 'pnl');
  if(name === 'الحسابات البنكية') return renderBankAccounts();

  return renderSmartWindow(name);
}

function renderInbox(){
  $('#content').className = 'work-layout';
  $('#content').innerHTML = `
    <section class="document-empty">
      <div class="empty-card">
        <div class="mail-illustration">
          <span class="spark s1">✦</span><span class="spark s2">✦</span><span class="spark s3">•</span>
          <div class="paper"></div><div class="envelope"><div class="flap"></div></div><div class="shadow"></div>
        </div>
        <h2>لم يتم اختيار أي مستند</h2>
        <p>اختر مستندًا من القائمة لرؤية نشاط العميل والبريد الأصلي وملاحظات الفريق.</p>
      </div>
    </section>
    <aside class="inbox-panel">
      <div class="inbox-head">
        <button class="refresh" title="تحديث">⟳</button>
        <h1>البريد الوارد</h1>
        <div class="channel-icons"><span>◉</span><span>✉</span></div>
      </div>
      <div class="inbox-search"><input placeholder="البحث" /><span>⌕</span></div>
      <div class="inbox-tabs">
        <label class="select-all"><input type="checkbox" /></label>
        <button class="active">الكل</button>
        <button>في انتظار المعالجة <span class="count">1</span></button>
        <button>تم</button>
      </div>
      <article class="message-row active">
        <input type="checkbox" />
        <div>
          <strong>مرحبًا بك في صندوق الوارد الخاص بك على تصنيف - ابدأ الآن!</strong>
          <small>منذ 9 دقائق</small>
          <em>غير معالج</em>
        </div>
      </article>
    </aside>`;
}

function renderDashboard(tab='pnl'){
  dashboardTab = tab;
  currentSection = 'لوحة البيانات';
  renderNav();
  const isPnl = tab === 'pnl';
  $('#content').className = 'dashboard-layout';
  $('#content').innerHTML = `
    <section class="dashboard-page">
      <div class="page-title-row">
        <h1>لوحة البيانات</h1>
      </div>

      <div class="dash-tabs">
        <button class="${isPnl?'active':''}" onclick="renderDashboard('pnl')">الأرباح والخسائر</button>
        <button class="${!isPnl?'active':''}" onclick="renderDashboard('cash')">التدفق النقدي</button>
      </div>

      <div class="dash-filter-row">
        <button class="filter-pill"><span>📅</span> آخر 6 أشهر</button>
        <button class="filter-pill">يناير-يوليو 2026 <span>⌄</span></button>
        <button class="filter-pill">عرض حسب الشهر <span>⌄</span></button>
      </div>

      ${isPnl ? renderPnlDashboard() : renderCashDashboard()}
    </section>`;
}

function chartIllustration(type='bars'){
  return `<div class="chart-illustration ${type}">
    <span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span><span class="bar b4"></span><span class="bar b5"></span><span class="bar b6"></span>
    <svg viewBox="0 0 240 90" aria-hidden="true">
      <polyline points="8,76 45,50 78,58 112,28 145,54 182,35 226,48" fill="none" stroke="currentColor" stroke-width="3"/>
      <circle cx="112" cy="28" r="5" fill="currentColor"/><circle cx="182" cy="35" r="5" fill="currentColor"/>
    </svg>
  </div>`;
}

function emptyTableIcon(){
  return `<div class="empty-doc"><span>▧</span><i>×</i></div>`;
}

function renderPnlDashboard(){
  return `
    <div class="analytics-grid">
      <article class="analytics-card">
        <h2>الإيرادات والأرباح والخسائر</h2>
        ${chartIllustration('bars')}
        <p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو أنشئ بعض الفواتير لعرض<br>بعض البيانات</p>
        <button class="primary-green" onclick="toast('فتح نافذة إنشاء فاتورة')">أنشئ فاتورة</button>
      </article>
      <article class="analytics-card">
        <h2>مجمل الربح</h2>
        ${chartIllustration('bars')}
        <p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو أنشئ بعض الفواتير لعرض<br>بعض البيانات</p>
        <button class="primary-green" onclick="toast('فتح نافذة إنشاء فاتورة')">أنشئ فاتورة</button>
      </article>
    </div>

    <div class="table-grid">
      ${dashboardTable('أكبر فواتير مبيعات متأخرة', ['فاتورة','أيام متأخرة','الرصيد'], 'لا توجد فواتير مبيعات متأخرة')}
      ${dashboardTable('أكبر فواتير مشتريات متأخرة', ['فاتورة المشتريات','أيام متأخرة','الرصيد'], 'لا توجد فواتير مشتريات متأخرة')}
    </div>`;
}

function renderCashDashboard(){
  return `
    <h2 class="section-title">نظرة نقدية عامة - حسابات بنك</h2>
    <div class="analytics-grid">
      <article class="analytics-card">
        <h2>الرصيد بحسب كشف الحساب</h2>
        ${chartIllustration('line')}
        <p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو قم باستيراد كشف الحساب<br>لعرض بعض البيانات</p>
        <button class="primary-green" onclick="openSection('الحسابات البنكية')">قم باستيراد كشف الحساب</button>
      </article>
      <article class="analytics-card">
        <h2>التدفق النقدي بحسب كشف الحساب</h2>
        ${chartIllustration('cash')}
        <p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو قم باستيراد كشف الحساب<br>لعرض بعض البيانات</p>
        <button class="primary-green" onclick="openSection('الحسابات البنكية')">قم باستيراد كشف الحساب</button>
      </article>
    </div>

    <div class="table-grid">
      ${dashboardTable('أكبر فواتير مبيعات غير مدفوعة', ['فاتورة','تاريخ الاستحقاق','الرصيد'], 'لا توجد فواتير مبيعات غير مدفوعة')}
      ${dashboardTable('أكبر فواتير مشتريات غير مدفوعة', ['فاتورة المشتريات','تاريخ الاستحقاق','الرصيد'], 'لا توجد فواتير مشتريات غير مدفوعة')}
    </div>`;
}

function dashboardTable(title, cols, emptyText){
  return `<article class="dash-table-card">
    <div class="table-card-head">
      <h3>${title}</h3>
      <button onclick="toast('فتح القائمة الكاملة')">عرض ‹</button>
    </div>
    <table class="dash-table">
      <thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
      <tbody><tr><td colspan="${cols.length}" class="empty-cell">${emptyTableIcon()}<p>${emptyText}</p></td></tr></tbody>
    </table>
  </article>`;
}

const bankAccountsData = [
  {name:'الحساب البنكي', icon:'🏦'},
  {name:'المصروفات النثرية', icon:'💵'},
  {name:'الخزينة', icon:'💰'}
];

function renderBankAccounts(){
  $('#content').className = 'bank-layout';
  $('#content').innerHTML = `
    <section class="bank-page">
      <div class="page-title-row bank-title-row">
        <h1>الحسابات البنكية</h1>
        <button class="add-bank-btn" onclick="toast('فتح نافذة إضافة حساب بنك')">أضف حساب بنك</button>
      </div>
      <div class="bank-cards-wrap">
        ${bankAccountsData.map(a => bankCard(a)).join('')}
      </div>
    </section>`;
}

function bankCard(a){
  return `<article class="bank-card">
    <div class="bank-card-top">
      <div class="bank-card-title-wrap">
        <div class="account-icon">${a.icon}</div>
        <h2>${a.name}</h2>
      </div>
      <div class="bank-card-actions">
        <button class="more-btn" title="المزيد">⋮</button>
        <button class="import-btn" onclick="toast('استيراد كشف حساب: ${a.name}')">استيراد كشف حساب</button>
      </div>
    </div>
    <div class="bank-metrics">
      <div class="metric-row"><strong>0.00 ﷼</strong><span>رصيد الدفتر</span></div>
      <div class="metric-row"><strong>0.00 ﷼</strong><span>رصيد كشف الحساب</span></div>
      <div class="metric-row metric-total"><strong>0.00 ﷼</strong><span>الفرق <em class="ok-badge">متوازن</em></span></div>
    </div>
  </article>`;
}

function renderSmartWindow(name){
  const modal = $('#smartModal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-head"><h2>${name}</h2><button class="close" onclick="closeModal()">إغلاق</button></div>
    <div class="smart-grid">
      <div class="smart-card"><h3>فلاتر ذكية</h3><p>فلترة حسب المشروع، الحالة، التاريخ، المسؤول، مركز التكلفة، والمستودع.</p></div>
      <div class="smart-card"><h3>قوائم منسدلة</h3><p>اختيارات جاهزة تمنع أخطاء الإدخال وتربط العملية بالمحاسبة والتشغيل.</p></div>
      <div class="smart-card"><h3>نافذة ذكية</h3><p>كل سجل يفتح تفاصيله وحركاته ومرفقاته وأثره المحاسبي من مكان واحد.</p></div>
    </div>
    <br>
    <table class="table"><thead><tr><th>السجل</th><th>الحالة</th><th>المسؤول</th><th>الإجراء</th></tr></thead><tbody>
      <tr><td>${name} - نموذج 001</td><td><span class="badge">نشط</span></td><td>مدير النظام</td><td><button class="close" onclick="toast('تم فتح النافذة الذكية')">فتح</button></td></tr>
      <tr><td>${name} - نموذج 002</td><td><span class="badge">قيد المعالجة</span></td><td>المحاسب</td><td><button class="close" onclick="toast('تم فتح النافذة الذكية')">فتح</button></td></tr>
    </tbody></table>`;
}

function closeModal(){ $('#smartModal').classList.add('hidden'); }

function toast(msg){
  const t=$('#toast');
  t.textContent=msg;
  t.classList.remove('hidden');
  setTimeout(()=>t.classList.add('hidden'),2400);
}

document.addEventListener('keydown',(e)=>{
  if((e.altKey || e.ctrlKey) && e.key.toLowerCase()==='k'){
    e.preventDefault(); $('#globalSearch').focus();
  }
});

$('#globalSearch').addEventListener('input',(e)=>{
  if(e.target.value.trim().length>1) toast('بحث ذكي عن: '+e.target.value);
});

renderNav();
renderInbox();
