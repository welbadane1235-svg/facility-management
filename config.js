
/*
  Tasneef ERP V017 Config

  ملاحظة أمنية:
  مفتاح anon الخاص بـ Supabase يمكن وضعه في الواجهة بشرط تفعيل RLS والصلاحيات داخل Supabase.
  لا تضع service_role key هنا أبدًا.
*/
window.TASNEEF_CONFIG = {
  APP_VERSION: 'V017',
  API_MODE: 'supabase', // local | server | supabase
  API_BASE_URL: 'https://lexsupjvsgjjwxnqxnhq.supabase.co/rest/v1',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxleHN1cGp2c2dqand4bnF4bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTYyMjcsImV4cCI6MjA5ODk5MjIyN30.F9nIfNOQX4uqrEQ06zuzuThm3Bhc2KlofY6SP6ivKNA',
  AUTH_TOKEN_KEY: 'tasneef_auth_token',
  REFRESH_TOKEN_KEY: 'tasneef_refresh_token',
  AUTH_STORAGE: 'session', // session | local
  EMAIL_REDIRECT_URL: window.location.origin + window.location.pathname,
  STORAGE_PREFIX: 'tasneef_erp_v017_',
  REQUIRE_AUTH: true,
  LOCAL_FALLBACK: false
};
