const https = require('https');

function wikiSearch(q) {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url|size|mime&format=json`;
    https.get(url, { headers: { 'User-Agent': 'IndustrialRefBot/1.0 (info@portfolio.com)' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          const pages = json.query ? Object.values(json.query.pages) : [];
          resolve(pages.map(p => ({
            title: p.title,
            width: p.imageinfo ? p.imageinfo[0].width : 0,
            height: p.imageinfo ? p.imageinfo[0].height : 0,
            url: p.imageinfo ? p.imageinfo[0].url : ''
          })));
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function run() {
  const queries = [
    'Indian engineer helmet OR construction OR plant',
    'Indian engineers site OR factory',
    'workers Indian plant refinery',
    'Indian workers construction engineers'
  ];

  for (const q of queries) {
    console.log(`\n=== ${q} ===`);
    const res = await wikiSearch(q);
    res.filter(r => r.width > r.height && r.width >= 1200).slice(0, 5).forEach(r => {
      console.log(`[${r.width}x${r.height}] ${r.title}`);
      console.log(`  ${r.url}`);
    });
  }
}

run();
