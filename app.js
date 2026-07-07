
const $ = (selector) => document.querySelector(selector);

let currentSection = 'البريد الوارد';
let dashboardTab = 'pnl';
let inboxFilter = 'الكل';
let selectedMessageId = 'INB-0001';

const navData = [
  {id:'start', label:'ابدأ الآن', icon:'🚀'},
  {id:'inbox', label:'البريد الوارد', icon:'✉'},
  {id:'dashboard', label:'لوحة البيانات', icon:'▦'},
  {id:'reports', label:'التقارير', icon:'▥'},
  {id:'ops-center', label:'مركز التشغيل الميداني', icon:'▣'},
  {group:true, label:'المبيعات', icon:'＄', open:true, children:[
    'عروض أسعار و فواتير مبدئية','فواتير بيع','سندات العملاء','فواتير مجدولة',
    'إشعارات دائنة','فواتير نقدية','إشعارات تسليم','فواتير بيع من الـ API'
  ]},
  {group:true, label:'المشتريات', icon:'🛒', children:['طلبات الشراء','فواتير الموردين','سندات الصرف','اعتمادات الشراء']},
  {group:true, label:'العملاء والموردين', icon:'👥', children:['العملاء','الموردين','جهات الاتصال','الأرصدة']},
  {group:true, label:'الرواتب والموظفين', icon:'♙', children:['الموظفين','الحضور','مسير الرواتب','الأوفر تايم']},
  {group:true, label:'منتجات، خدمات، مخزون', icon:'▣', children:['الأصناف','طلبات الصرف','العهد','الجرد','التحويلات','طلبات الشراء']},
  {divider:true},
  {group:true, label:'للمحاسب', icon:'▧', children:['القيود اليومية','دليل الحسابات','ميزان المراجعة','قفل الفترات']},
  {id:'banks', label:'الحسابات البنكية', icon:'🏦'},
  {id:'assets', label:'الأصول الثابتة', icon:'▤'},
  {id:'costcenters', label:'مراكز التكلفة', icon:'◇'},
  {id:'projects', label:'المشاريع', icon:'▰'},
  {id:'branches', label:'الفروع', icon:'⌘'},
  {divider:true},
  {group:true, label:'للمطورين', icon:'⌨', children:['API','Webhooks','سجل النظام']},
  {id:'integrations', label:'التكاملات', icon:'⇄'},
  {id:'templates', label:'القوالب', icon:'□'},
  {id:'users', label:'إدارة المستخدمين', icon:'👤'},
  {id:'help', label:'مركز المساعدة', icon:'?'},
  {id:'en', label:'English', icon:'', language:true}
];

const tableSections = {
  'عروض أسعار و فواتير مبدئية': ['عرض سعر جديد',['الرقم','العميل','المشروع','الإجمالي','الحالة','الإجراء'],[['Q-0001','جمعية تجريبية','الماجدية 70','0.00 ﷼','مسودة','فتح']]],
  'فواتير بيع': ['فاتورة بيع جديدة',['الفاتورة','العميل','الاستحقاق','الإجمالي','حالة الدفع','الإجراء'],[['INV-0001','الماجدية 70','2026-07-31','0.00 ﷼','غير مدفوعة','فتح']]],
  'سندات العملاء': ['سند قبض جديد',['السند','العميل','المبلغ','طريقة الدفع','الحالة','الإجراء'],[['REC-0001','الرمز A17','0.00 ﷼','تحويل بنكي','مرحّل','فتح']]],
  'فواتير مجدولة': ['جدولة فاتورة',['الجدولة','المشروع','التكرار','تاريخ قادم','الحالة','الإجراء'],[['SCH-0001','العجلان 30','شهري','2026-08-01','نشط','فتح']]],
  'إشعارات دائنة': ['إشعار دائن',['الإشعار','العميل','الفاتورة','المبلغ','الحالة','الإجراء'],[['CN-0001','عميل تجريبي','INV-0001','0.00 ﷼','مسودة','فتح']]],
  'فواتير نقدية': ['فاتورة نقدية',['الفاتورة','الفرع','الخزينة','الإجمالي','الحالة','الإجراء'],[['CASH-0001','الرئيسي','الخزينة','0.00 ﷼','مدفوعة','فتح']]],
  'إشعارات تسليم': ['إشعار تسليم',['الإشعار','العميل','المشروع','الحالة','المسؤول','الإجراء'],[['DN-0001','الرمز A17','الرمز A17','بانتظار توقيع','المشرف','فتح']]],
  'فواتير بيع من الـ API': ['إعداد API',['المعرف','المصدر','العميل','الحالة','آخر تحديث','الإجراء'],[['API-001','تكامل خارجي','عميل تجريبي','مستلم','اليوم','فتح']]],
  'طلبات الشراء': ['طلب شراء جديد',['الطلب','المورد','المشروع','الإجمالي','الحالة','الإجراء'],[['PO-0001','مورد مواد','المخزن الرئيسي','0.00 ﷼','بانتظار اعتماد','فتح']]],
  'فواتير الموردين': ['فاتورة مورد جديدة',['الفاتورة','المورد','الاستحقاق','الإجمالي','حالة الدفع','الإجراء'],[['BILL-0001','مورد تجريبي','2026-07-31','0.00 ﷼','غير مدفوعة','فتح']]],
  'سندات الصرف': ['سند صرف جديد',['السند','المستفيد','المبلغ','الحساب','الحالة','الإجراء'],[['PAY-0001','مورد تجريبي','0.00 ﷼','الحساب البنكي','مرحّل','فتح']]],
  'اعتمادات الشراء': ['إعداد اعتماد',['الطلب','المورد','المبلغ','مرحلة الاعتماد','الحالة','الإجراء'],[['APR-0001','مورد تجريبي','0.00 ﷼','مراجعة المحاسب','بانتظار','فتح']]],
  'العملاء': ['عميل جديد',['العميل','الجوال','المشاريع','الرصيد','الحالة','الإجراء'],[['جمعية الماجدية 70','—','1','0.00 ﷼','نشط','فتح']]],
  'الموردين': ['مورد جديد',['المورد','التصنيف','الرصيد','آخر فاتورة','الحالة','الإجراء'],[['مورد مواد تنظيف','مواد','0.00 ﷼','—','نشط','فتح']]],
  'جهات الاتصال': ['جهة اتصال',['الاسم','الجهة','الجوال','البريد','النوع','الإجراء'],[['رئيس جمعية','الماجدية 70','—','—','عميل','فتح']]],
  'الأرصدة': ['تصدير Excel',['الجهة','النوع','الرصيد','0-30 يوم','31-60 يوم','الإجراء'],[['الماجدية 70','عميل','0.00 ﷼','0.00','0.00','فتح']]],
  'الموظفين': ['موظف جديد',['الموظف','الوظيفة','المشروع','الراتب','الحالة','الإجراء'],[['محمد إبراهيم','مشرف','عدة مشاريع','2300 ﷼','نشط','فتح']]],
  'مسير الرواتب': ['إنشاء مسير',['الشهر','عدد الموظفين','الإجمالي','الخصومات','الصافي','الإجراء'],[['يوليو 2026','0','0.00 ﷼','0.00 ﷼','0.00 ﷼','فتح']]],
  'الأوفر تايم': ['إضافة أوفر تايم',['الموظف','التاريخ','الساعات','القيمة','الحالة','الإجراء'],[['فهد','2026-07-01','0','0.00 ﷼','بانتظار اعتماد','فتح']]],
  'طلبات الصرف': ['طلب صرف',['الطلب','المشروع','المستلم','الأصناف','الحالة','الإجراء'],[['ISS-0001','الرمز A17','مشرف الموقع','3','بانتظار اعتماد','فتح']]],
  'العهد': ['تسليم عهدة',['العهدة','الموظف','الصنف','القيمة','الحالة','الإجراء'],[['AST-0001','مازن','عدة','0.00 ﷼','مستلمة','فتح']]],
  'الجرد': ['جلسة جرد',['الجلسة','المستودع','التاريخ','الفروقات','الحالة','الإجراء'],[['CNT-0001','المخزن الرئيسي','اليوم','0','مسودة','فتح']]],
  'التحويلات': ['تحويل جديد',['التحويل','من','إلى','الأصناف','الحالة','الإجراء'],[['TR-0001','المخزن الرئيسي','مشروع الرمز','2','بانتظار استلام','فتح']]],
  'القيود اليومية': ['قيد يدوي',['القيد','التاريخ','الوصف','مدين','دائن','الإجراء'],[['JE-0001','اليوم','قيد افتتاحي','0.00 ﷼','0.00 ﷼','فتح']]],
  'دليل الحسابات': ['حساب جديد',['الكود','الحساب','النوع','الرصيد','الحالة','الإجراء'],[['1000','الأصول','أصل','0.00 ﷼','نشط','فتح']]],
  'ميزان المراجعة': ['تصدير PDF',['الحساب','افتتاحي','مدين','دائن','الرصيد','الإجراء'],[['الإيرادات','0.00','0.00','0.00','0.00','عرض']]],
  'قفل الفترات': ['قفل شهر',['الفترة','الحالة','تاريخ القفل','المسؤول','ملاحظات','الإجراء'],[['يوليو 2026','مفتوحة','—','مدير النظام','—','قفل']]],
  'الأصول الثابتة': ['أصل جديد',['الأصل','التصنيف','القيمة','الإهلاك','الحالة','الإجراء'],[['سيارة تشغيل','مركبات','0.00 ﷼','0.00 ﷼','نشط','فتح']]],
  'مراكز التكلفة': ['مركز تكلفة',['الكود','المركز','النوع','الإيرادات','المصروفات','الإجراء'],[['CC-001','مشاريع التشغيل','مشروع','0.00 ﷼','0.00 ﷼','فتح']]],
  'الفروع': ['فرع جديد',['الفرع','المدينة','المدير','الحساب البنكي','الحالة','الإجراء'],[['الفرع الرئيسي','الرياض','مدير النظام','الحساب البنكي','نشط','فتح']]],
  'سجل النظام': ['تصدير السجل',['الوقت','المستخدم','القسم','العملية','IP','الإجراء'],[['اليوم','مدير النظام','النظام','فتح شاشة','127.0.0.1','عرض']]]
};

let inboxMessages = [];

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
}

async function loadInbox(){
  inboxMessages = await TasneefAPI.list('inbox');
}

function renderNav(){
  const nav = $('#nav');
  if(!nav) return;
  nav.innerHTML = navData.map(n => {
    if(n.divider) return '<div class="nav-divider"></div>';
    if(n.group){
      return `<div class="nav-group ${n.open ? 'open' : ''}">
        <button class="nav-group-btn" onclick="toggleGroup(this)">
          <span class="nav-ico">${n.icon}</span><span>${n.label}</span><span class="chev">‹</span>
        </button>
        <div class="sub-menu">${n.children.map(c => `<button onclick="openSection('${escapeHtml(c)}')">${escapeHtml(c)}</button>`).join('')}</div>
      </div>`;
    }
    return `<button class="nav-item ${currentSection === n.label ? 'active' : ''} ${n.language ? 'language' : ''}" onclick="openSection('${escapeHtml(n.label)}')">
      <span class="nav-ico">${n.icon || ''}</span><span>${n.label}</span><span></span>
    </button>`;
  }).join('');
}

function toggleGroup(btn){
  const group = btn.closest('.nav-group');
  if(group) group.classList.toggle('open');
}

function setSection(name){
  currentSection = name;
  renderNav();
  closeModal();
}

async function openSection(name){
  setSection(name);
  if(name === 'البريد الوارد') return renderInbox();
  if(name === 'لوحة البيانات') return renderDashboard(dashboardTab);
  if(name === 'مركز التشغيل الميداني') return renderLegacyOperationsCenter();
  if(name === 'الحسابات البنكية') return renderBankAccounts();
  if(name === 'التقارير') return renderReports();
  if(name === 'الحضور') return renderAttendance();
  if(name === 'الأصناف') return renderInventory();
  if(name === 'المشاريع') return renderProjects();
  if(name === 'التكاملات') return renderCards('التكاملات','ربط واتساب، البريد، الفوترة الإلكترونية، والبنوك.', 'تكامل جديد', [['ZATCA','تجهيز للفوترة الإلكترونية والـ QR.','قيد الإعداد'],['WhatsApp','إرسال التقارير والفواتير للعملاء.','قيد الإعداد'],['Bank Feed','استيراد كشوف الحساب البنكية.','قيد الإعداد']]);
  if(name === 'القوالب') return renderCards('القوالب','قوالب PDF ورسائل واتساب وبريد إلكتروني.', 'قالب جديد', [['فاتورة ضريبية','قالب فاتورة بيع PDF.','نشط'],['تقرير عميل','قالب تقرير تشغيل PDF.','نشط'],['رسالة واتساب','قوالب إرسال للعملاء.','نشط']]);
  if(name === 'إدارة المستخدمين') return renderUserManagement();
  if(name === 'مركز المساعدة') return renderCards('مركز المساعدة','إرشادات استخدام النظام والدعم.', 'طلب دعم', [['بدء استخدام النظام','شرح إعداد الشركة والصلاحيات.','عرض'],['المحاسبة والفواتير','شرح الفواتير والسندات والقيود.','عرض'],['المخزون والعهد','شرح الطلبات والجرد والتحويلات.','عرض']]);
  if(tableSections[name]) return renderTablePage(name);
  return renderFallback(name);
}

function page(contentClass, innerHtml){
  const content = $('#content');
  if(!content) return;
  content.className = contentClass;
  content.innerHTML = innerHtml;
}

async function renderInboxOld(){
  await loadInbox();
  page('smart-inbox-layout', `
    <section class="inbox-detail-panel" id="inboxDetail"></section>
    <aside class="smart-inbox-panel">
      <div class="smart-inbox-head">
        <div><h1>البريد الوارد</h1><p>مركز معالجة ذكي للرسائل والفواتير والكشوف والتكتات والطلبات.</p></div>
        <button class="refresh" onclick="renderInbox();toast('تم تحديث البريد الوارد')">⟳</button>
      </div>
      <div class="smart-inbox-search"><span>⌕</span><input id="inboxSearchInput" placeholder="ابحث في البريد الوارد..." oninput="renderInboxList()" /></div>
      <div class="inbox-category-tabs">
        ${['الكل','غير معالج','بانتظار المعالجة','فواتير','كشوف بنكية','تكتات','طلبات مخزن','موافقات','تنبيهات','مؤرشف'].map(t => `<button class="${inboxFilter===t?'active':''}" onclick="setInboxFilter('${t}')">${t}${countBadge(t)}</button>`).join('')}
      </div>
      <div class="inbox-filter-row">
        <button class="mini-filter">من تاريخ <span>⌄</span></button>
        <button class="mini-filter">المشروع <span>⌄</span></button>
        <button class="mini-filter">المسؤول <span>⌄</span></button>
        <button class="mini-filter">مرفقات <span>⌄</span></button>
      </div>
      <div class="smart-message-list" id="smartInboxList"></div>
    </aside>
  `);
  if(!inboxMessages.some(m => m.id === selectedMessageId) && inboxMessages[0]) selectedMessageId = inboxMessages[0].id;
  renderInboxList();
  renderInboxDetail(selectedMessageId);
}

function countBadge(filter){
  const count = filterMessages(filter).length;
  if(filter === 'الكل') return ` <span>${inboxMessages.length}</span>`;
  return count ? ` <span>${count}</span>` : '';
}

function filterMessages(filter){
  if(filter === 'الكل') return inboxMessages;
  if(filter === 'غير معالج') return inboxMessages.filter(m => m.status === 'غير معالج');
  if(filter === 'بانتظار المعالجة') return inboxMessages.filter(m => m.status === 'بانتظار المعالجة');
  if(filter === 'فواتير') return inboxMessages.filter(m => m.type.includes('فاتورة'));
  if(filter === 'كشوف بنكية') return inboxMessages.filter(m => m.type === 'كشف بنكي');
  if(filter === 'تكتات') return inboxMessages.filter(m => m.type === 'تكت صيانة');
  if(filter === 'طلبات مخزن') return inboxMessages.filter(m => m.type === 'طلب مخزن');
  if(filter === 'موافقات') return inboxMessages.filter(m => m.type === 'موافقة');
  if(filter === 'تنبيهات') return inboxMessages.filter(m => m.type === 'تنبيه');
  if(filter === 'مؤرشف') return inboxMessages.filter(m => m.status === 'مؤرشف');
  return inboxMessages;
}

function setInboxFilterOld(filter){
  inboxFilter = filter;
  renderInbox();
}

function renderInboxListOld(){
  const box = $('#smartInboxList');
  if(!box) return;
  const query = ($('#inboxSearchInput')?.value || '').trim().toLowerCase();
  let list = filterMessages(inboxFilter);
  if(query){
    list = list.filter(m => [m.title,m.from,m.type,m.project,m.assignee,m.status].join(' ').toLowerCase().includes(query));
  }
  if(!list.length){
    box.innerHTML = '<div class="empty-inbox-list">لا توجد رسائل مطابقة للفلاتر الحالية</div>';
    return;
  }
  box.innerHTML = list.map(m => `
    <article class="smart-message-row ${m.id === selectedMessageId ? 'active' : ''}" onclick="selectInboxMessage('${m.id}')">
      <div class="message-check"><input type="checkbox" onclick="event.stopPropagation()" /></div>
      <div class="message-main">
        <div class="message-title-line"><strong>${escapeHtml(m.title)}</strong><span class="priority ${priorityClass(m.priority)}">${escapeHtml(m.priority)}</span></div>
        <p>${escapeHtml(m.from)} · ${escapeHtml(m.project)}</p>
        <div class="message-meta"><em class="${statusClass(m.status)}">${escapeHtml(m.status)}</em><span>${escapeHtml(m.type)}</span><span>${escapeHtml(m.time)}</span></div>
      </div>
    </article>
  `).join('');
}

function selectInboxMessage(id){
  selectedMessageId = id;
  renderInboxList();
  renderInboxDetail(id);
}

function getMessage(id){
  return inboxMessages.find(m => m.id === id) || inboxMessages[0];
}

function renderInboxDetail(id){
  const m = getMessage(id);
  const detail = $('#inboxDetail');
  if(!detail || !m) return;
  detail.innerHTML = `
    <div class="detail-topbar">
      <div><h2>${escapeHtml(m.title)}</h2><p>${escapeHtml(m.from)} · ${escapeHtml(m.time)}</p></div>
      <div class="detail-status"><span class="${statusClass(m.status)}">${escapeHtml(m.status)}</span><button onclick="archiveInboxMessage('${m.id}')">أرشفة</button></div>
    </div>
    <div class="inbox-smart-summary">
      <div class="summary-icon">${typeIcon(m.type)}</div>
      <div><h3>اقتراح النظام</h3><p>${escapeHtml(m.suggested)}</p></div>
    </div>
    <div class="detail-grid">
      <div class="detail-card"><span>نوع الرسالة</span><strong>${escapeHtml(m.type)}</strong></div>
      <div class="detail-card"><span>المشروع</span><strong>${escapeHtml(m.project)}</strong></div>
      <div class="detail-card"><span>المسؤول</span><strong>${escapeHtml(m.assignee)}</strong></div>
      <div class="detail-card"><span>الأولوية</span><strong>${escapeHtml(m.priority)}</strong></div>
    </div>
    <div class="message-body-card"><h3>محتوى الرسالة</h3><p>${escapeHtml(m.body)}</p></div>
    <div class="attachment-card"><div><h3>المرفقات</h3><p>${m.attachment === '—' ? 'لا توجد مرفقات' : escapeHtml(m.attachment)}</p></div>${m.attachment === '—' ? '' : `<button onclick="toast('فتح المرفق')">عرض المرفق</button>`}</div>
    <div class="inbox-actions">${actionButtons(m)}</div>
    <div class="notes-activity-grid">
      <div class="internal-notes"><h3>ملاحظات داخلية</h3><textarea id="internalNote" placeholder="اكتب ملاحظة للفريق..."></textarea><button onclick="addInboxNote('${m.id}')">إضافة ملاحظة</button></div>
      <div class="activity-log"><h3>سجل المعالجة</h3>${(m.activity || []).map(a => `<div><span>•</span><p>${escapeHtml(a)}</p></div>`).join('')}</div>
    </div>
  `;
}

function actionButtons(m){
  const common = `<button class="secondary-action" onclick="assignInboxMessage('${m.id}')">تعيين مسؤول</button><button class="secondary-action" onclick="changeInboxStatus('${m.id}','قيد المراجعة')">قيد المراجعة</button>`;
  if(m.type === 'فاتورة مورد') return `<button class="main-action" onclick="createFromInbox('${m.id}','فاتورة مورد')">إنشاء فاتورة مورد</button><button class="secondary-action" onclick="openSection('الموردين')">ربط بمورد</button><button class="secondary-action" onclick="openSection('المشاريع')">ربط بمشروع</button>${common}`;
  if(m.type === 'تكت صيانة') return `<button class="main-action" onclick="createFromInbox('${m.id}','تكت صيانة')">إنشاء تكت</button><button class="secondary-action" onclick="openSection('المشاريع')">ربط بمشروع</button><button class="secondary-action" onclick="assignInboxMessage('${m.id}')">تعيين فني</button><button class="secondary-action" onclick="toast('تم تجهيز رد واتساب')">رد واتساب</button>`;
  if(m.type === 'كشف بنكي') return `<button class="main-action" onclick="createFromInbox('${m.id}','كشف حساب بنكي')">استيراد كشف الحساب</button><button class="secondary-action" onclick="openSection('الحسابات البنكية')">ربط بحساب بنكي</button><button class="secondary-action" onclick="toast('فتح المطابقة البنكية')">مطابقة المدفوعات</button>${common}`;
  if(m.type === 'طلب مخزن') return `<button class="main-action" onclick="createFromInbox('${m.id}','طلب صرف')">إنشاء طلب صرف</button><button class="secondary-action" onclick="openSection('الأصناف')">فحص المخزون</button><button class="secondary-action" onclick="openSection('المشاريع')">ربط بمشروع</button>${common}`;
  if(m.type === 'موافقة') return `<button class="main-action" onclick="changeInboxStatus('${m.id}','مكتمل')">اعتماد</button><button class="secondary-action" onclick="toast('تم إرجاعها للمحاسب')">إرجاع للمحاسب</button><button class="secondary-action" onclick="openSection('فواتير بيع')">فتح الفاتورة</button>`;
  return `<button class="main-action" onclick="openSection('المشاريع')">مراجعة</button>${common}`;
}

async function createFromInbox(id, target){
  const m = getMessage(id);
  const activity = [...(m.activity || []), 'تم تحويل الرسالة إلى: ' + target];
  await TasneefAPI.update('inbox', id, {status:'تم التحويل', activity});
  await TasneefAPI.saveModuleRecord(target, {title:target + ' من البريد الوارد', sourceInboxId:id, project:m.project, status:'مسودة'});
  await loadInbox();
  renderInboxList();
  renderInboxDetail(id);
  openUniversalWindow(target + ' من البريد الوارد', 'تم إنشاء هذا السجل من الرسالة: ' + m.title, target);
}

async function changeInboxStatus(id, status){
  const m = getMessage(id);
  const activity = [...(m.activity || []), 'تم تغيير الحالة إلى: ' + status];
  await TasneefAPI.update('inbox', id, {status, activity});
  await loadInbox();
  renderInboxList();
  renderInboxDetail(id);
  toast('تم تحديث حالة الرسالة');
}

function archiveInboxMessage(id){ changeInboxStatus(id, 'مؤرشف'); }

async function addInboxNote(id){
  const note = $('#internalNote')?.value?.trim();
  if(!note) return toast('اكتب الملاحظة أولاً');
  const m = getMessage(id);
  const activity = [...(m.activity || []), 'ملاحظة: ' + note];
  await TasneefAPI.update('inbox', id, {activity});
  await loadInbox();
  renderInboxDetail(id);
  toast('تم حفظ الملاحظة');
}

function assignInboxMessage(id){
  const m = getMessage(id);
  openUniversalWindow('تعيين مسؤول - ' + m.title, 'اختر المسؤول المناسب لمعالجة هذه الرسالة.', 'تعيين مسؤول');
}

function typeIcon(type){ return type.includes('فاتورة') ? '🧾' : type === 'كشف بنكي' ? '🏦' : type === 'تكت صيانة' ? '🛠' : type === 'طلب مخزن' ? '📦' : type === 'موافقة' ? '✅' : '⚠'; }
function priorityClass(p){ return p === 'عالية' ? 'high' : p === 'متوسطة' ? 'medium' : 'low'; }
function statusClass(s){
  if(s === 'غير معالج' || s === 'يحتاج إجراء') return 'status-open';
  if(s === 'بانتظار المعالجة' || s === 'قيد المراجعة') return 'status-wait';
  if(s === 'تم التحويل' || s === 'مكتمل') return 'status-done';
  if(s === 'مؤرشف') return 'status-archived';
  return 'status-wait';
}

async function renderTablePageOld(name){
  const [action, columns, rows] = tableSections[name];
  const saved = await TasneefAPI.moduleRecords(name);
  const dynamicRows = saved.map(x => [x.title || x.name || x.id, x.project || '—', x.status || 'مسودة', x.createdAt ? new Date(x.createdAt).toLocaleDateString('ar-SA') : '—', x.total || '0.00 ﷼', 'فتح']);
  const allRows = [...dynamicRows, ...rows];
  page('module-layout', `
    <section class="module-page">
      <div class="module-header"><div><h1>${name}</h1><p>شاشة احترافية لإدارة ${name} مع فلاتر ونوافذ ذكية وحفظ محلي/سيرفر.</p></div><button class="module-primary" onclick="openUniversalWindow('${action}','نموذج إنشاء جديد','${name}')">${action}</button></div>
      ${filterBar(['الحالة','الفترة','المشروع','المسؤول'])}
      ${statsRow([['إجمالي السجلات', allRows.length], ['محفوظة', saved.length], ['قيد المعالجة','1'], ['آخر تحديث','الآن']])}
      <div class="pro-table-card"><table class="pro-table"><thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${allRows.map(r => `<tr>${r.map((c,i) => `<td>${i === r.length-1 ? `<button class="table-action" onclick="openUniversalWindow('${name} - ${escapeHtml(r[0])}','تفاصيل السجل والحركات والمرفقات','${name}')">${c}</button>` : escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    </section>
  `);
}

function filterBar(filters){
  return `<div class="module-filterbar"><div class="module-search"><span>⌕</span><input placeholder="بحث سريع..." oninput="quickFilter(this.value)" /></div>${filters.map(f => `<button class="filter-chip">${f} <span>⌄</span></button>`).join('')}<button class="filter-chip clear" onclick="toast('تم تصفير الفلاتر')">تصفير</button></div>`;
}

function statsRow(stats){
  return `<div class="stats-row">${stats.map(s => `<div class="stat-card"><span>${s[0]}</span><strong>${s[1]}</strong></div>`).join('')}</div>`;
}

function renderDashboard(tab){
  dashboardTab = tab || 'pnl';
  const isPnl = dashboardTab === 'pnl';
  page('dashboard-layout', `
    <section class="dashboard-page">
      <div class="page-title-row"><h1>لوحة البيانات</h1></div>
      <div class="dash-tabs"><button class="${isPnl?'active':''}" onclick="renderDashboard('pnl')">الأرباح والخسائر</button><button class="${!isPnl?'active':''}" onclick="renderDashboard('cash')">التدفق النقدي</button></div>
      <div class="dash-filter-row"><button class="filter-pill"><span>📅</span> آخر 6 أشهر</button><button class="filter-pill">يناير-يوليو 2026 <span>⌄</span></button><button class="filter-pill">عرض حسب الشهر <span>⌄</span></button></div>
      ${isPnl ? renderPnlDashboard() : renderCashDashboard()}
    </section>
  `);
}

const legacyModules = [
  {id:'admin', title:'لوحة الإدارة', desc:'إدارة التشغيل، الطلبات، العقود، المخزون، المالية، الصلاحيات والتقارير.', page:'legacy_app/admin.html'},
  {id:'supervisor', title:'بوابة المشرف', desc:'متابعة الفرق الميدانية والطلبات اليومية وتحديث الحالات.', page:'legacy_app/supervisor.html'},
  {id:'technician', title:'بوابة الفني', desc:'استلام المهام والتذاكر وتسجيل التنفيذ من الجوال.', page:'legacy_app/technician.html'},
  {id:'client', title:'تقارير العملاء', desc:'إصدار تقارير خدمات العملاء ومرفقات قبل/بعد التنفيذ.', page:'legacy_app/client-report.html'},
  {id:'login', title:'دخول النظام الميداني', desc:'صفحة الدخول الأصلية للتطبيق الميداني عند الحاجة.', page:'legacy_app/index.html'}
];

function renderLegacyOperationsCenter(activeId='admin'){
  const active = legacyModules.find(x => x.id === activeId) || legacyModules[0];
  page('module-layout ops-layout', `<section class="module-page ops-page">
    <div class="module-header">
      <div><h1>مركز التشغيل الميداني</h1><p>تم ربط النسخة التشغيلية الجديدة داخل واجهة ERP بنفس الهوية، ويمكن فتح كل بواباتها من هنا.</p></div>
      <button class="module-primary" onclick="window.open('${active.page}','_blank')">فتح في نافذة</button>
    </div>
    <div class="ops-module-grid">
      ${legacyModules.map(m => `<article class="ops-module-card ${m.id === active.id ? 'active' : ''}" onclick="renderLegacyOperationsCenter('${m.id}')"><strong>${m.title}</strong><p>${m.desc}</p></article>`).join('')}
    </div>
    <div class="ops-frame-shell">
      <div class="ops-frame-head">
        <div><strong>${active.title}</strong><span>${active.desc}</span></div>
        <button class="table-action" onclick="document.getElementById('legacyFrame').contentWindow.location.reload()">تحديث</button>
      </div>
      <iframe id="legacyFrame" class="ops-frame" src="${active.page}" title="${active.title}"></iframe>
    </div>
  </section>`);
}

function chartIllustration(type){
  return `<div class="chart-illustration ${type || 'bars'}"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span><span class="bar b4"></span><span class="bar b5"></span><span class="bar b6"></span><svg viewBox="0 0 240 90"><polyline points="8,76 45,50 78,58 112,28 145,54 182,35 226,48" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="112" cy="28" r="5" fill="currentColor"/><circle cx="182" cy="35" r="5" fill="currentColor"/></svg></div>`;
}

function emptyTableIcon(){ return `<div class="empty-doc"><span>▧</span><i>×</i></div>`; }

function dashTable(title, cols, emptyText){
  return `<article class="dash-table-card"><div class="table-card-head"><h3>${title}</h3><button onclick="toast('فتح القائمة الكاملة')">عرض ‹</button></div><table class="dash-table"><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody><tr><td colspan="${cols.length}" class="empty-cell">${emptyTableIcon()}<p>${emptyText}</p></td></tr></tbody></table></article>`;
}

function renderPnlDashboard(){
  return `<div class="analytics-grid">
    <article class="analytics-card"><h2>الإيرادات والأرباح والخسائر</h2>${chartIllustration('bars')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو أنشئ بعض الفواتير لعرض<br>بعض البيانات</p><button class="primary-green" onclick="openSection('فواتير بيع')">أنشئ فاتورة</button></article>
    <article class="analytics-card"><h2>مجمل الربح</h2>${chartIllustration('bars')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو أنشئ بعض الفواتير لعرض<br>بعض البيانات</p><button class="primary-green" onclick="openSection('فواتير بيع')">أنشئ فاتورة</button></article>
  </div><div class="table-grid">${dashTable('أكبر فواتير مبيعات متأخرة',['فاتورة','أيام متأخرة','الرصيد'],'لا توجد فواتير مبيعات متأخرة')}${dashTable('أكبر فواتير مشتريات متأخرة',['فاتورة المشتريات','أيام متأخرة','الرصيد'],'لا توجد فواتير مشتريات متأخرة')}</div>`;
}

function renderCashDashboard(){
  return `<h2 class="section-title">نظرة نقدية عامة - حسابات بنك</h2>
    <div class="analytics-grid">
      <article class="analytics-card"><h2>الرصيد بحسب كشف الحساب</h2>${chartIllustration('line')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو قم باستيراد كشف الحساب<br>لعرض بعض البيانات</p><button class="primary-green" onclick="openSection('الحسابات البنكية')">قم باستيراد كشف الحساب</button></article>
      <article class="analytics-card"><h2>التدفق النقدي بحسب كشف الحساب</h2>${chartIllustration('cash')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو قم باستيراد كشف الحساب<br>لعرض بعض البيانات</p><button class="primary-green" onclick="openSection('الحسابات البنكية')">قم باستيراد كشف الحساب</button></article>
    </div><div class="table-grid">${dashTable('أكبر فواتير مبيعات غير مدفوعة',['فاتورة','تاريخ الاستحقاق','الرصيد'],'لا توجد فواتير مبيعات غير مدفوعة')}${dashTable('أكبر فواتير مشتريات غير مدفوعة',['فاتورة المشتريات','تاريخ الاستحقاق','الرصيد'],'لا توجد فواتير مشتريات غير مدفوعة')}</div>`;
}

async function renderBankAccountsOld(){
  const accounts = await TasneefAPI.list('bankAccounts');
  page('bank-layout', `<section class="bank-page"><div class="page-title-row bank-title-row"><h1>الحسابات البنكية</h1><button class="add-bank-btn" onclick="openUniversalWindow('أضف حساب بنك','نموذج إضافة حساب بنكي','bankAccounts')">أضف حساب بنك</button></div><div class="bank-cards-wrap">${accounts.map(a => `<article class="bank-card"><div class="bank-card-top"><div class="bank-card-title-wrap"><div class="account-icon">${a.type === 'bank' ? '🏦' : a.type === 'petty_cash' ? '💵' : '💰'}</div><h2>${escapeHtml(a.name)}</h2></div><div class="bank-card-actions"><button class="more-btn">⋮</button><button class="import-btn" onclick="importBankStatement('${a.id}','${escapeHtml(a.name)}')">استيراد كشف حساب</button></div></div><div class="bank-metrics"><div class="metric-row"><strong>${Number(a.bookBalance||0).toFixed(2)} ﷼</strong><span>رصيد الدفتر</span></div><div class="metric-row"><strong>${Number(a.statementBalance||0).toFixed(2)} ﷼</strong><span>رصيد كشف الحساب</span></div><div class="metric-row metric-total"><strong>${(Number(a.bookBalance||0)-Number(a.statementBalance||0)).toFixed(2)} ﷼</strong><span>الفرق <em class="ok-badge">متوازن</em></span></div></div></article>`).join('')}</div></section>`);
}

async function importBankStatement(id, name){
  await TasneefAPI.importBankStatement(id, 'statement.xlsx');
  toast('تم استيراد كشف حساب: ' + name);
}

function renderReports(){
  const reports = ['تقرير ربح وخسارة','ميزان مراجعة','تقرير ضريبة القيمة المضافة','ربحية المشاريع','تقرير المخزون','تقرير الحضور','مسير الرواتب','تقرير التكتات'];
  page('module-layout', `<section class="module-page"><div class="module-header"><div><h1>التقارير</h1><p>مركز التقارير المالية والتشغيلية بصيغة PDF و Excel.</p></div><button class="module-primary" onclick="toast('إنشاء تقرير')">إنشاء تقرير</button></div>${filterBar(['القسم','الفترة','الصيغة','المستخدم'])}<div class="report-grid">${reports.map(r => `<article class="report-card"><div class="report-icon">▤</div><h3>${r}</h3><p>تقرير جاهز للتصدير مع فلاتر ذكية.</p><button onclick="toast('تجهيز تقرير ${r}')">تشغيل التقرير</button></article>`).join('')}</div></section>`);
}

function renderInventory(){
  const items = [['مواد تنظيف','SKU-CLN','المخزن الرئيسي','متاح'],['لمبات ومواد كهرباء','SKU-ELE','المخزن الرئيسي','تحت الحد'],['عدد وأدوات','SKU-TLS','عهدة','متاح']];
  page('module-layout', `<section class="module-page"><div class="module-header"><div><h1>الأصناف</h1><p>منتجات وخدمات ومخزون مع SKU وباركود وحد أدنى.</p></div><button class="module-primary" onclick="openUniversalWindow('صنف جديد','نموذج صنف مخزون','الأصناف')">صنف جديد</button></div>${filterBar(['المستودع','التصنيف','الحالة','تحت الحد'])}${statsRow([['الأصناف','0'],['تحت الحد','0'],['محجوز','0'],['قيمة المخزون','0.00 ﷼']])}<div class="inventory-grid">${items.map(i => `<article class="inventory-card" onclick="openUniversalWindow('${i[0]}','تفاصيل الصنف وحركات المخزون','الأصناف')"><div class="sku-box">▦</div><h3>${i[0]}</h3><p>${i[1]} · ${i[2]}</p><span class="status-pill">${i[3]}</span><div class="inv-actions"><button onclick="event.stopPropagation();toast('صرف')">صرف</button><button onclick="event.stopPropagation();toast('استلام')">استلام</button><button onclick="event.stopPropagation();toast('تحويل')">تحويل</button></div></article>`).join('')}</div></section>`);
}

function renderProjects(){
  const projects = ['الماجدية 70','الرمز A17','العجلان 30','برج جوديا'];
  page('module-layout', `<section class="module-page"><div class="module-header"><div><h1>المشاريع</h1><p>إدارة عقود المشاريع وربحيتها وتشغيلها.</p></div><button class="module-primary" onclick="openUniversalWindow('مشروع جديد','نموذج مشروع','المشاريع')">مشروع جديد</button></div>${filterBar(['العميل','المشرف','حالة العقد','قريب الانتهاء'])}${statsRow([['مشاريع نشطة','35+'],['قريبة الانتهاء','0'],['تكتات مفتوحة','0'],['ربحية الشهر','0.00 ﷼']])}<div class="project-grid">${projects.map(p => `<article class="project-card" onclick="openUniversalWindow('${p}','تفاصيل المشروع والعقد والتكتات والفواتير','المشاريع')"><h3>${p}</h3><p>مشروع إدارة مرافق · مشرف مسؤول · عقد نشط</p><div class="project-metrics"><span>تكتات: 0</span><span>مصروفات: 0.00 ﷼</span><span>إيرادات: 0.00 ﷼</span></div></article>`).join('')}</div></section>`);
}

function renderAttendance(){
  page('module-layout', `<section class="module-page"><div class="module-header"><div><h1>الحضور والانصراف</h1><p>حضور يومي، فلترة شهرية، وتأخير وأوفر تايم.</p></div><button class="module-primary" onclick="toast('تسجيل حضور')">تسجيل حضور</button></div>${filterBar(['الشهر','المشروع','الموظف','الحالة'])}${statsRow([['حضور اليوم','0'],['تأخير','0'],['غياب','0'],['أوفر تايم','0']])}<div class="attendance-board">${['ضمن الوقت','تأخير','خروج مبكر','أوفر تايم','غياب'].map(s => `<div class="attendance-col"><h3>${s}</h3><div class="empty-mini">لا توجد سجلات</div></div>`).join('')}</div></section>`);
}

async function renderCards(title, subtitle, action, cards){
  const saved = await TasneefAPI.moduleRecords(title);
  const savedCards = saved.map(x => [x.title || x.id, x.description || 'سجل محفوظ سحابيًا.', x.status || 'مسودة']);
  const allCards = [...savedCards, ...cards];
  page('module-layout', `<section class="module-page"><div class="module-header"><div><h1>${title}</h1><p>${subtitle}</p></div><button class="module-primary" onclick="openUniversalWindow('${action}','نموذج جديد','${title}')">${action}</button></div>${workingFilterBar(['النوع','الحالة','القسم'], title)}${statsRow([['السجلات', allCards.length],['محفوظة', saved.length],['نشط', allCards.filter(c => c[2] === 'نشط').length],['آخر تحديث','الآن']])}<div class="module-card-grid">${allCards.map(c => `<article class="module-card" data-filter-card="1" data-search="${escapeHtml(c.join(' '))}" data-status="${escapeHtml(c[2])}" data-project="" onclick="openUniversalWindow('${escapeHtml(c[0])}','${escapeHtml(c[1])}','${title}')"><h3>${escapeHtml(c[0])}</h3><p>${escapeHtml(c[1])}</p><span class="status-pill">${escapeHtml(c[2])}</span></article>`).join('')}</div></section>`);
}

async function renderFallback(name){
  const saved = await TasneefAPI.moduleRecords(name);
  const rows = saved.length ? saved : [{id:name + '-DEMO', title:name + ' - سجل تجريبي', status:'نشط', project:'الرئيسي', createdAt:new Date().toISOString()}];
  page('module-layout', `<section class="module-page">
    <div class="module-header"><div><h1>${name}</h1><p>قسم تشغيلي كامل لإضافة السجلات ومتابعة حالاتها وحفظها سحابيًا.</p></div><button class="module-primary" onclick="openUniversalWindow('${name} - جديد','نموذج إنشاء جديد','${name}')">إضافة جديد</button></div>
    ${workingFilterBar(['الحالة','التاريخ','المسؤول'], name)}
    ${statsRow([['السجلات', rows.length],['محفوظة سحابيًا', saved.length],['قيد المعالجة', rows.filter(x => x.status !== 'مكتمل').length],['آخر تحديث','الآن']])}
    <div class="pro-table-card"><table class="pro-table"><thead><tr><th>السجل</th><th>الحالة</th><th>المشروع</th><th>آخر تحديث</th><th>الإجراء</th></tr></thead><tbody>${rows.map(r => `<tr data-filter-row="1" data-search="${escapeHtml([r.title,r.status,r.project].join(' '))}" data-status="${escapeHtml(r.status || '')}" data-project="${escapeHtml(r.project || '')}" data-assignee=""><td>${escapeHtml(r.title || r.id)}</td><td>${escapeHtml(r.status || 'مسودة')}</td><td>${escapeHtml(r.project || '—')}</td><td>${r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : 'الآن'}</td><td><button class="table-action" onclick="openUniversalWindow('${escapeHtml(r.title || name)}','${escapeHtml(r.description || 'تفاصيل السجل والحركات والمرفقات')}','${name}')">فتح</button></td></tr>`).join('')}</tbody></table></div>
  </section>`);
}

async function renderUserManagement(){
  page('module-layout', `<section class="module-page">
    <div class="module-header"><div><h1>إدارة المستخدمين</h1><p>المستخدمون، الأدوار، حالات التحقق، وإرسال دعوات الدخول.</p></div><button class="module-primary" onclick="openUserInviteWindow()">دعوة مستخدم</button></div>
    ${statsRow([['المستخدمون','...'],['موثقون','...'],['بانتظار التحقق','...'],['الأدوار','مدير / محاسب / مشرف']])}
    <div class="pro-table-card" id="usersTable"><div class="empty-inbox-list">جاري تحميل المستخدمين...</div></div>
  </section>`);
  try{
    const users = await TasneefAPI.admin.users();
    const verified = users.filter(u => u.email_confirmed_at).length;
    document.querySelector('.stats-row').innerHTML = statsRow([['المستخدمون',users.length],['موثقون',verified],['بانتظار التحقق',users.length - verified],['الأدوار','مدير / محاسب / مشرف']]).replace(/^<div class="stats-row">|<\/div>$/g,'');
    $('#usersTable').innerHTML = `<table class="pro-table"><thead><tr><th>المستخدم</th><th>البريد</th><th>الدور</th><th>التحقق</th><th>آخر دخول</th></tr></thead><tbody>${users.map(u => `<tr><td>${escapeHtml(u.name || u.email || u.id)}</td><td>${escapeHtml(u.email || '—')}</td><td><span class="status-pill">${escapeHtml(u.role || 'user')}</span></td><td>${u.email_confirmed_at ? 'موثق' : 'بانتظار التحقق'}</td><td>${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString('ar-SA') : '—'}</td></tr>`).join('')}</tbody></table>`;
  }catch(err){
    $('#usersTable').innerHTML = `<div class="admin-empty"><h3>إدارة المستخدمين تحتاج تشغيل الخادم</h3><p>${escapeHtml(err.message || 'فعّل SUPABASE_SERVICE_ROLE_KEY داخل السيرفر فقط، ثم شغل npm start.')}</p><button class="module-primary" onclick="openUserInviteWindow()">إرسال دعوة عبر البريد</button></div>`;
  }
}

function openUserInviteWindow(){
  const modal = $('#smartModal');
  if(!modal) return;
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-head"><h2>دعوة مستخدم</h2><button class="close" onclick="closeModal()">إغلاق</button></div>
  <div class="record-layout"><div class="record-main">
    <label>البريد الإلكتروني</label><input id="inviteEmail" type="email" placeholder="user@company.com" />
    <label>الدور</label><select id="inviteRole"><option value="admin">مدير النظام</option><option value="accountant">محاسب</option><option value="operations">مشرف تشغيل</option><option value="viewer">مشاهد</option></select>
    <label>الاسم</label><input id="inviteName" placeholder="اسم المستخدم" />
  </div><aside class="record-side"><div><strong>دعوة سحابية</strong><span>سيتم إرسال رابط تحقق من Supabase.</span></div><div><strong>الصلاحيات</strong><span>تُحفظ في جدول profiles.</span></div></aside></div>
  <div class="modal-actions"><button class="module-primary" onclick="inviteUser()">إرسال الدعوة</button><button class="close" onclick="closeModal()">إلغاء</button></div>`;
}

async function inviteUser(){
  const email = $('#inviteEmail')?.value?.trim();
  const role = $('#inviteRole')?.value || 'viewer';
  const name = $('#inviteName')?.value?.trim() || '';
  if(!email) return toast('اكتب البريد الإلكتروني');
  try{
    await TasneefAPI.admin.inviteUser({email, role, name});
    closeModal();
    toast('تم إرسال الدعوة');
    renderUserManagement();
  }catch(err){
    toast(err.message || 'تعذر إرسال الدعوة');
  }
}

function openUniversalWindow(title, description, resource){
  const modal = $('#smartModal');
  if(!modal) return;
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-head"><h2>${escapeHtml(title)}</h2><button class="close" onclick="closeModal()">إغلاق</button></div>
  <div class="record-layout">
    <div class="record-main">
      <label>اسم السجل</label><input id="recordName" value="${escapeHtml(title)}" />
      <label>الحالة</label><select id="recordStatus"><option>نشط</option><option>مسودة</option><option>بانتظار اعتماد</option><option>مكتمل</option></select>
      <label>المشروع / مركز التكلفة</label><select id="recordProject"><option>الماجدية 70</option><option>الرمز A17</option><option>العجلان 30</option><option>برج جوديا</option></select>
      <label>الوصف</label><textarea id="recordDescription">${escapeHtml(description || '')}</textarea>
    </div>
    <aside class="record-side"><div><strong>الإجراءات السريعة</strong><span>حفظ / اعتماد / طباعة / إرسال</span></div><div><strong>الربط المحاسبي</strong><span>جاهز للقيود والفواتير</span></div><div><strong>المرفقات</strong><span>رفع صور أو ملفات PDF</span></div><div><strong>سجل التدقيق</strong><span>يتم تسجيل كل تعديل</span></div></aside>
  </div>
  <div class="modal-actions"><button class="module-primary" onclick="saveUniversalRecord('${escapeHtml(resource || currentSection)}')">حفظ</button><button class="close" onclick="toast('تم الاعتماد')">اعتماد</button><button class="close" onclick="window.print()">طباعة</button><button class="close" onclick="closeModal()">إلغاء</button></div>`;
}

async function saveUniversalRecord(resource){
  const data = {
    title: $('#recordName')?.value || 'سجل',
    status: $('#recordStatus')?.value || 'مسودة',
    project: $('#recordProject')?.value || '',
    description: $('#recordDescription')?.value || ''
  };
  if(resource === 'bankAccounts'){
    await TasneefAPI.create('bankAccounts', {name:data.title, type:'bank', bookBalance:0, statementBalance:0});
    closeModal(); toast('تم حفظ الحساب البنكي'); renderBankAccounts(); return;
  }
  await TasneefAPI.saveModuleRecord(resource || currentSection, data);
  closeModal();
  toast('تم الحفظ بنجاح');
  if(tableSections[currentSection]) renderTablePage(currentSection);
  else openSection(currentSection);
}

function closeModal(){
  const modal = $('#smartModal');
  if(modal) modal.classList.add('hidden');
}

function toast(message){
  const t = $('#toast');
  if(!t) return;
  t.textContent = message;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2200);
}

let authMode = 'login';
let lastAuthEmail = '';

function renderAuthScreen(message='', mode=authMode, kind='error'){
  const content = $('#content');
  if(!content) return;
  authMode = mode;
  document.body.classList.add('auth-mode');
  content.className = 'auth-layout';
  const isSignup = authMode === 'signup';
  const isVerify = authMode === 'verify';
  const isRecover = authMode === 'recover';
  const title = isSignup ? 'إنشاء حساب' : isVerify ? 'تحقق من بريدك' : isRecover ? 'استرجاع كلمة المرور' : 'تسجيل الدخول';
  const help = isSignup
    ? 'سيتم إرسال رابط تحقق إلى بريدك قبل تفعيل الحساب.'
    : isVerify
      ? 'فتح رابط التحقق من البريد يفعّل الحساب ثم يمكنك تسجيل الدخول.'
      : isRecover
        ? 'اكتب بريدك وسنرسل رابط تغيير كلمة المرور.'
        : 'ادخل بحسابك السحابي للوصول إلى بيانات النظام.';
  content.innerHTML = `
    <section class="auth-card">
      <img src="tasneef_logo.png" alt="Tasneef Facilities Management" />
      <h1>${title}</h1>
      <p>${help}</p>
      <div class="auth-tabs">
        <button class="${authMode === 'login' ? 'active' : ''}" onclick="renderAuthScreen('', 'login')">دخول</button>
        <button class="${authMode === 'signup' ? 'active' : ''}" onclick="renderAuthScreen('', 'signup')">حساب جديد</button>
      </div>
      ${message ? `<div class="${kind === 'success' ? 'auth-success' : 'auth-error'}">${escapeHtml(message)}</div>` : ''}
      <label>البريد الإلكتروني</label>
      <input id="authEmail" type="email" autocomplete="email" placeholder="name@company.com" value="${escapeHtml(lastAuthEmail)}" />
      ${isVerify || isRecover ? '' : `
        <label>كلمة المرور</label>
        <input id="authPassword" type="password" autocomplete="${isSignup ? 'new-password' : 'current-password'}" placeholder="••••••••" />
      `}
      <div class="auth-actions">
        ${isSignup ? '<button onclick="handleSignup()">إنشاء وإرسال التحقق</button>' : ''}
        ${isVerify ? '<button onclick="handleResendVerification()">إعادة إرسال التحقق</button>' : ''}
        ${isRecover ? '<button onclick="handleRecoverPassword()">إرسال رابط الاسترجاع</button>' : ''}
        ${(!isSignup && !isVerify && !isRecover) ? '<button onclick="handleLogin()">دخول</button>' : ''}
        <button class="secondary-action" onclick="renderAuthScreen('', 'login')">رجوع للدخول</button>
      </div>
      <div class="auth-links">
        <button onclick="renderAuthScreen('', 'recover')">نسيت كلمة المرور؟</button>
        <button onclick="handleResendVerification()">إعادة إرسال بريد التحقق</button>
      </div>
    </section>
  `;
}

async function handleLogin(){
  const email = $('#authEmail')?.value?.trim();
  const password = $('#authPassword')?.value || '';
  lastAuthEmail = email || lastAuthEmail;
  if(!email || !password) return renderAuthScreen('اكتب البريد وكلمة المرور.', 'login');
  try{
    await TasneefAPI.auth.login(email, password);
    document.body.classList.remove('auth-mode');
    await initApp();
    toast('تم تسجيل الدخول');
  }catch(err){
    const msg = err.message || 'تعذر تسجيل الدخول.';
    renderAuthScreen(msg, msg.includes('غير مؤكد') ? 'verify' : 'login');
  }
}

async function handleSignup(){
  const email = $('#authEmail')?.value?.trim();
  const password = $('#authPassword')?.value || '';
  lastAuthEmail = email || lastAuthEmail;
  if(!email || password.length < 6) return renderAuthScreen('كلمة المرور يجب أن تكون 6 أحرف على الأقل.', 'signup');
  try{
    await TasneefAPI.auth.signup(email, password);
    TasneefAPI.auth.logout();
    renderAuthScreen('تم إنشاء الحساب. أرسلنا رابط التحقق إلى بريدك، افتحه ثم سجل الدخول.', 'verify', 'success');
  }catch(err){
    renderAuthScreen(err.message || 'تعذر إنشاء الحساب.', 'signup');
  }
}

async function handleResendVerification(){
  const email = $('#authEmail')?.value?.trim() || lastAuthEmail;
  lastAuthEmail = email || lastAuthEmail;
  if(!email) return renderAuthScreen('اكتب البريد الإلكتروني أولًا.', 'verify');
  try{
    await TasneefAPI.auth.resendVerification(email);
    renderAuthScreen('تم إرسال رابط تحقق جديد. راجع البريد الوارد أو البريد غير المرغوب.', 'verify', 'success');
  }catch(err){
    renderAuthScreen(err.message || 'تعذر إرسال رابط التحقق.', 'verify');
  }
}

async function handleRecoverPassword(){
  const email = $('#authEmail')?.value?.trim() || lastAuthEmail;
  lastAuthEmail = email || lastAuthEmail;
  if(!email) return renderAuthScreen('اكتب البريد الإلكتروني أولًا.', 'recover');
  try{
    await TasneefAPI.auth.recoverPassword(email);
    renderAuthScreen('تم إرسال رابط استرجاع كلمة المرور إلى بريدك.', 'login', 'success');
  }catch(err){
    renderAuthScreen(err.message || 'تعذر إرسال رابط الاسترجاع.', 'recover');
  }
}

function logout(){
  TasneefAPI.auth.logout();
  renderAuthScreen('تم تسجيل الخروج.');
}

function quickFilter(value){
  if(value && value.trim().length > 1) toast('فلترة: ' + value);
}

function showAppStatus(){
  const mode = window.TASNEEF_CONFIG?.API_MODE || 'local';
  toast(mode === 'supabase' ? 'متصل بقاعدة البيانات' : 'يعمل بوضع التخزين المحلي');
}

async function initApp(){
  renderNav();
  await renderInbox();
  const userBox = document.querySelector('.user-box');
  const user = TasneefAPI.auth.user();
  if(userBox && user){
    userBox.innerHTML = `<div class="avatar">FM</div><div><strong>${escapeHtml(user.email || 'مستخدم')}</strong><span>TASNEEF-FM</span></div><button class="tiny-arrow" onclick="logout()">خروج</button>`;
  }
  const search = $('#globalSearch');
  if(search){
    search.addEventListener('input', e => {
      if(e.target.value.trim().length > 1) toast('بحث ذكي عن: ' + e.target.value);
    });
  }
  document.addEventListener('keydown', e => {
    if((e.ctrlKey || e.altKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      search?.focus();
    }
  });
  setTimeout(showAppStatus, 700);
}

async function init(){
  if(window.TASNEEF_CONFIG?.REQUIRE_AUTH !== false && !TasneefAPI.auth.isLoggedIn()){
    renderAuthScreen();
    return;
  }
  await initApp();
}

document.addEventListener('DOMContentLoaded', init);
if(document.readyState !== 'loading') init();



/* V015 Working Filters */
const TasneefFilterState = {};

function getModuleRows(name){
  const section = tableSections[name];
  if(!section) return [];
  const [action, columns, rows] = section;
  const normalized = rows.map(r => ({
    values: r,
    searchable: r.join(' ').toLowerCase(),
    status: r[4] || r[3] || '',
    project: r[2] || r[1] || '',
    assignee: r[1] || '',
    date: r[2] || ''
  }));
  return normalized;
}

function getFilterValue(key){
  return document.querySelector(`[data-filter="${key}"]`)?.value || '';
}

function workingFilterBar(filters, moduleName=''){
  const projects = ['','الماجدية 70','الرمز A17','العجلان 30','برج جوديا','المخزن الرئيسي'];
  const statuses = ['','نشط','مسودة','بانتظار اعتماد','غير مدفوعة','مرحّل','مكتمل','غير معالج','قيد المراجعة'];
  const assignees = ['','مدير النظام','المحاسب','مدير التشغيل','مسؤول المخزن','المشرف'];
  return `<div class="module-filterbar working-filterbar" data-module="${escapeHtml(moduleName)}">
    <div class="module-search"><span>⌕</span><input data-filter="q" placeholder="بحث سريع..." oninput="applyCurrentFilters()" /></div>
    <select data-filter="status" onchange="applyCurrentFilters()">${statuses.map(x=>`<option value="${x}">${x || 'كل الحالات'}</option>`).join('')}</select>
    <select data-filter="project" onchange="applyCurrentFilters()">${projects.map(x=>`<option value="${x}">${x || 'كل المشاريع'}</option>`).join('')}</select>
    <select data-filter="assignee" onchange="applyCurrentFilters()">${assignees.map(x=>`<option value="${x}">${x || 'كل المسؤولين'}</option>`).join('')}</select>
    <input data-filter="fromDate" type="date" onchange="applyCurrentFilters()" title="من تاريخ" />
    <input data-filter="toDate" type="date" onchange="applyCurrentFilters()" title="إلى تاريخ" />
    <button class="filter-chip clear" onclick="resetCurrentFilters()">تصفير</button>
  </div>`;
}

function rowMatchesFilter(rowText, status, project, assignee){
  const q = getFilterValue('q').toLowerCase().trim();
  const fs = getFilterValue('status');
  const fp = getFilterValue('project');
  const fa = getFilterValue('assignee');
  if(q && !rowText.toLowerCase().includes(q)) return false;
  if(fs && !status.includes(fs)) return false;
  if(fp && !project.includes(fp) && !rowText.includes(fp)) return false;
  if(fa && !assignee.includes(fa) && !rowText.includes(fa)) return false;
  return true;
}

function applyCurrentFilters(){
  const rows = document.querySelectorAll('[data-filter-row="1"]');
  let visible = 0;
  rows.forEach(row => {
    const rowText = row.dataset.search || row.textContent || '';
    const status = row.dataset.status || '';
    const project = row.dataset.project || '';
    const assignee = row.dataset.assignee || '';
    const ok = rowMatchesFilter(rowText, status, project, assignee);
    row.style.display = ok ? '' : 'none';
    if(ok) visible++;
  });
  const counter = document.getElementById('filteredCount');
  if(counter) counter.textContent = visible;
}

function resetCurrentFilters(){
  document.querySelectorAll('.working-filterbar [data-filter]').forEach(el => el.value = '');
  applyCurrentFilters();
  toast('تم تصفير الفلاتر');
}

async function renderTablePage(name){
  const [action, columns, rows] = tableSections[name];
  const saved = await TasneefAPI.moduleRecords(name);
  const dynamicRows = saved.map(x => [x.title || x.name || x.id, x.project || '—', x.status || 'مسودة', x.createdAt ? new Date(x.createdAt).toLocaleDateString('ar-SA') : '—', x.total || '0.00 ﷼', 'فتح']);
  const allRows = [...dynamicRows, ...rows];
  page('module-layout', `
    <section class="module-page">
      <div class="module-header">
        <div><h1>${name}</h1><p>شاشة احترافية لإدارة ${name} مع فلاتر فعالة وحفظ محلي/سيرفر.</p></div>
        <button class="module-primary" onclick="openUniversalWindow('${action}','نموذج إنشاء جديد','${name}')">${action}</button>
      </div>
      ${workingFilterBar(['الحالة','الفترة','المشروع','المسؤول'], name)}
      ${statsRow([['إجمالي السجلات', allRows.length], ['المعروضة','<span id="filteredCount">'+allRows.length+'</span>'], ['محفوظة', saved.length], ['آخر تحديث','الآن']])}
      <div class="pro-table-card"><table class="pro-table"><thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${allRows.map(r => {
        const search = escapeHtml(r.join(' '));
        const status = escapeHtml(r[4] || r[3] || '');
        const project = escapeHtml(r[2] || r[1] || '');
        const assignee = escapeHtml(r[1] || '');
        return `<tr data-filter-row="1" data-search="${search}" data-status="${status}" data-project="${project}" data-assignee="${assignee}">${r.map((c,i) => `<td>${i === r.length-1 ? `<button class="table-action" onclick="openUniversalWindow('${name} - ${escapeHtml(r[0])}','تفاصيل السجل والحركات والمرفقات','${name}')">${c}</button>` : escapeHtml(c)}</td>`).join('')}</tr>`;
      }).join('')}</tbody></table></div>
    </section>
  `);
}

function renderAdvancedFilterPage(title, subtitle, action, cardsHtml){
  page('module-layout', `<section class="module-page">
    <div class="module-header"><div><h1>${title}</h1><p>${subtitle}</p></div><button class="module-primary" onclick="openUniversalWindow('${action}','نموذج جديد','${title}')">${action}</button></div>
    ${workingFilterBar([], title)}
    ${cardsHtml}
  </section>`);
}

function applyCardFilters(){
  const q = getFilterValue('q').toLowerCase().trim();
  const status = getFilterValue('status');
  const project = getFilterValue('project');
  let visible = 0;
  document.querySelectorAll('[data-filter-card="1"]').forEach(card=>{
    const text = (card.dataset.search || card.textContent || '').toLowerCase();
    const s = card.dataset.status || '';
    const p = card.dataset.project || '';
    const ok = (!q || text.includes(q)) && (!status || s.includes(status)) && (!project || p.includes(project) || text.includes(project));
    card.style.display = ok ? '' : 'none';
    if(ok) visible++;
  });
  const counter = document.getElementById('filteredCount');
  if(counter) counter.textContent = visible;
}

async function renderBankAccounts(){
  const accounts = await TasneefAPI.list('bankAccounts');
  page('bank-layout', `<section class="bank-page">
    <div class="page-title-row bank-title-row"><h1>الحسابات البنكية</h1><button class="add-bank-btn" onclick="openUniversalWindow('أضف حساب بنك','نموذج إضافة حساب بنكي','bankAccounts')">أضف حساب بنك</button></div>
    ${workingFilterBar([], 'الحسابات البنكية')}
    <div class="stats-row"><div class="stat-card"><span>الحسابات</span><strong>${accounts.length}</strong></div><div class="stat-card"><span>المعروضة</span><strong><span id="filteredCount">${accounts.length}</span></strong></div><div class="stat-card"><span>إجمالي الدفتر</span><strong>0.00 ﷼</strong></div><div class="stat-card"><span>آخر تحديث</span><strong>الآن</strong></div></div>
    <div class="bank-cards-wrap">${accounts.map(a => `<article data-filter-row="1" data-search="${escapeHtml([a.name,a.type,a.status].join(' '))}" data-status="${escapeHtml(a.status || 'نشط')}" data-project="" data-assignee="" class="bank-card"><div class="bank-card-top"><div class="bank-card-title-wrap"><div class="account-icon">${a.type === 'bank' ? '🏦' : a.type === 'petty_cash' ? '💵' : '💰'}</div><h2>${escapeHtml(a.name)}</h2></div><div class="bank-card-actions"><button class="more-btn">⋮</button><button class="import-btn" onclick="importBankStatement('${a.id}','${escapeHtml(a.name)}')">استيراد كشف حساب</button></div></div><div class="bank-metrics"><div class="metric-row"><strong>${Number(a.bookBalance||0).toFixed(2)} ﷼</strong><span>رصيد الدفتر</span></div><div class="metric-row"><strong>${Number(a.statementBalance||0).toFixed(2)} ﷼</strong><span>رصيد كشف الحساب</span></div><div class="metric-row metric-total"><strong>${(Number(a.bookBalance||0)-Number(a.statementBalance||0)).toFixed(2)} ﷼</strong><span>الفرق <em class="ok-badge">متوازن</em></span></div></div></article>`).join('')}</div>
  </section>`);
}

function setInboxFilter(filter){
  inboxFilter = filter;
  renderInbox();
}

function renderInboxList(){
  const box = $('#smartInboxList');
  if(!box) return;
  const query = ($('#inboxSearchInput')?.value || '').trim().toLowerCase();
  const projectFilter = $('#inboxProjectFilter')?.value || '';
  const assigneeFilter = $('#inboxAssigneeFilter')?.value || '';
  const attachmentFilter = $('#inboxAttachmentFilter')?.value || '';

  let list = filterMessages(inboxFilter);
  if(query){
    list = list.filter(m => [m.title,m.from,m.type,m.project,m.assignee,m.status].join(' ').toLowerCase().includes(query));
  }
  if(projectFilter) list = list.filter(m => (m.project || '').includes(projectFilter));
  if(assigneeFilter) list = list.filter(m => (m.assignee || '').includes(assigneeFilter));
  if(attachmentFilter === 'yes') list = list.filter(m => m.attachment && m.attachment !== '—');
  if(attachmentFilter === 'no') list = list.filter(m => !m.attachment || m.attachment === '—');

  if(!list.length){
    box.innerHTML = '<div class="empty-inbox-list">لا توجد رسائل مطابقة للفلاتر الحالية</div>';
    return;
  }
  box.innerHTML = list.map(m => `
    <article class="smart-message-row ${m.id === selectedMessageId ? 'active' : ''}" onclick="selectInboxMessage('${m.id}')">
      <div class="message-check"><input type="checkbox" onclick="event.stopPropagation()" /></div>
      <div class="message-main">
        <div class="message-title-line"><strong>${escapeHtml(m.title)}</strong><span class="priority ${priorityClass(m.priority)}">${escapeHtml(m.priority)}</span></div>
        <p>${escapeHtml(m.from)} · ${escapeHtml(m.project)}</p>
        <div class="message-meta"><em class="${statusClass(m.status)}">${escapeHtml(m.status)}</em><span>${escapeHtml(m.type)}</span><span>${escapeHtml(m.time)}</span></div>
      </div>
    </article>
  `).join('');
}

async function renderInbox(){
  await loadInbox();
  page('smart-inbox-layout', `
    <section class="inbox-detail-panel" id="inboxDetail"></section>
    <aside class="smart-inbox-panel">
      <div class="smart-inbox-head">
        <div><h1>البريد الوارد</h1><p>مركز معالجة ذكي للرسائل والفواتير والكشوف والتكتات والطلبات.</p></div>
        <button class="refresh" onclick="renderInbox();toast('تم تحديث البريد الوارد')">⟳</button>
      </div>
      <div class="smart-inbox-search"><span>⌕</span><input id="inboxSearchInput" placeholder="ابحث في البريد الوارد..." oninput="renderInboxList()" /></div>
      <div class="inbox-category-tabs">
        ${['الكل','غير معالج','بانتظار المعالجة','فواتير','كشوف بنكية','تكتات','طلبات مخزن','موافقات','تنبيهات','مؤرشف'].map(t => `<button class="${inboxFilter===t?'active':''}" onclick="setInboxFilter('${t}')">${t}${countBadge(t)}</button>`).join('')}
      </div>
      <div class="inbox-filter-row">
        <select id="inboxProjectFilter" class="mini-filter" onchange="renderInboxList()"><option value="">كل المشاريع</option><option>الماجدية 70</option><option>الرمز A17</option><option>الحساب البنكي</option><option>المخزن الرئيسي</option></select>
        <select id="inboxAssigneeFilter" class="mini-filter" onchange="renderInboxList()"><option value="">كل المسؤولين</option><option>المحاسب</option><option>مدير التشغيل</option><option>مسؤول المخزن</option><option>المدير</option></select>
        <select id="inboxAttachmentFilter" class="mini-filter" onchange="renderInboxList()"><option value="">كل المرفقات</option><option value="yes">يوجد مرفق</option><option value="no">بدون مرفق</option></select>
        <button class="mini-filter" onclick="document.getElementById('inboxProjectFilter').value='';document.getElementById('inboxAssigneeFilter').value='';document.getElementById('inboxAttachmentFilter').value='';renderInboxList();">تصفير</button>
      </div>
      <div class="smart-message-list" id="smartInboxList"></div>
    </aside>
  `);
  if(!inboxMessages.some(m => m.id === selectedMessageId) && inboxMessages[0]) selectedMessageId = inboxMessages[0].id;
  renderInboxList();
  renderInboxDetail(selectedMessageId);
}
