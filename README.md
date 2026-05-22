# HireX Realtime Chat Interviews V1

## الجديد
- Realtime refresh للطلبات والإشعارات والرسائل والمقابلات.
- Chat بين الباحث والشركة.
- إنشاء محادثة تلقائيًا بعد التقديم.
- نظام مقابلات:
  - الشركة ترسل دعوة مقابلة
  - الباحث يقبل أو يرفض
  - رابط Meet أو موقع المقابلة
- إشعار للباحث عند دعوة مقابلة.

## مهم
بعد تشغيل SQL، فعّل Realtime في Supabase:
Database → Replication
وفعّل الجداول:
- notifications
- applications
- chat_messages
- interviews
