# ESG Game (Development)

This project is an experimental ESG training game using Next.js, Supabase, and OpenAI.

Quick start

1. Install dependencies

```powershell
npm install
```

2. Copy `.env.example` to `.env.local` and fill in the required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `OPENAI_API_KEY` (server only)
- `DATABASE_URL` or `SUPABASE_DB_URL` (for running migrations locally)

3. Run database migrations (will apply `supabase/schema.sql` to `DATABASE_URL`):

```powershell
npm run migrate
```

4. Run the dev server

```powershell
npm run dev
```

Helpful scripts

- `npm run migrate` — apply SQL schema to the database defined by `DATABASE_URL`/`SUPABASE_DB_URL`.
- `npm run test:parse` — run a small script that validates JSON parsing fallback logic used by the AI simulate endpoint.

Notes & Security

- Keep `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` out of client-side code and version control. Use environment variables on the server.
- The project uses an HttpOnly cookie `sb-access-token` for auth in server routes; development flows use `supabase.auth` to get an access token and then set the cookie via the `/api/auth/set-cookie` endpoint.

What's next

- Improve AI prompt engineering and add robust schema validation for model outputs.
- Add end-to-end tests and CI integration.

