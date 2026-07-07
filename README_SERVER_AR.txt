Tasneef ERP V016 - جاهز للتشغيل الحقيقي

هذه النسخة لم تعد مجرد Prototype مفتوح.
تم تحويلها إلى واجهة مرتبطة بـ Supabase Auth و Supabase Database مع RLS.

الملفات المهمة:
- index.html: الواجهة.
- config.js: إعدادات Supabase ووضع التشغيل.
- api.js: طبقة API المصادقة.
- app.js: واجهة النظام وشاشة الدخول.
- supabase_schema_v016.sql: الجداول والسياسات الآمنة.
- server.mjs: خادم Node اختياري.
- README_PRODUCTION_AR.txt: خطوات التشغيل الكاملة.

أهم إعدادات config.js:
- API_MODE: supabase
- REQUIRE_AUTH: true
- LOCAL_FALLBACK: false

للتشغيل الحقيقي:
1) شغّل supabase_schema_v016.sql داخل Supabase.
2) فعّل Email Auth في Supabase.
3) أنشئ مستخدمًا أو سجّل من شاشة الدخول.
4) ارفع الملفات أو شغّل npm start.

تنبيه أمني:
لا تستخدم سياسات anon المفتوحة في الإنتاج.
هذه النسخة تستخدم سياسات authenticated مع user_id لكل جدول.
