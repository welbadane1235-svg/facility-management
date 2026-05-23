HireX Final Auth System

1) Upload:
- register.html
- login.html
- supabase-config.js

2) In Supabase SQL Editor:
- Set Role = postgres
- Run supabase-final-auth.sql once

3) Result:
- Any new Auth user automatically gets:
  profiles row
  wallets row

4) Confirm email:
- During development you may disable Confirm email.
- In production enable it with SMTP.
