// Щоденне пуш-нагадування Quaderno. Запускається GitHub Actions (.github/workflows/remind.yml).
const webpush = require('web-push');
const fs = require('fs');
const subs = JSON.parse(fs.readFileSync(__dirname + '/subs.json', 'utf8'));
const pub = fs.readFileSync(__dirname + '/vapid_public.txt', 'utf8').trim();
if (!process.env.VAPID_PRIVATE) { console.log('Немає секрету VAPID_PRIVATE, пропускаю'); process.exit(0); }
webpush.setVapidDetails('https://alinagurovamobile-web.github.io/general/', pub, process.env.VAPID_PRIVATE);
(async () => {
  for (const s of subs) {
    try { const r = await webpush.sendNotification(s, '{}', { TTL: 4 * 3600, urgency: 'normal' }); console.log('ok', r.statusCode); }
    catch (e) { console.log('fail', e.statusCode, e.body); }
  }
})();
