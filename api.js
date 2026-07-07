
/*
  Tasneef ERP API Layer
  تعمل الآن محليًا عبر localStorage.
  عند تغيير API_MODE إلى server سيتم إرسال الطلبات إلى السيرفر.
*/
(function(){
  const cfg = window.TASNEEF_CONFIG || {};
  const prefix = cfg.STORAGE_PREFIX || 'tasneef_erp_';

  const seed = {
    records: [],
    inbox: [
      {id:'INB-0001', title:'فاتورة مورد - مواد تنظيف', from:'مورد مواد تنظيف', time:'منذ 12 دقيقة', type:'فاتورة مورد', status:'غير معالج', priority:'متوسطة', assignee:'المحاسب', project:'المخزن الرئيسي', attachment:'invoice_supplier_0001.pdf', suggested:'إنشاء فاتورة مورد وربطها بالمورد والمشروع', body:'وصلت فاتورة مواد تنظيف للمراجعة والاعتماد قبل الصرف.', activity:['تم استلام الرسالة','تم اكتشاف مرفق PDF','تم اقتراح إنشاء فاتورة مورد']},
      {id:'INB-0002', title:'شكوى عميل - ضعف ضخ المياه', from:'رئيس جمعية الماجدية 70', time:'منذ 28 دقيقة', type:'تكت صيانة', status:'يحتاج إجراء', priority:'عالية', assignee:'مدير التشغيل', project:'الماجدية 70', attachment:'water_issue_photo.jpg', suggested:'إنشاء تكت صيانة وتعيين فني', body:'العميل يفيد بوجود ضعف في ضخ المياه ويطلب الفحص بشكل عاجل.', activity:['تم استلام الشكوى','تم تحديد المشروع: الماجدية 70','الأولوية عالية']},
      {id:'INB-0003', title:'كشف حساب بنكي - شهر يوليو', from:'البنك', time:'منذ ساعة', type:'كشف بنكي', status:'بانتظار المعالجة', priority:'متوسطة', assignee:'المحاسب', project:'الحساب البنكي', attachment:'bank_statement_july.xlsx', suggested:'استيراد كشف الحساب والبدء بالمطابقة البنكية', body:'كشف حساب بنكي جديد جاهز للاستيراد والمطابقة.', activity:['تم استلام كشف الحساب','تم التعرف على نوع الملف XLSX']},
      {id:'INB-0004', title:'طلب صرف مواد - الرمز A17', from:'مشرف الموقع', time:'منذ ساعتين', type:'طلب مخزن', status:'غير معالج', priority:'متوسطة', assignee:'مسؤول المخزن', project:'الرمز A17', attachment:'request_items.png', suggested:'إنشاء طلب صرف وربطه بالمشروع', body:'طلب صرف مواد تشغيلية للموقع حسب الاحتياج المرفق.', activity:['تم استلام الطلب','تم ربطه بمشروع الرمز A17']}
    ],
    bankAccounts: [
      {id:'BA-001', name:'الحساب البنكي', type:'bank', bookBalance:0, statementBalance:0},
      {id:'BA-002', name:'المصروفات النثرية', type:'petty_cash', bookBalance:0, statementBalance:0},
      {id:'BA-003', name:'الخزينة', type:'cash', bookBalance:0, statementBalance:0}
    ],
    modules: {}
  };

  function key(name){ return prefix + name; }

  function readLocal(name){
    const raw = localStorage.getItem(key(name));
    if(raw) return JSON.parse(raw);
    const val = seed[name] ?? [];
    localStorage.setItem(key(name), JSON.stringify(val));
    return JSON.parse(JSON.stringify(val));
  }

  function writeLocal(name, value){
    localStorage.setItem(key(name), JSON.stringify(value));
    return value;
  }

  function uid(prefix='REC'){
    return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
  }

  async function request(path, options={}){
    if((cfg.API_MODE || 'local') !== 'server'){
      throw new Error('Server mode is disabled');
    }
    const token = localStorage.getItem(cfg.AUTH_TOKEN_KEY || 'tasneef_auth_token');
    const res = await fetch((cfg.API_BASE_URL || '') + path, {
      ...options,
      headers: {
        'Content-Type':'application/json',
        ...(token ? {Authorization:'Bearer ' + token} : {}),
        ...(options.headers || {})
      }
    });
    if(!res.ok) throw new Error(await res.text());
    return res.json();
  }

  window.TasneefAPI = {
    uid,

    async list(resource){
      if((cfg.API_MODE || 'local') === 'server') return request('/api/' + resource);
      return readLocal(resource);
    },

    async get(resource, id){
      if((cfg.API_MODE || 'local') === 'server') return request('/api/' + resource + '/' + encodeURIComponent(id));
      return readLocal(resource).find(x => x.id === id);
    },

    async create(resource, data){
      if((cfg.API_MODE || 'local') === 'server'){
        return request('/api/' + resource, {method:'POST', body:JSON.stringify(data)});
      }
      const list = readLocal(resource);
      const item = {id:data.id || uid(resource.slice(0,3).toUpperCase()), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), ...data};
      list.unshift(item);
      writeLocal(resource, list);
      return item;
    },

    async update(resource, id, data){
      if((cfg.API_MODE || 'local') === 'server'){
        return request('/api/' + resource + '/' + encodeURIComponent(id), {method:'PUT', body:JSON.stringify(data)});
      }
      const list = readLocal(resource);
      const idx = list.findIndex(x => x.id === id);
      if(idx >= 0) list[idx] = {...list[idx], ...data, updatedAt:new Date().toISOString()};
      writeLocal(resource, list);
      return list[idx];
    },

    async remove(resource, id){
      if((cfg.API_MODE || 'local') === 'server'){
        return request('/api/' + resource + '/' + encodeURIComponent(id), {method:'DELETE'});
      }
      const list = readLocal(resource).filter(x => x.id !== id);
      writeLocal(resource, list);
      return {ok:true};
    },

    async moduleRecords(moduleName){
      const modules = readLocal('modules');
      return modules[moduleName] || [];
    },

    async saveModuleRecord(moduleName, data){
      if((cfg.API_MODE || 'local') === 'server'){
        return request('/api/modules/' + encodeURIComponent(moduleName) + '/records', {method:'POST', body:JSON.stringify(data)});
      }
      const modules = readLocal('modules');
      const list = modules[moduleName] || [];
      const item = {id:data.id || uid('REC'), module:moduleName, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), ...data};
      const idx = list.findIndex(x => x.id === item.id);
      if(idx >= 0) list[idx] = item; else list.unshift(item);
      modules[moduleName] = list;
      writeLocal('modules', modules);
      return item;
    },

    async importBankStatement(accountId, fileName='bank-statement.xlsx'){
      const records = readLocal('records');
      const item = {id:uid('BNK'), type:'bank_statement', accountId, fileName, status:'imported', createdAt:new Date().toISOString()};
      records.unshift(item);
      writeLocal('records', records);
      return item;
    },

    reset(){
      Object.keys(seed).forEach(k => localStorage.removeItem(key(k)));
      return true;
    }
  };
})();
