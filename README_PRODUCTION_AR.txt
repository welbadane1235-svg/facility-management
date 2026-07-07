Tasneef ERP V016 - نسخة حقيقية مرتبطة بقاعدة بيانات

ما الذي تغيّر؟
- تسجيل دخول حقيقي عبر Supabase Auth.
- تعطيل التخزين المحلي الاحتياطي افتراضيًا.
- قاعدة بيانات RLS: كل مستخدم يرى بياناته فقط.
- تصحيح أسماء الحقول بين JavaScript و Supabase.
- إضافة خادم Node اختياري لتشغيل الواجهة وتمرير API.

خطوات Supabase:
1) افتح Supabase ثم SQL Editor.
2) شغّل الملف:
   supabase_schema_v016.sql
3) من Authentication > Providers فعّل Email.
4) أنشئ مستخدمًا من Authentication > Users، أو استخدم زر "إنشاء حساب" من شاشة الدخول.
5) بعد الدخول لأول مرة، يمكن تشغيل:
   select public.seed_tasneef_demo_data();
   هذا يضيف بيانات تجريبية للمستخدم الحالي فقط.

تشغيل مباشر كواجهة:
1) عدّل config.js إذا تغير رابط Supabase أو مفتاح anon.
2) ارفع الملفات إلى public_html أو أي استضافة Static.
3) افتح index.html وسجل الدخول.

تشغيل عبر Node:
1) انسخ .env.example إلى .env وضع القيم الحقيقية.
2) شغل:
   npm start
3) افتح:
   http://localhost:3000

ملاحظات مهمة للإنتاج:
- لا تضع service_role key داخل config.js أو داخل الواجهة.
- مفتاح anon مسموح في الواجهة بشرط بقاء RLS مفعّلًا.
- لا تعطل REQUIRE_AUTH إلا للتجربة المحلية.
- لا تفعّل LOCAL_FALLBACK في الإنتاج حتى لا تختلط بيانات المتصفح مع قاعدة البيانات.

المتبقي حسب مشروع ERP كامل:
- رفع مرفقات فعلي عبر Supabase Storage.
- أدوار وصلاحيات متعددة مثل مدير، محاسب، مشرف.
- تقارير PDF/Excel فعلية.
- تكاملات خارجية مثل البنوك و ZATCA و WhatsApp.
