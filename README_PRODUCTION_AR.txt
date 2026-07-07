Tasneef ERP V019 - نسخة ERP مدمجة مع تطبيق التشغيل الميداني

ما الذي تغيّر؟
- تسجيل دخول حقيقي عبر Supabase Auth.
- إنشاء حساب مع تحقق عبر البريد الإلكتروني.
- إعادة إرسال رابط التحقق.
- استرجاع كلمة المرور عبر البريد.
- قسم إدارة المستخدمين: عرض المستخدمين ودعوتهم وتحديد أدوارهم.
- كل الأقسام أصبحت تحفظ سجلات تشغيلية في module_records.
- إضافة مركز التشغيل الميداني داخل واجهة ERP.
- دمج صفحات النسخة الجديدة داخل مجلد legacy_app:
  admin.html
  supervisor.html
  technician.html
  client-report.html
  index.html
- تعطيل التخزين المحلي الاحتياطي افتراضيًا.
- قاعدة بيانات RLS: كل مستخدم يرى بياناته فقط.
- تصحيح أسماء الحقول بين JavaScript و Supabase.
- إضافة خادم Node اختياري لتشغيل الواجهة وتمرير API.

خطوات Supabase:
1) افتح Supabase ثم SQL Editor.
2) شغّل الملف:
   supabase_schema_v018.sql
3) من Authentication > Providers فعّل Email.
4) من Authentication > URL Configuration أضف رابط الموقع في:
   Site URL
   Redirect URLs
5) من Authentication > Email Templates عدّل قالب Confirm signup إذا أردت نصًا عربيًا.
6) أنشئ مستخدمًا من Authentication > Users، أو استخدم زر "حساب جديد" من شاشة الدخول.
7) يجب فتح رابط التحقق من البريد قبل تسجيل الدخول.
5) بعد الدخول لأول مرة، يمكن تشغيل:
   select public.seed_tasneef_demo_data();
   هذا يضيف بيانات تجريبية للمستخدم الحالي فقط.

تشغيل مباشر كواجهة:
1) عدّل config.js إذا تغير رابط Supabase أو مفتاح anon.
2) ارفع الملفات إلى public_html أو أي استضافة Static.
3) افتح index.html وسجل الدخول.

تشغيل عبر Node لإدارة المستخدمين:
1) انسخ .env.example إلى .env وضع القيم الحقيقية.
   ضع SUPABASE_SERVICE_ROLE_KEY داخل السيرفر فقط.
   ضع بريد المدير في ADMIN_EMAILS.
2) شغل:
   npm start
3) افتح:
   http://localhost:3000

إعدادات مهمة في config.js:
- EMAIL_REDIRECT_URL يجب أن يكون رابط موقع النظام.
- AUTH_STORAGE = session يجعل جلسة الدخول مؤقتة في المتصفح.
- REQUIRE_AUTH = true يمنع فتح النظام بدون تسجيل دخول.
- ADMIN_EMAILS في السيرفر يحدد أول مدير يمكنه فتح إدارة المستخدمين.

ملاحظات مهمة للإنتاج:
- لا تضع service_role key داخل config.js أو داخل الواجهة.
- إدارة المستخدمين لا تعمل من استضافة Static فقط؛ تحتاج تشغيل server.mjs.
- مركز التشغيل الميداني يعمل داخل iframe من مجلد legacy_app، ويمكن فتح كل بوابة في نافذة مستقلة.
- مفتاح anon مسموح في الواجهة بشرط بقاء RLS مفعّلًا.
- لا تعطل REQUIRE_AUTH إلا للتجربة المحلية.
- لا تفعّل LOCAL_FALLBACK في الإنتاج حتى لا تختلط بيانات المتصفح مع قاعدة البيانات.

المتبقي حسب مشروع ERP كامل:
- رفع مرفقات فعلي عبر Supabase Storage.
- أدوار وصلاحيات متعددة مثل مدير، محاسب، مشرف.
- تقارير PDF/Excel فعلية.
- تكاملات خارجية مثل البنوك و ZATCA و WhatsApp.
