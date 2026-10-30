const https = require('https');

function fetchPage(url) {
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

async function test() {
  const queries = [
    { name: 'textile', url: 'https://unsplash.com/napi/search/photos?query=textile+mill&per_page=10' },
    { name: 'glass', url: 'https://unsplash.com/napi/search/photos?query=glass+manufacturing&per_page=10' },
    { name: 'paper', url: 'https://unsplash.com/napi/search/photos?query=paper+mill&per_page=10' },
    { name: 'shipyard', url: 'https://unsplash.com/napi/search/photos?query=shipyard+cranes&per_page=10' },
    { name: 'cardboard', url: 'https://unsplash.com/napi/search/photos?query=cardboard+packaging+factory&per_page=10' }
  ];

  for (const q of queries) {
    try {
      const json = JSON.parse(await fetchPage(q.url));
      console.log(`=== ${q.name} (found ${json.results ? json.results.length : 0}) ===`);
      if (json.results) {
        json.results.slice(0, 4).forEach(r => {
          console.log(`  id: ${r.id}, desc: ${r.description || r.alt_description}, w: ${r.width}, h: ${r.height}`);
          console.log(`  url: ${r.urls.regular}`);
        });
      }
    } catch (e) {
      console.log(`Error for ${q.name}: ${e.message}`);
    }
  }
}

test();

