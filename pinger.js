/** Self-pinger — runs alongside Next.js to trigger the news pipeline every 30 minutes */
const http = require('http');
const PORT = process.env.PORT || 3000;

function pingCron() {
  const url = `http://localhost:${PORT}/api/cron/fetch-news`;
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
      console.log(`[pinger ${now}] fetch-news → ${res.statusCode}`);
    });
  }).on('error', (e) => {
    if (e.code !== 'ECONNREFUSED') {
      console.log(`[pinger] error: ${e.message}`);
    }
  });
}

// Wait 30 seconds for server to start, then ping every 30 minutes
setTimeout(() => {
  pingCron();
  setInterval(pingCron, 30 * 60 * 1000);
}, 30000);

console.log(`[pinger] Started — will call /api/cron/fetch-news every 30 min`);
