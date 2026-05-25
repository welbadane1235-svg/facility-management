/* HireX Auth Engine V14 - clean auth layer, does not block browse buttons. */
(function(){
  'use strict';
  var sbClient = null;
  var pendingCallback = null;
  var pendingReason = '';
  var replaying = false;
  var wrapped = {};

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function safeText(v){ return String(v == null ? '' : v); }

  function notify(msg){
    try{
      if(typeof window.showMiniNotice === 'function') return window.showMiniNotice(msg);
    }catch(e){}
    var old = qs('#hxAuthToastV14'); if(old) old.remove();
    var el = document.createElement('div');
    el.id = 'hxAuthToastV14';
    el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:2147483647;background:#061d1b;color:#eaffff;border:1px solid rgba(0,245,245,.45);border-radius:14px;padding:12px 16px;font:800 13px Arial,Tahoma;box-shadow:0 14px 40px rgba(0,0,0,.45);direction:rtl;text-align:center;max-width:90vw';
    document.body.appendChild(el);
    setTimeout(function(){ if(el.parentNode) el.remove(); }, 3500);
  }

  function configured(){
    return !!(window.supabase && window.supabase.createClient && window.HIREX_SUPABASE_URL && window.HIREX_SUPABASE_ANON_KEY && !String(window.HIREX_SUPABASE_URL).includes('ضع_') && !String(window.HIREX_SUPABASE_ANON_KEY).includes('ضع_'));
  }
  function supabaseClient(){
    if(!configured()) return null;
    if(!sbClient) sbClient = window.supabase.createClient(window.HIREX_SUPABASE_URL, window.HIREX_SUPABASE_ANON_KEY);
    return sbClient;
  }
  function isConfirmed(user){
    return !!(user && (user.email_confirmed_at || user.confirmed_at));
  }
  function syncUser(user){
    if(!user) return;
    window.accountState = window.accountState || {};
    window.accountState.isLoggedIn = true;
    window.accountState.emailVerified = true;
    window.accountState.email = user.email || window.accountState.email || '';
    window.accountState.name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || window.accountState.name || (user.email ? user.email.split('@')[0] : 'مستخدم');
    window.accountState.role = window.accountState.role || 'مستخدم';
    try{ if(typeof window.syncAccountUi === 'function') window.syncAccountUi(); }catch(e){}
    try{ if(typeof window.syncAccountUI === 'function') window.syncAccountUI(); }catch(e){}
  }
  function clearUser(){
    window.accountState = window.accountState || {};
    window.accountState.isLoggedIn = false;
    window.accountState.emailVerified = false;
  }
  async function isVerified(){
    var sb = supabaseClient();
    if(!sb) return false;
    try{
      var res = await sb.auth.getSession();
      var user = res && res.data && res.data.session && res.data.session.user;
      if(isConfirmed(user)){ syncUser(user); return true; }
      clearUser(); return false;
    }catch(e){ clearUser(); return false; }
  }

  function ensureModal(){
    if(qs('#hxAuthModalV14')) return;
    var style = document.createElement('style');
    style.id = 'hxAuthStyleV14';
    style.textContent = '#hxAuthModalV14{position:fixed;inset:0;display:none;align-items:center;justify-content:center;z-index:2147483646;background:rgba(0,0,0,.74);backdrop-filter:blur(10px);direction:rtl}#hxAuthModalV14.show{display:flex}.hx14-card{width:min(430px,92vw);box-sizing:border-box;background:linear-gradient(180deg,#07302d,#020908);border:1px solid rgba(0,245,245,.38);box-shadow:0 28px 90px rgba(0,0,0,.65);border-radius:24px;padding:20px;color:#eaffff;font-family:Arial,Tahoma,sans-serif}.hx14-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.hx14-title{font-size:22px;font-weight:900}.hx14-close{width:40px;height:40px;border-radius:13px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#fff;font-size:22px;cursor:pointer}.hx14-reason{font-size:13px;font-weight:800;line-height:1.7;background:rgba(0,245,245,.08);border:1px solid rgba(0,245,245,.22);padding:10px;border-radius:14px;margin:10px 0;text-align:center}.hx14-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.hx14-tabs button{border:1px solid rgba(0,245,245,.25);background:rgba(255,255,255,.05);color:#dfffff;border-radius:13px;padding:11px;font-weight:900;cursor:pointer}.hx14-tabs button.active{background:#16d6d6;color:#001313}.hx14-field{margin:10px 0}.hx14-field label{display:block;font-size:12px;color:#bff;font-weight:900;margin-bottom:6px}.hx14-field input{width:100%;box-sizing:border-box;border:1px solid rgba(0,245,245,.28);background:#071716;color:#fff;border-radius:13px;padding:13px 14px;font-weight:800;outline:none}.hx14-submit{width:100%;border:0;border-radius:14px;background:#16d6d6;color:#001313;padding:14px;margin-top:10px;font-weight:900;cursor:pointer}.hx14-link{width:100%;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:transparent;color:#eaffff;padding:11px;margin-top:8px;font-weight:800;cursor:pointer}.hx14-msg{min-height:24px;color:#ffd98a;text-align:center;font-size:12px;line-height:1.7;margin-top:10px}';
    document.head.appendChild(style);
    var modal = document.createElement('div');
    modal.id = 'hxAuthModalV14';
    modal.innerHTML = '<div class="hx14-card" role="dialog" aria-modal="true"><div class="hx14-head"><div class="hx14-title" id="hx14Title">تسجيل الدخول</div><button type="button" class="hx14-close" id="hx14Close">×</button></div><div class="hx14-reason" id="hx14Reason">سجل دخولك لإكمال هذا الإجراء.</div><div class="hx14-tabs"><button type="button" data-hx14-mode="login" class="active">دخول</button><button type="button" data-hx14-mode="signup">إنشاء حساب</button></div><div class="hx14-field" id="hx14NameWrap" style="display:none"><label>الاسم الكامل</label><input id="hx14Name" autocomplete="name" placeholder="اكتب اسمك"></div><div class="hx14-field"><label>البريد الإلكتروني</label><input id="hx14Email" type="email" autocomplete="email" placeholder="example@email.com"></div><div class="hx14-field"><label>كلمة المرور</label><input id="hx14Password" type="password" autocomplete="current-password" placeholder="******"></div><button type="button" class="hx14-submit" id="hx14Submit">تسجيل الدخول</button><button type="button" class="hx14-link" id="hx14Resend">إعادة إرسال رابط التحقق</button><button type="button" class="hx14-link" id="hx14Reset">نسيت كلمة المرور؟</button><div class="hx14-msg" id="hx14Msg"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
    qs('#hx14Close').addEventListener('click', closeModal);
    qsa('[data-hx14-mode]').forEach(function(btn){ btn.addEventListener('click', function(){ setMode(btn.getAttribute('data-hx14-mode')); }); });
    qs('#hx14Submit').addEventListener('click', submitAuth);
    qs('#hx14Resend').addEventListener('click', resendVerify);
    qs('#hx14Reset').addEventListener('click', resetPassword);
    qs('#hx14Password').addEventListener('keydown', function(e){ if(e.key === 'Enter') submitAuth(); });
  }
  function message(txt){ var el = qs('#hx14Msg'); if(el) el.textContent = txt || ''; }
  function setMode(mode){
    ensureModal();
    var signup = mode === 'signup';
    qs('#hxAuthModalV14').setAttribute('data-mode', signup ? 'signup' : 'login');
    qsa('[data-hx14-mode]').forEach(function(btn){ btn.classList.toggle('active', btn.getAttribute('data-hx14-mode') === (signup ? 'signup':'login')); });
    qs('#hx14NameWrap').style.display = signup ? 'block' : 'none';
    qs('#hx14Title').textContent = signup ? 'إنشاء حساب وتأكيد البريد' : 'تسجيل الدخول';
    qs('#hx14Submit').textContent = signup ? 'إنشاء حساب وإرسال التحقق' : 'تسجيل الدخول';
    message(signup ? 'سيتم إرسال رابط تحقق إلى بريدك الإلكتروني.' : 'استخدم بريدك وكلمة المرور للدخول.');
  }
  function openModal(reason, mode){
    ensureModal();
    qs('#hx14Reason').textContent = reason || 'سجل دخولك لإكمال هذا الإجراء.';
    setMode(mode || 'login');
    qs('#hxAuthModalV14').classList.add('show');
    document.body.classList.add('modal-open');
    setTimeout(function(){ var el = qs('#hx14Email'); if(el) el.focus(); }, 80);
  }
  function closeModal(){ var m=qs('#hxAuthModalV14'); if(m) m.classList.remove('show'); document.body.classList.remove('modal-open'); }
  function validEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim()); }
  function redirectUrl(){ return window.HIREX_AUTH_REDIRECT_URL || window.location.origin + window.location.pathname; }

  async function submitAuth(){
    var sb = supabaseClient();
    if(!sb) return message('إعدادات Supabase غير مكتملة أو لم يتم تحميل مكتبة التسجيل.');
    var mode = (qs('#hxAuthModalV14') && qs('#hxAuthModalV14').getAttribute('data-mode')) || 'login';
    var email = (qs('#hx14Email').value || '').trim().toLowerCase();
    var password = qs('#hx14Password').value || '';
    var fullName = (qs('#hx14Name').value || '').trim();
    if(!validEmail(email)) return message('اكتب بريد إلكتروني صحيح.');
    if(password.length < 6) return message('كلمة المرور يجب ألا تقل عن 6 أحرف.');
    message('جاري المعالجة...');
    try{
      if(mode === 'signup'){
        var sign = await sb.auth.signUp({ email: email, password: password, options: { emailRedirectTo: redirectUrl(), data: { full_name: fullName || email.split('@')[0] } } });
        if(sign.error) throw sign.error;
        var user = sign.data && sign.data.user;
        if(isConfirmed(user)){
          syncUser(user); closeModal(); notify('تم إنشاء الحساب وتسجيل الدخول.'); replayPending(); return;
        }
        message('تم إنشاء الحساب. افتح بريدك واضغط رابط التحقق، ثم ارجع وسجل الدخول.');
        notify('تم إرسال رابط التحقق إلى بريدك.');
        setMode('login');
        return;
      }
      var login = await sb.auth.signInWithPassword({ email: email, password: password });
      if(login.error) throw login.error;
      var loginUser = login.data && login.data.user;
      if(!isConfirmed(loginUser)){
        await sb.auth.signOut(); clearUser();
        message('حسابك موجود، لكن البريد غير مؤكد. اضغط رابط التحقق في بريدك أو أعد الإرسال.');
        return;
      }
      syncUser(loginUser); closeModal(); notify('تم تسجيل الدخول بنجاح.'); replayPending();
    }catch(err){
      var s = String((err && err.message) || err || '');
      if(/email not confirmed/i.test(s)) s = 'البريد غير مؤكد. افتح رابط التحقق في بريدك أو أعد الإرسال.';
      if(/database error saving new user/i.test(s)) s = 'خطأ في قاعدة البيانات عند إنشاء المستخدم. شغّل ملف supabase_hirex_schema.sql وملف إصلاح التسجيل.';
      message('تعذر إكمال العملية: ' + s);
    }
  }
  async function resendVerify(){
    var sb = supabaseClient(); if(!sb) return message('إعدادات Supabase غير مكتملة.');
    var email = (qs('#hx14Email').value || '').trim().toLowerCase();
    if(!validEmail(email)) return message('اكتب البريد الإلكتروني أولًا.');
    message('جاري إرسال رابط التحقق...');
    try{
      var res = await sb.auth.resend({ type:'signup', email: email, options:{ emailRedirectTo: redirectUrl() } });
      if(res.error) throw res.error;
      message('تم إرسال رابط التحقق. افحص Inbox و Spam.');
    }catch(err){ message('تعذر إرسال التحقق: ' + String((err && err.message) || err || '')); }
  }
  async function resetPassword(){
    var sb = supabaseClient(); if(!sb) return message('إعدادات Supabase غير مكتملة.');
    var email = (qs('#hx14Email').value || '').trim().toLowerCase();
    if(!validEmail(email)) return message('اكتب البريد الإلكتروني أولًا.');
    message('جاري إرسال رابط استعادة كلمة المرور...');
    try{
      var res = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
      if(res.error) throw res.error;
      message('تم إرسال رابط استعادة كلمة المرور.');
    }catch(err){ message('تعذر إرسال الرابط: ' + String((err && err.message) || err || '')); }
  }

  async function requireAuth(reason, callback){
    if(replaying){ if(typeof callback === 'function') return callback(); return true; }
    if(await isVerified()){
      if(typeof callback === 'function') return callback();
      return true;
    }
    pendingCallback = typeof callback === 'function' ? callback : null;
    pendingReason = reason || 'هذا الإجراء';
    openModal('سجّل دخولك أولًا لإكمال: ' + pendingReason, 'login');
    return false;
  }
  function replayPending(){
    var cb = pendingCallback; pendingCallback = null;
    if(typeof cb === 'function'){
      setTimeout(function(){ replaying = true; try{ cb(); } finally { setTimeout(function(){ replaying = false; }, 0); } }, 120);
    }
  }
  function wrapFunction(name, reason){
    if(wrapped[name]) return;
    var original = window[name];
    if(typeof original !== 'function') return;
    wrapped[name] = original;
    window[name] = function(){
      var args = arguments;
      return requireAuth(reason, function(){ return original.apply(window, args); });
    };
  }
  function installFunctionGuards(){
    wrapFunction('openMyAdsModal', 'إضافة أو إدارة إعلان');
    wrapFunction('openAccountModal', 'فتح الحساب');
    wrapFunction('saveCurrentAd', 'حفظ أو نشر الإعلان');
    wrapFunction('openPhoneModal', 'التواصل مع صاحب الإعلان');
    wrapFunction('openPaymentModal', 'طلب خدمة أو إرسال عرض');
    wrapFunction('openPlatformChat', 'المراسلة داخل المنصة');
    wrapFunction('openPlatformChatV15', 'المراسلة داخل المنصة');
    wrapFunction('openAtsCvBuilder', 'إنشاء سيرة ATS');
    wrapFunction('openXsStore', 'شراء أو استخدام رصيد Xs');
    wrapFunction('openPromotionModal', 'ترقية الإعلان');
    wrapFunction('openNotificationsModal', 'عرض الإشعارات');
  }
  function installTargetedClickGuard(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-requires-auth="true"], .requires-auth');
      if(!btn) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      requireAuth(btn.getAttribute('data-auth-reason') || 'هذا الإجراء');
    }, true);
  }
  function installLogoutPatch(){
    var logout = window.accountLogout;
    if(typeof logout !== 'function' || logout.__hx14) return;
    window.accountLogout = function(){
      var sb = supabaseClient();
      if(sb){ sb.auth.signOut().catch(function(){}); }
      clearUser(); notify('تم تسجيل الخروج.');
      try{ if(typeof window.syncAccountUi === 'function') window.syncAccountUi(); }catch(e){}
    };
    window.accountLogout.__hx14 = true;
  }
  function init(){
    ensureModal();
    installFunctionGuards();
    installTargetedClickGuard();
    installLogoutPatch();
    isVerified();
    var sb = supabaseClient();
    if(sb && sb.auth && sb.auth.onAuthStateChange){
      sb.auth.onAuthStateChange(function(_event, session){
        var user = session && session.user;
        if(isConfirmed(user)) syncUser(user); else clearUser();
      });
    }
    setInterval(function(){ installFunctionGuards(); installLogoutPatch(); }, 1000);
  }

  window.hirexAuthV14 = { version:'14', require: requireAuth, open: function(reason){ openModal(reason || 'سجل دخولك لإكمال هذا الإجراء.', 'login'); }, signup: function(reason){ openModal(reason || 'أنشئ حسابك لإكمال هذا الإجراء.', 'signup'); }, isVerified: isVerified };
  window.requireEmailLogin = function(reason, callback){ return requireAuth(reason, callback); };
  window.hirexAuthV14Require = function(reason, callback){ return requireAuth(reason, callback); };
  window.hirexAuthV14Open = function(reason){ openModal(reason || 'سجل دخولك لإكمال هذا الإجراء.', 'login'); };
  window.requireVerifiedAction = function(reason, callback){ return requireAuth(reason, callback); };
  window.hirexIsVerifiedUser = function(){ return !!(window.accountState && window.accountState.isLoggedIn && window.accountState.emailVerified); };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
