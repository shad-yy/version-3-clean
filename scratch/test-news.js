const fs = require('fs');
const path = require('path');

// Helper to parse env file manually to avoid external dependencies
function loadEnv() {
  const envPath = path.join(__dirname, '../env.local');
  if (!fs.existsSync(envPath)) {
    console.warn("No env.local file found at:", envPath);
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  });
  return env;
}

const env = loadEnv();
const apiKey = env.NEWS_API_KEY;

if (!apiKey) {
  console.error("❌ NEWS_API_KEY is not defined in env.local!");
  process.exit(1);
}

console.log(`🔍 Found NEWS_API_KEY in env.local (ends in ...${apiKey.slice(-6)})`);

const query = 'football OR soccer OR "premier league" OR UFC OR "champions league"';
const params = new URLSearchParams({
  apikey: apiKey,
  language: 'en',
  size: '10',
  q: query,
});

const domainFilter = 'skysports.com,bbc.com,espn.com,theguardian.com';
const url = `https://newsdata.io/api/1/news?${params.toString()}&domainurl=${domainFilter}`;

console.log("📡 Sending test request to NewsData.io...");
fetch(url)
  .then(res => res.json())
  .then(data => {
    if (data.status === 'success') {
      console.log("✅ SUCCESS! NewsData.io returned valid articles.");
      console.log(`Count: ${data.results ? data.results.length : 0} articles.`);
      if (data.results && data.results.length > 0) {
        console.log("Sample article title:", data.results[0].title);
      }
    } else {
      console.log("❌ FAILED! NewsData.io returned an error:");
      console.log(JSON.stringify(data.results, null, 2));
    }
  })
  .catch(err => {
    console.error("❌ Fetch Error:", err);
  });
