# Supabase setup (accounts and database)

About 15 minutes, once. Until it's done the app works on each phone only, as before.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Name: `walk-and-talk`. Region: **an EU region** (e.g. Stockholm or Frankfurt), for GDPR.
3. Database password: generate one and keep it in your password manager. The app never needs it.

## 2. Create the tables

**SQL Editor → New query**, paste all of `supabase/schema.sql`, click **Run**.
It creates `profiles`, `walks` and `words`, locks each table so people only see their own
rows, and adds the function behind "Delete my data".

## 3. Turn on the login methods

**Authentication → Sign In / Providers** (names may move slightly in the dashboard):

| Setting                     | Value | Why |
| --------------------------- | ----- | --- |
| Allow anonymous sign-ins    | On    | People can try the level call before making an account |
| Allow manual linking        | On    | "Keep your progress" attaches Google/email to the trial account |
| Email                       | On    | Magic links (no passwords) |
| Google                      | On    | Needs a Client ID and Secret, see below |

**Google:** in [Google Cloud Console](https://console.cloud.google.com) → APIs & Services →
Credentials → **Create credentials → OAuth client ID** → Web application.
Under *Authorized redirect URIs* add the **Callback URL** that Supabase shows on its Google
provider page (it looks like `https://xxxx.supabase.co/auth/v1/callback`). Paste the Client ID
and Secret back into Supabase. Google also asks you to fill in the OAuth consent screen (app
name, your email); "External" and "Testing" are fine for now. In testing mode, add the Google
accounts that may log in as test users.

## 4. Allowed addresses

**Authentication → URL Configuration**

- Site URL: `https://buddy.barboragustafsson.com`
- Redirect URLs (add each):
  - `https://buddy.barboragustafsson.com/**`
  - `https://192.168.1.79:5180/**` (testing on your phone at home)
  - `https://localhost:5180/**`

## 5. Send me two values

**Project Settings → API** (or "API Keys"):

- **Project URL** (`https://xxxx.supabase.co`)
- **anon / publishable key**

Both are public by design (the database rules protect the data), so it's fine to paste them in
chat. Never send the **service_role / secret** key. The app doesn't need it.

## 6. Token server (done)

The Gemini token server is a Supabase Edge Function, with the key stored as a Supabase secret.
See `DEPLOY.md` for how to redeploy it or change the key.

## Good to know

- Supabase's built-in email sender only allows a few emails per hour: fine for testing. Before
  real users, set up your own SMTP under Authentication → Emails (Hostinger email works).
- The MVP is for adults (18+). Before launch you'll still need a privacy policy (GDPR).
- Anonymous trial accounts are limited per IP address by Supabase (Authentication → Rate
  limits). If people abuse it, switch on CAPTCHA there.
