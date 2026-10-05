# Deploy (buddy.barboragustafsson.com)

Two parts:

| Part | Where | How it updates |
| --- | --- | --- |
| The website (static files) | Hostinger | Automatically on every push to `main` |
| The token server + database | Supabase | Database: `supabase/schema.sql`. Token server: deploy command below |

The Gemini key lives only in Supabase's encrypted secrets. Nothing secret is on Hostinger or GitHub.

## Website: Hostinger (already set up)

Every push to `main` makes a GitHub Action build the site and push only the built files to the
**`hostinger` branch**. Hostinger's Git deploy (Advanced → Git, branch `hostinger`, auto deployment
on) pulls it into `public_html/buddy`. `public/.htaccess` sends http to https and app routes like
`/call` to `index.html`.

Hostinger replaces everything in the site folder on each deploy, so never put files there by hand.

## Token server: Supabase Edge Function

`supabase/functions/live-token/index.ts` checks the login, then asks Google for a short-lived
Gemini Live token. After changing it, deploy from the project folder:

```sh
npx supabase functions deploy live-token --no-verify-jwt --project-ref uatijscirvcpmeasclih
```

(`--no-verify-jwt` because the function checks the login itself.) The CLI needs a one-time
`npx supabase login` in the Terminal app.

Changing the Gemini key:

```sh
npx supabase secrets set GEMINI_API_KEY=... --project-ref uatijscirvcpmeasclih
```

If you add another web address for the app, add it to `ALLOWED_ORIGINS` in the function.

## Check it works

The app calls `https://uatijscirvcpmeasclih.supabase.co/functions/v1/live-token`. Without a login
it answers `{"error":"Please log in"}` (401). That's correct.
