HireX Smart Platform Chat V12

Added:
- Smart in-platform messaging modal for services.
- Replaces browser alert for "مراسلة داخل المنصة".
- Chat includes:
  - service title and summary
  - policy warning: no phone numbers or external links
  - message thread
  - send message
  - send offer with price and duration
- Basic protection blocks phone numbers and external links in messages.
- Offer message is stored in local demo chatThreads object.
- Payment/commission flow from V11 remains.
- This is front-end demo logic; later it should be connected to Supabase tables:
  service_threads, service_messages, service_offers, service_orders, payments.
