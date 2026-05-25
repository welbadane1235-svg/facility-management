/* HireX Auth Engine V12 - external safe auth layer. */
(function () {
  'use strict';
  var clientInstance = null;
  var pendingElement = null;
  var pendingCallback = null;
  var bypassOnce = false;
  var verifiedUser = null;
  var protectedWords = /(إعلاناتي|اعلاناتي|حسابي|إضافة|اضافة|نشر|حفظ|طلب|تقديم|تواصل|اتصال|واتساب|شراء|ترقية|دفع|إرسال|ارسال|سيرة|ATS|CV|عرض سعر|قدّم|قدم|مراسلة|رسالة|الإكسز|الاكسز|Xs|إشعارات|اشعارات|تفعيل)/i;
  var protectedOnclick = /(openMyAdsModal|openAccountModal|saveCurrentAd|openPhoneModal|openPaymentModal|openPlatformChat|openAtsCvBuilder|openXsStore|openPromotionModal|openNotificationsModal|submit|order|apply|contact|pay|save|post)/i;
  var allowedBrowseTabs = { home: true, jobs: true, services: true };

  function qs(sel) { return document.querySelector(sel); }
  function qsa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function textOf(el) { return (el && (el.innerText || el.textContent || el.getAttribute('aria-label') || el.title || '')) || ''; }
  function toast(msg) {
    var old = qs('#hxAuthToastV12'); if (old) old.remove();
    var t = document.createElement('div'); t.id = 'hxAuthToastV12'; t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:92px;transform:translateX(-50%);z-index:2147483647;background:#062421;color:#eaffff;border:1px solid #10d6d6;border-radius:14px;padding:12px 16px;font:700 13px Arial,Tahoma;box-shadow:0 12px 32px rgba(0,0,0,.35);max-width:90%;text-align:center;direction:rtl';
    document.body.appendChild(t); setTimeout(function(){ if(t && t.parentNode) t.remove(); }, 3500);
  }
  function client() {
    if (clientInstance) return clientInstance;
    if (!window.supabase || !window.supabase.createClient) return null;
    if (!window.HIREX_SUPABASE_URL || !window.HIREX_SUPABASE_ANON_KEY) return null;
    clientInstance = window.supabase.createClient(window.HIREX_SUPABASE_URL, window.HIREX_SUPABASE_ANON_KEY);
    return clientInstance;
  }
  function isUserVerified(user) { return !!(user && (user.email_confirmed_at || user.confirmed_at)); }
  function syncAppUser(user) {
    if (!user) return; verifiedUser = user; window.accountState = window.accountState || {};
    window.accountState.isLoggedIn = true; window.accountState.emailVerified = true; window.accountState.email = user.email || window.accountState.email || '';
    window.accountState.name = (user.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) || window.accountState.name || (user.email ? user.email.split('@')[0] : 'مستخدم');
    window.accountState.role = window.accountState.role || 'مستخدم';
    try { localStorage.setItem('hirex_v12_verified_email', window.accountState.email || ''); } catch(e) {}
    if (typeof window.syncAccountUi === 'function') { try { window.syncAccountUi(); } catch(e) {} }
    if (typeof window.syncAccountUI === 'function') { try { window.syncAccountUI(); } catch(e) {} }
  }
  function clearAppUser() {
    verifiedUser = null; window.accountState = window.accountState || {}; window.accountState.isLoggedIn = false; window.accountState.emailVerified = false;
    try { localStorage.removeItem('hirex_v12_verified_email'); } catch(e) {}
  }
  async function refreshSession() {
    var sb = client(); if (!sb) return false;
    try { var res = await sb.auth.getSession(); var user = res && res.data && res.data.session && res.data.session.user;
      if (isUserVerified(user)) { syncAppUser(user); return true; } clearAppUser(); return false;
    } catch (e) { clearAppUser(); return false; }
  }
  function ensureModal() {
    if (qs('#hxAuthModalV12')) return;
    var style = document.createElement('style'); style.id = 'hxAuthStyleV12';
    style.textContent = '#hxAuthModalV12{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);direction:rtl}#hxAuthModalV12.show{display:flex}.hx-auth-card-v12{width:min(420px,92vw);background:linear-gradient(180deg,#062b29,#020b0b);border:1px solid rgba(0,245,245,.35);border-radius:24px;box-shadow:0 24px 80px rgba(0,0,0,.6);color:#eaffff;padding:20px;font-family:Arial,Tahoma,sans-serif}.hx-auth-head-v12{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.hx-auth-title-v12{font-size:22px;font-weight:900}.hx-auth-close-v12{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;border-radius:12px;width:38px;height:38px;font-size:20px;cursor:pointer}.hx-auth-tabs-v12{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.hx-auth-tabs-v12 button{border:1px solid rgba(0,245,245,.22);background:rgba(255,255,255,.05);color:#d9ffff;border-radius:12px;padding:11px;font-weight:800;cursor:pointer}.hx-auth-tabs-v12 button.active{background:#10d6d6;color:#001414}.hx-auth-field-v12{margin:10px 0}.hx-auth-field-v12 label{display:block;font-size:12px;font-weight:800;margin-bottom:6px;color:#bfffff}.hx-auth-field-v12 input{box-sizing:border-box;width:100%;padding:13px 14px;border-radius:13px;border:1px solid rgba(0,245,245,.28);background:#071716;color:#fff;outline:none;font-weight:700}.hx-auth-submit-v12{width:100%;border:0;border-radius:14px;background:#10d6d6;color:#001313;padding:14px;font-weight:900;cursor:pointer;margin-top:10px}.hx-auth-link-v12{width:100%;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:transparent;color:#eaffff;padding:11px;font-weight:800;cursor:pointer;margin-top:8px}.hx-auth-msg-v12{min-height:24px;color:#ffd98a;font-size:12px;line-height:1.7;margin-top:10px;text-align:center}.hx-auth-reason-v12{background:rgba(0,245,245,.08);border:1px solid rgba(0,245,245,.22);border-radius:14px;padding:10px;font-size:12px;color:#cfffff;line-height:1.7;text-align:center;margin-bottom:10px}';
    document.head.appendChild(style);
    var modal = document.createElement('div'); modal.id = 'hxAuthModalV12';
    modal.innerHTML = '<div class="hx-auth-card-v12" role="dialog" aria-modal="true"><div class="hx-auth-head-v12"><div class="hx-auth-title-v12" id="hxAuthTitleV12">تسجيل الدخول</div><button class="hx-auth-close-v12" id="hxAuthCloseV12" type="button">×</button></div><div class="hx-auth-reason-v12" id="hxAuthReasonV12">سجل دخولك لإكمال هذا الإجراء.</div><div class="hx-auth-tabs-v12"><button type="button" data-mode="login" class="active">دخول</button><button type="button" data-mode="signup">إنشاء حساب</button></div><div class="hx-auth-field-v12" id="hxAuthNameWrapV12" style="display:none"><label>الاسم الكامل</label><input id="hxAuthNameV12" autocomplete="name" placeholder="اكتب اسمك"></div><div class="hx-auth-field-v12"><label>البريد الإلكتروني</label><input id="hxAuthEmailV12" type="email" autocomplete="email" placeholder="example@email.com"></div><div class="hx-auth-field-v12"><label>كلمة المرور</label><input id="hxAuthPasswordV12" type="password" autocomplete="current-password" placeholder="******"></div><button class="hx-auth-submit-v12" id="hxAuthSubmitV12" type="button">تسجيل الدخول</button><button class="hx-auth-link-v12" id="hxAuthResendV12" type="button">إعادة إرسال رابط التحقق</button><button class="hx-auth-link-v12" id="hxAuthResetV12" type="button">نسيت كلمة المرور؟</button><div class="hx-auth-msg-v12" id="hxAuthMsgV12"></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target === modal) closeModal(); });
    qs('#hxAuthCloseV12').addEventListener('click', closeModal);
    qsa('#hxAuthModalV12 [data-mode]').forEach(function(btn){ btn.addEventListener('click', function(){ setMode(btn.getAttribute('data-mode')); }); });
    qs('#hxAuthSubmitV12').addEventListener('click', submitAuth); qs('#hxAuthResendV12').addEventListener('click', resendVerification); qs('#hxAuthResetV12').addEventListener('click', resetPassword);
    qs('#hxAuthPasswordV12').addEventListener('keydown', function(e){ if(e.key === 'Enter') submitAuth(); });
  }
  function msg(s) { var m = qs('#hxAuthMsgV12'); if (m) m.textContent = s || ''; }
  function setMode(mode) {
    var modal = qs('#hxAuthModalV12'); if (!modal) return; modal.setAttribute('data-mode', mode);
    qsa('#hxAuthModalV12 [data-mode]').forEach(function(btn){ btn.classList.toggle('active', btn.getAttribute('data-mode') === mode); });
    qs('#hxAuthNameWrapV12').style.display = mode === 'signup' ? 'block' : 'none'; qs('#hxAuthTitleV12').textContent = mode === 'signup' ? 'إنشاء حساب وتحقق' : 'تسجيل الدخول'; qs('#hxAuthSubmitV12').textContent = mode === 'signup' ? 'إنشاء حساب وإرسال التحقق' : 'تسجيل الدخول';
    msg(mode === 'signup' ? 'سيتم إرسال رابط تحقق إلى بريدك بعد إنشاء الحساب.' : 'استخدم بريدك وكلمة المرور للدخول إلى حسابك.');
  }
  function openModal(reason, mode) { ensureModal(); qs('#hxAuthReasonV12').textContent = reason || 'سجل دخولك لإكمال هذا الإجراء.'; setMode(mode || 'login'); qs('#hxAuthModalV12').classList.add('show'); document.body.classList.add('modal-open'); setTimeout(function(){ var e = qs('#hxAuthEmailV12'); if(e) e.focus(); }, 80); }
  function closeModal() { var m = qs('#hxAuthModalV12'); if (m) m.classList.remove('show'); document.body.classList.remove('modal-open'); }
  function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim()); }
  async function submitAuth() {
    var sb = client(); if (!sb) return msg('إعدادات Supabase غير مكتملة. راجع auth-config.js');
    var mode = (qs('#hxAuthModalV12') && qs('#hxAuthModalV12').getAttribute('data-mode')) || 'login'; var email = (qs('#hxAuthEmailV12').value || '').trim().toLowerCase(); var password = qs('#hxAuthPasswordV12').value || ''; var fullName = (qs('#hxAuthNameV12').value || '').trim();
    if (!validEmail(email)) return msg('اكتب بريد إلكتروني صحيح.'); if (password.length < 6) return msg('كلمة المرور يجب ألا تقل عن 6 أحرف.'); msg('جاري المعالجة...');
    try { if (mode === 'signup') { var sign = await sb.auth.signUp({ email: email, password: password, options: { emailRedirectTo: window.HIREX_AUTH_REDIRECT_URL || window.location.href, data: { full_name: fullName || email.split('@')[0] } } }); if (sign.error) throw sign.error; var u = sign.data && sign.data.user; if (isUserVerified(u)) { syncAppUser(u); msg('تم إنشاء الحساب وتسجيل الدخول بنجاح.'); closeModal(); replayPending(); } else { msg('تم إنشاء الحساب. افتح بريدك واضغط رابط التحقق، ثم ارجع وسجل الدخول.'); toast('تم إرسال رابط التحقق إلى بريدك.'); setMode('login'); } return; }
      var login = await sb.auth.signInWithPassword({ email: email, password: password }); if (login.error) throw login.error; var user = login.data && login.data.user; if (!isUserVerified(user)) { await sb.auth.signOut(); clearAppUser(); msg('حسابك موجود، لكن البريد غير مؤكد. اضغط إعادة إرسال رابط التحقق أو افتح بريدك.'); return; } syncAppUser(user); msg('تم تسجيل الدخول بنجاح.'); closeModal(); toast('تم تسجيل الدخول.'); replayPending();
    } catch (err) { var s = String((err && err.message) || err || ''); if (/email not confirmed/i.test(s)) s = 'البريد غير مؤكد. اضغط رابط التحقق في بريدك أو أعد الإرسال.'; msg('تعذر إكمال العملية: ' + s); }
  }
  async function resendVerification() { var sb = client(); if (!sb) return msg('إعدادات Supabase غير مكتملة.'); var email = (qs('#hxAuthEmailV12').value || '').trim().toLowerCase(); if (!validEmail(email)) return msg('اكتب البريد أولًا ثم أعد إرسال التحقق.'); msg('جاري إعادة إرسال رابط التحقق...'); try { var res = await sb.auth.resend({ type: 'signup', email: email, options: { emailRedirectTo: window.HIREX_AUTH_REDIRECT_URL || window.location.href } }); if (res.error) throw res.error; msg('تم إرسال رابط التحقق مرة أخرى. افحص Inbox و Spam.'); } catch (err) { msg('تعذر إرسال التحقق: ' + String((err && err.message) || err || '')); } }
  async function resetPassword() { var sb = client(); if (!sb) return msg('إعدادات Supabase غير مكتملة.'); var email = (qs('#hxAuthEmailV12').value || '').trim().toLowerCase(); if (!validEmail(email)) return msg('اكتب البريد أولًا لإرسال رابط استعادة كلمة المرور.'); msg('جاري إرسال رابط استعادة كلمة المرور...'); try { var res = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.HIREX_AUTH_REDIRECT_URL || window.location.href }); if (res.error) throw res.error; msg('تم إرسال رابط استعادة كلمة المرور إلى بريدك.'); } catch (err) { msg('تعذر إرسال الرابط: ' + String((err && err.message) || err || '')); } }
  async function requireAuth(reason, callback, element) { if (await refreshSession()) { if (typeof callback === 'function') return callback(); return true; } pendingCallback = typeof callback === 'function' ? callback : null; pendingElement = element || null; openModal(reason || 'سجل دخولك لإكمال هذا الإجراء.', 'login'); return false; }
  function replayPending() { var cb = pendingCallback; var el = pendingElement; pendingCallback = null; pendingElement = null; if (typeof cb === 'function') { setTimeout(cb, 120); return; } if (el && typeof el.click === 'function') { bypassOnce = true; setTimeout(function(){ try { el.click(); } finally { setTimeout(function(){ bypassOnce = false; }, 0); } }, 120); } }
  function isInsideAuth(el) { return !!(el && el.closest && el.closest('#hxAuthModalV12')); }
  function isProtectedElement(el) {
    if (!el || isInsideAuth(el)) return false; var item = el.closest('button,a,[role="button"],.nav-item,.nav-btn,.action-btn,.btn,.card,[onclick]'); if (!item) return false;
    var nav = item.closest('.bottom-nav .nav-item[data-tab], .bottom-nav [data-tab]'); if (nav) { var tab = nav.getAttribute('data-tab') || ''; if (allowedBrowseTabs[tab]) return false; return true; }
    var onclick = item.getAttribute('onclick') || ''; var txt = textOf(item).replace(/\s+/g, ' ').trim(); if (protectedOnclick.test(onclick)) return true; if (protectedWords.test(txt)) return true; if (item.matches && item.matches('[data-requires-auth="true"],[data-auth-required="true"]')) return true; return false;
  }
  function installClickGate() { document.addEventListener('click', function(e) { if (bypassOnce) return; var el = e.target; if (!isProtectedElement(el)) return; e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); var item = el.closest('button,a,[role="button"],.nav-item,.nav-btn,.action-btn,.btn,.card,[onclick]') || el; requireAuth('سجل دخولك أولًا لإكمال هذا الإجراء.', null, item); }, true); }
  function wrapFunction(name, reason) { var original = window[name]; if (typeof original !== 'function' || original.__hxV12Wrapped) return; var wrapped = function() { var args = arguments; return requireAuth(reason, function(){ return original.apply(window, args); }); }; wrapped.__hxV12Wrapped = true; wrapped.__hxV12Original = original; window[name] = wrapped; }
  function wrapKnownActions() { [['openMyAdsModal','عرض إعلاناتك يتطلب تسجيل الدخول.'],['openAccountModal','فتح الحساب يتطلب تسجيل الدخول.'],['saveCurrentAd','نشر أو حفظ الإعلان يتطلب تسجيل الدخول.'],['openPhoneModal','التواصل يتطلب تسجيل الدخول.'],['openPaymentModal','الدفع يتطلب تسجيل الدخول.'],['openPlatformChat','المراسلة تتطلب تسجيل الدخول.'],['openAtsCvBuilder','صناعة السيرة تتطلب تسجيل الدخول.'],['openXsStore','شراء Xs يتطلب تسجيل الدخول.'],['openPromotionModal','ترقية الإعلان تتطلب تسجيل الدخول.'],['openNotificationsModal','الإشعارات تتطلب تسجيل الدخول.']].forEach(function(x){ wrapFunction(x[0], x[1]); }); }
  async function init() { ensureModal(); installClickGate(); wrapKnownActions(); await refreshSession(); var sb = client(); if (sb && sb.auth && sb.auth.onAuthStateChange) { sb.auth.onAuthStateChange(function(_event, session){ var user = session && session.user; if (isUserVerified(user)) syncAppUser(user); else clearAppUser(); }); } setTimeout(wrapKnownActions, 500); setInterval(wrapKnownActions, 1500); }
  window.hirexAuthV12 = { version: '12', requireAuth: requireAuth, open: function(reason){ openModal(reason || 'سجل دخولك لإكمال هذا الإجراء.', 'login'); }, signup: function(reason){ openModal(reason || 'أنشئ حسابك لإكمال هذا الإجراء.', 'signup'); }, refresh: refreshSession };
  window.requireEmailLogin = function(reason, callback){ return requireAuth(reason, callback); };
  window.requireVerifiedAction = function(reason, callback){ return requireAuth(reason, callback); };
  window.hirexIsVerifiedUser = function(){ return !!verifiedUser; };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
