# VIP Transfer — Production Notes

## Local development
```bash
npm run dev:all
```
- Frontend: http://localhost:5173
- Admin: http://localhost:5173/admin
- API: http://localhost:3001

## Database
- **Local:** SQLite at `server/prisma/dev.db`
- **Production:** Set `DATABASE_URL` to PostgreSQL and run `npm run prisma:migrate`

## Admin security
Set in `server/prisma/.env` or environment:
```
JWT_SECRET=<random-32-byte-hex>
ADMIN_PASSWORD_HASH=<bcrypt-hash>
```

Generate password hash:
```bash
node server/scripts/hash-admin-password.mjs "your-secure-password"
```

Admin login returns a JWT; the panel stores it in sessionStorage and sends `Authorization: Bearer <token>` on API requests.

Dev fallback (not for production): plain `ADMIN_PASSWORD` without hash.

Optional machine token:
```
ADMIN_API_TOKEN=your-token
```

## Notifications
Optional webhook for new bookings:
```
ADMIN_WEBHOOK_URL=https://your-webhook-url
```

## Deploy options
1. **Single VPS:** Run Express on port 3001, serve `dist/` via nginx, proxy `/api` to Express
2. **Split:** Frontend on Vercel/Netlify, API on Render/Railway with PostgreSQL

## Seed default fleet & driver
```bash
npm run seed
```
