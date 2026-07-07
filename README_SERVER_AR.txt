Tasneef ERP V018 - جاهز للتشغيل السحابي الكامل

هذه النسخة لم تعد مجرد Prototype مفتوح.
تم تحويلها إلى واجهة مرتبطة بـ Supabase Auth و Supabase Database مع RLS.
تسجيل الحساب يتطلب تحققًا عبر البريد الإلكتروني قبل الدخول.
تمت إضافة إدارة المستخدمين وسجلات تشغيلية لكل الأقسام.

الملفات المهمة:
- index.html: الواجهة.
- config.js: إعدادات Supabase ووضع التشغيل ورابط التحقق.
- api.js: طبقة API المصادقة.
- app.js: واجهة النظام وشاشة الدخول.
- supabase_schema_v018.sql: الجداول والسياسات الآمنة وجدول profiles.
- server.mjs: خادم Node اختياري.
- README_PRODUCTION_AR.txt: خطوات التشغيل الكاملة.

أهم إعدادات config.js:
- API_MODE: supabase
- REQUIRE_AUTH: true
- LOCAL_FALLBACK: false
- AUTH_STORAGE: session
- EMAIL_REDIRECT_URL: رابط موقع النظام

للتشغيل الحقيقي:
1) شغّل supabase_schema_v016.sql داخل Supabase.
2) فعّل Email Auth في Supabase.
3) أضف رابط الموقع في Site URL و Redirect URLs.
4) شغّل server.mjs إذا أردت إدارة المستخدمين.
5) ضع SUPABASE_SERVICE_ROLE_KEY في .env داخل السيرفر فقط.
6) ضع بريد المدير الأول في ADMIN_EMAILS.
7) أنشئ مستخدمًا أو سجّل من شاشة الدخول.
8) افتح رابط التحقق من البريد.
9) ارفع الملفات أو شغّل npm start.

تنبيه أمني:
لا تستخدم سياسات anon المفتوحة في الإنتاج.
هذه النسخة تستخدم سياسات authenticated مع user_id لكل جدول.
