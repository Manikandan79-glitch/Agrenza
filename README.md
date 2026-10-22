# FarmLink — Consolidated Project (cleaned up + bug fixed)

Your uploaded zip had gotten messy — a duplicate nested `farmlink/farmlink/`
folder, a separate `farmlink-php-api/` that had actually evolved further
than the old top-level `backend/`, and a broken `npm run dev` script. This
package is everything merged into ONE clean copy of each file, using the
newest/correct version wherever there were duplicates.

```
farmlink/            ← replaces your htdocs/farmlink folder entirely
farmlink-nextjs/      ← the Next.js frontend (same folder name you had)
```

## The actual bug you hit ("Invalid or expired verification link")

Found it in `farmlink-nextjs/app/auth/email-verify/page.tsx`. React's
Strict Mode (development only) runs effects twice on purpose, to help
catch bugs. Your verification effect had no guard against that, so it
called Firebase's `signInWithEmailLink()` **twice** on the same link:

1. First call — succeeds, consumes the one-time code.
2. Second call — fails, because that code was just used. This is the
   error you saw, even though the link was only seconds old.

**Fixed** with a `useRef` guard so verification only ever runs once per
page load, no matter how many times Strict Mode invokes the effect. This
is a permanent fix, but your old email link is still burned — request a
fresh registration/verification email to test it.

## Also fixed

- `package.json`'s `dev` script was calling a custom `run-dev.ps1`
  PowerShell wrapper that was exiting silently on your machine. Reverted
  to plain `"next dev"`, which is what actually worked for you.
- `backend/config/db.php`'s `UPLOAD_URL` was pointing at
  `.../farmlink-php-api/backend/uploads/` — wrong folder name. Fixed to
  `.../farmlink/uploads/`.
- Removed the exact-duplicate nested `farmlink/farmlink/` folder and the
  redundant `farmlink-php-api/` folder — their real, current content is
  now merged directly into `farmlink/backend/`.

## Setup

**1. PHP backend** — delete your old `htdocs/farmlink`, copy this zip's
`farmlink/` folder in its place (same name, no renaming).

**2. Database migrations** — run these two, in order, in phpMyAdmin's SQL
tab (they're safe to run on your existing data):
```
farmlink/backend/sql/2026_add_firebase_columns.sql
farmlink/backend/sql/2026_add_admin_approval.sql
```

**3. Composer dependencies** — already included in `farmlink/vendor/`
(Firebase Admin SDK, for verifying tokens server-side). If you ever need
to reinstall: `cd farmlink && composer install`.

**4. Firebase service account** — already included at
`farmlink/backend/config/firebase-service-account.json`. Keep this file
private (it's already outside any web-servable path assumption, but
double check your Apache config doesn't serve `backend/` directly).

**5. Admin login** — auto-created on first request to any API endpoint:
- Mobile: `9999999999`
- Email: `admin@farmlink.com`
- Password: `admin123`
Change this after your first login.

**6. Admin notification emails (optional)** — `backend/helpers/mailer.php`
sends farmers an email when approved/rejected. Fill in `SMTP_USER` /
`SMTP_PASS` (a Gmail App Password) near the top of that file, or leave
the placeholders — approve/reject actions still work, they just skip
sending the email and log it instead.

**7. Next.js frontend**
```bash
cd farmlink-nextjs
npm install
npm run dev
```
Open http://localhost:3000.

## Note

There's both `/auth/admin-login` and `/admin/admin-login` pages in the
frontend — looks like a duplicate from an earlier iteration. Harmless,
but worth deleting one once you confirm which your login flow actually
links to.
