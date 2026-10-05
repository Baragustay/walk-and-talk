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

$apiKey = getenv('GEMINI_API_KEY') ?: '';
if ($apiKey === '') {
  foreach ([dirname(__DIR__, 2) . '/buddy-secrets.php', dirname(__DIR__) . '/buddy-secrets.php'] as $file) {
    if (is_file($file)) { $apiKey = trim((string) (include $file)); break; }
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
