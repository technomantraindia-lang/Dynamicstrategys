const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function search() {
  const pages = [
    'https://unsplash.com/s/photos/indian-engineer',
    'https://unsplash.com/s/photos/indian-construction',
    'https://unsplash.com/s/photos/indian-worker',
    'https://unsplash.com/s/photos/indian-architect'
  ];

  for (const page of pages) {
    console.log(`\n=== PAGE: ${page} ===`);
    try {
      const html = await fetchHtml(page);
      const matches = [...html.matchAll(/https:\/\/images\.unsplash\.com\/photo-([0-9a-zA-Z\-]+)\?([^"'\s>]+)/g)];
      const seen = new Set();
      matches.forEach(m => {
        const id = m[1];
        if (!seen.has(id)) {
          seen.add(id);
          console.log(`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`);
        }
      });
      console.log(`Total found: ${seen.size}`);
    } catch(e) {
      console.log(`Error: ${e.message}`);
    }
  }
}

search();
