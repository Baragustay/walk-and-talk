<?php
// Hostinger version of netlify/functions/live-token.ts: creates a short-lived Gemini Live
// token so the browser never sees the real API key. Keep the two files in step.
//
// The key is NOT in this repo. On the server, create buddy-secrets.php in the folder
// ABOVE the site folder (see DEPLOY.md), containing:   <?php return 'your-gemini-key';
// (Alternatively set a GEMINI_API_KEY environment variable.)

const LIVE_MODEL = 'gemini-3.8-live';      // same as src/lib/live/model.ts
const TOKEN_LIFETIME_MINUTES = 45;         // same as src/lib/live/model.ts

header('Content-Type: application/json');
header('Cache-Control: no-store');

function reply(int $status, array $body): void {
  http_response_code($status);
  echo json_encode($body);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(405, ['error' => 'Use POST']);

// Only our own pages may ask. (Not bulletproof: non-browser clients can fake Origin.)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== strtok($_SERVER['HTTP_HOST'] ?? '', ':')) {
  reply(403, ['error' => 'Forbidden']);
}

// With accounts set up, only logged-in users (including trial accounts) get tokens.
// config.php is written by the build from .env.production (public values only).
$config = is_file(__DIR__ . '/config.php') ? (include __DIR__ . '/config.php') : [];
if (!empty($config['supabase_url']) && !empty($config['supabase_anon_key'])) {
  $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
  if (stripos($auth, 'Bearer ') !== 0) reply(401, ['error' => 'Please log in']);
  $ch = curl_init(rtrim($config['supabase_url'], '/') . '/auth/v1/user');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => ['apikey: ' . $config['supabase_anon_key'], 'Authorization: ' . $auth],
  ]);
  curl_exec($ch);
  if (curl_getinfo($ch, CURLINFO_HTTP_CODE) !== 200) reply(401, ['error' => 'Please log in']);
}

// Look for buddy-secrets.php just above the site folder (preferred), two levels up, or
// in the site folder itself. Read it as text, never `include` it: if someone wrote just the
// bare key in the file, include would print the key into this response.
$apiKey = getenv('GEMINI_API_KEY') ?: '';
if ($apiKey === '') {
  $site = dirname(__DIR__);
  foreach ([dirname($site) . '/buddy-secrets.php', dirname($site, 2) . '/buddy-secrets.php', $site . '/buddy-secrets.php'] as $file) {
    if (!is_readable($file)) continue;
    $text = (string) file_get_contents($file);
    // Accepts  <?php return 'KEY';   or just  KEY
    if (preg_match('/[\'"]([A-Za-z0-9_\-]{20,})[\'"]/', $text, $m) || preg_match('/([A-Za-z0-9_\-]{30,})/', $text, $m)) {
      $apiKey = $m[1];
      break;
    }
  }
}
if ($apiKey === '') reply(500, ['error' => 'Server is missing the Gemini API key']);

$now = time();
$expiresAt = $now + TOKEN_LIFETIME_MINUTES * 60;
$body = [
  'expireTime' => gmdate('Y-m-d\TH:i:s\Z', $expiresAt),
  'newSessionExpireTime' => gmdate('Y-m-d\TH:i:s\Z', $now + 60),
  'uses' => 1, // one call; reconnecting with session resumption doesn't count as a use
  // Lock only these fields, so the app can still send its own system prompt and tools.
  'bidiGenerateContentSetup' => [
    'model' => 'models/' . LIVE_MODEL,
    'generationConfig' => ['responseModalities' => ['AUDIO']],
  ],
  'fieldMask' => 'model,generationConfig.responseModalities',
];

$ch = curl_init('https://generativelanguage.googleapis.com/v1alpha/auth_tokens');
curl_setopt_array($ch, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 15,
  CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'x-goog-api-key: ' . $apiKey],
  CURLOPT_POSTFIELDS => json_encode($body),
]);
$res = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);

$data = is_string($res) ? json_decode($res, true) : null;
if ($status !== 200 || empty($data['name'])) {
  error_log('live-token failed: HTTP ' . $status);
  reply(502, ['error' => 'Could not create a token']);
}

reply(200, ['token' => $data['name'], 'model' => LIVE_MODEL, 'expiresAt' => $expiresAt * 1000]);
