# Verification Status Fix

## المشكلة
الأدمن كان يغير حالة الطلب في جدول verification_requests فقط.
بوابة الشركة كانت تقرأ الحالة من جدول companies، لذلك لا يظهر الرفض أو القبول.

## الحل
عند قبول/رفض التوثيق من admin.html يتم الآن:
- تحديث verification_requests
- تحديث companies.verification_status للشركات
- تحديث seekers.verification_status للباحثين
- إرسال إشعار للمستخدم

## المطلوب
1. شغل supabase-setup.sql.
2. ارفع الملفات بدل القديمة.
3. جرّب رفض/قبول طلب التوثيق من admin.html.
4. افتح حساب الشركة وستظهر الحالة.
