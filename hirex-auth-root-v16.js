/* HireX V16 Root Auth - clean external auth gate
   الهدف: إظهار نافذة التسجيل دائمًا عند الإجراء المحمي، بدون تعطيل أزرار التصفح. */
(function(){
  'use strict';
  var VERSION = '16';
  var client = null;
  var pendingAction = null;
  var replaying = false;
  var originals = {};

  function q(sel){ return document.querySelector(sel); }
  function qa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function txt(v){ return String(v == null ? '' : v); }

  function toast(message){
    if(typeof window.showMiniNotice === 'function') window.showMiniNotice(message);
    else console.log('[HireX]', message);
  }

  function redirectUrl(){
    return window.HIREX_AUTH_REDIRECT_URL || (window.location.origin + window.location.pathname);
  }

  function sb(){
    if(client) return client;
    if(!window.supabase || !window.supabase.createClient || !window.HIREX_SUPABASE_URL || !window.HIREX_SUPABASE_ANON_KEY){
      return null;
    }
    client = window.supabase.createClient(window.HIREX_SUPABASE_URL, window.HIREX_SUPABASE_ANON_KEY);
    return client;
  }

  function userConfirmed(user){
    return !!(user && user.email && (user.email_confirmed_at || user.confirmed_at));
  }

  async function currentVerifiedUser(){
    var c = sb();
    if(!c) return null;
    try{
      var res = await c.auth.getSession();
      var user = res && res.data && res.data.session && res.data.session.user;
      return userConfirmed(user) ? user : null;
    }catch(e){ return null; }
  }

  function syncUser(user){
    window.accountState = window.accountState || {};
    window.accountState.isLoggedIn = true;
    window.accountState.emailVerified = true;
    window.accountState.email = user.email;
    window.accountState.name = (user.user_metadata && user.user_metadata.full_name) || user.email.split('@')[0];
    try{ if(typeof window.syncAccountUi === 'function') window.syncAccountUi(); }catch(e){}
  }

  function clearUser(){
    window.accountState = window.accountState || {};
    window.accountState.isLoggedIn = false;
    window.accountState.emailVerified = false;
  }

  function validEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(txt(email).trim()); }

  function buildModal(){
    if(q('#hxAuthV16')) return;
    var style = document.createElement('style');
    style.id = 'hxAuthV16Style';
    style.textContent = `
#hxAuthV16{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);padding:18px;direction:rtl;font-family:inherit}
#hxAuthV16.show{display:flex!important}
.hxv16-card{width:min(430px,100%);border:1px solid rgba(0,229,255,.28);border-radius:28px;background:linear-gradient(180deg,rgba(8,37,35,.98),rgba(3,12,11,.98));box-shadow:0 30px 90px rgba(0,0,0,.75);color:#fff;overflow:hidden}
.hxv16-head{display:flex;align-items:center;justify-content:space-between;padding:18px 18px 10px;border-bottom:1px solid rgba(255,255,255,.08)}
.hxv16-title{font-size:22px;font-weight:900}.hxv16-close{width:40px;height:40px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:24px;cursor:pointer}
.hxv16-body{padding:18px}.hxv16-reason{padding:12px 14px;margin-bottom:12px;border-radius:16px;background:rgba(0,229,255,.10);border:1px solid rgba(0,229,255,.20);font-size:13px;font-weight:800;color:#d8fffb;line-height:1.7}
.hxv16-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}.hxv16-tabs button{border:1px solid rgba(255,255,255,.12);border-radius:15px;background:rgba(255,255,255,.04);color:#d8fffb;padding:12px;font-weight:900;cursor:pointer}.hxv16-tabs button.active{background:linear-gradient(135deg,#17f0d2,#20d09f);color:#001b18}
.hxv16-field{margin-bottom:12px}.hxv16-field label{display:block;margin-bottom:7px;color:#bdfcf4;font-size:13px;font-weight:900}.hxv16-field input{width:100%;box-sizing:border-box;border:1px solid rgba(0,229,255,.25);border-radius:16px;background:rgba(255,255,255,.08);color:#fff;padding:14px;font-size:15px;outline:none}.hxv16-field input::placeholder{color:rgba(255,255,255,.45)}
.hxv16-submit{width:100%;border:0;border-radius:17px;background:linear-gradient(135deg,#17f0d2,#20d09f);color:#001b18;font-weight:1000;padding:15px;cursor:pointer;font-size:15px;margin-top:4px}.hxv16-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.hxv16-link{border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(255,255,255,.04);color:#d8fffb;padding:11px;font-weight:900;cursor:pointer;font-size:12px}.hxv16-msg{min-height:22px;margin-top:12px;font-size:13px;font-weight:800;color:#ffe7a3;line-height:1.7}
`;
    document.head.appendChild(style);
    var modal = document.createElement('div');
    modal.id = 'hxAuthV16';
    modal.innerHTML = '<div class="hxv16-card" role="dialog" aria-modal="true"><div class="hxv16-head"><div class="hxv16-title" id="hxv16Title">تسجيل الدخول</div><button type="button" class="hxv16-close" id="hxv16Close">×</button></div><div class="hxv16-body"><div class="hxv16-reason" id="hxv16Reason">سجّل دخولك لإكمال هذا الإجراء.</div><div class="hxv16-tabs"><button type="button" data-hxv16-mode="login" class="active">دخول</button><button type="button" data-hxv16-mode="signup">إنشاء حساب</button></div><div class="hxv16-field" id="hxv16NameWrap" style="display:none"><label>الاسم الكامل</label><input id="hxv16Name" autocomplete="name" placeholder="اكتب اسمك"></div><div class="hxv16-field"><label>البريد الإلكتروني</label><input id="hxv16Email" type="email" autocomplete="email" placeholder="example@email.com"></div><div class="hxv16-field"><label>كلمة المرور</label><input id="hxv16Password" type="password" autocomplete="current-password" placeholder="******"></div><button type="button" class="hxv16-submit" id="hxv16Submit">تسجيل الدخول</button><div class="hxv16-row"><button type="button" class="hxv16-link" id="hxv16Resend">إعادة التحقق</button><button type="button" class="hxv16-link" id="hxv16Reset">نسيت كلمة المرور؟</button></div><div class="hxv16-msg" id="hxv16Msg"></div></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
    q('#hxv16Close').addEventListener('click', closeModal);
    qa('[data-hxv16-mode]').forEach(function(btn){ btn.addEventListener('click', function(){ setMode(btn.getAttribute('data-hxv16-mode')); }); });
    q('#hxv16Submit').addEventListener('click', submit);
    q('#hxv16Resend').addEventListener('click', resendVerification);
    q('#hxv16Reset').addEventListener('click', resetPassword);
    q('#hxv16Password').addEventListener('keydown', function(e){ if(e.key === 'Enter') submit(); });
  }

  function setMsg(m){ var el = q('#hxv16Msg'); if(el) el.textContent = m || ''; }
  function setMode(mode){
    buildModal();
    var signup = mode === 'signup';
    q('#hxAuthV16').setAttribute('data-mode', signup ? 'signup' : 'login');
    qa('[data-hxv16-mode]').forEach(function(btn){ btn.classList.toggle('active', btn.getAttribute('data-hxv16-mode') === (signup ? 'signup' : 'login')); });
    q('#hxv16NameWrap').style.display = signup ? 'block' : 'none';
    q('#hxv16Title').textContent = signup ? 'إنشاء حساب وتأكيد البريد' : 'تسجيل الدخول';
    q('#hxv16Submit').textContent = signup ? 'إنشاء حساب وإرسال التحقق' : 'تسجيل الدخول';
    setMsg(signup ? 'سيتم إرسال رابط تحقق إلى بريدك الإلكتروني.' : 'استخدم بريدك وكلمة المرور للدخول.');
  }
  function openModal(reason, mode){
    buildModal();
    q('#hxv16Reason').textContent = reason || 'سجّل دخولك لإكمال هذا الإجراء.';
    setMode(mode || 'login');
    q('#hxAuthV16').classList.add('show');
    setTimeout(function(){ var el = q('#hxv16Email'); if(el) el.focus(); }, 80);
  }
  function closeModal(){ var m = q('#hxAuthV16'); if(m) m.classList.remove('show'); }

  async function submit(){
    var c = sb();
    if(!c) return setMsg('لم يتم تحميل إعدادات Supabase. تأكد من وجود auth-config.js ومكتبة Supabase.');
    var mode = q('#hxAuthV16').getAttribute('data-mode') || 'login';
    var email = (q('#hxv16Email').value || '').trim().toLowerCase();
    var password = q('#hxv16Password').value || '';
    var fullName = (q('#hxv16Name').value || '').trim();
    if(!validEmail(email)) return setMsg('اكتب بريد إلكتروني صحيح.');
    if(password.length < 6) return setMsg('كلمة المرور يجب ألا تقل عن 6 أحرف.');
    setMsg('جاري المعالجة...');
    try{
      if(mode === 'signup'){
        var s = await c.auth.signUp({ email: email, password: password, options:{ emailRedirectTo: redirectUrl(), data:{ full_name: fullName || email.split('@')[0] } } });
        if(s.error) throw s.error;
        if(userConfirmed(s.data && s.data.user)){
          syncUser(s.data.user); closeModal(); toast('تم إنشاء الحساب وتسجيل الدخول.'); replayPending(); return;
        }
        setMsg('تم إنشاء الحساب. افتح بريدك واضغط رابط التحقق، ثم ارجع وسجل الدخول. افحص Spam أيضًا.');
        toast('تم إرسال رابط التحقق إلى بريدك.');
        setMode('login');
        return;
      }
      var l = await c.auth.signInWithPassword({ email: email, password: password });
      if(l.error) throw l.error;
      var user = l.data && l.data.user;
      if(!userConfirmed(user)){
        await c.auth.signOut(); clearUser();
        setMsg('البريد غير مؤكد. افتح رسالة التحقق في بريدك أو اضغط إعادة التحقق.');
        return;
      }
      syncUser(user); closeModal(); toast('تم تسجيل الدخول بنجاح.'); replayPending();
    }catch(err){
      var m = txt((err && err.message) || err || '');
      if(/email not confirmed/i.test(m)) m = 'البريد غير مؤكد. افتح رابط التحقق في بريدك أو أعد الإرسال.';
      if(/database error saving new user/i.test(m)) m = 'خطأ في قاعدة البيانات عند إنشاء المستخدم. شغّل ملفات SQL الخاصة بالإصلاح في Supabase.';
      setMsg('تعذر إكمال العملية: ' + m);
    }
  }

  async function resendVerification(){
    var c = sb(); if(!c) return setMsg('إعدادات Supabase غير مكتملة.');
    var email = (q('#hxv16Email').value || '').trim().toLowerCase();
    if(!validEmail(email)) return setMsg('اكتب البريد الإلكتروني أولًا.');
    setMsg('جاري إرسال رابط التحقق...');
    try{ var r = await c.auth.resend({ type:'signup', email: email, options:{ emailRedirectTo: redirectUrl() } }); if(r.error) throw r.error; setMsg('تم إرسال رابط التحقق. افحص Inbox و Spam.'); }
    catch(err){ setMsg('تعذر إرسال التحقق: ' + txt((err && err.message) || err)); }
  }
  async function resetPassword(){
    var c = sb(); if(!c) return setMsg('إعدادات Supabase غير مكتملة.');
    var email = (q('#hxv16Email').value || '').trim().toLowerCase();
    if(!validEmail(email)) return setMsg('اكتب البريد الإلكتروني أولًا.');
    setMsg('جاري إرسال رابط استعادة كلمة المرور...');
    try{ var r = await c.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() }); if(r.error) throw r.error; setMsg('تم إرسال رابط استعادة كلمة المرور.'); }
    catch(err){ setMsg('تعذر إرسال الرابط: ' + txt((err && err.message) || err)); }
  }

  async function requireAuth(reason, callback){
    if(replaying){ if(typeof callback === 'function') callback(); return true; }
    var user = await currentVerifiedUser();
    if(user){ syncUser(user); if(typeof callback === 'function') callback(); return true; }
    pendingAction = typeof callback === 'function' ? callback : null;
    openModal('سجّل دخولك أولًا لإكمال: ' + (reason || 'هذا الإجراء'), 'login');
    return false;
  }
  function replayPending(){
    var cb = pendingAction; pendingAction = null;
    if(typeof cb === 'function'){
      setTimeout(function(){ replaying = true; try{ cb(); } finally{ setTimeout(function(){ replaying = false; }, 100); } }, 120);
    }
  }

  function wrapFunction(name, reason){
    var fn = window[name];
    if(typeof fn !== 'function') return;
    if(fn.__hxv16Wrapped) return;
    originals[name] = fn;
    var wrapped = function(){
      var args = arguments;
      return requireAuth(reason, function(){ return originals[name].apply(window, args); });
    };
    wrapped.__hxv16Wrapped = true;
    window[name] = wrapped;
  }

  function wrapProtectedFunctions(){
    wrapFunction('openMyAdsModal', 'إضافة أو إدارة إعلاناتي');
    wrapFunction('openAccountModal', 'فتح حسابي');
    wrapFunction('openAtsCvBuilder', 'صناعة سيرة ذاتية ATS');
    wrapFunction('openXsStore', 'شراء أو استخدام الإكسز Xs');
    wrapFunction('openPromotionModal', 'ترقية الإعلان');
    wrapFunction('openPhoneModal', 'التواصل ورؤية رقم الهاتف');
    wrapFunction('openPlatformChat', 'المراسلة داخل المنصة');
    wrapFunction('openPlatformChatV15', 'المراسلة داخل المنصة');
  }

  function installClickGuard(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest && e.target.closest('.bottom-nav .nav-item[data-tab]');
      if(!btn) return;
      var tab = btn.getAttribute('data-tab');
      if(tab !== 'post' && tab !== 'account') return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      if(tab === 'post') requireAuth('إضافة أو إدارة إعلاناتي', function(){ originals.openMyAdsModal ? originals.openMyAdsModal() : (typeof window.showOverlay === 'function' && window.showOverlay('myAdsOverlay')); });
      if(tab === 'account') requireAuth('فتح حسابي', function(){ originals.openAccountModal ? originals.openAccountModal() : (typeof window.showOverlay === 'function' && window.showOverlay('accountOverlay')); });
    }, true);

    document.addEventListener('click', function(e){
      var el = e.target.closest && e.target.closest('button,a,[role="button"]');
      if(!el || el.closest('.bottom-nav') || el.closest('#hxAuthV16')) return;
      var label = (el.getAttribute('aria-label') || el.textContent || '').trim();
      var words = ['ابدأ صناعة السيرة','صناعة سيرة','ATS','شراء إكسز','الإكسز','Xs','ترقية','تفعيل الصدارة','تواصل','رقم الهاتف','طلب خدمة','تقديم','حفظ الإعلان','نشر الإعلان'];
      var hit = words.some(function(w){ return label.indexOf(w) !== -1; });
      if(!hit) return;
      // لا نوقف الزر إذا كانت الدالة الأصلية الملفوفة ستتعامل معه، لكن نضمن ظهور التسجيل قبل التنفيذ.
      if(!replaying){
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        requireAuth(label.substring(0, 80));
      }
    }, true);
  }

  function publishAliases(){
    window.hirexAuthV16 = { version:VERSION, open:function(r){ openModal(r || 'سجّل دخولك لإكمال هذا الإجراء.', 'login'); }, signup:function(r){ openModal(r || 'أنشئ حسابًا لإكمال هذا الإجراء.', 'signup'); }, require:requireAuth, isReady:currentVerifiedUser };
    window.hirexAuthV15 = window.hirexAuthV16;
    window.hirexAuthV14 = window.hirexAuthV16;
    window.hirexAuthV14Require = requireAuth;
    window.requireEmailLogin = requireAuth;
    window.hirexRequireVerifiedAction = requireAuth;
    window.hirexRequireAuth = requireAuth;
  }

  function init(){
    buildModal();
    publishAliases();
    wrapProtectedFunctions();
    installClickGuard();
    currentVerifiedUser().then(function(user){ if(user) syncUser(user); else clearUser(); });
    var c = sb();
    if(c && c.auth && c.auth.onAuthStateChange){
      c.auth.onAuthStateChange(function(_event, session){
        var user = session && session.user;
        if(userConfirmed(user)){ syncUser(user); replayPending(); } else clearUser();
      });
    }
    // بعض دوال الصفحة تتأخر؛ نعيد الالتفاف بعد قليل.
    setTimeout(wrapProtectedFunctions, 300);
    setTimeout(wrapProtectedFunctions, 1000);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
