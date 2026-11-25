# Oracle deployment: afterclass.neuralagent.dev

Prepared configuration only; no VM, DNS record, certificate or deployment has been created.

Use one Oracle Always Free Ubuntu VM for the frontend, Express API, Socket.IO and background workers. Supabase and Upstash remain external services. Free VM capacity is not guaranteed. Keep all resources within the Always Free allowance.

## Prerequisites

- GitHub access to `pranavgupta701/after-class`.
- An allocated Oracle VM with a public IP and SSH access.
- Working Supabase PostgreSQL and certificate-verified Upstash Redis connections.
- A Resend-verified sender domain and email API key.
- DNS control for `neuralagent.dev` at its authoritative DNS provider.

Install Node.js 22 LTS, Git, Nginx, PM2 and Certbot on Ubuntu. Allow inbound 80/443 in the Oracle network and host firewall; restrict SSH to your administration IP. Keep application port 3000 private.

## Private environment

Clone the repository on the VM. Copy `.env.example` to `.env`, restrict it with `chmod 600 .env`, and fill in credentials privately. Never commit that file.

Set these non-secret values:

```dotenv
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
CLIENT_URL=https://afterclass.neuralagent.dev
VITE_API_URL=/api
GOOGLE_REDIRECT_URI=https://afterclass.neuralagent.dev/api/auth/google/callback
```

Configure DATABASE_URL, DIRECT_URL, REDIS_URL, RESEND_API_KEY, RESEND_FROM, ADMIN_EMAILS and HEALTH_SECRET. JWT_SECRET, OTP_PEPPER and STAFF_ENCRYPTION_KEY must be independent high-entropy secrets. Preserve the staff encryption key when migrating existing authenticator records; do not silently replace it. ADMIN_KEY is legacy, not staff authentication. Configure VAPID credentials for push and the operational alert recipient. Register the exact Google callback URL in its OAuth console if Google login is enabled.

Validate a candidate Upstash connection using `scripts/check-redis.cjs` before promoting it. The prior rollout notes report an unavailable old Redis hostname. Production login and rate limiting fail closed without working Redis.

## Build and start

Run from the application directory, with the private environment configured:

```sh
npm ci
npm run db:generate
npm test
npm run build
npm run db:migrate
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Follow the host-specific command printed by `pm2 startup`. Back up the target database before applying migrations. Retain writable private `server/uploads` storage across releases. Do not copy live private data into Git.

Install `deploy/nginx/afterclass.conf` as the enabled Afterclass Nginx site. Validate with `sudo nginx -t` before reloading Nginx.

## Namecheap DNS and HTTPS

First confirm that Namecheap is the authoritative DNS provider; a domain registered there may use external nameservers. In Namecheap Advanced DNS, add an A record with Host `afterclass`, Value equal to the Oracle VM public IPv4, and automatic TTL. Change only a conflicting record for this exact subdomain after reviewing it. Preserve apex, www and email records. Do not add an AAAA record unless the VM has working IPv6.

After the record resolves to the VM, run:

```sh
sudo certbot --nginx -d afterclass.neuralagent.dev
sudo certbot renew --dry-run
```

Use HTTPS for all browser checks; `.dev` domains require HTTPS in browsers. Resend requires its own provider-supplied verification records; do not guess or replace existing email records.

## Before inviting students

Check public health, email delivery, login/logout, Google login if configured, staff MFA, matching, live chat and device push. Run database integration checks in an isolated environment. Configure an independent monitor and off-site database backups; test restoration. The repository's production dating gate remains disabled. See `LOCAL_TO_PUBLIC.md` and the current rollout gates in `DEPLOYMENT_TODO.md`.

A successful build is not a deployed or operationally verified service.
