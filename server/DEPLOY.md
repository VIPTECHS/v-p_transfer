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
ADMIN_PASSWORD=your-secure-password
```
Admin panel login sends `X-Admin-Password` header on API requests.

Optional bearer token:
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
