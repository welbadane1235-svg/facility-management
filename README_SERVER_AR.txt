
# Tasneef ERP V014 - جاهز للربط بسيرفر

هذه النسخة تعمل الآن بطريقتين:

## 1) الوضع المحلي Local
مفعل افتراضيًا:
```js
API_MODE: 'local'
```
ويتم الحفظ في `localStorage` للتجربة الفعلية بدون سيرفر.

## 2) وضع السيرفر Server
في ملف `config.js` غيّر:
```js
API_MODE: 'server',
API_BASE_URL: 'https://api.your-domain.com'
```

## مسارات API المطلوبة من السيرفر

### موارد عامة
- `GET /api/:resource`
- `GET /api/:resource/:id`
- `POST /api/:resource`
- `PUT /api/:resource/:id`
- `DELETE /api/:resource/:id`

### سجلات الأقسام
- `GET /api/modules/:moduleName/records`
- `POST /api/modules/:moduleName/records`

### أمثلة Resources
- `inbox`
- `bankAccounts`
- `records`

## شكل البيانات المتوقع

### Inbox
```json
{
  "id": "INB-0001",
  "title": "فاتورة مورد - مواد تنظيف",
  "from": "مورد",
  "type": "فاتورة مورد",
  "status": "غير معالج",
  "priority": "متوسطة",
  "assignee": "المحاسب",
  "project": "المخزن الرئيسي",
  "attachment": "file.pdf",
  "suggested": "إنشاء فاتورة مورد",
  "body": "نص الرسالة",
  "activity": ["تم الاستلام"]
}
```

### Bank Account
```json
{
  "id": "BA-001",
  "name": "الحساب البنكي",
  "type": "bank",
  "bookBalance": 0,
  "statementBalance": 0
}
```

## ملاحظات مهمة
- هذه نسخة واجهة جاهزة للربط، وتعمل فعليًا محليًا.
- عند ربط السيرفر ستحتاج إضافة تسجيل دخول وصلاحيات Backend.
- لا تضع مفاتيح سرية داخل الواجهة.


## V015 Supabase
تم تجهيز الاتصال التالي:
- API_BASE_URL: https://lexsupjvsgjjwxnqxnhq.supabase.co/rest/v1
- API_MODE: supabase

الجداول المطلوبة:
- inbox
- bank_accounts
- records
- module_records

شغّل ملف:
supabase_schema_v015.sql

ملاحظة مهمة:
السياسات الموجودة في ملف SQL للتجربة فقط. عند التشغيل الحقيقي يجب تقييد RLS حسب المستخدمين والصلاحيات.
