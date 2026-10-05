# Deploy to Hostinger (buddy.barboragustafsson.com)

Same setup as Policy-translator: every push to `main` makes a GitHub Action build the site
and push only the built files to a **`hostinger` branch**. Hostinger's Git deploy pulls that
branch into the subdomain's folder.

Unlike Policy-translator, this app has one piece of server code: `api/live-token.php`,
which swaps the secret Gemini key for a short-lived token. The key itself is never in GitHub.

## 1. Put the code on GitHub (once)

Create an empty repo on github.com (e.g. `Baragustay/walk-and-talk`, private is fine), then:

```sh
git remote add origin https://github.com/Baragustay/walk-and-talk.git
git push -u origin main
```

Open the repo's **Actions** tab: "Build for Hostinger" should run and create the `hostinger`
branch. If it fails with a permission error: Settings → Actions → General → Workflow
permissions → **Read and write permissions**, then re-run it.

## 2. Subdomain and https (once)

1. hPanel → **Domains → Subdomains**: create `buddy`. Note its folder (for example
   `public_html/buddy`, or `domains/buddy.barboragustafsson.com/public_html`).
2. hPanel → **Security → SSL**: make sure the subdomain has SSL. The microphone only works over https.

## 3. Git deploy (once)

hPanel → **Advanced → Git**:

| Setting    | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Repository | `https://github.com/Baragustay/walk-and-talk.git`          |
| Branch     | `hostinger`                                                |
| Directory  | the subdomain folder from step 2 (it must be empty at first deploy) |

For a private repo, Hostinger shows an SSH key: add it on GitHub under the repo's
Settings → **Deploy keys**, and use the `git@github.com:…` address instead.

Click **Deploy**. Turn on **Auto deployment** and add the webhook it shows to GitHub
(repo Settings → Webhooks), so each build deploys by itself.

## 4. The Gemini key (once)

In hPanel **File Manager**, go to the folder **one level above** the subdomain folder
(for `public_html/buddy` that's `public_html`). Create a file named **`buddy-secrets.php`**:

```php
<?php return 'PASTE-YOUR-GEMINI-KEY-HERE';
```

Why it's safe: it lives outside the site folder, it's not in Git, and even if someone
requested it, PHP would run it and send back nothing.

## 5. Check it works

```sh
curl -X POST https://buddy.barboragustafsson.com/.netlify/functions/live-token
```

You should get `{"token":"auth_tokens/…","model":"gemini-3.8-live",…}`.
`Server is missing the Gemini API key` means step 4's file isn't found.
Then open the site on your phone and call Buddy.

## How it fits together

- `public/.htaccess`: http → https, sends `/.netlify/functions/live-token` (the path the app
  calls) to `api/live-token.php`, and sends app routes like `/call` to `index.html`.
- `public/api/live-token.php`: the PHP twin of `netlify/functions/live-token.ts`. If you
  change the model or token lifetime, change both.
- File Manager hides dotfiles; turn on "Show hidden files" to see `.htaccess`.
