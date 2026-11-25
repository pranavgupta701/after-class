# Local to public rollout

## Deployment status — 25 November 2026

- Source: `https://github.com/pranavgupta701/after-class`, application commit `880627a`.
- Primary local checkout remains on the SSD at `Projects/Anonymous/anonymous_project`.
- Oracle API access verified for tenancy `codingtocreation`, home region Mumbai.
- Created `afterclass-network` and its public subnet, internet gateway, route table and security list.
- A1 Flex launch failed with `Out of host capacity`; the Always Free-compatible `VM.Standard.E2.1.Micro` instance `afterclass-web` was created instead (1 GB RAM, 50 GB boot disk). A 2 GB swap file supports installation/builds; this is not additional RAM or a capacity guarantee.
- Public IPv4: `130.210.2.254`. OCI SSH ingress is restricted to the administration IP recorded privately at provisioning; web ports 80/443 are public. If the administration IP changes, update that rule before connecting.
- Node 22, Nginx and Certbot installed. Application checkout is `/opt/afterclass/app`, owned by the dedicated `afterclass` service account.
- Systemd service `/etc/systemd/system/afterclass.service` reads `/etc/afterclass/production.env`. The application remains stopped until production credentials are configured. Nginx is prepared for `afterclass.neuralagent.dev`.
- Namecheap is authoritative DNS. The `afterclass` A record and HTTPS certificate are still pending.
- Saved Supabase connection fails with `tenant/user not found`. Current SSD Redis is localhost, not a usable production service. Correct both before starting the app.
- Preserve the existing effective staff encryption key (which may fall back to the local JWT secret) when moving existing staff authenticator records. Do not silently replace it.
- No paid upgrade or paid VM was selected. No production app, external monitor, email-delivery check or public end-to-end verification is complete.

The sections below describe the remaining rollout procedure and historical recovery evidence.

## Hosting decision

Keep the source in GitHub. GitHub Pages serves static files and cannot run the Express/Socket.IO server, delivery worker, or verification uploads. GitHub also excludes using Pages to run an online business or commercial SaaS: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits.

The simplest deployment for the current code is one long-running Node/Docker application serving both `dist` and `/api`, behind HTTPS at `afterclass.neuralagent.dev`. This keeps sessions, WebSockets and push on the same origin. A DNS subdomain alone does not provide this server. Choose a host with persistent writable storage for temporary verification uploads and enough uptime for background workers; a sleeping service will delay notifications. No free-host capacity or terms are assumed here.

Before publishing:

1. Obtain the application host and its prescribed DNS destination. Configure the domain in that host before adding its DNS record. Do not replace the existing apex-domain or email DNS records.
2. Provision a current Upstash database. Store its TLS URL privately as `CANDIDATE_REDIS_URL`, then run `node --env-file=/private/upstash.env scripts/check-redis.cjs`. The check does not overwrite `.env`. Only promote the candidate to production `REDIS_URL` after success. The old hostname does not resolve; account access is needed to obtain or recreate that database.
3. Configure the production environment listed in `.env.example`, including independent signing/encryption secrets, the public `CLIENT_URL`, and Google OAuth callback. Keep VAPID private keys server-only. Preserve the staff encryption key needed to decrypt existing authenticator records, or follow a deliberate staff reenrolment procedure.
4. Generate the Prisma client and run migrations from the deployment checkout before starting the new release. The final application Docker image omits development tools.
5. Start the application with `NODE_ENV=production`, a host-appropriate `PORT`, and `HOST=0.0.0.0` inside containers. Forward HTTPS and WebSocket connections to it. Mount a writable private volume at `/app/server/uploads` when using the supplied Docker image.
6. Validate sign-in, logout, staff MFA, campus isolation, chat, hearings, and push on the public origin. A localhost push subscription does not migrate to the production domain.

## Independent monitor installation

Use a separate Linux machine with Node 22 or newer, not the application server or a sleeping laptop. The repository includes a systemd timer and service in `deploy/monitor`. They are templates; they are **not installed or running**.

```sh
sudo install -d -m 755 /opt/afterclass-monitor
sudo install -m 644 scripts/health-probe.cjs /opt/afterclass-monitor/health-probe.cjs
sudo install -m 600 deploy/monitor/monitor.env.example /etc/afterclass-monitor.env
# Edit the private file locally: set the real public endpoint and credentials.
sudo install -m 644 deploy/monitor/afterclass-monitor.service /etc/systemd/system/
sudo install -m 644 deploy/monitor/afterclass-monitor.timer /etc/systemd/system/
sudo systemd-analyze verify /etc/systemd/system/afterclass-monitor.service /etc/systemd/system/afterclass-monitor.timer
sudo systemctl daemon-reload
sudo systemctl start afterclass-monitor.service
sudo journalctl -u afterclass-monitor.service -n 10 --no-pager
sudo systemctl enable --now afterclass-monitor.timer
sudo systemctl list-timers afterclass-monitor.timer
```

Confirm `/usr/bin/node` exists; adjust `ExecStart` if Node is elsewhere. Persistent deduplication state is managed under `/var/lib/afterclass-monitor`. The timer checks about every two minutes. HTTP outages exit 1; configuration/provider failures exit 2. Observe timer/runner failures independently as well. If a process is forcibly killed, inspect the service before removing a stale `state.json.lock`; never delete a lock while a probe is running. Test failure and recovery using an isolated test endpoint before treating this as on-call coverage.

## Recovery evidence and remaining checks

An encrypted backup of the configured main database's **public application schema** was successfully restored into an isolated PostgreSQL 17 container on 10 November 2026. It contained 1 campus, 4 accounts, 3 reports and 12 completed migrations. All nine operational/push tables retained their RLS flags. Older review backups also restored successfully. Archives and reports remain in the ignored private `.keys/backups` directory, not Git.

The first full Supabase dump could not restore into stock PostgreSQL because it included the provider's `supabase_vault` extension. The tool now backs up the application schema explicitly. It does not claim to back up Supabase Auth, Storage, Vault, roles, grants, or project configuration. Restoring RLS flags is not an end-to-end authorization test. Apply and verify application privilege revocations, provider roles and API permissions before serving a restored database; `--no-acl` intentionally avoids restoring provider-specific grants.

Hearing and appeal attachments are stored inside database JSON and included in the application backup. The real snapshot currently contains **zero such images**, so this drill cannot prove recovery of real image evidence. Local verification-photo storage was also empty and there were zero pending photo references. Selfies are ephemeral and are not added to long-lived backups. After a storage-loss incident, affected pending applicants must resubmit; never silently approve them or resurrect expired photos.

Before declaring disaster recovery complete: rehearse against the chosen production environment; test login and staff permissions with isolated delivery disabled; rotate/revoke restored sessions as appropriate; validate representative attachments; set backup retention and a separate off-site destination; and keep the backup key recoverable separately. Define and measure recovery-time and recovery-point objectives instead of treating a two-second database restore as full service recovery.

## Device push acceptance

On the actual device, open Settings → Notifications, enable background notifications, save preferences and allow the browser prompt. Send one test outside quiet hours, switch away from the tab, confirm the OS notification arrives, and tap it to verify the inbox opens. Also check denied permission and device removal. Provider acceptance and automated worker tests are not proof of device display. This confirmation is still pending.
