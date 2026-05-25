/* HireX V15 Root Auth Modal - direct, independent gate for My Ads / Account and protected actions */
(function(){
  'use strict';
  var VERSION = '15';
  var client = null;
  var pending = null;
  var pendingReason = '';
  var allowReplay = false;

  function $(s){ return document.querySelector(s); }
  function $all(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function text(v){ return String(v == null ? '' : v); }

  function configured(){
    return !!(window.supabase && window.supabase.createClient && window.HIREX_SUPABASE_URL && window.HIREX_SUPABASE_ANON_KEY);
  }
  function sb(){
    if(!configured()) return null;
    if(!client) client = window.supabase.createClient(window.HIREX_SUPABASE_URL, window.HIREX_SUPABASE_ANON_KEY);
    return client;
  }
  function confirmed(user){ return !!(user && (user.email_confirmed_at || user.confirmed_at)); }
  function redirectUrl(){ return window.HIREX_AUTH_REDIRECT_URL || (window.location.origin + window.location.pathname); }

  function toast(msg){
    var old = $('#hxV15Toast'); if(old) old.remove();
    var t = document.createElement('div');
    t.id = 'hxV15Toast';
    t.textContent = msg || '';
    t.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:2147483647;background:#061d1b;color:#eaffff;border:1px solid rgba(0,245,245,.45);border-radius:14px;padding:12px 16px;font:800 13px Arial,Tahoma;box-shadow:0 14px 40px rgba(0,0,0,.45);direction:rtl;text-align:center;max-width:92vw';
    document.body.appendChild(t);
    setTimeout(function(){ if(t.parentNode) t.remove(); }, 3500);
  }

  function syncUser(user){
    if(!user) return;
    window.accountState = window.accountState || {};
    window.accountState.isLoggedIn = true;
    window.accountState.emailVerified = true;
    window.accountState.email = user.email || '';
    window.accountState.name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || (user.email ? user.email.split('@')[0] : 'مستخدم');
    window.accountState.role = window.accountState.role || 'مستخدم';
    try{ if(typeof window.syncAccountUi === 'function') window.syncAccountUi(); }catch(e){}
    try{ if(typeof window.syncAccountUI === 'function') window.syncAccountUI(); }catch(e){}
  }
  function clearUser(){
    window.accountState = window.accountState || {};
    window.accountState.isLoggedIn = false;
    window.accountState.emailVerified = false;
  }

  async function isReady(){
    var c = sb();
    if(!c) return false;
    try{
      var r = await c.auth.getSession();
      var user = r && r.data && r.data.session && r.data.session.user;
      if(confirmed(user)){ syncUser(user); return true; }
      clearUser();
      return false;
    }catch(e){ clearUser(); return false; }
  }

  function buildModal(){
    if($('#hxAuthRootV15')) return;
    var css = document.createElement('style');
    css.id = 'hxAuthRootV15Style';
    css.textContent = '\n#hxAuthRootV15{position:fixed!important;inset:0!important;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.76);backdrop-filter:blur(10px);z-index:2147483646!important;direction:rtl}\n#hxAuthRootV15.show{display:flex!important}\n.hxv15-card{width:min(430px,92vw);background:linear-gradient(180deg,#07302d,#020908);border:1px solid rgba(0,245,245,.42);border-radius:24px;padding:20px;color:#eaffff;font-family:Arial,Tahoma,sans-serif;box-shadow:0 28px 90px rgba(0,0,0,.65);box-sizing:border-box}\n.hxv15-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.hxv15-title{font-size:22px;font-weight:900}.hxv15-close{width:40px;height:40px;border-radius:13px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#fff;font-size:22px;cursor:pointer}.hxv15-reason{font-size:13px;font-weight:800;line-height:1.7;background:rgba(0,245,245,.08);border:1px solid rgba(0,245,245,.22);padding:10px;border-radius:14px;margin:12px 0;text-align:center}.hxv15-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.hxv15-tabs button{border:1px solid rgba(0,245,245,.25);background:rgba(255,255,255,.05);color:#dfffff;border-radius:13px;padding:11px;font-weight:900;cursor:pointer}.hxv15-tabs button.active{background:#16d6d6;color:#001313}.hxv15-field{margin:10px 0}.hxv15-field label{display:block;font-size:12px;color:#bff;font-weight:900;margin-bottom:6px}.hxv15-field input{width:100%;box-sizing:border-box;border:1px solid rgba(0,245,245,.28);background:#071716;color:#fff;border-radius:13px;padding:13px 14px;font-weight:800;outline:none}.hxv15-submit{width:100%;border:0;border-radius:14px;background:#16d6d6;color:#001313;padding:14px;margin-top:10px;font-weight:900;cursor:pointer}.hxv15-link{width:100%;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:transparent;color:#eaffff;padding:11px;margin-top:8px;font-weight:800;cursor:pointer}.hxv15-msg{min-height:24px;color:#ffd98a;text-align:center;font-size:12px;line-height:1.7;margin-top:10px}\n';
    document.head.appendChild(css);
    var modal = document.createElement('div');
    modal.id = 'hxAuthRootV15';
    modal.innerHTML = '<div class="hxv15-card" role="dialog" aria-modal="true"><div class="hxv15-head"><div class="hxv15-title" id="hxv15Title">تسجيل الدخول</div><button type="button" class="hxv15-close" id="hxv15Close">×</button></div><div class="hxv15-reason" id="hxv15Reason">سجل دخولك لإكمال هذا الإجراء.</div><div class="hxv15-tabs"><button type="button" data-hxv15-mode="login" class="active">دخول</button><button type="button" data-hxv15-mode="signup">إنشاء حساب</button></div><div class="hxv15-field" id="hxv15NameWrap" style="display:none"><label>الاسم الكامل</label><input id="hxv15Name" autocomplete="name" placeholder="اكتب اسمك"></div><div class="hxv15-field"><label>البريد الإلكتروني</label><input id="hxv15Email" type="email" autocomplete="email" placeholder="example@email.com"></div><div class="hxv15-field"><label>كلمة المرور</label><input id="hxv15Password" type="password" autocomplete="current-password" placeholder="******"></div><button type="button" class="hxv15-submit" id="hxv15Submit">تسجيل الدخول</button><button type="button" class="hxv15-link" id="hxv15Resend">إعادة إرسال رابط التحقق</button><button type="button" class="hxv15-link" id="hxv15Reset">نسيت كلمة المرور؟</button><div class="hxv15-msg" id="hxv15Msg"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
    $('#hxv15Close').addEventListener('click', closeModal);
    $all('[data-hxv15-mode]').forEach(function(b){ b.addEventListener('click', function(){ setMode(b.getAttribute('data-hxv15-mode')); }); });
    $('#hxv15Submit').addEventListener('click', submit);
    $('#hxv15Resend').addEventListener('click', resend);
    $('#hxv15Reset').addEventListener('click', resetPassword);
    $('#hxv15Password').addEventListener('keydown', function(e){ if(e.key === 'Enter') submit(); });
  }
  function msg(v){ var el = $('#hxv15Msg'); if(el) el.textContent = v || ''; }
  function setMode(mode){
    buildModal();
    var signup = mode === 'signup';
    $('#hxAuthRootV15').setAttribute('data-mode', signup ? 'signup' : 'login');
    $all('[data-hxv15-mode]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-hxv15-mode') === (signup?'signup':'login')); });
    $('#hxv15NameWrap').style.display = signup ? 'block' : 'none';
    $('#hxv15Title').textContent = signup ? 'إنشاء حساب وتأكيد البريد' : 'تسجيل الدخول';
    $('#hxv15Submit').textContent = signup ? 'إنشاء حساب وإرسال التحقق' : 'تسجيل الدخول';
    msg(signup ? 'سيتم إرسال رابط تحقق إلى بريدك الإلكتروني.' : 'استخدم بريدك وكلمة المرور للدخول.');
  }
  function openModal(reason, mode){
    buildModal();
    $('#hxv15Reason').textContent = reason || 'سجل دخولك لإكمال هذا الإجراء.';
    setMode(mode || 'login');
    $('#hxAuthRootV15').classList.add('show');
    document.body.classList.add('modal-open');
    setTimeout(function(){ var e = $('#hxv15Email'); if(e) e.focus(); }, 80);
  }
  function closeModal(){ var m = $('#hxAuthRootV15'); if(m) m.classList.remove('show'); document.body.classList.remove('modal-open'); }
  function validEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email||'').trim()); }

  async function submit(){
    var c = sb();
    if(!c) return msg('إعدادات Supabase غير مكتملة. تأكد من auth-config.js ومكتبة Supabase.');
    var mode = ($('#hxAuthRootV15') && $('#hxAuthRootV15').getAttribute('data-mode')) || 'login';
    var email = ($('#hxv15Email').value || '').trim().toLowerCase();
    var password = $('#hxv15Password').value || '';
    var fullName = ($('#hxv15Name').value || '').trim();
    if(!validEmail(email)) return msg('اكتب بريد إلكتروني صحيح.');
    if(password.length < 6) return msg('كلمة المرور يجب ألا تقل عن 6 أحرف.');
    msg('جاري المعالجة...');
    try{
      if(mode === 'signup'){
        var s = await c.auth.signUp({ email: email, password: password, options: { emailRedirectTo: redirectUrl(), data: { full_name: fullName || email.split('@')[0] } } });
        if(s.error) throw s.error;
        var u = s.data && s.data.user;
        if(confirmed(u)){ syncUser(u); closeModal(); toast('تم إنشاء الحساب وتسجيل الدخول.'); replay(); return; }
        msg('تم إنشاء الحساب. افتح بريدك واضغط رابط التحقق، ثم ارجع وسجل الدخول.');
        toast('تم إرسال رابط التحقق إلى بريدك.');
        setMode('login');
        return;
      }
      var l = await c.auth.signInWithPassword({ email: email, password: password });
      if(l.error) throw l.error;
      var user = l.data && l.data.user;
      if(!confirmed(user)){
        await c.auth.signOut(); clearUser();
        msg('حسابك موجود، لكن البريد غير مؤكد. اضغط رابط التحقق في بريدك أو أعد الإرسال.');
        return;
      }
      syncUser(user); closeModal(); toast('تم تسجيل الدخول بنجاح.'); replay();
    }catch(err){
      var s2 = String((err && err.message) || err || '');
      if(/email not confirmed/i.test(s2)) s2 = 'البريد غير مؤكد. افتح رابط التحقق في بريدك أو أعد الإرسال.';
      if(/database error saving new user/i.test(s2)) s2 = 'خطأ في قاعدة البيانات عند إنشاء المستخدم. شغّل ملف supabase_hirex_schema.sql وملف إصلاح التسجيل.';
      msg('تعذر إكمال العملية: ' + s2);
    }
  }
  async function resend(){
    var c = sb(); if(!c) return msg('إعدادات Supabase غير مكتملة.');
    var email = ($('#hxv15Email').value || '').trim().toLowerCase();
    if(!validEmail(email)) return msg('اكتب البريد الإلكتروني أولًا.');
    msg('جاري إرسال رابط التحقق...');
    try{ var r = await c.auth.resend({ type:'signup', email: email, options:{ emailRedirectTo: redirectUrl() } }); if(r.error) throw r.error; msg('تم إرسال رابط التحقق. افحص Inbox و Spam.'); }
    catch(err){ msg('تعذر إرسال التحقق: ' + String((err && err.message) || err || '')); }
  }
  async function resetPassword(){
    var c = sb(); if(!c) return msg('إعدادات Supabase غير مكتملة.');
    var email = ($('#hxv15Email').value || '').trim().toLowerCase();
    if(!validEmail(email)) return msg('اكتب البريد الإلكتروني أولًا.');
    msg('جاري إرسال رابط استعادة كلمة المرور...');
    try{ var r = await c.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() }); if(r.error) throw r.error; msg('تم إرسال رابط استعادة كلمة المرور.'); }
    catch(err){ msg('تعذر إرسال الرابط: ' + String((err && err.message) || err || '')); }
  }

  async function requireAuth(reason, cb){
    if(allowReplay){ if(typeof cb === 'function') cb(); return true; }
    if(await isReady()){ if(typeof cb === 'function') cb(); return true; }
    pending = typeof cb === 'function' ? cb : null;
    pendingReason = reason || 'هذا الإجراء';
    openModal('سجّل دخولك أولًا لإكمال: ' + pendingReason, 'login');
    return false;
  }
  function replay(){
    var cb = pending; pending = null;
    if(typeof cb === 'function'){
      setTimeout(function(){ allowReplay = true; try{ cb(); } finally { setTimeout(function(){ allowReplay = false; }, 80); } }, 150);
    }
  }
  function openProtected(tab){
    var reason = tab === 'account' ? 'فتح حسابي' : 'إضافة أو إدارة إعلاناتي';
    return requireAuth(reason, function(){
      if(tab === 'account'){
        window.__HX_AUTH_ALLOW_ACCOUNT = true;
        try{ if(typeof window.openAccountModal === 'function') window.openAccountModal(); else if(typeof window.showOverlay === 'function') window.showOverlay('accountOverlay'); }
        finally{ setTimeout(function(){ window.__HX_AUTH_ALLOW_ACCOUNT = false; }, 200); }
      }else{
        window.__HX_AUTH_ALLOW_MYADS = true;
        try{ if(typeof window.openMyAdsModal === 'function') window.openMyAdsModal(); else if(typeof window.showOverlay === 'function') window.showOverlay('myAdsOverlay'); }
        finally{ setTimeout(function(){ window.__HX_AUTH_ALLOW_MYADS = false; }, 200); }
      }
    });
  }

  function installBottomNavDirect(){
    document.addEventListener('click', function(e){
      var nav = e.target.closest && e.target.closest('.bottom-nav .nav-item[data-tab]');
      if(!nav) return;
      var tab = nav.getAttribute('data-tab');
      if(tab !== 'post' && tab !== 'account') return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      openProtected(tab);
    }, true);
  }
  function protectTextClick(e){
    var el = e.target.closest && e.target.closest('button,a,[role="button"],.btn,.card,.service-card,.job-card');
    if(!el) return;
    if(el.closest('.bottom-nav')) return;
    var label = (el.getAttribute('aria-label') || el.textContent || '').trim();
    if(!label) return;
    var protectedWords = ['إضافة إعلان','نشر','حفظ الإعلان','تواصل','اتصال','رقم الهاتف','طلب خدمة','تقديم','دفع','شراء','Xs','ترقية','ATS','سيرة','إعلاناتي','حسابي'];
    var hit = protectedWords.some(function(w){ return label.indexOf(w) !== -1; });
    if(!hit) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    requireAuth(label.substring(0,60));
  }
  function installActionGuard(){ document.addEventListener('click', protectTextClick, true); }

  function installGlobalAliases(){
    window.hirexAuthV15 = { version: VERSION, open: function(reason){ openModal(reason || 'سجل دخولك لإكمال هذا الإجراء.', 'login'); }, signup: function(reason){ openModal(reason || 'أنشئ حسابك لإكمال هذا الإجراء.', 'signup'); }, require: requireAuth, isReady: isReady };
    window.hirexAuthV14 = window.hirexAuthV15;
    window.hirexAuthV14Open = function(reason){ openModal(reason || 'سجل دخولك لإكمال هذا الإجراء.', 'login'); };
    window.hirexAuthV14Require = requireAuth;
    window.requireEmailLogin = requireAuth;
    window.requireVerifiedAction = requireAuth;
  }
  function init(){
    buildModal();
    installGlobalAliases();
    installBottomNavDirect();
    installActionGuard();
    isReady();
    var c = sb();
    if(c && c.auth && c.auth.onAuthStateChange){
      c.auth.onAuthStateChange(function(_event, session){ var user = session && session.user; if(confirmed(user)) syncUser(user); else clearUser(); });
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
