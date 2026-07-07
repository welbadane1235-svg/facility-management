/*
  Tasneef ERP API Layer V017
  وضع حقيقي:
  - تسجيل دخول عبر Supabase Auth
  - RLS يعمل باستخدام access_token الخاص بالمستخدم
  - تحويل أسماء الحقول بين الواجهة وقاعدة البيانات
  - لا يوجد fallback محلي إلا إذا تم تفعيله صراحة من config.js
*/
(function(){
  const cfg = window.TASNEEF_CONFIG || {};
  const prefix = cfg.STORAGE_PREFIX || 'tasneef_erp_';
  const tokenKey = cfg.AUTH_TOKEN_KEY || 'tasneef_auth_token';
  const refreshKey = cfg.REFRESH_TOKEN_KEY || 'tasneef_refresh_token';
  let memorySession = {};

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
  function uid(prefix='REC'){ return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase(); }
  function apiBase(){ return (cfg.API_BASE_URL || '').replace(/\/$/, ''); }
  function authBase(){ return apiBase().replace('/rest/v1', '/auth/v1'); }
  function isSupabase(){ return (cfg.API_MODE || 'supabase') === 'supabase'; }
  function authStore(){ return cfg.AUTH_STORAGE === 'local' ? localStorage : sessionStorage; }
  function storageGet(name){
    try{ return authStore().getItem(name) || memorySession[name] || ''; }
    catch(_err){ return memorySession[name] || ''; }
  }
  function storageSet(name, value){
    memorySession[name] = value;
    try{ authStore().setItem(name, value); }
    catch(_err){ throw new Error('تعذر حفظ جلسة الدخول في المتصفح. افتح نافذة خاصة أو امسح بيانات الموقع ثم حاول مرة أخرى.'); }
  }
  function storageRemove(name){
    delete memorySession[name];
    try{ sessionStorage.removeItem(name); localStorage.removeItem(name); }
    catch(_err){}
  }
  function hasSession(){ return Boolean(storageGet(tokenKey)); }

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

  function authHeaders(extra={}){
    const anon = cfg.SUPABASE_ANON_KEY || '';
    const token = storageGet(tokenKey) || anon;
    return {
      apikey: anon,
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...extra
    };
  }

  function supabaseUrl(resource, query='select=*'){
    const table = tableMap[resource] || resource;
    return apiBase() + '/' + table + '?' + query;
  }

  function fromDb(resource, rows){
    if(!Array.isArray(rows)) return rows;
    if(resource === 'bankAccounts'){
      return rows.map(x => ({
        id: x.id,
        name: x.name,
        type: x.type,
        bookBalance: Number(x.book_balance ?? 0),
        statementBalance: Number(x.statement_balance ?? 0),
        status: x.status || 'نشط',
        createdAt: x.created_at,
        updatedAt: x.updated_at
      }));
    }
    if(resource === 'inbox'){
      return rows.map(x => ({
        id: x.id,
        title: x.title,
        from: x.sender || '',
        time: x.time_label || '',
        type: x.type,
        status: x.status,
        priority: x.priority,
        assignee: x.assignee,
        project: x.project,
        attachment: x.attachment || '—',
        suggested: x.suggested || '',
        body: x.body || '',
        activity: Array.isArray(x.activity) ? x.activity : [],
        createdAt: x.created_at,
        updatedAt: x.updated_at
      }));
    }
    if(resource === 'records'){
      return rows.map(x => ({
        id: x.id,
        type: x.type,
        accountId: x.account_id,
        fileName: x.file_name,
        status: x.status,
        createdAt: x.created_at,
        updatedAt: x.updated_at
      }));
    }
    if(resource === 'modules'){
      return rows.map(x => ({
        id: x.id,
        module: x.module,
        title: x.title,
        status: x.status,
        project: x.project,
        description: x.description,
        total: x.total,
        sourceInboxId: x.source_inbox_id,
        createdAt: x.created_at,
        updatedAt: x.updated_at
      }));
    }
    return rows;
  }

  function toDb(resource, data){
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
    if(resource === 'records'){
      return {
        id: data.id,
        type: data.type,
        account_id: data.accountId || data.account_id || null,
        file_name: data.fileName || data.file_name || null,
        status: data.status || 'مسودة'
      };
    }
    if(resource === 'modules'){
      return {
        id: data.id,
        module: data.module,
        title: data.title || data.name || data.id,
        status: data.status || 'مسودة',
        project: data.project || '',
        description: data.description || '',
        total: data.total || '0.00 ﷼',
        source_inbox_id: data.sourceInboxId || data.source_inbox_id || null
      };
    }
    return data;
  }

  async function request(url, options={}){
    const res = await fetch(url, options);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if(!res.ok){
      const message = data?.msg || data?.message || data?.error_description || data?.error || text || 'API error';
      throw new Error(message);
    }
    return data;
  }

  async function listDb(resource){
    return fromDb(resource, await request(supabaseUrl(resource), {headers:authHeaders()}));
  }

  async function createDb(resource, data){
    const item = {id:data.id || uid(resource.slice(0,3).toUpperCase()), ...data};
    const rows = await request(supabaseUrl(resource), {
      method:'POST',
      headers:authHeaders(),
      body:JSON.stringify(toDb(resource, item))
    });
    return fromDb(resource, rows)[0] || item;
  }

  async function updateDb(resource, id, data){
    const table = tableMap[resource] || resource;
    const rows = await request(apiBase() + '/' + table + '?id=eq.' + encodeURIComponent(id), {
      method:'PATCH',
      headers:authHeaders(),
      body:JSON.stringify(toDb(resource, {id, ...data}))
    });
    return fromDb(resource, rows)[0] || {id, ...data};
  }

  async function deleteDb(resource, id){
    const table = tableMap[resource] || resource;
    await request(apiBase() + '/' + table + '?id=eq.' + encodeURIComponent(id), {
      method:'DELETE',
      headers:authHeaders({'Prefer':'return=minimal'})
    });
    return {ok:true};
  }

  async function realOrLocal(resource, action, fallback){
    if(!isSupabase()) return fallback();
    if(!hasSession() && cfg.REQUIRE_AUTH !== false) throw new Error('يلزم تسجيل الدخول أولًا');
    try{
      return await action();
    }catch(err){
      if(cfg.LOCAL_FALLBACK === true) return fallback();
      throw err;
    }
  }

  function authMessage(message){
    const msg = String(message || '').toLowerCase();
    if(msg.includes('email not confirmed')) return 'البريد الإلكتروني غير مؤكد. افتح رسالة التحقق في بريدك ثم حاول الدخول.';
    if(msg.includes('invalid login')) return 'بيانات الدخول غير صحيحة.';
    if(msg.includes('user already registered')) return 'هذا البريد مسجل مسبقًا. استخدم تسجيل الدخول أو استرجاع كلمة المرور.';
    if(msg.includes('rate limit')) return 'تم إرسال عدة طلبات بسرعة. انتظر قليلًا ثم حاول مرة أخرى.';
    if(msg.includes('password')) return 'تحقق من كلمة المرور. يجب أن تكون مطابقة لشروط Supabase.';
    return message || 'تعذر تنفيذ العملية.';
  }

  async function authRequest(path, body, options={}){
    try{
      return await request(authBase() + path, {
        method:options.method || 'POST',
        headers:{
          apikey: cfg.SUPABASE_ANON_KEY || '',
          ...(options.authorized ? {Authorization:'Bearer ' + storageGet(tokenKey)} : {}),
          'Content-Type':'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
      });
    }catch(err){
      throw new Error(authMessage(err.message));
    }
  }

  function withRedirect(path){
    const url = new URL(authBase() + path);
    url.searchParams.set('redirect_to', cfg.EMAIL_REDIRECT_URL || location.href);
    return url.href.replace(authBase(), '');
  }

  function saveSession(session){
    if(!session?.access_token) return null;
    storageSet(tokenKey, session.access_token);
    if(session.refresh_token) storageSet(refreshKey, session.refresh_token);
    storageSet(prefix + 'user', JSON.stringify(session.user || {}));
    return session.user || null;
  }

  async function getCloudUser(){
    if(!hasSession()) return null;
    const user = await request(authBase() + '/user', {
      method:'GET',
      headers:{
        apikey: cfg.SUPABASE_ANON_KEY || '',
        Authorization:'Bearer ' + storageGet(tokenKey)
      }
    });
    storageSet(prefix + 'user', JSON.stringify(user || {}));
    return user;
  }

  async function appServerRequest(path, options={}){
    const res = await fetch(path, {
      ...options,
      headers:{
        'Content-Type':'application/json',
        Authorization:'Bearer ' + storageGet(tokenKey),
        ...(options.headers || {})
      }
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if(!res.ok) throw new Error(data?.error || data?.message || 'تعذر الاتصال بالخادم');
    return data;
  }

  window.TasneefAPI = {
    uid,

    auth: {
      isLoggedIn: hasSession,
      user(){
        try{ return JSON.parse(storageGet(prefix + 'user') || 'null'); }
        catch(_err){ return null; }
      },
      getUser: getCloudUser,
      async login(email, password){
        const session = await authRequest('/token?grant_type=password', {email, password});
        const user = saveSession(session);
        if(user && user.email_confirmed_at === null){
          this.logout();
          throw new Error('البريد الإلكتروني غير مؤكد. افتح رسالة التحقق في بريدك ثم حاول الدخول.');
        }
        return user;
      },
      async signup(email, password){
        const session = await authRequest(withRedirect('/signup'), {email, password, data:{app:'tasneef_erp'}});
        return saveSession(session);
      },
      async resendVerification(email){
        return authRequest('/resend', {
          type:'signup',
          email,
          options:{email_redirect_to: cfg.EMAIL_REDIRECT_URL || location.href}
        });
      },
      async recoverPassword(email){
        return authRequest(withRedirect('/recover'), {email});
      },
      async updatePassword(password){
        return authRequest('/user', {password}, {authorized:true});
      },
      logout(){
        storageRemove(tokenKey);
        storageRemove(refreshKey);
        storageRemove(prefix + 'user');
      }
    },

    admin: {
      async users(){
        return appServerRequest('/admin/users');
      },
      async inviteUser(data){
        return appServerRequest('/admin/users/invite', {method:'POST', body:JSON.stringify(data)});
      }
    },

    async list(resource){
      return realOrLocal(resource, () => listDb(resource), () => readLocal(resource));
    },

    async create(resource, data){
      return realOrLocal(resource,
        () => createDb(resource, data),
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
      return realOrLocal(resource,
        () => updateDb(resource, id, data),
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
      return realOrLocal(resource, () => deleteDb(resource, id), () => {
        const list = readLocal(resource).filter(x => x.id !== id);
        writeLocal(resource, list);
        return {ok:true};
      });
    },

    async moduleRecords(moduleName){
      return realOrLocal('modules',
        async () => {
          const rows = await request(apiBase() + '/' + tableMap.modules + '?select=*&module=eq.' + encodeURIComponent(moduleName), {headers:authHeaders()});
          return fromDb('modules', rows);
        },
        () => {
          const modules = readLocal('modules');
          return modules[moduleName] || [];
        }
      );
    },

    async saveModuleRecord(moduleName, data){
      const item = {id:data.id || uid('REC'), module:moduleName, ...data};
      return realOrLocal('modules',
        () => createDb('modules', item),
        () => {
          const modules = readLocal('modules');
          const list = modules[moduleName] || [];
          const idx = list.findIndex(x => x.id === item.id);
          if(idx >= 0) list[idx] = item; else list.unshift({...item, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()});
          modules[moduleName] = list;
          writeLocal('modules', modules);
          return item;
        }
      );
    },

    async importBankStatement(accountId, fileName='bank-statement.xlsx'){
      return this.create('records', {id:uid('BNK'), type:'bank_statement', accountId, fileName, status:'imported'});
    },

    reset(){
      Object.keys(seed).forEach(k => localStorage.removeItem(key(k)));
      return true;
    }
  };
})();
