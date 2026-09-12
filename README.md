# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Arcway SAT Math

Arcway is a gamified SAT/PSAT Math platform prototype with a React dashboard and a server foundation for authentication, lessons, practice, moderation, admin metrics, and recurring Premium billing.

The public entry points are `/#landing`, `/#login`, and `/#signup`. The authenticated dashboard remains available at the root route after sign-in.

## Run locally

```powershell
Copy-Item .env.example .env
# Set JWT_SECRET and ADMIN_EMAIL in .env
npm install
npm run dev:full
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:8787`.

For separate processes, use `npm run dev` and `npm run server`.

## Backend capabilities

- `POST /api/auth/register` and `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me` and `PATCH /api/profile`
- `GET /api/lessons`
- `POST /api/practice/attempts`
- `POST /api/moderation/check`
- `GET /api/admin/overview` for the admin account only
- `POST /api/billing/checkout` for Octo hosted checkout
- `POST /api/billing/octo/notify` for Octo payment notifications
- `POST /api/billing/webhook` for the optional Stripe fallback

Authentication uses an HttpOnly, SameSite session cookie. Login and registration are rate-limited, CORS is restricted to `CLIENT_ORIGIN`, Helmet supplies security headers, request bodies are size-limited, and API inputs are validated with Zod. Use HTTPS in production so the session cookie is marked Secure. A production deployment should also add a reverse-proxy/WAF rate limit, centralized logging and alerting, secret rotation, dependency scanning, and a managed database with encrypted backups.

SQLite data is stored in the ignored `data/` directory during development. Production should use a managed database, HTTPS, secret management, backups, and a real moderation provider in addition to the pre-publish filter.

## Billing security

Arcway does not collect or store full card numbers or payment passwords. Octo's hosted payment page supports Humo, Uzcard, Visa, and Mastercard, including OTP verification. Octo tokenization can support future recurring charges without storing the PAN. Payment notifications update server-side subscription records, and cancellation should keep Premium active through the paid billing period.

Required Octo billing variables are documented in `.env.example`:

- `OCTO_SHOP_ID`
- `OCTO_SECRET`
- `OCTO_NOTIFY_URL`
- `OCTO_RETURN_URL`

## Checks

```powershell
npm run server:build
npm run build
```
