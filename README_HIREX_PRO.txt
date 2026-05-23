HireX Professional Integrated Platform

طريقة الرفع:
1) ارفع كل الملفات إلى GitHub Pages داخل نفس المستودع.
2) افتح Supabase SQL Editor واختر Role = postgres.
3) شغّل ملف supabase-master-setup.sql مرة واحدة فقط.
4) أثناء التطوير، الأفضل تعطيل Confirm email مؤقتًا من Authentication > Sign In / Providers > Email.
5) عند الإطلاق الرسمي، فعّل SMTP رسمي ثم فعّل تأكيد البريد.

الملفات الأساسية:
- index.html: الرئيسية
- jobs.html / job-details.html: الوظائف والتفاصيل
- candidates.html / candidate-dashboard.html: المرشح
- companies.html / company-dashboard.html: الشركة
- register.html / login.html: التسجيل والدخول النهائي
- supabase-config.js: ربط Supabase
- supabase-master-setup.sql: تجهيز قاعدة البيانات بالكامل

ملاحظات:
- أي مستخدم جديد يحصل تلقائيًا على profiles و wallets بعد تشغيل SQL.
- تحويل المستخدم يتم حسب role: company أو candidate.
- الكوينز تعمل للمرشح والشركة عبر جدول wallets والعمليات.
