
/*
  Tasneef ERP V014 Config
  عند الربط بالسيرفر:
  1) غير API_BASE_URL إلى رابط السيرفر الحقيقي.
  2) خلي API_MODE = 'server'.
  3) جهز نفس مسارات API الموضحة في README_SERVER_AR.txt.
*/
window.TASNEEF_CONFIG = {
  APP_VERSION: 'V014',
  API_MODE: 'local', // local | server
  API_BASE_URL: '',  // مثال: https://api.your-domain.com
  AUTH_TOKEN_KEY: 'tasneef_auth_token',
  STORAGE_PREFIX: 'tasneef_erp_v014_'
};
