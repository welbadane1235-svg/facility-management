/* HireX V17 Root Auth - direct working modal + protected buttons */
(function(){
  'use strict';
  var client=null, pendingAction=null, isRunningPending=false;
  var originals={};
  function $(s){return document.querySelector(s)}
  function $all(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
  function text(v){return String(v==null?'':v)}
  function notice(m){ if(typeof window.showMiniNotice==='function') window.showMiniNotice(m); else alert(m); }
  function redirectUrl(){ return window.HIREX_AUTH_REDIRECT_URL || (location.origin + location.pathname); }
  function validEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(e).trim()); }
  function sb(){
    if(client) return client;
    if(!window.supabase || !window.supabase.createClient || !window.HIREX_SUPABASE_URL || !window.HIREX_SUPABASE_ANON_KEY) return null;
    client = window.supabase.createClient(window.HIREX_SUPABASE_URL, window.HIREX_SUPABASE_ANON_KEY);
    return client;
  }
  function confirmed(u){ return !!(u && u.email && (u.email_confirmed_at || u.confirmed_at)); }
  async function verifiedUser(){
    var c=sb(); if(!c) return null;
    try{ var r=await c.auth.getSession(); var u=r && r.data && r.data.session && r.data.session.user; return confirmed(u)?u:null; }catch(e){ return null; }
  }
  function setAccount(u){
    window.accountState=window.accountState||{};
    if(u){
      accountState.isLoggedIn=true; accountState.emailVerified=true; accountState.email=u.email;
      accountState.name=(u.user_metadata&&u.user_metadata.full_name)||u.email.split('@')[0];
    }else{
      accountState.isLoggedIn=false; accountState.emailVerified=false;
    }
    try{ if(typeof window.syncAccountUi==='function') window.syncAccountUi(); }catch(e){}
  }
  function closeMainOverlays(){
    ['jobsOverlay','servicesOverlay','myAdsOverlay','accountOverlay','atsCvOverlay','xsStoreOverlay','paymentOverlay','promotionOverlay','platformChatOverlay','notificationsOverlay'].forEach(function(id){
      var el=document.getElementById(id); if(el){ el.classList.remove('show'); el.setAttribute('aria-hidden','true'); el.style.display=''; }
    });
    if(!document.querySelector('.overlay.show')) document.body.classList.remove('modal-open');
  }
  function setActive(tab){ $all('.bottom-nav .nav-item[data-tab]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab')===tab); }); }
  function showOverlay(id){ var el=document.getElementById(id); if(!el) return false; el.classList.add('show'); el.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open'); return true; }
  function buildModal(){
    if($('#hxAuthV17')) return;
    var st=document.createElement('style'); st.id='hxAuthV17Style'; st.textContent=`
#hxAuthV17{position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.78);backdrop-filter:blur(12px);padding:18px;direction:rtl;font-family:inherit}
#hxAuthV17.show{display:flex!important}.hx17-card{width:min(430px,100%);border:1px solid rgba(0,229,255,.35);border-radius:28px;background:linear-gradient(180deg,rgba(7,41,38,.98),rgba(2,13,12,.99));box-shadow:0 30px 100px rgba(0,0,0,.78);color:#fff;overflow:hidden}.hx17-head{display:flex;align-items:center;justify-content:space-between;padding:18px;border-bottom:1px solid rgba(255,255,255,.08)}.hx17-title{font-size:22px;font-weight:1000}.hx17-close{width:40px;height:40px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff;font-size:24px;cursor:pointer}.hx17-body{padding:18px}.hx17-reason{padding:12px 14px;margin-bottom:13px;border-radius:16px;background:rgba(0,229,255,.10);border:1px solid rgba(0,229,255,.22);font-size:13px;font-weight:900;color:#d8fffb;line-height:1.7}.hx17-tabs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}.hx17-tabs button{border:1px solid rgba(255,255,255,.13);border-radius:15px;background:rgba(255,255,255,.04);color:#d8fffb;padding:12px;font-weight:1000;cursor:pointer}.hx17-tabs button.active{background:linear-gradient(135deg,#17f0d2,#20d09f);color:#001b18}.hx17-field{margin-bottom:12px}.hx17-field label{display:block;margin-bottom:7px;color:#bdfcf4;font-size:13px;font-weight:1000}.hx17-field input{width:100%;box-sizing:border-box;border:1px solid rgba(0,229,255,.28);border-radius:16px;background:rgba(255,255,255,.08);color:#fff;padding:14px;font-size:15px;outline:none}.hx17-submit{width:100%;border:0;border-radius:17px;background:linear-gradient(135deg,#17f0d2,#20d09f);color:#001b18;font-weight:1000;padding:15px;cursor:pointer;font-size:15px;margin-top:4px}.hx17-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.hx17-link{border:1px solid rgba(255,255,255,.13);border-radius:14px;background:rgba(255,255,255,.04);color:#d8fffb;padding:11px;font-weight:900;cursor:pointer;font-size:12px}.hx17-msg{min-height:22px;margin-top:12px;font-size:13px;font-weight:800;color:#ffe7a3;line-height:1.7}`;
    document.head.appendChild(st);
    var m=document.createElement('div'); m.id='hxAuthV17';
    m.innerHTML='<div class="hx17-card" role="dialog" aria-modal="true"><div class="hx17-head"><div class="hx17-title" id="hx17Title">تسجيل الدخول</div><button type="button" class="hx17-close" id="hx17Close">×</button></div><div class="hx17-body"><div class="hx17-reason" id="hx17Reason">سجّل دخولك لإكمال هذا الإجراء.</div><div class="hx17-tabs"><button type="button" data-hx17-mode="login" class="active">دخول</button><button type="button" data-hx17-mode="signup">إنشاء حساب</button></div><div class="hx17-field" id="hx17NameWrap" style="display:none"><label>الاسم الكامل</label><input id="hx17Name" autocomplete="name" placeholder="اكتب اسمك"></div><div class="hx17-field"><label>البريد الإلكتروني</label><input id="hx17Email" type="email" autocomplete="email" placeholder="example@email.com"></div><div class="hx17-field"><label>كلمة المرور</label><input id="hx17Password" type="password" autocomplete="current-password" placeholder="******"></div><button type="button" class="hx17-submit" id="hx17Submit">تسجيل الدخول</button><div class="hx17-row"><button type="button" class="hx17-link" id="hx17Resend">إعادة التحقق</button><button type="button" class="hx17-link" id="hx17Reset">نسيت كلمة المرور؟</button></div><div class="hx17-msg" id="hx17Msg"></div></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click',function(e){ if(e.target===m) closeAuth(); });
    $('#hx17Close').addEventListener('click',closeAuth);
    $all('[data-hx17-mode]').forEach(function(b){ b.addEventListener('click',function(){ setMode(b.getAttribute('data-hx17-mode')); }); });
    $('#hx17Submit').addEventListener('click',submitAuth);
    $('#hx17Resend').addEventListener('click',resend);
    $('#hx17Reset').addEventListener('click',resetPass);
    $('#hx17Password').addEventListener('keydown',function(e){ if(e.key==='Enter') submitAuth(); });
  }
  function msg(t){ var el=$('#hx17Msg'); if(el) el.textContent=t||''; }
  function setMode(mode){
    buildModal(); var signup=mode==='signup'; var m=$('#hxAuthV17'); m.setAttribute('data-mode',signup?'signup':'login');
    $all('[data-hx17-mode]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-hx17-mode')===(signup?'signup':'login')); });
    $('#hx17NameWrap').style.display=signup?'block':'none'; $('#hx17Title').textContent=signup?'إنشاء حساب وتأكيد البريد':'تسجيل الدخول'; $('#hx17Submit').textContent=signup?'إنشاء حساب وإرسال التحقق':'تسجيل الدخول'; msg(signup?'سيتم إرسال رابط تحقق إلى بريدك الإلكتروني.':'استخدم بريدك وكلمة المرور للدخول.');
  }
  function openAuth(reason,mode){ buildModal(); closeMainOverlays(); $('#hx17Reason').textContent=reason||'سجّل دخولك لإكمال هذا الإجراء.'; setMode(mode||'login'); $('#hxAuthV17').classList.add('show'); document.body.classList.add('modal-open'); setTimeout(function(){ var e=$('#hx17Email'); if(e) e.focus();},80); return false; }
  function closeAuth(){ var m=$('#hxAuthV17'); if(m) m.classList.remove('show'); if(!document.querySelector('.overlay.show')) document.body.classList.remove('modal-open'); }
  async function submitAuth(){
    var c=sb(); if(!c) return msg('إعدادات Supabase غير مكتملة. تأكد من auth-config.js ومكتبة Supabase.');
    var mode=($('#hxAuthV17').getAttribute('data-mode')||'login'), email=($('#hx17Email').value||'').trim().toLowerCase(), pass=$('#hx17Password').value||'', name=($('#hx17Name').value||'').trim();
    if(!validEmail(email)) return msg('اكتب بريد إلكتروني صحيح.'); if(pass.length<6) return msg('كلمة المرور يجب ألا تقل عن 6 أحرف.'); msg('جاري المعالجة...');
    try{
      if(mode==='signup'){
        var s=await c.auth.signUp({email:email,password:pass,options:{emailRedirectTo:redirectUrl(),data:{full_name:name||email.split('@')[0]}}}); if(s.error) throw s.error;
        if(confirmed(s.data&&s.data.user)){ setAccount(s.data.user); closeAuth(); notice('تم إنشاء الحساب وتسجيل الدخول.'); runPending(); return; }
        msg('تم إنشاء الحساب. افتح بريدك واضغط رابط التحقق، ثم ارجع وسجل الدخول. افحص Spam أيضًا.'); setMode('login'); return;
      }
      var l=await c.auth.signInWithPassword({email:email,password:pass}); if(l.error) throw l.error; var u=l.data&&l.data.user;
      if(!confirmed(u)){ try{ await c.auth.signOut(); }catch(e){} setAccount(null); msg('البريد غير مؤكد. افتح رسالة التحقق أو اضغط إعادة التحقق.'); return; }
      setAccount(u); closeAuth(); notice('تم تسجيل الدخول بنجاح.'); runPending();
    }catch(err){ var m=text((err&&err.message)||err); if(/email not confirmed/i.test(m)) m='البريد غير مؤكد. افتح رابط التحقق في بريدك.'; if(/database error saving new user/i.test(m)) m='خطأ قاعدة بيانات عند إنشاء المستخدم. شغّل ملف SQL الخاص بالإصلاح في Supabase.'; msg('تعذر إكمال العملية: '+m); }
  }
  async function resend(){ var c=sb(); if(!c) return msg('إعدادات Supabase غير مكتملة.'); var email=($('#hx17Email').value||'').trim().toLowerCase(); if(!validEmail(email)) return msg('اكتب البريد الإلكتروني أولًا.'); msg('جاري إرسال رابط التحقق...'); try{ var r=await c.auth.resend({type:'signup',email:email,options:{emailRedirectTo:redirectUrl()}}); if(r.error) throw r.error; msg('تم إرسال رابط التحقق. افحص Inbox و Spam.'); }catch(e){ msg('تعذر إرسال التحقق: '+text((e&&e.message)||e)); } }
  async function resetPass(){ var c=sb(); if(!c) return msg('إعدادات Supabase غير مكتملة.'); var email=($('#hx17Email').value||'').trim().toLowerCase(); if(!validEmail(email)) return msg('اكتب البريد الإلكتروني أولًا.'); msg('جاري إرسال رابط الاستعادة...'); try{ var r=await c.auth.resetPasswordForEmail(email,{redirectTo:redirectUrl()}); if(r.error) throw r.error; msg('تم إرسال رابط استعادة كلمة المرور.'); }catch(e){ msg('تعذر إرسال الرابط: '+text((e&&e.message)||e)); } }
  async function requireAuth(reason,cb){
    if(isRunningPending){ if(typeof cb==='function') cb(); return true; }
    var u=await verifiedUser(); if(u){ setAccount(u); if(typeof cb==='function') cb(); return true; }
    pendingAction=typeof cb==='function'?cb:null; return openAuth('سجّل دخولك وتحقق من بريدك لإكمال: '+(reason||'هذا الإجراء'),'login');
  }
  function runPending(){ var cb=pendingAction; pendingAction=null; if(typeof cb==='function') setTimeout(function(){ isRunningPending=true; try{ cb(); } finally{ setTimeout(function(){isRunningPending=false;},100); } },120); }
  function wrap(name,reason){
    var fn=window[name]; if(typeof fn!=='function') return; if(fn.__hx17) return;
    originals[name]=originals[name]||fn;
    var w=function(){ var args=arguments; return requireAuth(reason,function(){ return originals[name].apply(window,args); }); };
    w.__hx17=true; window[name]=w;
  }
  function wrapAll(){ ['openMyAdsModal','openAccountModal','openAtsCvBuilder','openXsStore','openPromotionModal','openPhoneModal','openPaymentModal','openPlatformChat','openPlatformChatV15','saveCurrentAd','generateAtsCv','confirmXsPayment'].forEach(function(n){
      wrap(n, ({openMyAdsModal:'إضافة أو إدارة إعلان',openAccountModal:'فتح حسابي',openAtsCvBuilder:'صناعة سيرة ATS',openXsStore:'شراء أو استخدام الإكسز Xs',openPromotionModal:'ترقية الإعلان',openPhoneModal:'التواصل ورؤية رقم الهاتف',openPaymentModal:'الدفع أو إرسال إثبات',openPlatformChat:'المراسلة داخل المنصة',openPlatformChatV15:'المراسلة داخل المنصة',saveCurrentAd:'حفظ أو نشر الإعلان',generateAtsCv:'إنشاء السيرة',confirmXsPayment:'تأكيد الدفع'})[n]||'هذا الإجراء');
    }); }
  function openPublicTab(tab){
    closeMainOverlays(); setActive(tab);
    if(tab==='home'){ try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){} return; }
    if(tab==='jobs'){ if(typeof originals.openJobsModal==='function') originals.openJobsModal(); else if(typeof window.openJobsModal==='function') window.openJobsModal(); else showOverlay('jobsOverlay'); setActive('jobs'); return; }
    if(tab==='services'){ if(typeof originals.openServicesModal==='function') originals.openServicesModal(); else if(typeof window.openServicesModal==='function') window.openServicesModal(); else showOverlay('servicesOverlay'); setActive('services'); return; }
  }
  function installClicks(){
    // ضع علامة واضحة على الأزرار المطلوبة
    var hero=document.querySelector('.hero-cta'); if(hero) hero.setAttribute('data-hx17-protected','ابدأ رحلتك الآن');
    $all('.bottom-nav .nav-item[data-tab]').forEach(function(b){ b.setAttribute('type','button'); });
    document.addEventListener('click',function(e){
      var authBox=e.target.closest&&e.target.closest('#hxAuthV17'); if(authBox) return;
      var nav=e.target.closest&&e.target.closest('.bottom-nav .nav-item[data-tab]');
      if(nav){ var tab=nav.getAttribute('data-tab'); e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation(); if(tab==='home'||tab==='jobs'||tab==='services') return openPublicTab(tab); if(tab==='post') return requireAuth('إضافة أو إدارة إعلان',function(){ if(originals.openMyAdsModal) originals.openMyAdsModal(); else showOverlay('myAdsOverlay'); setActive('post'); }); if(tab==='account') return requireAuth('فتح حسابي',function(){ if(originals.openAccountModal) originals.openAccountModal(); else showOverlay('accountOverlay'); setActive('account'); }); }
      var el=e.target.closest&&e.target.closest('[data-hx17-protected],button,a,[role="button"]'); if(!el) return;
      var label=(el.getAttribute('data-hx17-protected')||el.getAttribute('aria-label')||el.textContent||'').replace(/\s+/g,' ').trim();
      var onclick=String(el.getAttribute('onclick')||'');
      var hit=/ابدأ رحلتك|إعلاناتي|اعلاناتي|حسابي|صناعة السيرة|سيرة ATS|ATS|شراء إكسز|الإكسز|Xs|تواصل|رقم الجوال|طلب خدمة|تقديم|نشر|حفظ الإعلان|ترقية|دفع|إثبات|محفظة/i.test(label+' '+onclick);
      if(!hit) return;
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      return requireAuth(label||'هذا الإجراء');
    }, true);
  }
  function expose(){ window.hirexOpenAuth=function(reason,mode){ return openAuth(reason,mode||'login'); }; window.hirexAuthV17={open:openAuth,require:requireAuth,isReady:verifiedUser}; window.requireEmailLogin=requireAuth; window.hirexRequireAuth=requireAuth; window.hirexRequireVerifiedAction=requireAuth; }
  function init(){ buildModal(); expose(); originals.openJobsModal=window.openJobsModal; originals.openServicesModal=window.openServicesModal; wrapAll(); installClicks(); verifiedUser().then(function(u){ setAccount(u||null); }); var c=sb(); if(c&&c.auth&&c.auth.onAuthStateChange){ c.auth.onAuthStateChange(function(_ev,session){ var u=session&&session.user; setAccount(confirmed(u)?u:null); if(confirmed(u)) runPending(); }); } setTimeout(wrapAll,300); setTimeout(wrapAll,1000); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
