
/*
  Tasneef ERP API Layer V015
  - local: يعمل على localStorage
  - supabase: يحاول قراءة/كتابة Supabase REST ثم يرجع محليًا كاحتياط إذا الجدول غير موجود
  - server: API خاص لاحقًا
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
      {id:'BA-001', name:'الحساب البنكي', type:'bank', bookBalance:0, statementBalance:0, status:'نشط'},
      {id:'BA-002', name:'المصروفات النثرية', type:'petty_cash', bookBalance:0, statementBalance:0, status:'نشط'},
      {id:'BA-003', name:'الخزينة', type:'cash', bookBalance:0, statementBalance:0, status:'نشط'}
    ],
    modules: {}
  };

  const tableMap = {
    inbox: 'inbox',
    bankAccounts: 'bank_accounts',
    records: 'records',
    modules: 'module_records'
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

  function supabaseHeaders(extra={}){
    const anon = cfg.SUPABASE_ANON_KEY || '';
    return {
      'apikey': anon,
      'Authorization': 'Bearer ' + anon,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...extra
    };
  }

  function supabaseUrl(resource, query='select=*'){
    const table = tableMap[resource] || resource;
    const base = (cfg.API_BASE_URL || '').replace(/\/$/, '');
    return base + '/' + table + '?' + query;
  }

  function normalizeFromSupabase(resource, rows){
    if(!Array.isArray(rows)) return rows;
    if(resource === 'bankAccounts'){
      return rows.map(x => ({
        id: x.id,
        name: x.name,
        type: x.type,
        bookBalance: Number(x.book_balance ?? x.bookBalance ?? 0),
        statementBalance: Number(x.statement_balance ?? x.statementBalance ?? 0),
        status: x.status || 'نشط'
      }));
    }
    if(resource === 'inbox'){
      return rows.map(x => ({
        id: x.id,
        title: x.title,
        from: x.sender || x.from || '',
        time: x.time_label || x.time || '',
        type: x.type,
        status: x.status,
        priority: x.priority,
        assignee: x.assignee,
        project: x.project,
        attachment: x.attachment || '—',
        suggested: x.suggested || '',
        body: x.body || '',
        activity: Array.isArray(x.activity) ? x.activity : (x.activity ? JSON.parse(x.activity) : [])
      }));
    }
    return rows;
  }

  function normalizeToSupabase(resource, data){
    if(resource === 'bankAccounts'){
      return {
        id: data.id,
        name: data.name,
        type: data.type || 'bank',
        book_balance: Number(data.bookBalance ?? data.book_balance ?? 0),
        statement_balance: Number(data.statementBalance ?? data.statement_balance ?? 0),
        status: data.status || 'نشط'
      };
    }
    if(resource === 'inbox'){
      return {
        id: data.id,
        title: data.title,
        sender: data.from || data.sender || '',
        time_label: data.time || data.time_label || '',
        type: data.type,
        status: data.status,
        priority: data.priority,
        assignee: data.assignee,
        project: data.project,
        attachment: data.attachment || '—',
        suggested: data.suggested || '',
        body: data.body || '',
        activity: data.activity || []
      };
    }
    return data;
  }

  async function trySupabaseList(resource){
    const res = await fetch(supabaseUrl(resource), {headers:supabaseHeaders()});
    if(!res.ok) throw new Error(await res.text());
    return normalizeFromSupabase(resource, await res.json());
  }

  async function trySupabaseCreate(resource, data){
    const payload = normalizeToSupabase(resource, data);
    const res = await fetch(supabaseUrl(resource), {
      method:'POST',
      headers:supabaseHeaders(),
      body:JSON.stringify(payload)
    });
    if(!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    return normalizeFromSupabase(resource, rows)[0] || data;
  }

  async function trySupabaseUpdate(resource, id, data){
    const payload = normalizeToSupabase(resource, {id, ...data});
    const table = tableMap[resource] || resource;
    const base = (cfg.API_BASE_URL || '').replace(/\/$/, '');
    const res = await fetch(base + '/' + table + '?id=eq.' + encodeURIComponent(id), {
      method:'PATCH',
      headers:supabaseHeaders(),
      body:JSON.stringify(payload)
    });
    if(!res.ok) throw new Error(await res.text());
    const rows = await res.json();
    return normalizeFromSupabase(resource, rows)[0] || {id, ...data};
  }

  async function serverRequest(path, options={}){
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

  function shouldUseSupabase(){
    return (cfg.API_MODE || 'local') === 'supabase' && cfg.API_BASE_URL && cfg.SUPABASE_ANON_KEY;
  }

  async function withFallback(resource, action, fallback){
    try{
      if(shouldUseSupabase()) return await action();
      if((cfg.API_MODE || 'local') === 'server') return await action();
    }catch(err){
      console.warn('API fallback for', resource, err.message || err);
      if(!cfg.LOCAL_FALLBACK) throw err;
    }
    return fallback();
  }

  window.TasneefAPI = {
    uid,

    async list(resource){
      return withFallback(resource,
        async () => {
          if(shouldUseSupabase()) return trySupabaseList(resource);
          return serverRequest('/api/' + resource);
        },
        () => readLocal(resource)
      );
    },

    async create(resource, data){
      return withFallback(resource,
        async () => {
          const item = {id:data.id || uid(resource.slice(0,3).toUpperCase()), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), ...data};
          if(shouldUseSupabase()) return trySupabaseCreate(resource, item);
          return serverRequest('/api/' + resource, {method:'POST', body:JSON.stringify(item)});
        },
        () => {
          const list = readLocal(resource);
          const item = {id:data.id || uid(resource.slice(0,3).toUpperCase()), createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), ...data};
          list.unshift(item);
          writeLocal(resource, list);
          return item;
        }
      );
    },

    async update(resource, id, data){
      return withFallback(resource,
        async () => {
          if(shouldUseSupabase()) return trySupabaseUpdate(resource, id, data);
          return serverRequest('/api/' + resource + '/' + encodeURIComponent(id), {method:'PUT', body:JSON.stringify(data)});
        },
        () => {
          const list = readLocal(resource);
          const idx = list.findIndex(x => x.id === id);
          if(idx >= 0) list[idx] = {...list[idx], ...data, updatedAt:new Date().toISOString()};
          writeLocal(resource, list);
          return list[idx] || {id, ...data};
        }
      );
    },

    async remove(resource, id){
      return withFallback(resource,
        async () => serverRequest('/api/' + resource + '/' + encodeURIComponent(id), {method:'DELETE'}),
        () => {
          const list = readLocal(resource).filter(x => x.id !== id);
          writeLocal(resource, list);
          return {ok:true};
        }
      );
    },

    async moduleRecords(moduleName){
      if(shouldUseSupabase()){
        try{
          const base = (cfg.API_BASE_URL || '').replace(/\/$/, '');
          const table = tableMap.modules;
          const res = await fetch(base + '/' + table + '?select=*&module=eq.' + encodeURIComponent(moduleName), {headers:supabaseHeaders()});
          if(res.ok) return await res.json();
          throw new Error(await res.text());
        }catch(err){ if(!cfg.LOCAL_FALLBACK) throw err; }
      }
      const modules = readLocal('modules');
      return modules[moduleName] || [];
    },

    async saveModuleRecord(moduleName, data){
      const item = {id:data.id || uid('REC'), module:moduleName, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), ...data};
      if(shouldUseSupabase()){
        try{
          const base = (cfg.API_BASE_URL || '').replace(/\/$/, '');
          const table = tableMap.modules;
          const res = await fetch(base + '/' + table + '?select=*', {method:'POST', headers:supabaseHeaders(), body:JSON.stringify(item)});
          if(res.ok) return (await res.json())[0] || item;
          throw new Error(await res.text());
        }catch(err){ if(!cfg.LOCAL_FALLBACK) throw err; }
      }
      const modules = readLocal('modules');
      const list = modules[moduleName] || [];
      const idx = list.findIndex(x => x.id === item.id);
      if(idx >= 0) list[idx] = item; else list.unshift(item);
      modules[moduleName] = list;
      writeLocal('modules', modules);
      return item;
    },

    async importBankStatement(accountId, fileName='bank-statement.xlsx'){
      const item = {id:uid('BNK'), type:'bank_statement', accountId, fileName, status:'imported', createdAt:new Date().toISOString()};
      return this.create('records', item);
    },

    reset(){
      Object.keys(seed).forEach(k => localStorage.removeItem(key(k)));
      return true;
    }
  };
})();
