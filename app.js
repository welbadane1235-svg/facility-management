
const $ = (s)=>document.querySelector(s);

let currentSection = 'البريد الوارد';
let dashboardTab = 'pnl';

const navData = [
  {id:'start',label:'ابدأ الآن',icon:'🚀'},
  {id:'inbox',label:'البريد الوارد',icon:'✉'},
  {id:'dashboard',label:'لوحة البيانات',icon:'▦'},
  {id:'reports',label:'التقارير',icon:'▥'},
  {group:true,label:'المبيعات',icon:'＄',open:true,children:[
    'عروض أسعار و فواتير مبدئية','فواتير بيع','سندات العملاء','فواتير مجدولة',
    'إشعارات دائنة','فواتير نقدية','إشعارات تسليم','فواتير بيع من الـ API'
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

const sectionConfig = {
  'ابدأ الآن': {
    type:'cards', title:'ابدأ الآن', subtitle:'خطوات التشغيل الأولى لإعداد النظام بسرعة.',
    action:'إكمال الإعداد', stats:[['الشركة','مفعلة'],['المستخدمين','1'],['البيانات الأساسية','جاهزة']],
    filters:['الشركة','الفرع','حالة الإعداد'],
    cards:[
      ['إعداد الشركة','بيانات الشركة، الشعار، الرقم الضريبي، والفروع.','جاهز'],
      ['إعداد المحاسبة','دليل الحسابات، الضريبة، البنك، والخزينة.','مطلوب'],
      ['إعداد التشغيل','المشاريع، المشرفين، الفنيين، والمخزون.','مطلوب']
    ]
  },
  'التقارير': {
    type:'reports', title:'التقارير', subtitle:'مركز التقارير المالية والتشغيلية بصيغة PDF و Excel.',
    action:'إنشاء تقرير',
    reports:['تقرير ربح وخسارة','ميزان مراجعة','تقرير ضريبة القيمة المضافة','ربحية المشاريع','تقرير المخزون','تقرير الحضور','مسير الرواتب','تقرير التكتات']
  },
  'عروض أسعار و فواتير مبدئية': {
    type:'table', title:'عروض أسعار و فواتير مبدئية', subtitle:'إدارة العروض وتحويلها إلى فواتير بيع معتمدة.',
    action:'عرض سعر جديد', filters:['العميل','المشروع','الحالة','من تاريخ','إلى تاريخ'],
    columns:['الرقم','العميل','المشروع','الإجمالي','الحالة','الإجراء'],
    rows:[['Q-0001','شركة تجريبية','الماجدية 70','0.00 ﷼','مسودة','فتح'],['Q-0002','عميل نقدي','العجلان 30','0.00 ﷼','بانتظار اعتماد','فتح']]
  },
  'فواتير بيع': {
    type:'table', title:'فواتير بيع', subtitle:'فواتير العملاء الضريبية وربطها بالقيود وسندات القبض.',
    action:'فاتورة بيع جديدة', filters:['العميل','حالة الدفع','الضريبة','المشروع','الفترة'],
    columns:['الفاتورة','العميل','تاريخ الاستحقاق','الإجمالي','حالة الدفع','الإجراء'],
    rows:[['INV-0001','الماجدية 70','2026-07-31','0.00 ﷼','غير مدفوعة','فتح'],['INV-0002','الرمز A17','2026-07-31','0.00 ﷼','مسودة','فتح']]
  },
  'سندات العملاء': {
    type:'table', title:'سندات العملاء', subtitle:'سندات القبض وربط المدفوعات بفواتير العملاء.',
    action:'سند قبض جديد', filters:['العميل','طريقة الدفع','الحساب البنكي','التاريخ'],
    columns:['السند','العميل','المبلغ','طريقة الدفع','الحالة','الإجراء'],
    rows:[['REC-0001','الماجدية 70','0.00 ﷼','تحويل بنكي','مرحّل','فتح']]
  },
  'فواتير مجدولة': {
    type:'table', title:'فواتير مجدولة', subtitle:'جدولة فواتير العقود الشهرية والسنوية تلقائيًا.',
    action:'جدولة فاتورة', filters:['العقد','المشروع','التكرار','الحالة'],
    columns:['الجدولة','المشروع','التكرار','تاريخ الفاتورة القادمة','الحالة','الإجراء'],
    rows:[['SCH-0001','العجلان 30','شهري','2026-08-01','نشط','فتح']]
  },
  'إشعارات دائنة': {
    type:'table', title:'إشعارات دائنة', subtitle:'معالجة الخصومات والاسترجاعات على فواتير العملاء.',
    action:'إشعار دائن جديد', filters:['العميل','الفاتورة','الحالة','التاريخ'],
    columns:['الإشعار','العميل','الفاتورة','المبلغ','الحالة','الإجراء'],
    rows:[['CN-0001','عميل تجريبي','INV-0001','0.00 ﷼','مسودة','فتح']]
  },
  'فواتير نقدية': {
    type:'table', title:'فواتير نقدية', subtitle:'فواتير سريعة للعمليات النقدية والخدمات المباشرة.',
    action:'فاتورة نقدية', filters:['الفرع','الخزينة','الموظف','التاريخ'],
    columns:['الفاتورة','الفرع','الخزينة','الإجمالي','الحالة','الإجراء'],
    rows:[['CASH-0001','الفرع الرئيسي','الخزينة','0.00 ﷼','مدفوعة','فتح']]
  },
  'إشعارات تسليم': {
    type:'table', title:'إشعارات تسليم', subtitle:'تسليم الخدمات أو المواد وربطها بالفواتير والمشاريع.',
    action:'إشعار تسليم', filters:['العميل','المشروع','الحالة','التاريخ'],
    columns:['الإشعار','العميل','المشروع','الحالة','المسؤول','الإجراء'],
    rows:[['DN-0001','الرمز A17','الرمز A17','بانتظار توقيع','المشرف','فتح']]
  },
  'فواتير بيع من الـ API': {
    type:'table', title:'فواتير بيع من الـ API', subtitle:'مراقبة الفواتير الواردة من التكاملات الخارجية.',
    action:'إعداد API', filters:['المصدر','الحالة','الفترة','العميل'],
    columns:['المعرف','المصدر','العميل','الحالة','آخر تحديث','الإجراء'],
    rows:[['API-001','تكامل خارجي','عميل تجريبي','مستلم','اليوم','فتح']]
  },
  'طلبات الشراء': {
    type:'table', title:'طلبات الشراء', subtitle:'طلبات شراء مرتبطة بالمخزون والمشاريع وسير الاعتماد.',
    action:'طلب شراء جديد', filters:['المورد','المشروع','الحالة','المعتمد'],
    columns:['الطلب','المورد','المشروع','الإجمالي','الحالة','الإجراء'],
    rows:[['PO-0001','مورد مواد','المخزن الرئيسي','0.00 ﷼','بانتظار اعتماد','فتح']]
  },
  'فواتير الموردين': {
    type:'table', title:'فواتير الموردين', subtitle:'فواتير المشتريات مع الضريبة وربطها بالمصروفات والمخزون.',
    action:'فاتورة مورد جديدة', filters:['المورد','حالة الدفع','الضريبة','المشروع'],
    columns:['الفاتورة','المورد','تاريخ الاستحقاق','الإجمالي','حالة الدفع','الإجراء'],
    rows:[['BILL-0001','مورد تجريبي','2026-07-31','0.00 ﷼','غير مدفوعة','فتح']]
  },
  'سندات الصرف': {
    type:'table', title:'سندات الصرف', subtitle:'إدارة المدفوعات للموردين والمصروفات والخزينة.',
    action:'سند صرف جديد', filters:['المورد','الحساب','طريقة الدفع','الفترة'],
    columns:['السند','المستفيد','المبلغ','الحساب','الحالة','الإجراء'],
    rows:[['PAY-0001','مورد تجريبي','0.00 ﷼','الحساب البنكي','مرحّل','فتح']]
  },
  'اعتمادات الشراء': {
    type:'approvals', title:'اعتمادات الشراء', subtitle:'سير موافقة مضبوط قبل إنشاء أوامر الشراء أو الصرف.',
    action:'إعداد الاعتماد'
  },
  'العملاء': {
    type:'table', title:'العملاء', subtitle:'ملفات العملاء، المشاريع، الفواتير، الأرصدة، والمخاطبات.',
    action:'عميل جديد', filters:['المدينة','الحالة','الرصيد','نوع العميل'],
    columns:['العميل','الجوال','المشاريع','الرصيد','الحالة','الإجراء'],
    rows:[['جمعية الماجدية 70','—','1','0.00 ﷼','نشط','فتح'],['جمعية الرمز A17','—','1','0.00 ﷼','نشط','فتح']]
  },
  'الموردين': {
    type:'table', title:'الموردين', subtitle:'إدارة الموردين والفواتير والمدفوعات وأعمار الديون.',
    action:'مورد جديد', filters:['التصنيف','الحالة','الرصيد','المدينة'],
    columns:['المورد','التصنيف','الرصيد','آخر فاتورة','الحالة','الإجراء'],
    rows:[['مورد مواد تنظيف','مواد','0.00 ﷼','—','نشط','فتح']]
  },
  'جهات الاتصال': {
    type:'table', title:'جهات الاتصال', subtitle:'أرقام مسؤولي الجمعيات والعملاء والموردين.',
    action:'جهة اتصال', filters:['النوع','المدينة','الجهة','الحالة'],
    columns:['الاسم','الجهة','الجوال','البريد','النوع','الإجراء'],
    rows:[['رئيس جمعية','الماجدية 70','—','—','عميل','فتح']]
  },
  'الأرصدة': {
    type:'table', title:'الأرصدة', subtitle:'أرصدة العملاء والموردين وأعمار الديون.',
    action:'تصدير Excel', filters:['النوع','العمر','الرصيد','الفترة'],
    columns:['الجهة','النوع','الرصيد','0-30 يوم','31-60 يوم','الإجراء'],
    rows:[['الماجدية 70','عميل','0.00 ﷼','0.00','0.00','فتح']]
  },
  'الموظفين': {
    type:'table', title:'الموظفين', subtitle:'ملفات الموظفين والعمال والفنيين والمشرفين.',
    action:'موظف جديد', filters:['المشروع','الوظيفة','الحالة','المشرف'],
    columns:['الموظف','الوظيفة','المشروع','الراتب','الحالة','الإجراء'],
    rows:[['محمد إبراهيم','مشرف','عدة مشاريع','2300 ﷼','نشط','فتح'],['رؤوف','عامل','العجلان 19','1600 ﷼','نشط','فتح']]
  },
  'الحضور': {
    type:'attendance', title:'الحضور والانصراف', subtitle:'حضور يومي، فلترة شهرية، وتأخير وأوفر تايم.'
  },
  'مسير الرواتب': {
    type:'table', title:'مسير الرواتب', subtitle:'حساب الرواتب مع البدلات والخصومات والأوفر تايم.',
    action:'إنشاء مسير', filters:['الشهر','المشروع','الحالة','المشرف'],
    columns:['الشهر','عدد الموظفين','الإجمالي','الخصومات','الصافي','الإجراء'],
    rows:[['يوليو 2026','0','0.00 ﷼','0.00 ﷼','0.00 ﷼','فتح']]
  },
  'الأوفر تايم': {
    type:'table', title:'الأوفر تايم', subtitle:'اعتماد ساعات العمل الإضافي وربطها بالرواتب.',
    action:'إضافة أوفر تايم', filters:['الموظف','المشروع','الشهر','الحالة'],
    columns:['الموظف','التاريخ','الساعات','القيمة','الحالة','الإجراء'],
    rows:[['فهد','2026-07-01','0','0.00 ﷼','بانتظار اعتماد','فتح']]
  },
  'الأصناف': {
    type:'inventory', title:'الأصناف', subtitle:'منتجات وخدمات ومخزون مع SKU وباركود وحد أدنى.'
  },
  'طلبات الصرف': {
    type:'table', title:'طلبات الصرف', subtitle:'صرف مواد للمشاريع والتكتات والعهد.',
    action:'طلب صرف', filters:['المشروع','المستودع','الحالة','المستلم'],
    columns:['الطلب','المشروع','المستلم','الأصناف','الحالة','الإجراء'],
    rows:[['ISS-0001','الرمز A17','مشرف الموقع','3','بانتظار اعتماد','فتح']]
  },
  'العهد': {
    type:'table', title:'العهد', subtitle:'تتبع العهد على المشرفين والفنيين والعمال.',
    action:'تسليم عهدة', filters:['الموظف','المشروع','الحالة','الصنف'],
    columns:['العهدة','الموظف','الصنف','القيمة','الحالة','الإجراء'],
    rows:[['AST-0001','مازن','جهاز / عدة','0.00 ﷼','مستلمة','فتح']]
  },
  'الجرد': {
    type:'table', title:'الجرد', subtitle:'جلسات الجرد وفروقات الكمية والقيمة.',
    action:'جلسة جرد', filters:['المستودع','الحالة','التاريخ','المسؤول'],
    columns:['الجلسة','المستودع','التاريخ','الفروقات','الحالة','الإجراء'],
    rows:[['CNT-0001','المخزن الرئيسي','اليوم','0','مسودة','فتح']]
  },
  'التحويلات': {
    type:'table', title:'التحويلات', subtitle:'تحويل مواد بين المستودعات والمواقع.',
    action:'تحويل جديد', filters:['من مستودع','إلى مستودع','الحالة','التاريخ'],
    columns:['التحويل','من','إلى','الأصناف','الحالة','الإجراء'],
    rows:[['TR-0001','المخزن الرئيسي','مشروع الرمز','2','بانتظار استلام','فتح']]
  },
  'القيود اليومية': {
    type:'table', title:'القيود اليومية', subtitle:'كل عملية مالية تولد قيدًا محاسبيًا قابلًا للتدقيق.',
    action:'قيد يدوي', filters:['الفترة','الحساب','المصدر','الحالة'],
    columns:['القيد','التاريخ','الوصف','مدين','دائن','الإجراء'],
    rows:[['JE-0001','اليوم','قيد افتتاحي','0.00 ﷼','0.00 ﷼','فتح']]
  },
  'دليل الحسابات': {
    type:'table', title:'دليل الحسابات', subtitle:'الأصول، الخصوم، الإيرادات، المصروفات، الضريبة، والبنوك.',
    action:'حساب جديد', filters:['نوع الحساب','الأب','الحالة','مستوى الحساب'],
    columns:['الكود','الحساب','النوع','الرصيد','الحالة','الإجراء'],
    rows:[['1000','الأصول','أصل','0.00 ﷼','نشط','فتح'],['4000','الإيرادات','إيراد','0.00 ﷼','نشط','فتح']]
  },
  'ميزان المراجعة': {
    type:'table', title:'ميزان المراجعة', subtitle:'أرصدة الحسابات مدينة ودائنة حسب الفترة.',
    action:'تصدير PDF', filters:['الفترة','من حساب','إلى حساب','مركز تكلفة'],
    columns:['الحساب','الرصيد الافتتاحي','مدين','دائن','الرصيد','الإجراء'],
    rows:[['الإيرادات','0.00','0.00','0.00','0.00','عرض']]
  },
  'قفل الفترات': {
    type:'table', title:'قفل الفترات', subtitle:'منع تعديل الفواتير والقيود بعد اعتماد الفترة.',
    action:'قفل شهر', filters:['السنة','الشهر','الحالة','المسؤول'],
    columns:['الفترة','الحالة','تاريخ القفل','المسؤول','ملاحظات','الإجراء'],
    rows:[['يوليو 2026','مفتوحة','—','مدير النظام','—','قفل']]
  },
  'الحسابات البنكية': {type:'bank'},
  'الأصول الثابتة': {
    type:'table', title:'الأصول الثابتة', subtitle:'الأصول، الإهلاك، الموقع، والعهدة.',
    action:'أصل جديد', filters:['التصنيف','الموقع','الحالة','المسؤول'],
    columns:['الأصل','التصنيف','القيمة','الإهلاك','الحالة','الإجراء'],
    rows:[['سيارة تشغيل','مركبات','0.00 ﷼','0.00 ﷼','نشط','فتح']]
  },
  'مراكز التكلفة': {
    type:'table', title:'مراكز التكلفة', subtitle:'ربط المصروفات والإيرادات بالمشاريع والأقسام.',
    action:'مركز تكلفة', filters:['النوع','الحالة','الفرع','المسؤول'],
    columns:['الكود','المركز','النوع','الإيرادات','المصروفات','الإجراء'],
    rows:[['CC-001','مشاريع التشغيل','مشروع','0.00 ﷼','0.00 ﷼','فتح']]
  },
  'المشاريع': {
    type:'projects', title:'المشاريع', subtitle:'إدارة عقود المشاريع وربحيتها وتشغيلها.'
  },
  'الفروع': {
    type:'table', title:'الفروع', subtitle:'فروع الشركة والمستودعات والخزن المرتبطة بها.',
    action:'فرع جديد', filters:['المدينة','الحالة','المدير','النشاط'],
    columns:['الفرع','المدينة','المدير','الحساب البنكي','الحالة','الإجراء'],
    rows:[['الفرع الرئيسي','الرياض','مدير النظام','الحساب البنكي','نشط','فتح']]
  },
  'API': {
    type:'developer', title:'API', subtitle:'مفاتيح الربط والتكاملات البرمجية.'
  },
  'Webhooks': {
    type:'developer', title:'Webhooks', subtitle:'إرسال الأحداث للأنظمة الخارجية.'
  },
  'سجل النظام': {
    type:'table', title:'سجل النظام', subtitle:'تدقيق العمليات والتعديلات والحذف والدخول.',
    action:'تصدير السجل', filters:['المستخدم','العملية','الفترة','القسم'],
    columns:['الوقت','المستخدم','القسم','العملية','IP','الإجراء'],
    rows:[['اليوم','مدير النظام','النظام','فتح شاشة','127.0.0.1','عرض']]
  },
  'التكاملات': {
    type:'cards', title:'التكاملات', subtitle:'ربط واتساب، البريد، الفوترة الإلكترونية، والبنوك.',
    action:'تكامل جديد', stats:[['نشط','0'],['بانتظار إعداد','4'],['أخطاء','0']],
    filters:['النوع','الحالة','المزود'],
    cards:[['ZATCA','تجهيز للفوترة الإلكترونية والـ QR.','قيد الإعداد'],['WhatsApp','إرسال التقارير والفواتير للعملاء.','قيد الإعداد'],['Bank Feed','استيراد كشوف الحساب البنكية.','قيد الإعداد']]
  },
  'القوالب': {
    type:'cards', title:'القوالب', subtitle:'قوالب PDF ورسائل واتساب وبريد إلكتروني.',
    action:'قالب جديد', stats:[['PDF','6'],['رسائل','8'],['نشط','14']],
    filters:['النوع','القسم','الحالة'],
    cards:[['فاتورة ضريبية','قالب فاتورة بيع PDF.','نشط'],['تقرير عميل','قالب تقرير تشغيل PDF.','نشط'],['رسالة واتساب','قوالب إرسال للعملاء.','نشط']]
  },
  'مركز المساعدة': {
    type:'help', title:'مركز المساعدة', subtitle:'إرشادات استخدام النظام والدعم.'
  }
};

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
function toggleGroup(btn){ btn.parentElement.classList.toggle('open'); }

function openSection(name){
  currentSection = name;
  renderNav();
  closeModal();
  if(name === 'البريد الوارد') return renderInbox();
  if(name === 'لوحة البيانات') return renderDashboard(dashboardTab || 'pnl');
  const cfg = sectionConfig[name];
  if(!cfg) return renderGenericPage(name);
  if(cfg.type === 'bank') return renderBankAccounts();
  if(cfg.type === 'table') return renderTablePage(cfg);
  if(cfg.type === 'cards') return renderCardsPage(cfg);
  if(cfg.type === 'reports') return renderReportsPage(cfg);
  if(cfg.type === 'approvals') return renderApprovalsPage(cfg);
  if(cfg.type === 'attendance') return renderAttendancePage(cfg);
  if(cfg.type === 'inventory') return renderInventoryPage(cfg);
  if(cfg.type === 'projects') return renderProjectsPage(cfg);
  if(cfg.type === 'developer') return renderDeveloperPage(cfg);
  if(cfg.type === 'help') return renderHelpPage(cfg);
  return renderGenericPage(name);
}

function pageShell(cfg, body){
  $('#content').className = 'module-layout';
  $('#content').innerHTML = `
    <section class="module-page">
      <div class="module-header">
        <div>
          <h1>${cfg.title}</h1>
          <p>${cfg.subtitle || ''}</p>
        </div>
        <button class="module-primary" onclick="toast('فتح نافذة: ${cfg.action || 'إجراء جديد'}')">${cfg.action || 'جديد'}</button>
      </div>
      ${body}
    </section>`;
}

function filterBar(filters=[]){
  return `<div class="module-filterbar">
    <div class="module-search"><span>⌕</span><input placeholder="بحث سريع..." oninput="quickFilter(this.value)" /></div>
    ${filters.map(f=>`<button class="filter-chip">${f} <span>⌄</span></button>`).join('')}
    <button class="filter-chip clear" onclick="toast('تم تصفير الفلاتر')">تصفير</button>
  </div>`;
}

function statsRow(stats=[]){
  if(!stats.length) return '';
  return `<div class="stats-row">${stats.map(s=>`<div class="stat-card"><span>${s[0]}</span><strong>${s[1]}</strong></div>`).join('')}</div>`;
}

function renderTablePage(cfg){
  pageShell(cfg, `
    ${filterBar(cfg.filters || [])}
    ${statsRow(cfg.stats || [['إجمالي السجلات', cfg.rows?.length || 0], ['قيد المعالجة','1'], ['مكتمل','0']])}
    <div class="pro-table-card">
      <table class="pro-table">
        <thead><tr>${cfg.columns.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${(cfg.rows||[]).map(r=>`<tr>${r.map((c,i)=>`<td>${i===r.length-1?`<button class="table-action" onclick="openRecord('${cfg.title}')">${c}</button>`:c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`);
}

function renderCardsPage(cfg){
  pageShell(cfg, `
    ${filterBar(cfg.filters || [])}
    ${statsRow(cfg.stats || [])}
    <div class="module-card-grid">
      ${cfg.cards.map(c=>`<article class="module-card" onclick="openRecord('${c[0]}')">
        <h3>${c[0]}</h3><p>${c[1]}</p><span class="status-pill">${c[2]}</span>
      </article>`).join('')}
    </div>`);
}

function renderReportsPage(cfg){
  pageShell(cfg, `
    ${filterBar(['القسم','الفترة','الصيغة','المستخدم'])}
    <div class="report-grid">
      ${cfg.reports.map(r=>`<article class="report-card">
        <div class="report-icon">▤</div><h3>${r}</h3><p>تقرير جاهز للتصدير PDF أو Excel مع فلاتر ذكية.</p>
        <button onclick="toast('تجهيز تقرير ${r}')">تشغيل التقرير</button>
      </article>`).join('')}
    </div>`);
}

function renderApprovalsPage(cfg){
  pageShell(cfg, `
    ${filterBar(['المورد','المشروع','المبلغ','المعتمد'])}
    <div class="approval-flow">
      ${['طلب شراء','مراجعة المحاسب','اعتماد المدير','إصدار أمر الشراء','استلام / فاتورة'].map((s,i)=>`
        <div class="approval-step"><strong>${i+1}</strong><span>${s}</span><em>${i<1?'نشط':'بانتظار'}</em></div>`).join('')}
    </div>
    <div class="pro-table-card"><table class="pro-table"><thead><tr><th>الطلب</th><th>المورد</th><th>المبلغ</th><th>المرحلة</th><th>الإجراء</th></tr></thead>
    <tbody><tr><td>APR-0001</td><td>مورد تجريبي</td><td>0.00 ﷼</td><td>مراجعة</td><td><button class="table-action" onclick="openRecord('اعتماد')">فتح</button></td></tr></tbody></table></div>`);
}

function renderAttendancePage(cfg){
  pageShell({...cfg, action:'تسجيل حضور'}, `
    ${filterBar(['الشهر','المشروع','الموظف','الحالة'])}
    ${statsRow([['حضور اليوم','0'],['تأخير','0'],['غياب','0'],['أوفر تايم','0']])}
    <div class="attendance-board">
      ${['ضمن الوقت','تأخير','خروج مبكر','أوفر تايم','غياب'].map(s=>`<div class="attendance-col"><h3>${s}</h3><div class="empty-mini">لا توجد سجلات</div></div>`).join('')}
    </div>`);
}

function renderInventoryPage(cfg){
  pageShell({...cfg, action:'صنف جديد'}, `
    ${filterBar(['المستودع','التصنيف','الحالة','تحت الحد','عهدة'])}
    ${statsRow([['الأصناف','0'],['تحت الحد','0'],['محجوز','0'],['قيمة المخزون','0.00 ﷼']])}
    <div class="inventory-grid">
      ${[
        ['مواد تنظيف','SKU-CLN','المخزن الرئيسي','متاح'],
        ['لمبات ومواد كهرباء','SKU-ELE','المخزن الرئيسي','تحت الحد'],
        ['عدد وأدوات','SKU-TLS','عهدة','متاح']
      ].map(i=>`<article class="inventory-card" onclick="openRecord('${i[0]}')">
        <div class="sku-box">▦</div><h3>${i[0]}</h3><p>${i[1]} · ${i[2]}</p><span class="status-pill">${i[3]}</span>
        <div class="inv-actions"><button>صرف</button><button>استلام</button><button>تحويل</button></div>
      </article>`).join('')}
    </div>`);
}

function renderProjectsPage(cfg){
  pageShell({...cfg, action:'مشروع جديد'}, `
    ${filterBar(['العميل','المشرف','حالة العقد','قريب الانتهاء'])}
    ${statsRow([['مشاريع نشطة','35+'],['قريبة الانتهاء','0'],['تكتات مفتوحة','0'],['ربحية الشهر','0.00 ﷼']])}
    <div class="project-grid">
      ${['الماجدية 70','الرمز A17','العجلان 30','برج جوديا'].map((p,i)=>`<article class="project-card" onclick="openRecord('${p}')">
        <h3>${p}</h3><p>مشروع إدارة مرافق · مشرف مسؤول · عقد نشط</p>
        <div class="project-metrics"><span>تكتات: 0</span><span>مصروفات: 0.00 ﷼</span><span>إيرادات: 0.00 ﷼</span></div>
      </article>`).join('')}
    </div>`);
}

function renderDeveloperPage(cfg){
  pageShell({...cfg, action:'إضافة مفتاح'}, `
    ${filterBar(['الحالة','النظام','آخر استخدام'])}
    <div class="developer-box">
      <h3>${cfg.title}</h3>
      <p>${cfg.subtitle}</p>
      <pre>{
  "status": "ready",
  "environment": "prototype",
  "version": "V010"
}</pre>
    </div>`);
}

function renderHelpPage(cfg){
  pageShell({...cfg, action:'طلب دعم'}, `
    <div class="help-grid">
      ${['بدء استخدام النظام','المحاسبة والفواتير','المخزون والعهد','المشاريع والتكتات','الرواتب والحضور','التكاملات'].map(h=>`<article class="help-card"><h3>${h}</h3><p>شرح مختصر وخطوات عملية لهذا القسم.</p><button onclick="toast('فتح المساعدة')">عرض</button></article>`).join('')}
    </div>`);
}

function renderGenericPage(name){
  renderTablePage({
    title:name, subtitle:'شاشة احترافية قابلة للتطوير ضمن نظام تصنيف ERP.',
    action:'إضافة جديد', filters:['الحالة','التاريخ','المسؤول'],
    columns:['السجل','الحالة','المسؤول','آخر تحديث','الإجراء'],
    rows:[[name+' - 001','نشط','مدير النظام','اليوم','فتح']]
  });
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
      <div class="inbox-head"><button class="refresh" title="تحديث">⟳</button><h1>البريد الوارد</h1><div class="channel-icons"><span>◉</span><span>✉</span></div></div>
      <div class="inbox-search"><input placeholder="البحث" /><span>⌕</span></div>
      <div class="inbox-tabs"><label class="select-all"><input type="checkbox" /></label><button class="active">الكل</button><button>في انتظار المعالجة <span class="count">1</span></button><button>تم</button></div>
      <article class="message-row active"><input type="checkbox" /><div><strong>مرحبًا بك في صندوق الوارد الخاص بك على تصنيف - ابدأ الآن!</strong><small>منذ 9 دقائق</small><em>غير معالج</em></div></article>
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
      <div class="page-title-row"><h1>لوحة البيانات</h1></div>
      <div class="dash-tabs"><button class="${isPnl?'active':''}" onclick="renderDashboard('pnl')">الأرباح والخسائر</button><button class="${!isPnl?'active':''}" onclick="renderDashboard('cash')">التدفق النقدي</button></div>
      <div class="dash-filter-row"><button class="filter-pill"><span>📅</span> آخر 6 أشهر</button><button class="filter-pill">يناير-يوليو 2026 <span>⌄</span></button><button class="filter-pill">عرض حسب الشهر <span>⌄</span></button></div>
      ${isPnl ? renderPnlDashboard() : renderCashDashboard()}
    </section>`;
}

function chartIllustration(type='bars'){
  return `<div class="chart-illustration ${type}">
    <span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span><span class="bar b4"></span><span class="bar b5"></span><span class="bar b6"></span>
    <svg viewBox="0 0 240 90" aria-hidden="true"><polyline points="8,76 45,50 78,58 112,28 145,54 182,35 226,48" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="112" cy="28" r="5" fill="currentColor"/><circle cx="182" cy="35" r="5" fill="currentColor"/></svg>
  </div>`;
}
function emptyTableIcon(){ return `<div class="empty-doc"><span>▧</span><i>×</i></div>`; }
function renderPnlDashboard(){
  return `<div class="analytics-grid">
    <article class="analytics-card"><h2>الإيرادات والأرباح والخسائر</h2>${chartIllustration('bars')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو أنشئ بعض الفواتير لعرض<br>بعض البيانات</p><button class="primary-green" onclick="openSection('فواتير بيع')">أنشئ فاتورة</button></article>
    <article class="analytics-card"><h2>مجمل الربح</h2>${chartIllustration('bars')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو أنشئ بعض الفواتير لعرض<br>بعض البيانات</p><button class="primary-green" onclick="openSection('فواتير بيع')">أنشئ فاتورة</button></article>
  </div>
  <div class="table-grid">${dashboardTable('أكبر فواتير مبيعات متأخرة', ['فاتورة','أيام متأخرة','الرصيد'], 'لا توجد فواتير مبيعات متأخرة')}${dashboardTable('أكبر فواتير مشتريات متأخرة', ['فاتورة المشتريات','أيام متأخرة','الرصيد'], 'لا توجد فواتير مشتريات متأخرة')}</div>`;
}
function renderCashDashboard(){
  return `<h2 class="section-title">نظرة نقدية عامة - حسابات بنك</h2>
  <div class="analytics-grid">
    <article class="analytics-card"><h2>الرصيد بحسب كشف الحساب</h2>${chartIllustration('line')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو قم باستيراد كشف الحساب<br>لعرض بعض البيانات</p><button class="primary-green" onclick="openSection('الحسابات البنكية')">قم باستيراد كشف الحساب</button></article>
    <article class="analytics-card"><h2>التدفق النقدي بحسب كشف الحساب</h2>${chartIllustration('cash')}<p>لا توجد بيانات للعرض ضمن الفترة الزمنية المختارة<br>قم بتعديل الفترة الزمنية أو قم باستيراد كشف الحساب<br>لعرض بعض البيانات</p><button class="primary-green" onclick="openSection('الحسابات البنكية')">قم باستيراد كشف الحساب</button></article>
  </div>
  <div class="table-grid">${dashboardTable('أكبر فواتير مبيعات غير مدفوعة', ['فاتورة','تاريخ الاستحقاق','الرصيد'], 'لا توجد فواتير مبيعات غير مدفوعة')}${dashboardTable('أكبر فواتير مشتريات غير مدفوعة', ['فاتورة المشتريات','تاريخ الاستحقاق','الرصيد'], 'لا توجد فواتير مشتريات غير مدفوعة')}</div>`;
}
function dashboardTable(title, cols, emptyText){
  return `<article class="dash-table-card"><div class="table-card-head"><h3>${title}</h3><button onclick="toast('فتح القائمة الكاملة')">عرض ‹</button></div><table class="dash-table"><thead><tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead><tbody><tr><td colspan="${cols.length}" class="empty-cell">${emptyTableIcon()}<p>${emptyText}</p></td></tr></tbody></table></article>`;
}

const bankAccountsData = [{name:'الحساب البنكي', icon:'🏦'}, {name:'المصروفات النثرية', icon:'💵'}, {name:'الخزينة', icon:'💰'}];
function renderBankAccounts(){
  $('#content').className = 'bank-layout';
  $('#content').innerHTML = `
    <section class="bank-page">
      <div class="page-title-row bank-title-row"><h1>الحسابات البنكية</h1><button class="add-bank-btn" onclick="toast('فتح نافذة إضافة حساب بنك')">أضف حساب بنك</button></div>
      <div class="bank-cards-wrap">${bankAccountsData.map(a => bankCard(a)).join('')}</div>
    </section>`;
}
function bankCard(a){
  return `<article class="bank-card">
    <div class="bank-card-top"><div class="bank-card-title-wrap"><div class="account-icon">${a.icon}</div><h2>${a.name}</h2></div><div class="bank-card-actions"><button class="more-btn" title="المزيد">⋮</button><button class="import-btn" onclick="toast('استيراد كشف حساب: ${a.name}')">استيراد كشف حساب</button></div></div>
    <div class="bank-metrics"><div class="metric-row"><strong>0.00 ﷼</strong><span>رصيد الدفتر</span></div><div class="metric-row"><strong>0.00 ﷼</strong><span>رصيد كشف الحساب</span></div><div class="metric-row metric-total"><strong>0.00 ﷼</strong><span>الفرق <em class="ok-badge">متوازن</em></span></div></div>
  </article>`;
}

function openRecord(name){
  const modal = $('#smartModal');
  modal.classList.remove('hidden');
  modal.innerHTML = `<div class="modal-head"><h2>نافذة ذكية - ${name}</h2><button class="close" onclick="closeModal()">إغلاق</button></div>
    <div class="record-layout">
      <div class="record-main">
        <label>الاسم / الرقم</label><input value="${name}" />
        <label>الحالة</label><select><option>نشط</option><option>مسودة</option><option>بانتظار اعتماد</option><option>مكتمل</option></select>
        <label>المشروع / مركز التكلفة</label><select><option>الماجدية 70</option><option>الرمز A17</option><option>العجلان 30</option></select>
        <label>ملاحظات</label><textarea>نافذة ذكية تعرض البيانات والمرفقات والحركات المرتبطة.</textarea>
      </div>
      <aside class="record-side">
        <div><strong>الأثر المحاسبي</strong><span>جاهز للربط</span></div>
        <div><strong>المرفقات</strong><span>0 ملفات</span></div>
        <div><strong>سجل التدقيق</strong><span>آخر تحديث الآن</span></div>
      </aside>
    </div>
    <div class="modal-actions"><button class="module-primary" onclick="toast('تم الحفظ')">حفظ</button><button class="close" onclick="closeModal()">إلغاء</button></div>`;
}
function closeModal(){ $('#smartModal').classList.add('hidden'); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),2400); }
function quickFilter(value){ if(value && value.length>1) toast('فلترة: '+value); }

document.addEventListener('keydown',(e)=>{ if((e.altKey || e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); $('#globalSearch').focus(); }});
$('#globalSearch').addEventListener('input',(e)=>{ if(e.target.value.trim().length>1) toast('بحث ذكي عن: '+e.target.value); });
renderNav();
renderInbox();
