-- Optional manual fix for a user that exists in Authentication but not profiles.
-- Replace the id and email with the user values from Authentication -> Users if needed.

insert into public.profiles (
  id, role, full_name, email, city, specialty, experience, updated_at
)
values (
  'USER_ID_HERE',
  'candidate',
  'مرشح جديد',
  'EMAIL_HERE',
  'الرياض',
  'محاسبة',
  'حديث تخرج',
  now()
)
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name,
  email = excluded.email,
  city = excluded.city,
  specialty = excluded.specialty,
  experience = excluded.experience,
  updated_at = now();