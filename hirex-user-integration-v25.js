/* HireX V25: clean user integration for account, my ads, notifications, and Supabase session.
   External file to avoid breaking index.html scripts. */
(function(){
  'use strict';
  var sbClient = null;
  var currentUser = null;
  var currentProfile = null;
  var installed = false;

  function toast(msg){
    try{ if(typeof window.showMiniNotice === 'function') return window.showMiniNotice(msg); }catch(e){}
    try{ console.log('[HireX]', msg); }catch(e){}
  }
  function qs(id){ return document.getElementById(id); }
  function isVerified(user){ return !!(user && user.email && (user.email_confirmed_at || user.confirmed_at)); }
  function client(){
    try{
      if(sbClient) return sbClient;
      if(!window.supabase || !window.supabase.createClient || !window.HIREX_SUPABASE_URL || !window.HIREX_SUPABASE_ANON_KEY) return null;
      sbClient = window.supabase.createClient(window.HIREX_SUPABASE_URL, window.HIREX_SUPABASE_ANON_KEY, {
        auth:{ detectSessionInUrl:true, persistSession:true, autoRefreshToken:true }
      });
      return sbClient;
    }catch(e){ return null; }
  }
  function roleFromProfile(profile){
    var r = (profile && profile.role) || '';
    if(!r || r === 'visitor') return 'باحث عن عمل';
    return r;
  }
  function applyAccount(user, profile){
    if(!user || !user.email) return;
    currentUser = user;
    currentProfile = profile || currentProfile || {};
    var fullName = currentProfile.full_name || (user.user_metadata && user.user_metadata.full_name) || user.email.split('@')[0];
    var phone = currentProfile.phone || '';
    var role = roleFromProfile(currentProfile);
    try{
      if(typeof accountState !== 'undefined'){
        accountState.isLoggedIn = true;
        accountState.emailVerified = true;
        accountState.email = user.email;
        accountState.name = fullName;
        accountState.phone = phone;
        accountState.role = role;
        accountState.bio = currentProfile.notes || accountState.bio || '';
      }
    }catch(e){}
    var map = {
      accountDisplayName: fullName,
      accountDisplayEmail: user.email,
      accountDisplayRole: role,
      accName: fullName,
      accEmail: user.email,
      accPhone: phone,
      accRole: role,
      accBio: (currentProfile && currentProfile.notes) || ''
    };
    Object.keys(map).forEach(function(id){
      var el = qs(id);
      if(!el) return;
      if('value' in el) el.value = map[id] || '';
      else el.textContent = map[id] || '';
    });
    try{ if(typeof syncAccountUi === 'function') syncAccountUi(); }catch(e){}
    try{ hideFirstAuthWall(); }catch(e){}
  }
  function hideFirstAuthWall(){
    document.documentElement.classList.remove('hx18-locked');
    document.body.classList.remove('hx18-locked');
    var wall = qs('hxFirstAuthWall');
    if(wall) wall.classList.remove('show');
  }
  function showFirstAuthWall(){
    document.documentElement.classList.add('hx18-locked');
    document.body.classList.add('hx18-locked');
    var wall = qs('hxFirstAuthWall');
    if(wall) wall.classList.add('show');
  }
  async function upsertAndLoadProfile(user){
    var sb = client();
    if(!sb || !isVerified(user)) return null;
    var base = {
      email: user.email.toLowerCase(),
      full_name: (user.user_metadata && user.user_metadata.full_name) || user.email.split('@')[0],
      role: 'visitor',
      status: 'active',
      email_verified: true,
      auth_user_id: user.id
    };
    try{
      await sb.from('hirex_users').upsert(base, { onConflict:'email' });
    }catch(e){}
    try{
      var res = await sb.from('hirex_users').select('*').eq('email', user.email.toLowerCase()).maybeSingle();
      if(res && res.data) return res.data;
    }catch(e){}
    return base;
  }
  function normalizeStatus(status){ return status === 'published' ? 'published' : 'draft'; }
  function normalizeType(t){
    t = String(t || '').toLowerCase();
    if(t.indexOf('resume') > -1 || t.indexOf('سير') > -1 || t.indexOf('باحث') > -1) return 'resume';
    if(t.indexOf('service') > -1 || t.indexOf('خدم') > -1 || t.indexOf('عرض') > -1) return 'service';
    if(t.indexOf('request') > -1 || t.indexOf('طلب') > -1) return 'request';
    return 'job';
  }
  function mapAd(row){
    var payload = row.payload || {};
    var type = normalizeType(payload.type || row.ad_type);
    var ad = Object.assign({}, payload);
    ad.id = row.id;
    ad.type = type;
    ad.title = row.title || payload.title || 'إعلان بدون عنوان';
    ad.status = normalizeStatus(row.status || payload.status);
    ad.promoted = !!row.promoted;
    ad.createdAt = row.created_at ? new Date(row.created_at).toLocaleString('ar-SA') : (payload.createdAt || '');
    ad.updatedAt = row.updated_at ? new Date(row.updated_at).toLocaleString('ar-SA') : (payload.updatedAt || '');
    ad.portalLabel = (type === 'job' || type === 'resume') ? 'بوابة الوظائف' : 'بوابة الخدمات';
    ad.targetPortal = (type === 'job' || type === 'resume') ? 'jobs' : 'services';
    return ad;
  }
  async function loadMyAds(){
    var sb = client();
    if(!sb || !currentUser || !currentUser.email) return;
    try{
      var res = await sb.from('hirex_ads').select('*').eq('owner_email', currentUser.email.toLowerCase()).order('created_at', { ascending:false });
      var ads = (res && res.data || []).map(mapAd);
      try{
        if(typeof myAdsState !== 'undefined'){
          myAdsState.ads = ads;
          if(typeof renderMyAdsList === 'function') renderMyAdsList();
          if(typeof syncAccountUi === 'function') syncAccountUi();
        }
      }catch(e){}
    }catch(e){
      // Keep local ads if Supabase policy is not ready.
    }
  }
  async function persistAd(ad){
    var sb = client();
    if(!sb || !currentUser || !currentUser.email || !ad || !ad.title) return;
    var type = normalizeType(ad.type);
    var status = normalizeStatus(ad.status);
    var payload = Object.assign({}, ad);
    var row = {
      title: ad.title,
      ad_type: type,
      owner_email: currentUser.email.toLowerCase(),
      owner_name: (currentProfile && currentProfile.full_name) || (currentUser.user_metadata && currentUser.user_metadata.full_name) || currentUser.email.split('@')[0],
      city: ad.city || '',
      status: status,
      promoted: !!ad.promoted,
      price: Number(ad.price || 0) || 0,
      payload: payload
    };
    try{
      if(String(ad.id || '').indexOf('-') > -1){
        await sb.from('hirex_ads').update(row).eq('id', ad.id).eq('owner_email', currentUser.email.toLowerCase());
      }else{
        var res = await sb.from('hirex_ads').insert(row).select('*').single();
        if(res && res.data){
          ad.id = res.data.id;
          ad.createdAt = new Date(res.data.created_at).toLocaleString('ar-SA');
        }
      }
    }catch(e){ toast('تم حفظ الإعلان محليًا، وتعذر ربطه بقاعدة البيانات. راجع سياسات Supabase.'); }
  }
  function installSaveWrappers(){
    if(installed) return;
    installed = true;
    try{
      if(typeof saveCurrentAd === 'function' && !window.__hirexV25SaveCurrentAd){
        window.__hirexV25SaveCurrentAd = saveCurrentAd;
        saveCurrentAd = function(status){
          var beforeId = null;
          try{ if(typeof myAdsState !== 'undefined' && myAdsState.ads && myAdsState.ads[0]) beforeId = myAdsState.ads[0].id; }catch(e){}
          var result = window.__hirexV25SaveCurrentAd(status);
          setTimeout(function(){
            try{
              if(typeof myAdsState === 'undefined' || !myAdsState.ads || !myAdsState.ads.length) return;
              var ad = myAdsState.ads[0];
              if(ad && (ad.id !== beforeId || String(ad.id).indexOf('-') === -1)) persistAd(ad).then(loadMyAds);
              else if(ad) persistAd(ad).then(loadMyAds);
            }catch(e){}
          }, 120);
          return result;
        };
      }
    }catch(e){}
    try{
      if(typeof saveAccountProfile === 'function' && !window.__hirexV25SaveAccountProfile){
        window.__hirexV25SaveAccountProfile = saveAccountProfile;
        saveAccountProfile = function(){
          var result = window.__hirexV25SaveAccountProfile();
          saveProfileFromForm();
          return result;
        };
      }
    }catch(e){}
  }
  async function saveProfileFromForm(){
    var sb = client();
    if(!sb || !currentUser || !currentUser.email) return;
    var fullName = (qs('accName') && qs('accName').value || '').trim() || currentUser.email.split('@')[0];
    var phone = (qs('accPhone') && qs('accPhone').value || '').trim();
    var role = (qs('accRole') && qs('accRole').value || '').trim() || 'باحث عن عمل';
    var notes = (qs('accBio') && qs('accBio').value || '').trim();
    try{
      var res = await sb.from('hirex_users').upsert({
        email: currentUser.email.toLowerCase(),
        full_name: fullName,
        phone: phone,
        role: role,
        notes: notes,
        status: 'active',
        email_verified: true,
        auth_user_id: currentUser.id
      }, { onConflict:'email' }).select('*').single();
      currentProfile = (res && res.data) || { full_name:fullName, phone:phone, role:role, notes:notes };
      applyAccount(currentUser, currentProfile);
      toast('تم حفظ بيانات الحساب وربطها بالمستخدم.');
    }catch(e){ toast('تعذر حفظ بيانات الحساب في Supabase.'); }
  }
  function installRuntimeOverrides(){
    // After verified login, protected windows should not reopen auth wall.
    window.requireEmailLogin = function(reason, callback){
      if(currentUser && currentUser.email){ if(typeof callback === 'function') callback(); return true; }
      showFirstAuthWall(); return false;
    };
    window.hirexRequireAuth = window.requireEmailLogin;
    window.hirexRequireVerifiedAction = window.requireEmailLogin;
    window.hirexV25RefreshUser = refresh;
    // Open notifications freely once verified and keep user data synced.
    try{
      if(typeof openNotificationsModal === 'function' && !window.__hirexV25OpenNotifications){
        window.__hirexV25OpenNotifications = openNotificationsModal;
        openNotificationsModal = function(){
          if(!(currentUser && currentUser.email)){ showFirstAuthWall(); return false; }
          return window.__hirexV25OpenNotifications();
        };
      }
    }catch(e){}
    try{
      if(typeof openMyAdsModal === 'function' && !window.__hirexV25OpenMyAds){
        window.__hirexV25OpenMyAds = openMyAdsModal;
        openMyAdsModal = function(){
          if(!(currentUser && currentUser.email)){ showFirstAuthWall(); return false; }
          loadMyAds();
          return window.__hirexV25OpenMyAds();
        };
      }
    }catch(e){}
  }
  async function refresh(){
    var sb = client();
    if(!sb) return;
    try{
      var res = await sb.auth.getSession();
      var user = res && res.data && res.data.session && res.data.session.user;
      if(isVerified(user)){
        var profile = await upsertAndLoadProfile(user);
        applyAccount(user, profile);
        installRuntimeOverrides();
        installSaveWrappers();
        await loadMyAds();
      }else{
        currentUser = null;
        currentProfile = null;
      }
    }catch(e){}
  }
  function install(){
    installRuntimeOverrides();
    installSaveWrappers();
    refresh();
    var sb = client();
    if(sb && sb.auth && sb.auth.onAuthStateChange){
      sb.auth.onAuthStateChange(function(_event, session){
        var user = session && session.user;
        if(isVerified(user)){
          upsertAndLoadProfile(user).then(function(profile){
            applyAccount(user, profile);
            installRuntimeOverrides();
            installSaveWrappers();
            loadMyAds();
          });
        }
      });
    }
    document.addEventListener('click', function(){
      if(currentUser && currentUser.email){ setTimeout(function(){ applyAccount(currentUser, currentProfile); }, 80); }
    }, true);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
